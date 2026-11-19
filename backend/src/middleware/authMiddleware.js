import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { db } from '../config/db.js'
import { consumeProTrialCreation, getProTrialStatus, refundProTrialCreation } from '../services/proTrialService.js'

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'invoxa_jwt_secret_dev_key_2026_super_secure')
    const user = db.data.users.find(u => u.id === decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'Invalid user session.' })
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId || 'comp_krishna',
      plan: user.plan || 'free',
      subscriptionExpiry: user.subscriptionExpiry || null
    }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' })
    }
    // Super admins always have full access
    if (req.user.role === 'super_admin') {
      return next()
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission for this resource.' })
    }
    next()
  }
}

const planRanks = { free: 0, pro: 1, enterprise: 2 }

export const getEffectivePlan = user => {
  if (user?.role === 'super_admin') return 'enterprise'
  const plan = planRanks[user?.plan] === undefined ? 'free' : user.plan
  if (plan === 'free') return 'free'
  const expiry = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).getTime() : 0
  return Number.isFinite(expiry) && expiry > Date.now() ? plan : 'free'
}

export const requirePlan = (requiredPlan, { consumeTrialCreation = false, feature = 'Pro document' } = {}) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' })
  if (req.user.role === 'super_admin') return next()
  if ((planRanks[getEffectivePlan(req.user)] || 0) >= (planRanks[requiredPlan] || 0)) return next()

  const user = db.data.users.find(entry => entry.id === req.user.id)
  const trial = requiredPlan === 'pro' ? getProTrialStatus(user) : null
  if (trial?.active) {
    if (consumeTrialCreation) {
      const usageId = String(req.body?.trialUsageId || req.body?.id || randomUUID()).slice(0, 120)
      try {
        await consumeProTrialCreation(user, { usageId, feature })
        req.proTrialReservation = { usageId, userId: user.id }
        const originalJson = res.json.bind(res)
        res.json = body => {
          if (req.proTrialReservation && res.statusCode >= 400) {
            const statusCode = res.statusCode
            refundProTrialCreation(user.id, usageId)
              .catch(error => console.error('Pro trial refund error:', error.message))
              .finally(() => {
                res.statusCode = statusCode
                originalJson(body)
              })
            return res
          }
          return originalJson(body)
        }
      } catch (err) {
        return res.status(err.status || 503).json({
          code: err.code || 'PRO_TRIAL_ERROR',
          requiredPlan,
          trial: err.trial,
          error: err.message || 'Your Pro trial could not be checked.'
        })
      }
    }
    req.proTrial = trial
    return next()
  }

  return res.status(403).json({
    code: 'PLAN_UPGRADE_REQUIRED',
    requiredPlan,
    trial,
    error: trial?.started
      ? 'Your free Pro trial has ended. Choose a plan to continue.'
      : `This feature requires an active ${requiredPlan} plan or free trial.`
  })
}
