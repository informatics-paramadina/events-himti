export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "../../../../../lib/prisma";
import * as XLSX from "xlsx";

/**
 * GET /api/events/[id]/export
 * Export data peserta event ke format XLSX (Excel)
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Ambil data event beserta peserta
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!event) {
      return Response.json(
        { message: "Event tidak ditemukan" },
        { status: 404 },
      );
    }

    // Generate Excel file
    const excelBuffer = generateExcel(event);

    // Return Excel response
    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="peserta_${sanitizeFilename(event.nama_event)}_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting Excel:", error);
    return Response.json(
      { message: "Gagal export data", error: error.message },
      { status: 500 },
    );
  }
}

/**
 * Generate Excel file from event data
 */
function generateExcel(event) {
  const workbook = XLSX.utils.book_new();
  const exportDate = new Date();
  const eventDate = formatDate(event.tanggal);

  const infoData = [
    ["DAFTAR PESERTA EVENT"],
    [],
    ["Nama Event", normalizeCell(event.nama_event)],
    ["Tanggal", eventDate],
    ["Waktu", normalizeCell(`${event.jam_mulai} - ${event.jam_berakhir} WIB`)],
    ["Lokasi", normalizeCell(event.lokasi)],
    ["Kapasitas", event.kapasitas ?? "Tidak terbatas"],
    ["Total Peserta", event.participants.length],
    ["Tanggal Export", exportDate.toLocaleString("id-ID")],
  ];

  const infoSheet = XLSX.utils.aoa_to_sheet(infoData);

  // Set column widths for info sheet
  infoSheet["!cols"] = [{ wch: 20 }, { wch: 50 }];

  // Add info sheet to workbook
  XLSX.utils.book_append_sheet(workbook, infoSheet, "Info Event");

  const participantsData = [
    [
      "No",
      "Nama",
      "Email",
      "NIM",
      "No WhatsApp",
      "Jurusan",
      "Instansi",
      "Divisi",
      "Angkatan",
      "Role",
      "Status",
      "Status Pembayaran",
      "Tanggal Daftar",
    ],
    ...event.participants.map((participant, index) => {
      const { jurusan } = mapParticipantFields(participant);

      return [
        index + 1,
        normalizeCell(participant.nama),
        normalizeCell(participant.email),
        normalizeCell(participant.nim),
        normalizeCell(participant.no_wa),
        normalizeCell(jurusan),
        normalizeCell(participant.instansi),
        normalizeCell(participant.divisi),
        normalizeCell(participant.angkatan),
        getRoleLabel(participant.role),
        normalizeCell(participant.status),
        getPaymentProofLabel(participant.paymentStatus),
        new Date(participant.createdAt).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      ];
    }),
  ];

  function getPaymentProofLabel(bukti) {
    if (!bukti) return "❌ Belum Upload";
    return bukti;
  }

  const participantsSheet = XLSX.utils.aoa_to_sheet(participantsData);

  participantsSheet["!cols"] = [
    { wch: 5 }, // No
    { wch: 25 }, // Nama
    { wch: 30 }, // Email
    { wch: 15 }, // NIM
    { wch: 16 }, // No WhatsApp
    { wch: 24 }, // Jurusan
    { wch: 24 }, // Instansi
    { wch: 24 }, // Divisi
    { wch: 10 }, // Angkatan
    { wch: 18 }, // Role
    { wch: 12 }, // Status
    { wch: 20 }, // Bukti Pembayaran
    { wch: 20 }, // Tanggal Daftar
  ];

  XLSX.utils.book_append_sheet(workbook, participantsSheet, "Data Peserta");

  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
    cellStyles: true,
  });

  return excelBuffer;
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9_\-\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscore
    .substring(0, 50); // Limit length
}

/**
 * Get role label with emoji
 */
function getRoleLabel(role) {
  const roleMap = {
    PESERTA: "👤 Peserta",
    MAHASISWA: "🎓 Mahasiswa",
    DOSEN: "👨‍🏫 Dosen",
    PANITIA: "👔 Panitia",
    PENGURUS_HIMTI: "🏛️ Pengurus HIMTI",
  };
  return roleMap[role] || normalizeCell(role);
}

function mapParticipantFields(participant) {
  const role = String(participant.role || "").toUpperCase();
  const source = participant.jurusan;

  if (role === "PESERTA") {
    return { jurusan: null, instansi: source, divisi: null };
  }

  if (role === "PANITIA") {
    return { jurusan: null, instansi: null, divisi: source };
  }

  if (role === "MAHASISWA" || role === "PENGURUS_HIMTI") {
    return { jurusan: source, instansi: null, divisi: null };
  }

  return { jurusan: null, instansi: null, divisi: null };
}

function normalizeCell(value) {
  const text =
    value === null || value === undefined || value === "" ? "-" : String(value);
  if (/^[=+\-@]/.test(text)) {
    return `'${text}`;
  }
  return text;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
