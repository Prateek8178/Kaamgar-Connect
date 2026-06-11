/**
 * Gmail SMTP Test Script
 * Run: node test-email.js
 * 
 * Ye script check karegi ki email sending kaam kar rahi hai ya nahi.
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🔍 Email Configuration:');
console.log('   HOST :', process.env.EMAIL_HOST);
console.log('   PORT :', process.env.EMAIL_PORT);
console.log('   USER :', process.env.EMAIL_USER);
console.log('   PASS :', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}****` : '❌ NOT SET');
console.log('   FROM :', process.env.EMAIL_FROM);
console.log('');

async function testEmail() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env file!');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  // Step 1: Connection verify
  console.log('⏳ Step 1: SMTP connection test...');
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection OK!\n');
  } catch (err) {
    console.error('❌ SMTP Connection FAILED!');
    console.error('   Error:', err.message);
    console.error('\n📋 Fix Steps:');
    console.error('   1. Go to: https://myaccount.google.com/security');
    console.error('   2. Enable "2-Step Verification"');
    console.error('   3. Go to: https://myaccount.google.com/apppasswords');
    console.error('   4. Generate App Password for "Mail"');
    console.error('   5. Copy the 16-char password WITHOUT spaces into .env EMAIL_PASS');
    process.exit(1);
  }

  // Step 2: Send test email
  console.log('⏳ Step 2: Sending test email...');
  try {
    const testOtp = '123456';
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // apne aap ko bhejo
      subject: `[Kaamgar Connect] Test Email — OTP: ${testOtp}`,
      text: `Test successful! Your OTP would be: ${testOtp}`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:2rem;background:#1e293b;border-radius:12px;color:#f1f5f9;">
          <h2 style="color:#4f46e5;">✅ Email Test Successful!</h2>
          <p>Kaamgar Connect email system is working correctly.</p>
          <div style="background:#0f172a;border:2px solid #4f46e5;border-radius:8px;padding:1rem;text-align:center;margin:1rem 0;">
            <span style="font-size:2rem;font-weight:900;letter-spacing:8px;color:#4f46e5;font-family:monospace;">${testOtp}</span>
          </div>
          <p style="color:#94a3b8;font-size:.85rem;">This is a test email from your Kaamgar Connect backend.</p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('   MessageId:', info.messageId);
    console.log(`\n📬 Check your Gmail inbox: ${process.env.EMAIL_USER}`);
    console.log('   (Spam folder bhi check karo agar inbox mein nahi hai)\n');
  } catch (err) {
    console.error('❌ Email send FAILED!');
    console.error('   Error:', err.message);
    process.exit(1);
  }
}

testEmail();
