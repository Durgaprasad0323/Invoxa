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
import { connectDB, db } from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}))
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

app.listen(PORT, async () => {
  console.log(`🚀 Invoxa Backend Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check available at http://localhost:${PORT}/api/health`)
  console.log(`🔑 Super Admin default login: admin@invoxa.com / admin123`)
  await connectDB()
})
