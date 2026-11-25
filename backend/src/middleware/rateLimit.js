const buckets = new Map()
let cleanupStarted = false

export const createRateLimiter = ({ windowMs, max, keyBy = req => req.ip, message }) => {
  if (!cleanupStarted) {
    cleanupStarted = true
    const cleanup = setInterval(() => {
      const now = Date.now()
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key)
      }
    }, 60_000)
    cleanup.unref?.()
  }

  return (req, res, next) => {
    const key = `${req.baseUrl}${req.path}:${keyBy(req)}`
    const now = Date.now()
    let bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(key, bucket)
    }

    bucket.count += 1
    if (bucket.count > max) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))))
      return res.status(429).json({ error: message || 'Too many attempts. Please try again later.' })
    }

    next()
  }
}

export const authIpKey = req => req.ip || req.socket?.remoteAddress || 'unknown'
export const authIdentifierKey = field => req => {
  const identifier = String(req.body?.[field] || '').trim().toLowerCase().slice(0, 160)
  return `${authIpKey(req)}:${identifier || 'missing'}`
}
