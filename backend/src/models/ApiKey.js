import mongoose from 'mongoose'

const apiKeySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  companyId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  keyHash: { type: String, required: true, unique: true, select: false },
  keyPrefix: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null }
}, { timestamps: true })

export const ApiKeyModel = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema)
export default ApiKeyModel
