export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import {
  sendTaskSubmissionEmail,
  sendAdminTaskNotification,
  sendCertificateEmail,
} from "@/lib/mail";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/* =======================
   GET → rekap pengumpulan tugas sebuah event
======================= */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const submissions = await prisma.submission.findMany({
      where: { eventId: id },
      include: { participant: true },
      orderBy: { submittedAt: "desc" },
    });
    return Response.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error.message);
    return Response.json(
      { message: "Gagal memuat data pengumpulan tugas", error: error.message },
      { status: 500 },
    );
  }
}

/* =======================
   POST → peserta mengumpulkan tugas
======================= */
export async function POST(req, { params }) {
  try {
    const { id: eventId } = await params;
    const formData = await req.formData();

    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    const nim = (formData.get("nim") || "").toString().trim();
    const file = formData.get("file");

    if (!email) {
      return Response.json({ message: "Email wajib diisi" }, { status: 400 });
    }

    /* ===== CEK EVENT & FITUR TUGAS ===== */
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return Response.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }
    if (!event.adaTugas) {
      return Response.json(
        { message: "Event ini tidak memiliki tugas" },
        { status: 400 },
      );
    }

    /* ===== CEK DEADLINE ===== */
    if (event.deadlineTugas && new Date() > new Date(event.deadlineTugas)) {
      return Response.json(
        { message: "Batas waktu pengumpulan tugas sudah berakhir" },
        { status: 400 },
      );
    }

    /* ===== IDENTIFIKASI PESERTA (email + NIM terdaftar) ===== */
    const participant = await prisma.participant.findFirst({
      where: { eventId, email },
    });
    if (!participant) {
      return Response.json(
        { message: "Email tidak terdaftar sebagai peserta event ini" },
        { status: 404 },
      );
    }
    if (participant.nim && participant.nim !== nim) {
      return Response.json(
        { message: "NIM tidak cocok dengan data pendaftaran" },
        { status: 400 },
      );
    }

    /* ===== CEK DUPLIKAT ===== */
    const existing = await prisma.submission.findUnique({
      where: { eventId_participantId: { eventId, participantId: participant.id } },
    });
    if (existing) {
      return Response.json(
        { message: "Kamu sudah mengumpulkan tugas untuk event ini" },
        { status: 400 },
      );
    }

    /* ===== VALIDASI FILE ===== */
    if (!file || typeof file === "string" || file.size === 0) {
      return Response.json(
        { message: "File tugas wajib diupload (PDF atau gambar)" },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { message: "Format file harus PDF atau gambar (JPG/PNG/WEBP/GIF)" },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { message: "Ukuran file maksimal 10 MB" },
        { status: 400 },
      );
    }

    /* ===== UPLOAD CLOUDINARY ===== */
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error(
        "Cloudinary configuration missing: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET is not set.",
      );
      return Response.json(
        {
          message:
            "Layanan upload file (Cloudinary) belum dikonfigurasi di server. Silakan hubungi admin.",
        },
        { status: 500 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `himti-events/${eventId}/tugas`,
            resource_type: "auto",
            public_id: `tugas-${participant.id}-${Date.now()}`,
          },
          (err, result) => (err ? reject(err) : resolve(result)),
        )
        .end(buffer);
    });

    /* ===== SIMPAN SUBMISSION ===== */
    const submission = await prisma.submission.create({
      data: {
        eventId,
        participantId: participant.id,
        fileUrl: uploadResult.secure_url,
        fileName: file.name,
      },
      include: { participant: true, event: true },
    });

    /* ===== KIRIM EMAIL NOTIFIKASI PENGUMPULAN TUGAS ===== */
    // 1. Kirim notifikasi konfirmasi ke peserta (sertifikat akan dikirim via Google Drive WhatsApp)
    try {
      await sendTaskSubmissionEmail({
        email: participant.email,
        participant,
        event,
        submission,
      });
    } catch (emailError) {
      console.error(
        "Warning: Email konfirmasi tugas ke peserta gagal terkirim:",
        emailError.message,
      );
    }

    // 2. Kirim notifikasi ke admin/panitia jika ADMIN_EMAIL atau NOTIFY_ADMIN_SUBMISSION diset
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      (process.env.NOTIFY_ADMIN_SUBMISSION === "true"
        ? process.env.SMTP_USER
        : null);

    if (adminEmail) {
      try {
        await sendAdminTaskNotification({
          targetEmail: adminEmail,
          participant,
          event,
          submission,
        });
      } catch (adminError) {
        console.error(
          "Warning: Email notifikasi tugas ke admin gagal terkirim:",
          adminError.message,
        );
      }
    }

    return Response.json(
      {
        ...submission,
        message:
          "Tugas berhasil dikumpulkan. Sertifikat akan dibagikan oleh panitia melalui Google Drive via WhatsApp.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting tugas:", error);
    return Response.json(
      { message: "Terjadi kesalahan server", error: error.message },
      { status: 500 },
    );
  }
}