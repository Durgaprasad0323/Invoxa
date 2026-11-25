import { Router } from 'express'
import { createApiInvoice } from '../controllers/developerApiController.js'
import { verifyApiKey } from '../middleware/apiKeyMiddleware.js'

const router = Router()

router.get('/status', verifyApiKey, (req, res) => {
  return res.json({
    status: 'active',
    environment: req.apiKey.environment,
    capabilities: ['invoice:create']
  })
})

router.post('/invoices', verifyApiKey, createApiInvoice)

export default router
