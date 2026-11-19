import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  sku: { type: String, default: '' },
  hsnSac: { type: String, default: '998314' },
  price: { type: Number, default: 0 },
  buyPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  trackInventory: { type: Boolean, default: false },
  stockMovements: [{
    id: { type: String, required: true },
    quantity: { type: Number, required: true },
    direction: { type: String, enum: ['add', 'remove'], required: true },
    reason: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    previousStock: { type: Number, default: 0 },
    newStock: { type: Number, default: 0 }
  }],
  taxRate: { type: Number, default: 18 },
  unit: { type: String, default: 'nos' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema)
export default ProductModel
