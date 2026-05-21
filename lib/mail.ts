import nodemailer from 'nodemailer';

// Recipient for all lead / contact notifications
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'info@mojautodiler.com';

const {
  ZOHO_SMTP_HOST,
  ZOHO_SMTP_PORT,
  ZOHO_SMTP_USER,
  ZOHO_SMTP_PASS,
} = process.env;

const smtpReady = Boolean(ZOHO_SMTP_HOST && ZOHO_SMTP_USER && ZOHO_SMTP_PASS);

// Lazily created — module-level singleton kept across warm lambda invocations
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   ZOHO_SMTP_HOST,
      port:   Number(ZOHO_SMTP_PORT ?? 465),
      secure: true, // port 465 requires SSL
      auth: {
        user: ZOHO_SMTP_USER,
        pass: ZOHO_SMTP_PASS,
      },
    });
  }
  return transporter;
}

export interface LeadEmailData {
  name: string;
  phone: string;
  email?: string;
  message: string;
  intent?: string;
  vehicleTitle?: string;
  attachment?: {
    filename: string;
    buffer: Buffer;
    contentType: string;
  };
}

/**
 * Sends a lead notification email to CONTACT_EMAIL via Zoho SMTP.
 * Silently skips (with a console log in dev) when SMTP is not configured,
 * so the contact form continues working in environments without email set up.
 */
export async function sendLeadNotification(data: LeadEmailData): Promise<void> {
  if (!smtpReady) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[mail] Zoho SMTP not configured — skipping email. Lead data:', data);
    }
    return;
  }

  const { name, phone, email, message, intent, vehicleTitle } = data;

  const subject = vehicleTitle
    ? `Nova upita za vozilo: ${vehicleTitle}`
    : 'Nova kontakt poruka — Moj Auto Diler';

  const rows: [string, string][] = [
    ['Ime', name],
    ['Telefon', phone],
    ...(email        ? [['Email', email] as [string, string]]               : []),
    ['Poruka', message],
    ...(vehicleTitle ? [['Vozilo', vehicleTitle] as [string, string]]        : []),
    ...(intent       ? [['Tip upita', intent] as [string, string]]           : []),
  ];

  const htmlRows = rows
    .map(([label, value]) =>
      `<tr>` +
      `<td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top"><strong>${label}</strong></td>` +
      `<td style="padding:6px 0;color:#111827">${value}</td>` +
      `</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="sr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#1a1a2e;padding:20px 24px">
      <p style="margin:0;color:#c9a84c;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700">Moj Auto Diler</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:18px;font-weight:700">${subject}</h1>
    </div>
    <div style="padding:24px">
      <table style="border-collapse:collapse;width:100%">${htmlRows}</table>
    </div>
    <div style="padding:12px 24px;background:#f9fafb;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:11px;color:#9ca3af">Primljeno automatski sa sajta mojautodiler.com</p>
    </div>
  </div>
</body>
</html>`;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

  await getTransporter().sendMail({
    from:    `"Moj Auto Diler" <${ZOHO_SMTP_USER}>`,
    to:      CONTACT_EMAIL,
    ...(email ? { replyTo: email } : {}),
    subject,
    html,
    text,
    ...(data.attachment ? {
      attachments: [{
        filename: data.attachment.filename,
        content:  data.attachment.buffer,
        contentType: data.attachment.contentType,
      }],
    } : {}),
  });
}
