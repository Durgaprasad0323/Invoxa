import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  gstin: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: 'Maharashtra' },
  pincode: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifsc: { type: String, default: '' },
  upiId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export const CompanyModel = mongoose.models.Company || mongoose.model('Company', companySchema)
export default CompanyModel
