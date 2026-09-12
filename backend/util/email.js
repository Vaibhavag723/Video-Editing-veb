// Transactional email for the "forgot password" flow.
//
// Two delivery modes:
//  - Real SMTP   — when SMTP_HOST is set (plus SMTP_FROM) the email is sent
//                  through nodemailer using the configured credentials.
//  - Dev mode    — no SMTP configured: the reset link is printed to the server
//                  console and returned to the caller so the flow can be
//                  exercised locally without a mail server.
//
// nodemailer is required lazily so the app still boots if it was not installed.

const APP_URL_DEFAULT = 'http://localhost:5173';

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

// Base URL of the frontend, used to build the reset link inside the email.
function appUrl() {
  return String(process.env.APP_URL || APP_URL_DEFAULT).replace(/\/+$/, '');
}

async function sendPasswordResetEmail(to, name, token) {
  const link = `${appUrl()}/?reset=${encodeURIComponent(token)}`;
  const subject = 'Cutroom — reset your password';
  const label = String(name || 'there');
  const text =
    `Hi ${label},\n\n` +
    `We received a request to reset your Cutroom password. Click the link below to choose a new one:\n\n` +
    `${link}\n\n` +
    `This link is valid for 1 hour and can only be used once. If you did not request this, ` +
    `you can safely ignore this email — your password will stay the same.\n\n` +
    `— The Cutroom team`;
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1d29">` +
    `<h2 style="margin:0 0 4px">Cutroom</h2>` +
    `<p style="color:#5a6178">Reset your password</p>` +
    `<p>Hi ${label.replace(/[<>&]/g, '')},</p>` +
    `<p>We received a request to reset your Cutroom password. Click the button below to choose a new one:</p>` +
    `<p><a href="${link}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:linear-gradient(135deg,#00f0c8,#4c8dff);color:#052018;font-weight:700;text-decoration:none">Choose a new password</a></p>` +
    `<p style="font-size:12px;color:#71717c">This link is valid for 1 hour and can only be used once. ` +
    `If you did not request this, you can safely ignore this email — your password will stay the same.</p>` +
    `</div>`;

  if (smtpConfigured()) {
    await sendMail({ to, subject, text, html });
    return { sent: true };
  }

  console.log('\n[mail:dev] Password reset requested for', to);
  console.log('[mail:dev] Reset link:', link);
  console.log('[mail:dev] Configure SMTP_HOST / SMTP_FROM in backend/.env to send real email.\n');
  return { sent: false, link };
}

// Shared nodemailer transport built from the SMTP_* environment variables.
function sendMail({ to, subject, text, html }) {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text, html });
}

// Notify the site owner (SMTP_FROM) about a question submitted through the
// "Ask a question" form. Falls back to a console log in dev mode.
async function sendAdminMessageNotification({ name, email, subject, message }) {
  if (smtpConfigured()) {
    await sendMail({
      to: process.env.SMTP_FROM,
      subject: `New question from the website — ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    });
    return { sent: true };
  }
  console.log(`\n[contact:dev] New question from ${name} <${email}>`);
  console.log(`[contact:dev] Subject: ${subject}`);
  console.log(`[contact:dev] ${message}\n`);
  return { sent: false };
}

module.exports = { sendPasswordResetEmail, sendAdminMessageNotification, smtpConfigured, appUrl };