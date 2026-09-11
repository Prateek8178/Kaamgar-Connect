const { Resend } = require('resend');

// ─── Resend Client (HTTP API — works on Render free tier) ────────────────────
let _resend = null;

const getResendClient = () => {
  if (_resend) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  RESEND_API_KEY not set — emails will be skipped');
    return null;
  }
  _resend = new Resend(apiKey);
  console.log('📧 Resend email client ready');
  return _resend;
};

// ─── OTP Email HTML Template ─────────────────────────────────────────────────
const getOtpEmailHtml = (user, otp, purpose) => {
  const purposeText = {
    register: 'verify your email',
    login: 'sign in to your account',
    resend: 'verify your email',
  }[purpose] || 'verify your account';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Kaamgar Connect — OTP Verification</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'DM Sans',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:32px;text-align:center;">
          <div style="width:52px;height:52px;background:#fff;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:900;color:#4f46e5;margin-bottom:12px;">K</div>
          <h1 style="margin:0;color:#fff;font-size:1.5rem;font-weight:800;">Kaamgar Connect</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.8);font-size:.92rem;">India's Local Job Marketplace</p>
        </td></tr>
        <tr><td style="padding:40px 36px;">
          <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:1.2rem;">Email Verification</h2>
          <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">Hi <strong style="color:#f1f5f9;">${user.username}</strong>, please use the OTP below to ${purposeText}:</p>
          <div style="background:#0f172a;border:2px solid #4f46e5;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <div style="font-size:2.5rem;font-weight:900;letter-spacing:12px;color:#4f46e5;font-family:monospace;">${otp}</div>
          </div>
          <div style="background:#1e3a5f;border:1px solid #1d4ed8;border-radius:10px;padding:14px 18px;margin:0 0 24px;">
            <p style="margin:0;color:#93c5fd;font-size:.88rem;">⏱️ This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <p style="color:#64748b;font-size:.82rem;margin:0;">If you didn't request this, please ignore this email. Your account will not be affected.</p>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #334155;text-align:center;">
          <p style="margin:0;color:#475569;font-size:.78rem;">© 2025 Kaamgar Connect | Bhopal, Madhya Pradesh, India</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

// ─── Main Send Function ───────────────────────────────────────────────────────
const sendOtpEmail = async (user, otp, purpose = 'register') => {
  const purposeText = {
    register: 'Registration Verification',
    login: 'Sign In Verification',
    resend: 'OTP Resend',
  }[purpose] || 'OTP Verification';

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn(`⚠️  No Resend client — OTP for ${user.email} : ${otp}`);
      return false;
    }

    const from = process.env.EMAIL_FROM || 'Kaamgar Connect <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from,
      to: [user.email],
      subject: `[Kaamgar Connect] ${purposeText} — OTP: ${otp}`,
      html: getOtpEmailHtml(user, otp, purpose),
    });

    if (error) {
      console.error('❌ Resend error:', error.message);
      console.log(`⚠️  OTP for ${user.email} : ${otp}`);
      return false;
    }

    console.log(`✅ OTP email sent via Resend to ${user.email} | id: ${data.id}`);
    return true;
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    console.log(`⚠️  OTP for ${user.email} : ${otp}`);
    return false;
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail };

// ─── Password Reset Email ─────────────────────────────────────────────────────
async function sendPasswordResetEmail(user, otp) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Kaamgar Connect — Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'DM Sans',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr><td style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px;text-align:center;">
          <div style="width:52px;height:52px;background:#fff;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:900;color:#dc2626;margin-bottom:12px;">K</div>
          <h1 style="margin:0;color:#fff;font-size:1.5rem;font-weight:800;">Kaamgar Connect</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.8);font-size:.92rem;">Password Reset Request</p>
        </td></tr>
        <tr><td style="padding:40px 36px;">
          <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:1.2rem;">🔐 Reset Your Password</h2>
          <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">Hi <strong style="color:#f1f5f9;">${user.username}</strong>, use the OTP below to reset your password:</p>
          <div style="background:#0f172a;border:2px solid #dc2626;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <div style="font-size:2.5rem;font-weight:900;letter-spacing:12px;color:#ef4444;font-family:monospace;">${otp}</div>
          </div>
          <div style="background:#3f1515;border:1px solid #dc2626;border-radius:10px;padding:14px 18px;margin:0 0 24px;">
            <p style="margin:0;color:#fca5a5;font-size:.88rem;">⏱️ This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <p style="color:#64748b;font-size:.82rem;margin:0;">If you didn't request a password reset, please ignore this email. Your account remains secure.</p>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #334155;text-align:center;">
          <p style="margin:0;color:#475569;font-size:.78rem;">© 2025 Kaamgar Connect | Bhopal, Madhya Pradesh, India</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn(`⚠️  No Resend client — Password reset OTP for ${user.email} : ${otp}`);
      return false;
    }
    const from = process.env.EMAIL_FROM || 'Kaamgar Connect <onboarding@resend.dev>';
    const { data, error } = await resend.emails.send({
      from,
      to: [user.email],
      subject: `[Kaamgar Connect] Password Reset OTP: ${otp}`,
      html,
    });
    if (error) {
      console.error('❌ Resend error:', error.message);
      return false;
    }
    console.log(`✅ Password reset email sent via Resend to ${user.email} | id: ${data.id}`);
    return true;
  } catch (err) {
    console.error('❌ Password reset email error:', err.message);
    console.log(`⚠️  PASSWORD RESET OTP for ${user.email} : ${otp}`);
    return false;
  }
}

