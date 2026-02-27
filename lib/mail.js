import nodemailer from 'nodemailer';

/**
 * Konfigurasi transporter menggunakan SMTP Gmail
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
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
  // Mapping role ke badge style
  const roleStyles = {
    PESERTA: { bg: '#10b981', emoji: '🎓', label: 'Peserta' },
    DOSEN: { bg: '#8b5cf6', emoji: '👨‍🏫', label: 'Dosen' },
    PANITIA: { bg: '#3b82f6', emoji: '👔', label: 'Panitia' }
  };

  const roleInfo = roleStyles[participant.role] || roleStyles.PESERTA;

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
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280;">Nama:</span>
                    <strong style="font-size: 14px; color: #1f2937; float: right;">${participant.nama}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280;">Email:</span>
                    <strong style="font-size: 14px; color: #1f2937; float: right;">${participant.email}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280;">NIM:</span>
                    <strong style="font-size: 14px; color: #1f2937; float: right;">${participant.nim}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280;">Jurusan:</span>
                    <strong style="font-size: 14px; color: #1f2937; float: right;">${participant.jurusan}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280;">Angkatan:</span>
                    <strong style="font-size: 14px; color: #1f2937; float: right;">${participant.angkatan}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="font-size: 14px; color: #6b7280;">Status Pendaftaran:</span>
                    <span style="float: right; background-color: ${roleInfo.bg}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                      ${roleInfo.emoji} ${roleInfo.label}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #1e40af;">
                  📌 Hal yang Perlu Diperhatikan:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #1e40af;">
                  <li>Harap datang <strong>15 menit sebelum</strong> acara dimulai</li>
                  <li>Bawa <strong>kartu identitas</strong> (KTM/KTP) untuk verifikasi</li>
                  <li>Simpan email ini sebagai bukti pendaftaran</li>
                  <li>Jika berhalangan hadir, mohon hubungi panitia</li>
                </ul>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Jika ada pertanyaan, silakan hubungi kami melalui kontak yang tersedia di website.
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Sampai jumpa di acara!<br>
                <strong style="color: #667eea;">Tim HIMTI</strong>
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
