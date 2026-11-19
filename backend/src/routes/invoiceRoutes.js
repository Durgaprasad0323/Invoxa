import { Router } from 'express'
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController.js'
import { requirePlan, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken)

router.get('/', getInvoices)
router.get('/:id', getInvoiceById)
router.post('/', (req, res, next) => {
  if (req.body?.docType === 'pos') return requirePlan('pro', { consumeTrialCreation: true, feature: 'POS bill' })(req, res, next)
  if (['einvoice', 'e-invoice'].includes(req.body?.docType)) return requirePlan('pro', { consumeTrialCreation: true, feature: 'E-Invoice draft' })(req, res, next)
  if (req.body?.templateId) return requirePlan('pro', { consumeTrialCreation: true, feature: 'Invoice template' })(req, res, next)
  return next()
}, createInvoice)
router.put('/:id', updateInvoice)
router.delete('/:id', deleteInvoice)

export default router
