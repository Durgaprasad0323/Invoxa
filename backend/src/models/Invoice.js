import mongoose from 'mongoose'

const invoiceItemSchema = new mongoose.Schema({
  id: { type: String },
  description: { type: String },
  hsnSac: { type: String },
  quantity: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
  taxRate: { type: Number, default: 18 }
}, { _id: false })

const sellerSchema = new mongoose.Schema({
  name: { type: String },
  gstin: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String }
}, { _id: false })

const invoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyId: { type: String, required: true },
  userId: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: String },
  dueDate: { type: String },
  status: { type: String, default: 'Unpaid' },
  theme: { type: String, default: 'emerald' },
  layout: { type: String, default: 'band' },
  seller: { type: sellerSchema },
  client: {
    name: { type: String },
    city: { type: String },
    state: { type: String },
    gstin: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  items: [invoiceItemSchema],
  discountRate: { type: Number, default: 0 },
  paymentDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    ifsc: { type: String },
    upiId: { type: String }
  },
  notes: { type: String },
  terms: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)
export default InvoiceModel
