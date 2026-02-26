import { prisma } from "../../../lib/prisma";

/* =======================
   GET → ambil semua peserta
======================= */
export async function GET() {
  const data = await prisma.participant.findMany({
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(data);
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
        status,
        eventId,
      },
    });

    return Response.json(participant);
  } catch (err) {
    console.log(err);

    return Response.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}