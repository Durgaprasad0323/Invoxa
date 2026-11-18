import { createHash } from 'crypto'
import { db } from '../config/db.js'
import { ApiKeyModel } from '../models/ApiKey.js'

const requestWindows = new Map()
const MAX_REQUESTS_PER_MINUTE = 60

export const verifyApiKey = (req, res, next) => {
  const authorization = req.headers.authorization || ''
  const match = authorization.match(/^Bearer (invoxa_live_[A-Za-z0-9_-]+)$/)
  if (!match) {
    return res.status(401).json({ error: 'A valid Invoxa API key is required in the Authorization header.' })
  }

  const keyHash = createHash('sha256').update(match[1]).digest('hex')
  const record = (db.data.apiKeys || []).find(key => key.keyHash === keyHash && !key.revokedAt)
  if (!record) {
    return res.status(401).json({ error: 'Invalid or revoked API key.' })
  }

  const user = db.data.users.find(item => item.id === record.userId)
  if (!user || user.status === 'suspended' || user.status === 'disabled') {
    return res.status(401).json({ error: 'This API key is no longer active.' })
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

  record.lastUsedAt = new Date().toISOString()
  db.saveLocal()
  if (db.isMongoConnected) {
    ApiKeyModel.updateOne({ id: record.id }, { $set: { lastUsedAt: record.lastUsedAt } })
      .catch(error => console.warn('API key usage update warning:', error.message))
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: record.companyId,
    companyName: user.companyName
  }
  req.apiKey = { id: record.id, companyId: record.companyId }
  return next()
}
