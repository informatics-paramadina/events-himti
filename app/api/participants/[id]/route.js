export const dynamic = "force-dynamic"

import { prisma } from "../../../../lib/prisma";

/* =======================
   PUT → update peserta
======================= */
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return Response.json(
        { message: "ID peserta tidak ditemukan" },
        { status: 400 }
      );
    }

    const participantId = parseInt(id, 10);
    if (isNaN(participantId)) {
      return Response.json(
        { message: "ID peserta harus berupa angka" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return Response.json(
        { message: "Status harus disertakan" },
        { status: 400 }
      );
    }

    // Valid status values
    const validStatuses = ['terdaftar', 'hadir', 'tidak_hadir', 'dibatalkan'];
    if (!validStatuses.includes(status)) {
      return Response.json(
        { message: `Status harus salah satu dari: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: { status },
      include: { event: true },
    });

    return Response.json(participant, { status: 200 });
  } catch (error) {
    console.error('Error updating participant:', error);
    if (error.code === 'P2025') {
      return Response.json(
        { message: "Peserta tidak ditemukan" },
        { status: 404 }
      );
    }
    return Response.json(
      { message: "Terjadi kesalahan server", error: error.message },
      { status: 500 }
    );
  }
}

/* =======================
   DELETE → hapus peserta
======================= */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { message: "ID peserta tidak ditemukan" },
        { status: 400 }
      );
    }

    const participantId = parseInt(id, 10);
    if (isNaN(participantId)) {
      return Response.json(
        { message: "ID peserta harus berupa angka" },
        { status: 400 }
      );
    }

    await prisma.participant.delete({
      where: { id: participantId },
    });

    return Response.json({ message: "Peserta berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error('Error deleting participant:', error);
    if (error.code === 'P2025') {
      return Response.json(
        { message: "Peserta tidak ditemukan" },
        { status: 404 }
      );
    }
    return Response.json(
      { message: "Terjadi kesalahan server", error: error.message },
      { status: 500 }
    );
  }
}
