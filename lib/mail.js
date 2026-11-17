import nodemailer from 'nodemailer';

/**
 * Konfigurasi transporter menggunakan SMTP Gmail
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Kirim email konfirmasi pendaftaran event
 * @param {string} email - Email tujuan
 * @param {object} participant - Data peserta
 * @param {object} event - Data event
 */
export async function sendConfirmationEmail(email, participant, event) {
  const mailOptions = {
    from: `"HIMTI Event" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `✅ Konfirmasi Pendaftaran - ${event.nama_event}`,
    html: getConfirmationEmailTemplate(participant, event),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Template HTML untuk email konfirmasi
 */
function getConfirmationEmailTemplate(participant, event) {
  const roleStyles = {
    PESERTA: { bg: '#10b981', emoji: '👤', label: 'Peserta' },
    MAHASISWA: { bg: '#10b981', emoji: '🎓', label: 'Mahasiswa' },
    DOSEN: { bg: '#8b5cf6', emoji: '👨‍🏫', label: 'Dosen' },
    PANITIA: { bg: '#3b82f6', emoji: '👔', label: 'Panitia' },
    PENGURUS_HIMTI: { bg: '#3b82f6', emoji: '👔', label: 'Pengurus HIMTI' },
  };

  const role = (participant.role || 'PESERTA').toUpperCase();
  const roleInfo = roleStyles[role] || roleStyles.PESERTA;

  const valueOrDash = (value) => {
    if (value === null || value === undefined) return '-';
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : '-';
  };

  const baseFields = [
    { label: 'Nama', value: participant.nama },
    { label: 'Email', value: participant.email },
  ];

  const roleSpecificFields = {
    PESERTA: [
      { label: 'Instansi', value: participant.instansi ?? participant.jurusan },
    ],
    MAHASISWA: [
      { label: 'NIM', value: participant.nim },
      { label: 'Jurusan', value: participant.jurusan },
      { label: 'Angkatan', value: participant.angkatan },
    ],
    DOSEN: [],
    PANITIA: [
      { label: 'NIM', value: participant.nim },
      { label: 'Angkatan', value: participant.angkatan },
      { label: 'Divisi', value: participant.divisi ?? participant.jurusan },
    ],
    PENGURUS_HIMTI: [
      { label: 'NIM', value: participant.nim },
      { label: 'Jurusan', value: participant.prodi ?? participant.jurusan },
      { label: 'Angkatan', value: participant.angkatan },
      { label: 'Divisi', value: participant.divisi },
    ],
  };

  const visibleFields = [...baseFields, ...(roleSpecificFields[role] || roleSpecificFields.PESERTA)];

  const buktiPembayaranSection = participant.buktiPembayaran
  ? `
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; background-color: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
          <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #92400e;">
            🧾 Bukti Pembayaran
          </p>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #78350f;">
            Berikut adalah bukti pembayaran yang telah Anda upload:
          </p>
          <a href="${participant.buktiPembayaran}" target="_blank"
            style="display: inline-block; padding: 10px 16px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
            Lihat Bukti Pembayaran
          </a>
        </td>
      </tr>
    </table>
  `
  : '';

  const participantInfoRows = visibleFields
    .map(
      (field) => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280;">${field.label}:</span>
                    <strong style="font-size: 14px; color: #1f2937; float: right;">${valueOrDash(field.value)}</strong>
                  </td>
                </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Pendaftaran Event</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✅ Pendaftaran Berhasil!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Halo <strong>${participant.nama}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Terima kasih telah mendaftar! Pendaftaran Anda untuk event berikut telah berhasil dikonfirmasi:
              </p>

              <!-- Event Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; border: 2px solid #e5e7eb; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #1f2937; font-weight: bold;">
                      ${event.nama_event}
                    </h2>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">
                          <span style="display: inline-block; width: 24px; text-align: center;">📅</span>
                          <strong style="color: #374151;">Tanggal:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #1f2937; text-align: right;">
                          ${event.tanggal}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">
                          <span style="display: inline-block; width: 24px; text-align: center;">⏰</span>
                          <strong style="color: #374151;">Waktu:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #1f2937; text-align: right;">
                          ${event.jam_mulai} - ${event.jam_berakhir} WIB
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">
                          <span style="display: inline-block; width: 24px; text-align: center;">📍</span>
                          <strong style="color: #374151;">Lokasi:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #1f2937; text-align: right;">
                          ${event.lokasi}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Participant Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                ${participantInfoRows}
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="font-size: 14px; color: #6b7280;">Status Pendaftaran:</span>
                    <span style="float: right; background-color: ${roleInfo.bg}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                      ${roleInfo.emoji} ${roleInfo.label}
                    </span>
                  </td>
                </tr>
              </table>

              ${buktiPembayaranSection}

              <!-- Instructions -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #1e40af;">
                  📌 Hal yang Perlu Diperhatikan:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #1e40af;">
                  <li>Simpan email ini sebagai bukti pendaftaran</li>
                  <li>Jika berhalangan hadir, mohon hubungi panitia</li>
                </ul>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Jika ada pertanyaan, silakan hubungi kami melalui kontak yang tersedia di website.
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Sampai jumpa di acara!<br>
                <strong style="color: #667eea;">Dibuat oleh Research &amp; Technology HIMTI Paramadina</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                Email ini dikirim otomatis oleh sistem HIMTI Event Management
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                © ${new Date().getFullYear()} HIMTI Universitas Paramadina. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Helper memformat tanggal & waktu ke format Indonesia (Asia/Jakarta)
 */
function formatIndonesianDate(date, withTime = false) {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return (
      new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        ...(withTime
          ? { timeStyle: 'short', timeZone: 'Asia/Jakarta' }
          : { timeZone: 'Asia/Jakarta' }),
      }).format(d) + (withTime ? ' WIB' : '')
    );
  } catch (e) {
    return String(date);
  }
}

/**
 * Kirim email notifikasi konfirmasi pengumpulan tugas ke peserta.
 * Menjelaskan bahwa tugas telah diterima dan sertifikat akan dikirim via Google Drive melalui WA.
 */
export async function sendTaskSubmissionEmail(optionsOrEmail, participant, event, certificateUrl, certificateNumber, submission = null) {
  let opts = {};
  if (
    typeof optionsOrEmail === 'object' &&
    optionsOrEmail !== null &&
    !Array.isArray(optionsOrEmail) &&
    optionsOrEmail.email
  ) {
    opts = optionsOrEmail;
  } else {
    opts = {
      email: optionsOrEmail,
      participant,
      event,
      certificateUrl,
      certificateNumber,
      submission,
    };
  }

  const {
    email,
    participant: p = {},
    event: ev = {},
    submission: sub = {},
  } = opts;

  const mailOptions = {
    from: `"HIMTI Event" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `✅ Konfirmasi Pengumpulan Tugas - ${ev.nama_event || 'Event HIMTI'}`,
    html: getTaskSubmissionEmailTemplate(p, ev, sub),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Task submission notification email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send task submission email:', error);
    throw error;
  }
}

