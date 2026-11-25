import { createHash } from 'crypto'
import { db } from '../config/db.js'
import { ApiKeyModel } from '../models/ApiKey.js'
import { getEffectivePlan } from './authMiddleware.js'

const requestWindows = new Map()
const MAX_REQUESTS_PER_MINUTE = 60

export const verifyApiKey = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || ''
    const match = authorization.match(/^Bearer (invoxa_(live|test)_[A-Za-z0-9_-]+)$/)
    if (!match) {
      return res.status(401).json({ error: 'A valid Invoxa API key is required in the Authorization header.' })
    }

    const keyHash = createHash('sha256').update(match[1]).digest('hex')
    const record = db.isMongoConnected
      ? await ApiKeyModel.findOne({ keyHash }).select('+keyHash').lean()
      : (db.data.apiKeys || []).find(key => key.keyHash === keyHash)
    if (!record || record.revokedAt) {
      return res.status(401).json({ error: 'Invalid or revoked API key.' })
    }
    const environment = record.environment || 'live'
    if (environment !== match[2]) {
      return res.status(401).json({ error: 'API key environment does not match its stored record.' })
    }

    const user = db.data.users.find(item => item.id === record.userId)
    if (!user || user.status === 'suspended' || user.status === 'disabled') {
      return res.status(401).json({ error: 'This API key is no longer active.' })
    }

    const effectivePlan = getEffectivePlan(user)
    if (effectivePlan !== 'enterprise') {
      const eligibleFreeKey = db.isMongoConnected
        ? await ApiKeyModel.findOne({ userId: user.id, revokedAt: null, environment: 'live' })
          .sort({ createdAt: 1 })
          .select('id createdAt')
          .lean()
        : (db.data.apiKeys || [])
          .filter(key => key.userId === user.id && !key.revokedAt && (key.environment || 'live') === 'live')
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
      if (environment !== 'live' || eligibleFreeKey?.id !== record.id) {
        return res.status(403).json({
          code: 'ENTERPRISE_API_UPGRADE_REQUIRED',
          error: 'Free access includes one Live Web integration key. Upgrade to Enterprise to use Sandbox or additional API keys.'
        })
      }
    }

    const now = Date.now()
    const window = requestWindows.get(record.id)
    if (!window || now - window.startedAt >= 60_000) {
      requestWindows.set(record.id, { startedAt: now, count: 1 })
    } else if (window.count >= MAX_REQUESTS_PER_MINUTE) {
      return res.status(429).json({ error: 'API request limit reached. Please retry in a minute.' })
    } else {
      window.count += 1
    }

    const lastUsedAt = new Date().toISOString()
    const cachedRecord = (db.data.apiKeys || []).find(key => key.id === record.id)
    if (cachedRecord) cachedRecord.lastUsedAt = lastUsedAt
    if (db.isMongoConnected) {
      ApiKeyModel.updateOne({ id: record.id, revokedAt: null }, { $set: { lastUsedAt } })
        .catch(error => console.warn('API key usage update warning:', error.message))
    } else {
      db.saveLocal()
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: record.companyId,
      companyName: user.companyName,
      plan: user.plan || 'free',
      subscriptionExpiry: user.subscriptionExpiry || null
    }
    req.apiKey = { id: record.id, companyId: record.companyId, environment }
    return next()
  } catch (error) {
    console.error('Developer API key verification error:', error)
    return res.status(503).json({ error: 'The Developer API key service is temporarily unavailable.' })
  }
}
