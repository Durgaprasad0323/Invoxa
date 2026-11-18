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
  status: { type: String, default: 'active' },
  subscriptionExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema)
export default UserModel
