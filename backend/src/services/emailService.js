/**
 * Email OTP Service — Invoxa Account Verification
 * Uses Gmail SMTP (free). Requires Gmail App Password in .env
 *
 * Setup (one-time):
 *   1. Go to myaccount.google.com → Security → 2-Step Verification → App Passwords
 *   2. Create App Password for "Mail" → copy 16-char password
 *   3. Add to backend/.env:
 *      GMAIL_USER=your_gmail@gmail.com
 *      GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 */

import nodemailer from 'nodemailer'

const getTransporter = () => {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD

  if (gmailUser && gmailPass && gmailUser !== 'your_gmail@gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    })
  }
  return null
}

export const sendEmailOTP = async (email, otp, name = 'User') => {
  const transporter = getTransporter()
  const gmailUser = process.env.GMAIL_USER

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #15865a, #0d6b47); padding: 28px 32px; text-align: center;">
        <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 10px; padding: 8px 16px; margin-bottom: 10px;">
          <span style="color: #fff; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px;">📄 Invoxa</span>
        </div>
        <h2 style="color: #fff; margin: 0; font-size: 1.1rem; font-weight: 500; opacity: 0.9;">Email Verification Code</h2>
      </div>

      <div style="padding: 32px;">
        <p style="color: #374151; font-size: 1rem; margin: 0 0 20px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #6b7280; font-size: 0.95rem; margin: 0 0 24px; line-height: 1.6;">
          Use the code below to verify your email address and complete your Invoxa account setup.
        </p>

        <div style="background: #f0fdf4; border: 2px dashed #15865a; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 2.4rem; font-weight: 800; letter-spacing: 10px; color: #15865a; font-family: 'Courier New', monospace;">${otp}</div>
          <div style="font-size: 0.8rem; color: #6b7280; margin-top: 6px;">Valid for 10 minutes</div>
        </div>

        <p style="color: #9ca3af; font-size: 0.82rem; margin: 0; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          If you didn't request this code, you can safely ignore this email.<br/>
          Never share this code with anyone.
        </p>
      </div>

      <div style="background: #f1f5f9; padding: 14px 32px; text-align: center;">
        <p style="color: #94a3b8; font-size: 0.75rem; margin: 0;">© 2026 Invoxa — GST Billing & Invoicing Platform</p>
      </div>
    </div>
  `

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Invoxa" <${gmailUser}>`,
        to: email,
        subject: `${otp} is your Invoxa verification code`,
        html: htmlBody,
        text: `Your Invoxa verification code is: ${otp}. Valid for 10 minutes.`
      })
      console.log(`✅ [Email] OTP sent to ${email}`)
      return { success: true, provider: 'Gmail' }
    } catch (err) {
      console.error('❌ [Email] Send failed:', err.message)
      return { success: false, error: err.message }
    }
  }

  // Fallback — no email credentials configured
  console.log(`\n📧 [EMAIL SERVICE] Cannot send real email to ${email}: GMAIL_USER or GMAIL_APP_PASSWORD not configured in backend/.env`)
  return { success: false, error: 'Email service credentials not set in backend/.env (requires GMAIL_USER & GMAIL_APP_PASSWORD)' }
}

export const sendPasswordResetEmail = async (email, otp, name = 'User') => {
  const transporter = getTransporter()
  const gmailUser = process.env.GMAIL_USER

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 28px 32px; text-align: center;">
        <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 10px; padding: 8px 16px; margin-bottom: 10px;">
          <span style="color: #fff; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px;">📄 Invoxa</span>
        </div>
        <h2 style="color: #fff; margin: 0; font-size: 1.1rem; font-weight: 500; opacity: 0.9;">Password Reset Request</h2>
      </div>

      <div style="padding: 32px;">
        <p style="color: #374151; font-size: 1rem; margin: 0 0 20px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #6b7280; font-size: 0.95rem; margin: 0 0 24px; line-height: 1.6;">
          We received a request to reset your Invoxa account password. Use the verification code below to set a new password:
        </p>

        <div style="background: #eff6ff; border: 2px dashed #2563eb; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 2.4rem; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; font-family: 'Courier New', monospace;">${otp}</div>
          <div style="font-size: 0.8rem; color: #6b7280; margin-top: 6px;">Valid for 10 minutes</div>
        </div>

        <p style="color: #9ca3af; font-size: 0.82rem; margin: 0; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          If you did not request a password reset, please ignore this email or secure your account.<br/>
          Never share this code with anyone.
        </p>
      </div>

      <div style="background: #f1f5f9; padding: 14px 32px; text-align: center;">
        <p style="color: #94a3b8; font-size: 0.75rem; margin: 0;">© 2026 Invoxa — GST Billing & Invoicing Platform</p>
      </div>
    </div>
  `

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Invoxa Support" <${gmailUser}>`,
        to: email,
        subject: `${otp} is your Invoxa password reset code`,
        html: htmlBody,
        text: `Your Invoxa password reset code is: ${otp}. Valid for 10 minutes.`
      })
      console.log(`✅ [Password Reset] Email sent to ${email}`)
      return { success: true, provider: 'Gmail' }
    } catch (err) {
      console.error('❌ [Password Reset] Email failed:', err.message)
      return { success: false, error: err.message }
    }
  }

  return { success: false, error: 'Email service credentials not configured.' }
}
