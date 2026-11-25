import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'
import { randomUUID } from 'crypto'

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (_) {}
import { UserModel } from '../models/User.js'
import { CompanyModel } from '../models/Company.js'
import { InvoiceModel } from '../models/Invoice.js'
import { CreditNoteModel } from '../models/CreditNote.js'
import { CustomerModel } from '../models/Customer.js'
import { ProductModel } from '../models/Product.js'
import { ApiKeyModel } from '../models/ApiKey.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config()
const DB_FILE = process.env.INVOXA_DATA_FILE
  ? path.resolve(process.env.INVOXA_DATA_FILE)
  : path.join(__dirname, '../../data/database.json')

// Initial Seed Data
export const getInitialData = () => {
  if (process.env.NODE_ENV === 'production') {
    return { users: [], companies: [], invoices: [], creditNotes: [], customers: [], products: [], apiKeys: [] }
  }

  const hashedPassword = bcrypt.hashSync('admin123', 10)
  const userPassword = bcrypt.hashSync('password123', 10)

  return {
    users: [
      {
        id: 'usr_super_admin',
        name: 'Master Platform Admin',
        email: 'admin@invoxa.com',
        password: hashedPassword,
        role: 'super_admin',
        companyName: 'Invoxa Technologies',
        plan: 'enterprise',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_krishna',
        name: 'Krishna Murthy',
        email: 'krishna@enterprises.com',
        password: userPassword,
        role: 'company_admin',
        companyName: 'Krishna Enterprises',
        plan: 'free',
        createdAt: new Date().toISOString()
      }
    ],
    companies: [
      {
        id: 'comp_krishna',
        ownerId: 'usr_krishna',
        name: 'Krishna Enterprises',
        gstin: '27ABCDE1234F1Z5',
        phone: '+91 98200 12345',
        email: 'accounts@krishnaenterprises.com',
        address: '402, Lotus Corporate Park, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200012345678',
        ifsc: 'HDFC0000240',
        branch: 'BKC Branch, Mumbai',
        upiId: 'krishna@okhdfc',
        upiQrUrl: ''
      }
    ],
    invoices: [
      {
        id: 'inv_101',
        companyId: 'comp_krishna',
        userId: 'usr_krishna',
        invoiceNumber: 'INV-2026-001',
        invoiceDate: '2026-11-14',
        dueDate: '2026-11-29',
        status: 'Unpaid',
        theme: 'emerald',
        layout: 'band',
        client: {
          name: 'Mehta Homes',
          city: 'Mumbai',
          state: 'Maharashtra',
          gstin: '27AADCM9910K1Z4',
          email: 'arjun@mehtahomes.com',
          phone: '+91 98765 43210',
          address: '801, Bandra West, Mumbai'
        },
        items: [
          {
            id: 'item_1',
            description: 'Custom Office Interior Layout & 3D Render',
            hsnSac: '998391',
            quantity: 1,
            rate: 45000,
            taxRate: 18
          }
        ],
        notes: 'Thank you for your business.',
        terms: 'Payment due within 15 days of invoice date.'
      },
      {
        id: 'inv_102',
        companyId: 'comp_krishna',
        userId: 'usr_krishna',
        invoiceNumber: 'INV-2026-002',
        invoiceDate: '2026-11-10',
        dueDate: '2026-11-25',
        status: 'Paid',
        theme: 'navy',
        layout: 'band',
        client: {
          name: 'Sharma Tech Labs',
          city: 'Bengaluru',
          state: 'Karnataka',
          gstin: '29AAECS1234P1Z8',
          email: 'billing@sharmatech.in',
          phone: '+91 98111 22334',
          address: '4th Block, Koramangala, Bengaluru'
        },
        items: [
          {
            id: 'item_2',
            description: 'Cloud Infrastructure Setup & ERP Architecture',
            hsnSac: '998314',
            quantity: 1,
            rate: 129279.66,
            taxRate: 18
          }
        ],
        notes: 'Payment received via NEFT.',
        terms: 'Subject to Mumbai jurisdiction.'
      }
    ],
    creditNotes: [],
    customers: [
      {
        id: 'cust_1',
        companyId: 'comp_krishna',
        name: 'Mehta Homes',
        contactPerson: 'Arjun Mehta',
        phone: '+91 98765 43210',
        email: 'arjun@mehtahomes.com',
        gstin: '27AADCM9910K1Z4',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: '801, Bandra West, Mumbai'
      },
      {
        id: 'cust_2',
        companyId: 'comp_krishna',
        name: 'Sharma Tech Labs',
        contactPerson: 'Vikram Sharma',
        phone: '+91 98111 22334',
        email: 'billing@sharmatech.in',
        gstin: '29AAECS1234P1Z8',
        city: 'Bengaluru',
        state: 'Karnataka',
        address: '4th Block, Koramangala, Bengaluru'
      }
    ],
    products: [
      {
        id: 'prod_1',
        companyId: 'comp_krishna',
        name: 'Interior Design Consulting',
        hsnSac: '998391',
        price: 25000,
        taxRate: 18,
        unit: 'job'
      },
      {
        id: 'prod_2',
        companyId: 'comp_krishna',
        name: '3D Render Walkthrough',
        hsnSac: '998391',
        price: 15000,
        taxRate: 18,
        unit: 'job'
      }
    ],
    apiKeys: []
  }
}