/**
 * Backward-compatible alias untuk sendTaskSubmissionEmail
 */
export async function sendCertificateEmail(email, participant, event, certificateUrl, certificateNumber, submission = null) {
  return sendTaskSubmissionEmail(email, participant, event, certificateUrl, certificateNumber, submission);
}

/**
 * Kirim email notifikasi ke admin/panitia saat ada tugas baru dikumpulkan
 */
export async function sendAdminTaskNotification({
  targetEmail,
  participant = {},
  event = {},
  submission = {},
}) {
  const recipient = targetEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!recipient) return null;

  const mailOptions = {
    from: `"HIMTI Event System" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject: `📥 [Tugas Masuk] ${participant.nama || 'Peserta'} - ${event.nama_event || 'Event HIMTI'}`,
    html: getAdminTaskNotificationTemplate(participant, event, submission),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin task notification email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send admin task notification email:', error);
    throw error;
  }
}

/**
 * Template HTML email notifikasi pengumpulan tugas untuk peserta
 */
function getTaskSubmissionEmailTemplate(participant, event, submission) {
  const formattedSubmittedAt = formatIndonesianDate(submission?.submittedAt || new Date(), true);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Pengumpulan Tugas</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 36px 30px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 26px; font-weight: bold;">
                ✅ Pengumpulan Tugas Berhasil!
              </h1>
              <p style="margin: 0; color: #dcfce7; font-size: 15px; font-weight: 500;">
                ${event.nama_event || 'HIMTI Event'}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 30px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Halo <strong>${participant.nama || 'Peserta'}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
                Terima kasih telah berpartisipasi! Tugas kamu untuk event <strong>${event.nama_event}</strong> telah berhasil kami terima dan tersimpan di sistem HIMTI.
              </p>

              <!-- Card: Rincian Pengumpulan Tugas -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 14px 0; font-size: 15px; font-weight: bold; color: #1e293b;">
                      📋 Rincian Pengumpulan Tugas
                    </p>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      ${event.judulTugas ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #64748b; width: 140px;">Judul Tugas:</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${event.judulTugas}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #64748b; width: 140px;">Nama File:</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right; word-break: break-all;">${submission?.fileName || 'File Tugas'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Waktu Submit:</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${formattedSubmittedAt}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Status:</td>
                        <td style="padding: 6px 0; text-align: right;">
                          <span style="background-color: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700;">
                            ✔ Berhasil Diterima
                          </span>
                        </td>
                      </tr>
                    </table>

                    ${submission?.fileUrl ? `
                    <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1; text-align: center;">
                      <a href="${submission.fileUrl}" target="_blank"
                        style="display: inline-block; padding: 9px 18px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">
                        📎 Buka File Tugas yang Diupload
                      </a>
                    </div>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <!-- Card: Informasi Sertifikat via Google Drive & WA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fefce8; border: 2px solid #fef08a; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #854d0e;">
                      🎓 Informasi Pembagian Sertifikat
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #713f12;">
                      Sertifikat kegiatan <strong>tidak diterbitkan otomatis secara langsung</strong>. Setelah seluruh tugas peserta selesai direkap dan divalidasi oleh panitia, tautan folder <strong>Google Drive</strong> berisi e-sertifikat akan dibagikan melalui <strong>WhatsApp (WA)</strong>.
                    </p>
                    <div style="background-color: #ffffff; border: 1px solid #fef08a; border-radius: 6px; padding: 12px;">
                      <p style="margin: 0; font-size: 13px; color: #854d0e; line-height: 1.5;">
                        📲 <strong>Penting:</strong> Pastikan nomor WhatsApp kamu (<strong>${participant.no_wa || 'yang telah didaftarkan'}</strong>) tetap aktif untuk menerima link folder sertifikat dari panitia.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Data Identitas Peserta -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 8px; font-size: 14px; font-weight: bold; color: #374151; border-bottom: 2px solid #f1f5f9;">
                    Data Peserta Terdaftar
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b7280; width: 140px;">Nama Lengkap:</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937; text-align: right;">${participant.nama || '-'}</td>
                </tr>
                ${participant.nim ? `
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">NIM:</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937; text-align: right;">${participant.nim}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Email:</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937; text-align: right;">${participant.email || '-'}</td>
                </tr>
                ${participant.no_wa ? `
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">No. WhatsApp:</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937; text-align: right;">${participant.no_wa}</td>
                </tr>
                ` : ''}
                ${(participant.jurusan || participant.instansi) ? `
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Jurusan / Instansi:</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937; text-align: right;">${participant.jurusan || participant.instansi}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Notice Box -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #1e40af;">
                  📌 Simpan email ini sebagai bukti sah kamu telah mengumpulkan tugas event tepat waktu. Jika ada pertanyaan mengenai kegiatan atau sertifikat, hubungi narahubung panitia HIMTI.
                </p>
              </div>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                Salam hangat,<br>
                <strong style="color: #16a34a;">Research &amp; Technology HIMTI Paramadina</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #6b7280;">
                Email ini dikirim otomatis oleh sistem HIMTI Event Management
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} HIMTI Universitas Paramadina. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Template HTML notifikasi untuk admin / panitia saat ada tugas baru masuk
 */
function getAdminTaskNotificationTemplate(participant, event, submission) {
  const formattedSubmittedAt = formatIndonesianDate(submission?.submittedAt || new Date(), true);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notifikasi Pengumpulan Tugas Masuk</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0 0 6px 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                📥 Tugas Masuk Baru
              </h1>
              <p style="margin: 0; color: #bfdbfe; font-size: 14px; font-weight: 500;">
                ${event.nama_event || 'Event HIMTI'}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                Halo Tim Panitia HIMTI,<br>
                Seorang peserta baru saja mengumpulkan tugas untuk event <strong>${event.nama_event}</strong>:
              </p>

              <!-- Table Data -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 140px;">Nama Peserta</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a;">${participant.nama || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">NIM</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a;">${participant.nim || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Email</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a;">${participant.email || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">No. WhatsApp</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #166534;">${participant.no_wa || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Instansi / Jurusan</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a;">${participant.jurusan || participant.instansi || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Nama File</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a; word-break: break-all;">${submission?.fileName || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Waktu Submit</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a;">${formattedSubmittedAt}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b;">Status Sertifikat</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #854d0e;">Dikirim via Drive (WhatsApp)</td>
                </tr>
              </table>

              <!-- Action button -->
              ${submission?.fileUrl ? `
              <div style="margin-bottom: 16px;">
                <a href="${submission.fileUrl}" target="_blank"
                  style="display: inline-block; padding: 11px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">
                  📎 Lihat File Tugas Peserta (Cloudinary)
                </a>
              </div>
              ` : ''}

              <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                Catatan: Peserta telah diinformasikan bahwa sertifikat akan dibagikan melalui Google Drive via WhatsApp. Data tugas lengkap juga tersedia di Dashboard Admin HIMTI.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 18px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Notifikasi Otomatis • HIMTI Event Management System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
