import { Router } from 'express'
import {
  login,
  getMe,
  updateCompany,
  sendOtp,
  verifyOtp,
  googleAuth,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  forgotPasswordSendOtp,
  forgotPasswordReset
} from '../controllers/authController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { createRateLimiter, authIdentifierKey, authIpKey } from '../middleware/rateLimit.js'

const router = Router()

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyBy: authIdentifierKey('email') })
const registrationLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5, keyBy: authIpKey })
const signupOtpLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3, keyBy: authIdentifierKey('email') })
const signupVerifyLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyBy: authIdentifierKey('email') })
const phoneOtpLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3, keyBy: authIdentifierKey('phone') })
const phoneVerifyLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyBy: authIdentifierKey('phone') })
const passwordResetLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3, keyBy: authIdentifierKey('email') })
const passwordResetVerifyLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyBy: authIdentifierKey('email') })

// Accounts must be created through the email verification flow.
router.post('/register', registrationLimiter, (req, res) => res.status(410).json({ error: 'Direct registration is disabled. Verify your email to create an account.' }))
router.post('/register-send-otp', signupOtpLimiter, sendRegistrationOtp)
router.post('/register-verify', signupVerifyLimiter, verifyRegistrationOtp)
router.post('/login', loginLimiter, login)
router.post('/send-otp', phoneOtpLimiter, sendOtp)
router.post('/verify-otp', phoneVerifyLimiter, verifyOtp)
router.post('/google', googleAuth)
router.post('/forgot-password-send', passwordResetLimiter, forgotPasswordSendOtp)
router.post('/forgot-password-reset', passwordResetVerifyLimiter, forgotPasswordReset)
router.get('/me', verifyToken, getMe)
router.put('/company', verifyToken, updateCompany)

export default router