class Database {
  constructor() {
    this.data = null
    this.isMongoConnected = false
    this.initLocal()
  }

  initLocal() {
    try {
      if (process.env.NODE_ENV === 'production' && !process.env.INVOXA_DATA_FILE) {
        this.data = getInitialData()
        return
      }

      const dir = path.dirname(DB_FILE)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8')
        this.data = JSON.parse(raw)
        this.data.apiKeys ||= []
        this.data.creditNotes ||= []
      } else {
        this.data = getInitialData()
        this.saveLocal()
      }
    } catch {
      this.data = getInitialData()
    }
  }

  saveLocal() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2))
      return true
    } catch (err) {
      console.error('Failed to save to database file:', err)
      return false
    }
  }

  async persistInvoice(invoice) {
    if (this.isMongoConnected) {
      await InvoiceModel.updateOne({ id: invoice.id }, { $set: invoice }, { upsert: true })
      return 'database'
    }

    if (process.env.NODE_ENV === 'production' && !process.env.INVOXA_DATA_FILE) {
      throw new Error('Production invoice storage is not configured. Connect MongoDB or set INVOXA_DATA_FILE to a persistent disk path.')
    }

    const previousInvoices = this.data.invoices
    const existingIndex = previousInvoices.findIndex(item => item.id === invoice.id)
    this.data.invoices = existingIndex >= 0
      ? previousInvoices.map((item, index) => index === existingIndex ? invoice : item)
      : [invoice, ...previousInvoices]

    if (!this.saveLocal()) {
      this.data.invoices = previousInvoices
      throw new Error('Could not write the invoice to persistent storage.')
    }

    return 'file'
  }

  async persistApiKey(apiKey) {
    const { _id, __v, ...storedKey } = apiKey
    if (this.isMongoConnected) {
      await ApiKeyModel.updateOne(
        { id: storedKey.id },
        { $set: storedKey },
        { upsert: true, runValidators: true }
      )
      this.data.apiKeys ||= []
      this.data.apiKeys = [storedKey, ...this.data.apiKeys.filter(key => key.id !== storedKey.id)]
      this.saveLocal()
      return 'database'
    }

    if (process.env.NODE_ENV === 'production' && !process.env.INVOXA_DATA_FILE) {
      throw new Error('Production API key storage is not configured. Connect MongoDB or set INVOXA_DATA_FILE to a persistent disk path.')
    }

    const previousApiKeys = this.data.apiKeys || []
    this.data.apiKeys = [storedKey, ...previousApiKeys.filter(key => key.id !== storedKey.id)]
    if (!this.saveLocal()) {
      this.data.apiKeys = previousApiKeys
      throw new Error('Could not write the API key to persistent storage.')
    }
    return 'file'
  }

  async persistCreditNote(creditNote) {
    if (this.isMongoConnected) {
      await CreditNoteModel.updateOne({ id: creditNote.id }, { $set: creditNote }, { upsert: true })
      this.data.creditNotes = [creditNote, ...this.data.creditNotes.filter(item => item.id !== creditNote.id)]
      this.saveLocal()
      return 'database'
    }

    if (process.env.NODE_ENV === 'production' && !process.env.INVOXA_DATA_FILE) {
      throw new Error('Production credit note storage is not configured. Connect MongoDB or set INVOXA_DATA_FILE to a persistent disk path.')
    }

    const previousCreditNotes = this.data.creditNotes
    this.data.creditNotes = [creditNote, ...previousCreditNotes.filter(item => item.id !== creditNote.id)]
    if (!this.saveLocal()) {
      this.data.creditNotes = previousCreditNotes
      throw new Error('Could not write the credit note to persistent storage.')
    }
    return 'file'
  }

  // Dual-persistence: updates local backup and MongoDB
  save() {
    this.saveLocal()
    if (this.isMongoConnected) {
      this.syncToMongo().catch(err => console.error('MongoDB sync error:', err.message))
    }
  }

  async removeInvoice(id) {
    if (this.isMongoConnected) {
      try {
        await InvoiceModel.deleteOne({ id })
      } catch (err) {
        console.warn('MongoDB delete invoice warning:', err.message)
      }
    }
  }

  async removeCreditNote(id) {
    if (this.isMongoConnected) {
      await CreditNoteModel.deleteOne({ id })
    }
  }

  async removeCustomer(id) {
    if (this.isMongoConnected) {
      try {
        await CustomerModel.deleteOne({ id })
      } catch (err) {
        console.warn('MongoDB delete customer warning:', err.message)
      }
    }
  }

  async removeProduct(id) {
    if (this.isMongoConnected) {
      try {
        await ProductModel.deleteOne({ id })
      } catch (err) {
        console.warn('MongoDB delete product warning:', err.message)
      }
    }
  }

  async syncToMongo() {
    if (!this.isMongoConnected) return

    try {
      // Upsert users
      if (this.data.users?.length) {
        for (const u of this.data.users) {
          await UserModel.updateOne({ id: u.id }, { $set: u }, { upsert: true })
        }
      }
      // Upsert companies
      if (this.data.companies?.length) {
        for (const c of this.data.companies) {
          await CompanyModel.updateOne({ id: c.id }, { $set: c }, { upsert: true })
        }
      }
      // Upsert invoices
      if (this.data.invoices?.length) {
        for (const inv of this.data.invoices) {
          await InvoiceModel.updateOne({ id: inv.id }, { $set: inv }, { upsert: true })
        }
      }
      // Upsert credit notes
      if (this.data.creditNotes?.length) {
        for (const creditNote of this.data.creditNotes) {
          await CreditNoteModel.updateOne({ id: creditNote.id }, { $set: creditNote }, { upsert: true })
        }
      }
      // Upsert customers
      if (this.data.customers?.length) {
        for (const cust of this.data.customers) {
          await CustomerModel.updateOne({ id: cust.id }, { $set: cust }, { upsert: true })
        }
      }
      // Upsert products
      if (this.data.products?.length) {
        for (const p of this.data.products) {
          await ProductModel.updateOne({ id: p.id }, { $set: p }, { upsert: true })
        }
      }
      if (this.data.apiKeys?.length) {
        for (const apiKey of this.data.apiKeys) {
          const { _id, __v, ...storedKey } = apiKey
          await ApiKeyModel.updateOne({ id: storedKey.id }, { $set: storedKey }, { upsert: true })
        }
      }
    } catch (err) {
      console.warn('Sync to MongoDB warning:', err.message)
    }
  }

  async loadFromMongo() {
    try {
      const users = await UserModel.find({}).lean()
      const companies = await CompanyModel.find({}).lean()
      const invoices = await InvoiceModel.find({}).lean()
      const creditNotes = await CreditNoteModel.find({}).lean()
      const customers = await CustomerModel.find({}).lean()
      const products = await ProductModel.find({}).lean()
      const apiKeys = await ApiKeyModel.find({}).select('+keyHash').lean()

      if (users.length > 0) {
        this.data = {
          users,
          companies,
          invoices,
          creditNotes,
          customers,
          products,
          apiKeys
        }
        this.saveLocal()
        console.log(`📦 Loaded from MongoDB: ${users.length} users, ${invoices.length} invoices, ${customers.length} customers, ${products.length} products.`)
      } else {
        // First time MongoDB connected: seed from existing local data
        console.log('🌱 MongoDB collections are empty. Seeding MongoDB with initial data...')
        await this.syncToMongo()
        console.log('✅ MongoDB seeded successfully!')
      }
    } catch (err) {
      console.error('Failed to load data from MongoDB:', err)
    }
  }
}

