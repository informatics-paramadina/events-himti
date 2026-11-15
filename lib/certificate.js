import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const INK = hex("#1a1a1a");
const DARK = hex("#003300");
const GREEN = hex("#2AAF15");
const LIME = hex("#33CC00");
const MUTED = hex("#6b7280");
const PAPER = hex("#FEFEFE");

const PAGE_W = 842;
const PAGE_H = 595;

function fitSize(font, text, maxSize, maxWidth) {
  let size = maxSize;
  while (size > 8 && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }
  return size;
}

function centerText(page, text, y, font, maxSize, color, maxWidth = PAGE_W - 160) {
  const size = fitSize(font, text, maxSize, maxWidth);
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (PAGE_W - width) / 2, y, size, font, color });
  return size;
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Hasilkan PDF sertifikat otomatis (A4 landscape) memakai pdf-lib.
 * Mengembalikan Buffer siap kirim sebagai respons HTTP.
 */
export async function generateCertificatePDF({
  participantName,
  eventName,
  eventDate,
  certificateNumber,
  submittedAt,
}) {
  const doc = await PDFDocument.create();
  doc.setTitle(`Sertifikat - ${participantName}`);
  doc.setAuthor("HIMTI Universitas Paramadina");
  doc.setSubject(eventName);

  const page = doc.addPage([PAGE_W, PAGE_H]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const oblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  // Latar kertas
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: PAPER });

  // Bingkai luar & dalam
  page.drawRectangle({
    x: 24, y: 24, width: PAGE_W - 48, height: PAGE_H - 48,
    borderColor: DARK, borderWidth: 3,
  });
  page.drawRectangle({
    x: 34, y: 34, width: PAGE_W - 68, height: PAGE_H - 68,
    borderColor: GREEN, borderWidth: 1,
  });

  // Aksen sudut (kotak neo-brutalist)
  const corner = (x, y) =>
    page.drawRectangle({ x, y, width: 16, height: 16, color: LIME, borderColor: INK, borderWidth: 1.5 });
  corner(24, PAGE_H - 40);
  corner(PAGE_W - 40, PAGE_H - 40);
  corner(24, 24);
  corner(PAGE_W - 40, 24);

  // Header lembaga
  centerText(page, "HIMTI UNIVERSITAS PARAMADINA", PAGE_H - 92, bold, 15, DARK);
  centerText(page, "Himpunan Mahasiswa Teknik Informatika", PAGE_H - 110, regular, 10, MUTED);

  // Judul
  centerText(page, "SERTIFIKAT", PAGE_H - 168, bold, 52, INK);
  centerText(page, "Certificate of Completion", PAGE_H - 190, oblique, 14, GREEN);

  // Garis pemisah dekoratif
  page.drawLine({ start: { x: PAGE_W / 2 - 120, y: PAGE_H - 206 }, end: { x: PAGE_W / 2 + 120, y: PAGE_H - 206 }, thickness: 2, color: LIME });

  // Pemberian
  centerText(page, "Diberikan kepada:", PAGE_H - 240, regular, 13, MUTED);

  // Nama peserta
  const nameY = PAGE_H - 286;
  const nameSize = centerText(page, participantName, nameY, bold, 36, DARK, PAGE_W - 200);
  const nameWidth = bold.widthOfTextAtSize(participantName, nameSize);
  page.drawLine({
    start: { x: (PAGE_W - nameWidth) / 2 - 10, y: nameY - 10 },
    end: { x: (PAGE_W + nameWidth) / 2 + 10, y: nameY - 10 },
    thickness: 1.5, color: GREEN,
  });

  // Keterangan
  centerText(page, "atas partisipasi dan penyelesaian tugas pada event", PAGE_H - 322, regular, 13, INK);
  centerText(page, eventName, PAGE_H - 350, bold, 24, GREEN, PAGE_W - 200);
  centerText(page, `Diselenggarakan pada ${formatDate(eventDate)}`, PAGE_H - 374, regular, 12, MUTED);

  // Seal / stempel lingkaran kiri-bawah
  const sealX = 130;
  const sealY = 120;
  page.drawCircle({ x: sealX, y: sealY, size: 40, color: GREEN, borderColor: DARK, borderWidth: 2 });
  page.drawCircle({ x: sealX, y: sealY, size: 32, borderColor: PAPER, borderWidth: 1.5 });
  const sealText = "HIMTI";
  const sealSize = 13;
  const sealW = bold.widthOfTextAtSize(sealText, sealSize);
  page.drawText(sealText, { x: sealX - sealW / 2, y: sealY - 4, size: sealSize, font: bold, color: PAPER });
  const sealSub = "PARAMADINA";
  const sealSubSize = 6;
  const sealSubW = bold.widthOfTextAtSize(sealSub, sealSubSize);
  page.drawText(sealSub, { x: sealX - sealSubW / 2, y: sealY - 16, size: sealSubSize, font: bold, color: PAPER });

  // Blok tanda tangan kanan-bawah
  const sigX = PAGE_W - 250;
  const sigY = 110;
  page.drawLine({ start: { x: sigX, y: sigY }, end: { x: sigX + 180, y: sigY }, thickness: 1.5, color: INK });
  const sigLabel = "Ketua HIMTI Paramadina";
  const sigSize = 11;
  const sigW = bold.widthOfTextAtSize(sigLabel, sigSize);
  page.drawText(sigLabel, { x: sigX + (180 - sigW) / 2, y: sigY - 16, size: sigSize, font: bold, color: INK });

  // Nomor sertifikat & tanggal terbit (tengah bawah)
  const noText = `No: ${certificateNumber}`;
  centerText(page, noText, 70, regular, 10, MUTED);
  centerText(page, `Diterbitkan pada ${formatDate(submittedAt || new Date())}`, 56, regular, 9, MUTED);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}