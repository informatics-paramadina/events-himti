import { prisma } from "../../../../../lib/prisma";

/**
 * GET /api/events/[id]/export
 * Export data peserta event ke format CSV
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

    // Generate CSV content
    const csvContent = generateCSV(event);

    // Return CSV response
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="peserta_${sanitizeFilename(event.nama_event)}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting CSV:', error);
    return Response.json(
      { message: "Gagal export data", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV content from event data
 */
function generateCSV(event) {
  // CSV Headers
  const headers = [
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
  ];

  // CSV Rows
  const rows = event.participants.map((participant, index) => {
    return [
      index + 1,
      escapeCSV(participant.nama),
      escapeCSV(participant.email),
      escapeCSV(participant.nim),
      escapeCSV(participant.no_wa || '-'),
      escapeCSV(participant.jurusan),
      escapeCSV(participant.angkatan),
      getRoleLabel(participant.role),
      escapeCSV(participant.status),
      new Date(participant.createdAt).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    ];
  });

  // Info header (metadata event)
  const metadata = [
    ['DAFTAR PESERTA EVENT'],
    [''],
    ['Nama Event', event.nama_event],
    ['Tanggal', event.tanggal],
    ['Waktu', `${event.jam_mulai} - ${event.jam_berakhir} WIB`],
    ['Lokasi', event.lokasi],
    ['Kapasitas', event.kapasitas || 'Tidak terbatas'],
    ['Total Peserta', event.participants.length],
    ['Tanggal Export', new Date().toLocaleString('id-ID')],
    [''],
    []
  ];

  // Combine metadata + headers + rows
  const allRows = [
    ...metadata,
    headers,
    ...rows
  ];

  // Convert to CSV string with BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvString = allRows
    .map(row => row.join(','))
    .join('\n');

  return BOM + csvString;
}

/**
 * Escape CSV special characters
 */
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
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
