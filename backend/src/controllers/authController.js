import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomInt } from 'crypto'
import { db } from '../config/db.js'
import { sendRealSMS } from '../services/smsService.js'
import { sendEmailOTP, sendPasswordResetEmail } from '../services/emailService.js'
import { getJwtSecret } from '../utils/security.js'

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  )
}

export const login = (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const isMatch = bcrypt.compareSync(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    if (user.status === 'disabled' || user.status === 'suspended') {
      return res.status(403).json({ error: 'This account is disabled. Contact Invoxa support.' })
    }
    if (process.env.NODE_ENV === 'production' && (
      (user.email?.toLowerCase() === 'admin@invoxa.com' && bcrypt.compareSync('admin123', user.password)) ||
      (user.email?.toLowerCase() === 'krishna@enterprises.com' && bcrypt.compareSync('password123', user.password))
    )) {
      return res.status(403).json({ error: 'This seeded account still uses its public default password. Reset it before signing in.' })
    }

    const token = generateToken(user)
    const company = db.data.companies.find(c => c.ownerId === user.id) || null

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // 'super_admin' or 'company_admin'
        companyName: user.companyName,
        companyId: user.companyId,
        plan: user.plan,
        billingCycle: user.billingCycle || 'yearly',
        subscriptionExpiry: user.subscriptionExpiry || null
      },
      company
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed. Please try again.' })
  }
}

export const getMe = (req, res) => {
  try {
    const user = db.data.users.find(u => u.id === req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    const company = db.data.companies.find(c => c.id === user.companyId || c.ownerId === user.id) || null

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        companyId: user.companyId,
        plan: user.plan,
        billingCycle: user.billingCycle || 'yearly',
        subscriptionExpiry: user.subscriptionExpiry || null
      },
      company
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' })
  }
}

export const updateCompany = (req, res) => {
  try {
    const user = db.data.users.find(u => u.id === req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    let company = db.data.companies.find(c => c.id === user.companyId || c.ownerId === user.id)

    if (!company) {
      const companyId = user.companyId || `comp_${Date.now()}`
      user.companyId = companyId
      company = {
        id: companyId,
        ownerId: user.id,
        name: req.body.name || user.companyName || `${user.name}'s Business`,
        gstin: req.body.gstin || '',
        phone: req.body.phone || '',
        email: req.body.email || user.email,
        address: req.body.address || '',
        city: req.body.city || '',
        state: req.body.state || 'Maharashtra',
        pincode: req.body.pincode || '',
        bankName: req.body.bankName || '',
        accountNumber: req.body.accountNumber || '',
        ifsc: req.body.ifsc || '',
        branch: req.body.branch || '',
        upiId: req.body.upiId || '',
        upiQrUrl: req.body.upiQrUrl || ''
      }
      db.data.companies.push(company)
    } else {
      Object.assign(company, req.body, { id: company.id, ownerId: company.ownerId })
    }

    if (req.body.name) {
      user.companyName = req.body.name
    }

    db.save()

    return res.json({
      message: 'Company profile updated successfully!',
      company
    })
  } catch (err) {
    console.error('Update company error:', err)
    return res.status(500).json({ error: 'Failed to update company profile.' })
  }
}

// In-memory OTP storage: phone -> { otp, expiresAt }
const otpStore = new Map()

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body
    if (!phone) {
      return res.status(400).json({ error: 'Valid 10-digit phone number is required.' })
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10)
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Valid 10-digit phone number is required.' })
    }

    const generatedOtp = String(randomInt(100000, 1000000))

    // Attempt real SMS / WhatsApp delivery via gateway
    const smsResult = await sendRealSMS(cleanPhone, generatedOtp)

    if (!smsResult.success) {
      otpStore.delete(cleanPhone)
      return res.status(503).json({ error: 'SMS delivery is unavailable. Please try again later or sign in with email and password.' })
    }

    otpStore.set(cleanPhone, {
      otp: generatedOtp,
      attempts: 0,
      expiresAt: Date.now() + 5 * 60 * 1000
    })

    return res.json({
      message: `OTP sent to your phone (+91 ${cleanPhone}) via SMS!`,
      phone: cleanPhone,
      smsDelivered: smsResult.success,
      provider: smsResult.provider
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send OTP.' })
  }
}

