import { prisma } from "../../../lib/prisma";
import { sendConfirmationEmail } from "../../../lib/mail";

/* =======================
   GET → ambil semua peserta
======================= */
export async function GET() {
  try {
    const data = await prisma.participant.findMany({
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching participants:', error.message);
    return Response.json(
      { error: 'Failed to fetch participants', message: error.message },
      { status: 500 }
    );
  }
}

/* =======================
   POST → daftar peserta
======================= */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      nama,
      email,
      nim,
      no_wa,
      jurusan,
      angkatan,
      status,
      role,
      eventId,
    } = body;

    /* ===== VALIDASI ===== */
    if (!nama || !email || !nim || !eventId) {
      return Response.json(
        { message: "Data belum lengkap" },
        { status: 400 }
      );
    }

    /* ===== CEK DOUBLE ===== */
    const existing = await prisma.participant.findFirst({
      where: { nim, eventId },
    });

    if (existing) {
      return Response.json(
        { message: "Kamu sudah terdaftar di event ini" },
        { status: 400 }
      );
    }

    /* ===== CEK EVENT ===== */
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: true },
    });

    if (!event) {
      return Response.json(
        { message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    /* ===== CEK KUOTA ===== */
    if (
      event.kapasitas &&
      event.participants.length >= event.kapasitas
    ) {
      return Response.json(
        { message: "Kuota event sudah penuh" },
        { status: 400 }
      );
    }

    /* ===== SIMPAN ===== */
    const participant = await prisma.participant.create({
      data: {
        nama,
        email,
        nim,
        no_wa,
        jurusan,
        angkatan,
        status: status || "terdaftar",
        role: role || "PESERTA",
        eventId,
      },
      include: { event: true },
    });

    /* ===== KIRIM EMAIL KONFIRMASI ===== */
    try {
      await sendConfirmationEmail(email, participant, participant.event);
    } catch (emailError) {
      console.error('Warning: Email confirmation failed, but registration successful:', emailError.message);
      // Tidak gagalkan registrasi jika email gagal terkirim
    }

    return Response.json(participant, { status: 201 });
  } catch (err) {
    console.error('Error creating participant:', err);
    return Response.json(
      { message: "Terjadi kesalahan server", error: err.message },
      { status: 500 }
    );
  }
}