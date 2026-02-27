import { prisma } from "../../../../../lib/prisma";
import * as XLSX from 'xlsx';

/**
 * GET /api/events/[id]/export
 * Export data peserta event ke format XLSX (Excel)
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    // Ambil data event beserta peserta
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!event) {
      return Response.json(
        { message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    // Generate Excel file
    const excelBuffer = generateExcel(event);

    // Return Excel response
    return new Response(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="peserta_${sanitizeFilename(event.nama_event)}_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error exporting Excel:', error);
    return Response.json(
      { message: "Gagal export data", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate Excel file from event data
 */
function generateExcel(event) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Info Sheet (Metadata)
  const infoData = [
    ['DAFTAR PESERTA EVENT'],
    [],
    ['Nama Event', event.nama_event],
    ['Tanggal', event.tanggal],
    ['Waktu', `${event.jam_mulai} - ${event.jam_berakhir} WIB`],
    ['Lokasi', event.lokasi],
    ['Kapasitas', event.kapasitas || 'Tidak terbatas'],
    ['Total Peserta', event.participants.length],
    ['Tanggal Export', new Date().toLocaleString('id-ID')],
  ];

  const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
  
  // Set column widths for info sheet
  infoSheet['!cols'] = [
    { wch: 20 },
    { wch: 50 }
  ];

  // Add info sheet to workbook
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info Event');

  // Participants Sheet
  const participantsData = [
    // Headers
    [
      'No',
      'Nama',
      'Email',
      'NIM',
      'No WhatsApp',
      'Jurusan',
      'Angkatan',
      'Role',
      'Status',
      'Tanggal Daftar'
    ],
    // Data rows
    ...event.participants.map((participant, index) => [
      index + 1,
      participant.nama,
      participant.email,
      participant.nim,
      participant.no_wa || '-',
      participant.jurusan,
      participant.angkatan,
      getRoleLabel(participant.role),
      participant.status,
      new Date(participant.createdAt).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    ])
  ];

  const participantsSheet = XLSX.utils.aoa_to_sheet(participantsData);

  // Set column widths for participants sheet
  participantsSheet['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // Nama
    { wch: 30 },  // Email
    { wch: 15 },  // NIM
    { wch: 15 },  // No WhatsApp
    { wch: 30 },  // Jurusan
    { wch: 10 },  // Angkatan
    { wch: 15 },  // Role
    { wch: 12 },  // Status
    { wch: 18 }   // Tanggal Daftar
  ];

  // Add participants sheet to workbook
  XLSX.utils.book_append_sheet(workbook, participantsSheet, 'Data Peserta');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { 
    type: 'buffer', 
    bookType: 'xlsx',
    cellStyles: true
  });

  return excelBuffer;
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9_\-\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_')              // Replace spaces with underscore
    .substring(0, 50);                  // Limit length
}

/**
 * Get role label with emoji
 */
function getRoleLabel(role) {
  const roleMap = {
    'PESERTA': '🎓 Peserta',
    'DOSEN': '👨‍🏫 Dosen',
    'PANITIA': '👔 Panitia'
  };
  return roleMap[role] || role;
}
