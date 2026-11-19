import mongoose from 'mongoose'

const creditNoteItemSchema = new mongoose.Schema({
  id: { type: String },
  sourceItemId: { type: String },
  itemName: { type: String },
  hsnSac: { type: String },
  unit: { type: String },
  quantity: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 }
}, { _id: false })

const creditNoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyId: { type: String, required: true },
  userId: { type: String, required: true },
  creditNoteNumber: { type: String, required: true },
  date: { type: String },
  customer: { type: mongoose.Schema.Types.Mixed, default: {} },
  invoiceId: { type: String, default: '' },
  invoiceNumber: { type: String, default: '' },
  reason: { type: String, default: '' },
  reasonDetails: { type: String, default: '' },
  items: [creditNoteItemSchema],
  adjustmentAmount: { type: Number, default: 0 },
  adjustmentTaxRate: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  terms: { type: String, default: '' },
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, default: 'Issued' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

export const CreditNoteModel = mongoose.models.CreditNote || mongoose.model('CreditNote', creditNoteSchema)
export default CreditNoteModel
