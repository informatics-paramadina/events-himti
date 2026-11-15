export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { generateCertificatePDF } from "@/lib/certificate";

/* =======================
   GET → unduh sertifikat PDF sebuah submission
======================= */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { participant: true, event: true },
    });

    if (!submission) {
      return Response.json(
        { message: "Sertifikat tidak ditemukan" },
        { status: 404 },
      );
    }

    const pdf = await generateCertificatePDF({
      participantName: submission.participant.nama,
      eventName: submission.event.nama_event,
      eventDate: submission.event.tanggal,
      certificateNumber: submission.certificateNumber,
      submittedAt: submission.submittedAt,
    });

    const safeName = submission.participant.nama.replace(/[^\w\s-]/g, "").trim();
    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Sertifikat-${safeName || "HIMTI"}.pdf"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return Response.json(
      { message: "Gagal membuat sertifikat", error: error.message },
      { status: 500 },
    );
  }
}