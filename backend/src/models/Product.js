import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  hsnSac: { type: String, default: '998314' },
  price: { type: Number, default: 0 },
  taxRate: { type: Number, default: 18 },
  unit: { type: String, default: 'nos' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema)
export default ProductModel
