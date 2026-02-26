import { prisma } from "../../../lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany();
  return Response.json(events);
}

export async function POST(req) {
  const body = await req.json();

  const event = await prisma.event.create({
    data: {
      nama_event: body.nama_event,
      deskripsi: body.deskripsi,
      tanggal: new Date(body.tanggal),
      jam: body.jam,
      lokasi: body.lokasi,
      kapasitas: body.kapasitas,
    },
  });

  return Response.json(event);
}