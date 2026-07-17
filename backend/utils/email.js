// Helper utility for sending email verification codes via Nodemailer or printing to logs
import nodemailer from 'nodemailer';
import dns from 'dns/promises';

export const sendOtpEmail = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Print a large console log box so the code is easy to find in terminal/Render logs
  console.log('\n=========================================');
  console.log(`✉️  [MOCK EMAIL SENT TO: ${email}]`);
  console.log(`🔑  YOUR OTP VERIFICATION CODE IS: ${otp}`);
  console.log('=========================================\n');

  // If credentials are not configured, fallback to console logging
  if (!emailUser || !emailPass) {
    console.log('ℹ️  SMTP email credentials not set. Falling back to terminal log verification.');
    return true;
  }

  try {
    // Dynamically resolve smtp.gmail.com to IPv4 address to bypass Render's IPv6 outbound socket errors
    let hostAddress = 'smtp.gmail.com';
    try {
      const ips = await dns.resolve4('smtp.gmail.com');
      if (ips && ips.length > 0) {
        hostAddress = ips[0];
        console.log(`[SMTP DNS] Dynamically resolved smtp.gmail.com to IPv4: ${hostAddress}`);
      }
    } catch (dnsErr) {
      console.warn('[SMTP DNS] Failed to resolve smtp.gmail.com over IPv4, falling back to hostname:', dnsErr.message);
    }

    // Setup transporter using Gmail SMTP over IPv4 / Port 587 (TLS)
    const transporter = nodemailer.createTransport({
      host: hostAddress,
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: emailUser,
        pass: emailPass, // App password
      },
      tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com', // Crucial to match TLS SNI certificate
      },
    });

    const mailOptions = {
      from: `"SkillSwap Support" <${emailUser}>`,
      to: email,
      subject: 'SkillSwap - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f1f5f9; color: #1e293b; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #4f46e5; margin-bottom: 5px;">Verify your SkillSwap Account</h2>
          <p style="font-size: 14px; margin-top: 0;">Thank you for registering on our peer skill-sharing network!</p>
          <p style="font-size: 13px;">Please enter the following 6-digit verification code to complete your registration:</p>
          <div style="font-size: 28px; font-weight: 800; background-color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #cbd5e1; color: #4f46e5; letter-spacing: 4px; max-width: 180px; margin: 20px auto;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #64748b;">This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 10px; color: #94a3b8; text-align: center;">This is an automated system email. Please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅  Email successfully sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌  Error sending email via Nodemailer:', error.message);
    // Return true anyway so that registration doesn't fail due to SMTP password errors
    return true;
  }
};
