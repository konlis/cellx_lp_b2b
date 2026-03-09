/**
 * Vercel Serverless Function — Contact Form → Resend Email
 * retrofit24.pl — Home Fit+ B2B partner inquiries
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Resend account at https://resend.com
 * 2. Add your domain and verify it
 * 3. Create an API key
 * 4. In Vercel dashboard → Settings → Environment Variables, add:
 *    - RESEND_API_KEY = your Resend API key
 *    - RECIPIENT_EMAIL = the email address to receive form submissions
 * 5. Deploy to Vercel
 */

// Simple in-memory rate limiter (resets on cold start)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max requests per IP per minute

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function sanitizePlainText(str, maxLen = 50) {
  return String(str).replace(/[\r\n\t\x00-\x1f]/g, '').substring(0, maxLen);
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS: restrict to own origin
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://retrofit24.pl';
  const origin = req.headers.origin;
  if (origin && origin !== allowedOrigin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  const { name, phone, email, city, company, nip, monthly_installations, message, website } = req.body;

  // Honeypot check (silent success to confuse bots)
  if (website) {
    return res.status(200).json({ success: true });
  }

  // Basic required field validation
  if (!name || !phone || !email || !company) {
    return res.status(400).json({ error: 'Missing required fields: name, phone, email, company' });
  }

  // Field length limits
  if (String(name).length > 100 || String(phone).length > 30 || String(email).length > 254 ||
      (city && String(city).length > 100) || (message && String(message).length > 5000) ||
      (company && String(company).length > 200) || (nip && String(nip).length > 20) ||
      (monthly_installations && String(monthly_installations).length > 20)) {
    return res.status(400).json({ error: 'Field length exceeded' });
  }

  // Strict email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Phone format validation
  const phoneRegex = /^[\d\s+\-()]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone format' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipientEmail = process.env.RECIPIENT_EMAIL;

  if (!apiKey || !recipientEmail) {
    console.error('Missing environment variables: RESEND_API_KEY or RECIPIENT_EMAIL');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Sanitized subject line
  const subject = `Nowe zapytanie partnerskie Home Fit+ — ${sanitizePlainText(name)} z ${sanitizePlainText(city || 'nieznane miasto')}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1d1d1f; border-bottom: 3px solid #7ed957; padding-bottom: 10px;">
        Nowe zapytanie partnerskie — Home Fit+
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 12px; font-weight: bold; color: #555; width: 160px;">Imię:</td><td style="padding: 8px 12px;">${escapeHtml(name)}</td></tr>
        <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Firma:</td><td style="padding: 8px 12px;">${escapeHtml(company)}</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">NIP:</td><td style="padding: 8px 12px;">${escapeHtml(nip || '—')}</td></tr>
        <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Telefon:</td><td style="padding: 8px 12px;">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Miasto/Region:</td><td style="padding: 8px 12px;">${escapeHtml(city || '—')}</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Instalacje miesięcznie:</td><td style="padding: 8px 12px;">${escapeHtml(monthly_installations || '—')}</td></tr>
      </table>
      ${message ? `
      <div style="margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
        <strong style="color: #555;">Wiadomość:</strong>
        <p style="margin: 8px 0 0; color: #333;">${escapeHtml(message)}</p>
      </div>
      ` : ''}
      <p style="margin-top: 24px; font-size: 12px; color: #999;">
        Wiadomość wysłana z formularza na retrofit24.pl
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Home Fit+ <noreply@retrofit24.pl>',
        to: [recipientEmail],
        reply_to: email,
        subject,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Send error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
