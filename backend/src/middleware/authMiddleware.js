import jwt from 'jsonwebtoken'
import { db } from '../config/db.js'

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
      companyId: user.companyId || 'comp_krishna'
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
