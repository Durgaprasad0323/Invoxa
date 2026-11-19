import { Router } from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import { consumeProTrialCreationForAccount, getProTrial, startProTrialForAccount } from '../controllers/planController.js'

const router = Router()
router.use(verifyToken)
router.get('/pro-trial', getProTrial)
router.post('/pro-trial/start', startProTrialForAccount)
router.post('/pro-trial/creation', consumeProTrialCreationForAccount)

export default router
