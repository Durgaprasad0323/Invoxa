import { Router } from 'express'
import {
  getPlatformStats,
  getAllUsers,
  updateUserPlan,
  toggleUserStatus
} from '../controllers/adminController.js'
import { verifyToken, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// Only Super Admin can access these routes
router.use(verifyToken, requireRole('super_admin'))

router.get('/stats', getPlatformStats)
router.get('/users', getAllUsers)
router.put('/users/:id/plan', updateUserPlan)
router.put('/users/:id/status', toggleUserStatus)

export default router
