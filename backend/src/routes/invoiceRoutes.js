import { Router } from 'express'
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken)

router.get('/', getInvoices)
router.get('/:id', getInvoiceById)
router.post('/', createInvoice)
router.put('/:id', updateInvoice)
router.delete('/:id', deleteInvoice)

export default router
