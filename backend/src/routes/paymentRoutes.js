import { Router } from 'express'
import {
  createSubscriptionOrder,
  verifySubscriptionPayment
} from '../controllers/paymentController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken)

router.post('/order', createSubscriptionOrder)
router.post('/verify', verifySubscriptionPayment)

export default router