export const verifyOtp = (req, res) => {
  try {
    const { phone, otp } = req.body
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required.' })
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10)
    const stored = otpStore.get(cleanPhone)

    if (stored && stored.expiresAt <= Date.now()) {
      otpStore.delete(cleanPhone)
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new code.' })
    }

    const isValid = Boolean(stored && stored.otp === otp.trim())

    if (!isValid) {
      if (stored) {
        stored.attempts += 1
        if (stored.attempts >= 5) otpStore.delete(cleanPhone)
      }
      return res.status(400).json({ error: 'Invalid or expired OTP. Please try again.' })
    }

    // Clear OTP after successful use
    otpStore.delete(cleanPhone)

    // Find user by phone in database, or create brand new user & company!
    let user = db.data.users.find(u => u.phone === cleanPhone || (u.email && u.email === `user_${cleanPhone}@invoxa.com`))

    if (!user) {
      const userId = `usr_${Date.now()}`
      const companyId = `comp_${Date.now()}`
      user = {
        id: userId,
        name: `User +91 ${cleanPhone}`,
        phone: cleanPhone,
        email: `user_${cleanPhone}@invoxa.com`,
        password: bcrypt.hashSync(`otp_${Date.now()}`, 10),
        role: 'company_admin',
        companyId,
        companyName: `Business (+91 ${cleanPhone})`,
        plan: 'free',
        createdAt: new Date().toISOString()
      }

      const newCompany = {
        id: companyId,
        ownerId: userId,
        name: user.companyName,
        phone: cleanPhone,
        email: user.email,
        address: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        bankName: '',
        accountNumber: '',
        ifsc: '',
        branch: '',
        upiId: '',
        upiQrUrl: ''
      }

      db.data.users.push(user)
      db.data.companies.push(newCompany)
      db.save()
    }

    if (user.status === 'disabled' || user.status === 'suspended') {
      return res.status(403).json({ error: 'This account is disabled. Contact Invoxa support.' })
    }

    const token = generateToken(user)
    const company = db.data.companies.find(c => c.ownerId === user.id || c.id === user.companyId) || null

    return res.json({
      message: 'Mobile OTP verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || cleanPhone,
        role: user.role,
        companyName: user.companyName,
        companyId: user.companyId,
        plan: user.plan
      },
      company
    })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return res.status(500).json({ error: 'OTP verification failed.' })
  }
}

export const googleAuth = async (req, res) => {
  return res.status(501).json({ error: 'Google sign-in is not configured. Use email and password until verified Google OAuth is connected.' })
}

// In-memory store for Email Signup: email -> { emailOtp, email, expiresAt }
const signupOtpStore = new Map()

export const sendRegistrationOtp = async (req, res) => {
  try {
    const { email, name } = req.body
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Check if account already exists
    const existingByEmail = db.data.users.find(u => u.email && u.email.toLowerCase() === cleanEmail)
    if (existingByEmail) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' })
    }

    const emailOtp = String(randomInt(100000, 1000000))

    signupOtpStore.set(cleanEmail, {
      emailOtp,
      attempts: 0,
      email: cleanEmail,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    })

    // Dispatch real email verification code
    const emailRes = await sendEmailOTP(cleanEmail, emailOtp, name || 'Business Owner')

    if (!emailRes.success) {
      signupOtpStore.delete(cleanEmail)
      return res.status(500).json({ error: emailRes.error || 'Failed to dispatch email verification code.' })
    }

    return res.json({
      message: 'Verification code sent to your email!',
      email: cleanEmail,
      emailDelivered: true
    })
  } catch (err) {
    console.error('Send registration OTP error:', err)
    return res.status(500).json({ error: 'Failed to dispatch verification code. Please try again.' })
  }
}

