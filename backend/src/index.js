import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'

import authRoutes from './routes/authRoutes.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import creditNoteRoutes from './routes/creditNoteRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import productRoutes from './routes/productRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import developerApiRoutes from './routes/developerApiRoutes.js'
import publicApiRoutes from './routes/publicApiRoutes.js'
import planRoutes from './routes/planRoutes.js'
import { connectDB, db, disableDefaultSeedAccounts, provisionConfiguredSuperAdmin } from './config/db.js'
import { validateProductionSecurityConfig } from './utils/security.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

validateProductionSecurityConfig()

// Middlewares
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)

    const configuredOrigins = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
    const allowedOrigins = new Set([
      ...configuredOrigins,
      'https://invoxa-lime.vercel.app',
      ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173'])
    ])

    const isLocalDevelopmentOrigin = process.env.NODE_ENV !== 'production' && /^http:\/\/(?:localhost|127\.0\.0\.1|(?:\d{1,3}\.){3}\d{1,3}):5173$/.test(origin)
    if (allowedOrigins.has(origin) || isLocalDevelopmentOrigin) return callback(null, true)
    return callback(new Error('Origin is not allowed by CORS.'))
  },
  credentials: false
}))
app.disable('x-powered-by')
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()')
  next()
})
app.use(express.json({ limit: '5mb' }))
app.use(morgan('dev'))

// Health Check
app.get('/api/health', (req, res) => {
  const persistenceWarning = process.env.NODE_ENV === 'production' &&
    !db.isMongoConnected &&
    !process.env.INVOXA_DATA_FILE
    ? 'Production storage is using the default local file path. Configure MongoDB or a persistent disk before saving invoices.'
    : null

  res.json({
    status: 'healthy',
    platform: 'Invoxa Invoice Platform API',
    database: db.isMongoConnected ? 'MongoDB (Connected)' : 'File-based (Local database.json)',
    mongoConnected: db.isMongoConnected,
    persistenceWarning,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Route Handlers
app.use('/api/auth', authRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/credit-notes', creditNoteRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/products', productRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/plans', planRoutes)
app.use('/api/developer', developerApiRoutes)
app.use('/api/v1', publicApiRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

const startServer = async () => {
  await connectDB()
  await disableDefaultSeedAccounts()
  await provisionConfiguredSuperAdmin()

  app.listen(PORT, () => {
  console.log(`🚀 Invoxa Backend Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check available at http://localhost:${PORT}/api/health`)
  })
}

startServer().catch(error => {
  console.error('Failed to start Invoxa API:', error.message)
  process.exit(1)
})