export const db = new Database()

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/invoxa'

  try {
    console.log('⏳ Connecting to MongoDB...')
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    })

    db.isMongoConnected = true
    console.log('🟢 MongoDB connected successfully!')
    await db.loadFromMongo()
  } catch (err) {
    db.isMongoConnected = false
    console.log('⚠️ MongoDB connection note:', err.message)
    console.log('💡 Running with file-backed database (data/database.json).')
    console.log('👉 To use MongoDB Atlas, add your connection string to backend/.env:')
    console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/invoxa?retryWrites=true&w=majority')
  }
}

export const disableDefaultSeedAccounts = async () => {
  if (process.env.NODE_ENV !== 'production') return

  const knownDefaults = new Map([
    ['admin@invoxa.com', 'admin123'],
    ['krishna@enterprises.com', 'password123']
  ])
  let changed = false

  for (const user of db.data.users || []) {
    const defaultPassword = knownDefaults.get(user.email?.toLowerCase())
    if (defaultPassword && typeof user.password === 'string' && bcrypt.compareSync(defaultPassword, user.password)) {
      if (user.status !== 'disabled') {
        user.status = 'disabled'
        changed = true
        console.warn(`Disabled seeded account with a public default password: ${user.email}`)
      }
    }
  }

  if (changed) {
    db.saveLocal()
    if (db.isMongoConnected) {
      for (const user of db.data.users || []) {
        if (user.status === 'disabled' && knownDefaults.has(user.email?.toLowerCase())) {
          await UserModel.updateOne({ id: user.id }, { $set: { status: 'disabled' } })
        }
      }
    }
  }
}

