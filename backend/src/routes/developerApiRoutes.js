import { Router } from 'express'
import { createApiKey, listApiKeys, revokeApiKey } from '../controllers/developerApiController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken)
router.get('/keys', listApiKeys)
router.post('/keys', createApiKey)
router.delete('/keys/:id', revokeApiKey)

export default router