export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { name, companyName, email, phone, password, emailOtp } = req.body

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' })
    }
    if (!emailOtp) {
      return res.status(400).json({ error: 'Email verification code is required.' })
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : ''

    const record = signupOtpStore.get(cleanEmail)
    if (!record) {
      return res.status(400).json({ error: 'Verification session expired. Please request a new code.' })
    }

    if (Date.now() > record.expiresAt) {
      signupOtpStore.delete(cleanEmail)
      return res.status(400).json({ error: 'Verification code expired. Please request a new code.' })
    }

    // Strict verification: only the exact real email code matches
    if (record.emailOtp !== emailOtp.trim()) {
      record.attempts += 1
      if (record.attempts >= 5) signupOtpStore.delete(cleanEmail)
      return res.status(400).json({ error: 'Invalid Email verification code. Please check your inbox.' })
    }

    // Verified! Clear from store
    signupOtpStore.delete(cleanEmail)

    // Double check user doesn't already exist
    const existingUser = db.data.users.find(u => u.email.toLowerCase() === cleanEmail)
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const userId = `usr_${Date.now()}`
    const companyId = `comp_${Date.now()}`

    const newUser = {
      id: userId,
      name,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: 'company_admin',
      companyId,
      companyName: companyName || `${name}'s Business`,
      plan: 'free',
      emailVerified: true,
      createdAt: new Date().toISOString()
    }

    const newCompany = {
      id: companyId,
      ownerId: userId,
      name: companyName || `${name}'s Business`,
      phone: cleanPhone,
      email: cleanEmail,
      address: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      bankName: '',
      accountNumber: '',
      ifsc: '',
      branch: '',
      upiId: '',
      upiQrUrl: ''
    }

    db.data.users.push(newUser)
    db.data.companies.push(newCompany)
    db.save()

    const token = generateToken(newUser)

    return res.status(201).json({
      message: 'Account verified and created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        companyName: newUser.companyName,
        companyId: newUser.companyId,
        plan: newUser.plan
      },
      company: newCompany
    })
  } catch (err) {
    console.error('Verify registration OTP error:', err)
    return res.status(500).json({ error: 'Account creation failed. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD FLOW (Reset via Email Code)
// ─────────────────────────────────────────────────────────────
const passwordResetStore = new Map()

export const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = db.data.users.find(u => u.email && u.email.toLowerCase() === cleanEmail)
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' })
    }

    const resetOtp = String(randomInt(100000, 1000000))
    passwordResetStore.set(cleanEmail, {
      resetOtp,
      attempts: 0,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    })

    const emailRes = await sendPasswordResetEmail(cleanEmail, resetOtp, user.name)
    if (!emailRes.success) {
      passwordResetStore.delete(cleanEmail)
      return res.status(500).json({ error: emailRes.error || 'Failed to dispatch reset code to email.' })
    }

    return res.json({
      message: 'Password reset code sent to your email!',
      email: cleanEmail
    })
  } catch (err) {
    console.error('Forgot password send error:', err)
    return res.status(500).json({ error: 'Failed to send password reset code. Please try again.' })
  }
}

export const forgotPasswordReset = async (req, res) => {
  try {
    const { email, resetOtp, newPassword } = req.body
    if (!email || !resetOtp || !newPassword) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required.' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const record = passwordResetStore.get(cleanEmail)
    if (!record) {
      return res.status(400).json({ error: 'Reset session expired. Please request a new code.' })
    }

    if (Date.now() > record.expiresAt) {
      passwordResetStore.delete(cleanEmail)
      return res.status(400).json({ error: 'Reset code expired. Please request a new code.' })
    }

    if (record.resetOtp !== resetOtp.trim()) {
      record.attempts += 1
      if (record.attempts >= 5) passwordResetStore.delete(cleanEmail)
      return res.status(400).json({ error: 'Invalid verification code. Please check your email inbox.' })
    }

    // Code verified! Find user and update password
    const user = db.data.users.find(u => u.email && u.email.toLowerCase() === cleanEmail)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    user.password = bcrypt.hashSync(newPassword, 10)
    user.status = 'active'
    db.save()
    passwordResetStore.delete(cleanEmail)

    const token = generateToken(user)
    const company = db.data.companies.find(c => c.ownerId === user.id || c.id === user.companyId) || null

    return res.json({
      message: 'Password reset successfully! Welcome back.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        companyId: user.companyId,
        plan: user.plan
      },
      company
    })
  } catch (err) {
    console.error('Forgot password reset error:', err)
    return res.status(500).json({ error: 'Password reset failed. Please try again.' })
  }
}
