import { db } from '../config/db.js'
import { consumeProTrialCreation, getProTrialStatus, startProTrial } from '../services/proTrialService.js'

const getAccountUser = userId => db.data.users.find(user => user.id === userId)

export const getProTrial = (req, res) => {
  const user = getAccountUser(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  return res.json({ trial: getProTrialStatus(user) })
}

export const startProTrialForAccount = async (req, res) => {
  const user = getAccountUser(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  try {
    const trial = await startProTrial(user)
    return res.json({ trial })
  } catch (err) {
    console.error('Start Pro trial error:', err.message)
    return res.status(503).json({ error: 'The free Pro trial could not be started. Please try again.' })
  }
}

export const consumeProTrialCreationForAccount = async (req, res) => {
  const user = getAccountUser(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  const { usageId, feature } = req.body || {}
  if (typeof usageId !== 'string' || usageId.length < 1 || usageId.length > 120) {
    return res.status(400).json({ error: 'A valid creation ID is required.' })
  }
  if (typeof feature !== 'string' || feature.length > 60) {
    return res.status(400).json({ error: 'A valid Pro feature name is required.' })
  }
  try {
    const result = await consumeProTrialCreation(user, { usageId, feature })
    return res.json(result)
  } catch (err) {
    return res.status(err.status || 503).json({
      code: err.code || 'PRO_TRIAL_ERROR',
      error: err.message || 'The Pro trial creation could not be recorded.',
      trial: err.trial
    })
  }
}
