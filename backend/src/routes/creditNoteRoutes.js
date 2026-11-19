import { Router } from 'express'
import { createCreditNote, deleteCreditNote, getCreditNotes } from '../controllers/creditNoteController.js'
import { requirePlan, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()
router.use(verifyToken)
router.use(requirePlan('pro'))

router.get('/', getCreditNotes)
router.post('/', requirePlan('pro', { consumeTrialCreation: true, feature: 'Credit note' }), createCreditNote)
router.delete('/:id', deleteCreditNote)

export default router
