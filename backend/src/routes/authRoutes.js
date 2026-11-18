import { Router } from 'express'
import {
  register,
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

const router = Router()

router.post('/register', register)
router.post('/register-send-otp', sendRegistrationOtp)
router.post('/register-verify', verifyRegistrationOtp)
router.post('/login', login)
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/google', googleAuth)
router.post('/forgot-password-send', forgotPasswordSendOtp)
router.post('/forgot-password-reset', forgotPasswordReset)
router.get('/me', verifyToken, getMe)
router.put('/company', verifyToken, updateCompany)

export default router
