import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  contactPerson: { type: String },
  phone: { type: String },
  email: { type: String },
  gstin: { type: String },
  city: { type: String },
  state: { type: String, default: 'Maharashtra' },
  address: { type: String },
  outstandingDue: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', customerSchema)
export default CustomerModel
