import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'company_admin', 'user'], default: 'company_admin' },
  phone: { type: String },
  googleId: { type: String },
  avatar: { type: String },
  companyId: { type: String },
  companyName: { type: String },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'yearly' },
  status: { type: String, default: 'active' },
  subscriptionExpiry: { type: Date },
  proTrialStartedAt: { type: Date },
  proTrialEndsAt: { type: Date },
  proTrialCreationsUsed: { type: Number, default: 0 },
  proTrialUsage: [{
    usageId: { type: String },
    feature: { type: String },
    usedAt: { type: Date, default: Date.now }
  }],
  subscriptionOrders: [{
    orderId: { type: String },
    plan: { type: String, enum: ['pro', 'enterprise'] },
    billingCycle: { type: String, default: 'yearly' },
    amount: { type: Number },
    status: { type: String, default: 'created' },
    paymentId: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  subscriptionPayments: [{
    paymentId: { type: String },
    orderId: { type: String },
    plan: { type: String, enum: ['pro', 'enterprise'] },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'yearly' },
    amount: { type: Number },
    paidAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema)
export default UserModel