export const provisionConfiguredSuperAdmin = async () => {
  if (process.env.NODE_ENV !== 'production') return

  const configuredEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
  const configuredPassword = process.env.SUPER_ADMIN_PASSWORD
  if (!configuredEmail && !configuredPassword) return
  if (!configuredEmail || !configuredPassword || configuredPassword.length < 12 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail)) {
    throw new Error('Configure both SUPER_ADMIN_EMAIL and a SUPER_ADMIN_PASSWORD of at least 12 characters, or leave both unset.')
  }

  let admin = db.data.users.find(user => user.email?.toLowerCase() === configuredEmail)
  if (admin && admin.role !== 'super_admin') {
    throw new Error('SUPER_ADMIN_EMAIL already belongs to a non-admin account. Use a separate platform admin email.')
  }

  let changed = false
  if (!admin) {
    admin = {
      id: `usr_super_admin_${randomUUID()}`,
      name: 'Invoxa Platform Admin',
      email: configuredEmail,
      role: 'super_admin',
      plan: 'enterprise',
      createdAt: new Date().toISOString()
    }
    db.data.users.push(admin)
    changed = true
  }

  if (admin.status !== 'active') {
    admin.status = 'active'
    changed = true
  }
  if (!admin.password || !bcrypt.compareSync(configuredPassword, admin.password)) {
    admin.password = bcrypt.hashSync(configuredPassword, 10)
    changed = true
  }

  if (changed) {
    db.saveLocal()
    if (db.isMongoConnected) {
      await UserModel.updateOne({ id: admin.id }, { $set: admin }, { upsert: true })
    }
    console.log(`Configured platform admin account: ${configuredEmail}`)
  }
}
