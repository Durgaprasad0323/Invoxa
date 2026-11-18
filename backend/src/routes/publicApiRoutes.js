import { Router } from 'express'
import { createApiInvoice } from '../controllers/developerApiController.js'
import { verifyApiKey } from '../middleware/apiKeyMiddleware.js'

const router = Router()

router.post('/invoices', verifyApiKey, createApiInvoice)

export default router
