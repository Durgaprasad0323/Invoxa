import { Router } from 'express'
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken)

router.get('/', getCustomers)
router.post('/', createCustomer)
router.put('/:id', updateCustomer)
router.delete('/:id', deleteCustomer)

export default router
