import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { UserModel } from '../models/User.js'
import { CompanyModel } from '../models/Company.js'
import { InvoiceModel } from '../models/Invoice.js'
import { CustomerModel } from '../models/Customer.js'
import { ProductModel } from '../models/Product.js'
import { ApiKeyModel } from '../models/ApiKey.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_FILE = path.join(__dirname, '../../data/database.json')

// Initial Seed Data
export const getInitialData = () => {
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
        upiId: 'krishna@okhdfc'
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
      const dir = path.dirname(DB_FILE)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8')
        this.data = JSON.parse(raw)
        this.data.apiKeys ||= []
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
    } catch (err) {
      console.error('Failed to save to database file:', err)
    }
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
      const customers = await CustomerModel.find({}).lean()
      const products = await ProductModel.find({}).lean()
      const apiKeys = await ApiKeyModel.find({}).select('+keyHash').lean()

      if (users.length > 0) {
        this.data = {
          users,
          companies,
          invoices,
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
    console.log(`⏳ Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`)
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
