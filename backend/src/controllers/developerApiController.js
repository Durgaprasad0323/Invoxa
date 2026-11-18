import { createHash, randomBytes, randomUUID } from 'crypto'
import { db } from '../config/db.js'

const hashApiKey = (apiKey) => createHash('sha256').update(apiKey).digest('hex')

const toPublicKey = (key) => ({
  id: key.id,
  name: key.name,
  keyPrefix: key.keyPrefix,
  createdAt: key.createdAt,
  lastUsedAt: key.lastUsedAt || null,
  revokedAt: key.revokedAt || null
})

export const listApiKeys = (req, res) => {
  const keys = (db.data.apiKeys || [])
    .filter(key => key.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(toPublicKey)

  return res.json({ keys })
}

export const createApiKey = (req, res) => {
  if (req.user.role === 'super_admin') {
    return res.status(403).json({ error: 'API keys can only be created for a business account.' })
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  if (!name || name.length > 60) {
    return res.status(400).json({ error: 'Name this key with 1 to 60 characters.' })
  }

  const activeKeys = (db.data.apiKeys || []).filter(key => key.userId === req.user.id && !key.revokedAt)
  if (activeKeys.length >= 10) {
    return res.status(409).json({ error: 'You can have up to 10 active API keys. Revoke one before creating another.' })
  }

  const accountUser = db.data.users.find(item => item.id === req.user.id)
  const company = db.data.companies.find(item => item.ownerId === req.user.id || item.id === accountUser?.companyId)
  const companyId = company?.id
  if (!companyId) {
    return res.status(400).json({ error: 'Add a business profile before creating an API key.' })
  }

  const secret = `invoxa_live_${randomBytes(32).toString('base64url')}`
  const record = {
    id: `key_${randomUUID()}`,
    userId: req.user.id,
    companyId,
    name,
    keyHash: hashApiKey(secret),
    keyPrefix: `${secret.slice(0, 20)}…`,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    revokedAt: null
  }

  db.data.apiKeys ||= []
  db.data.apiKeys.push(record)
  db.save()

  return res.status(201).json({
    message: 'API key created. Copy it now; it will not be shown again.',
    key: toPublicKey(record),
    secret
  })
}

export const revokeApiKey = (req, res) => {
  const key = (db.data.apiKeys || []).find(item => item.id === req.params.id && item.userId === req.user.id)
  if (!key) {
    return res.status(404).json({ error: 'API key not found.' })
  }

  if (!key.revokedAt) {
    key.revokedAt = new Date().toISOString()
    db.save()
  }

  return res.json({ message: 'API key revoked.', key: toPublicKey(key) })
}

const validDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const optionalText = (value, label, maxLength) => {
  if (value === undefined || value === null || value === '') return { value: '', error: null }
  if (typeof value !== 'string' || value.length > maxLength) {
    return { value: '', error: `${label} must be text with no more than ${maxLength} characters.` }
  }
  return { value: value.trim(), error: null }
}

export const createApiInvoice = (req, res) => {
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object.' })
  }

  const clientInput = body.client
  if (!clientInput || typeof clientInput !== 'object' || Array.isArray(clientInput)) {
    return res.status(400).json({ error: 'A client object is required.' })
  }

  const clientName = optionalText(clientInput.name, 'client.name', 200)
  if (clientName.error || !clientName.value) {
    return res.status(400).json({ error: clientName.error || 'client.name is required.' })
  }

  const client = { name: clientName.value }
  for (const [field, maxLength] of Object.entries({
    city: 100,
    state: 100,
    gstin: 30,
    email: 254,
    phone: 40,
    address: 500
  })) {
    const parsed = optionalText(clientInput[field], `client.${field}`, maxLength)
    if (parsed.error) return res.status(400).json({ error: parsed.error })
    if (parsed.value) client[field] = parsed.value
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
    return res.status(400).json({ error: 'items must contain between 1 and 100 invoice items.' })
  }

  const items = []
  for (const [index, item] of body.items.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return res.status(400).json({ error: `items[${index}] must be an object.` })
    }

    const description = optionalText(item.description, `items[${index}].description`, 300)
    const quantity = Number(item.quantity)
    const rate = Number(item.rate)
    const taxRate = item.taxRate === undefined ? 18 : Number(item.taxRate)
    if (description.error || !description.value) {
      return res.status(400).json({ error: description.error || `items[${index}].description is required.` })
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1_000_000) {
      return res.status(400).json({ error: `items[${index}].quantity must be greater than 0.` })
    }
    if (!Number.isFinite(rate) || rate < 0 || rate > 1_000_000_000) {
      return res.status(400).json({ error: `items[${index}].rate must be 0 or more.` })
    }
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return res.status(400).json({ error: `items[${index}].taxRate must be between 0 and 100.` })
    }

    const hsnSac = optionalText(item.hsnSac, `items[${index}].hsnSac`, 30)
    if (hsnSac.error) return res.status(400).json({ error: hsnSac.error })
    items.push({
      id: `item_${randomUUID()}`,
      description: description.value,
      ...(hsnSac.value ? { hsnSac: hsnSac.value } : {}),
      quantity,
      rate,
      taxRate
    })
  }

  const invoiceDate = body.invoiceDate === undefined ? new Date().toISOString().slice(0, 10) : body.invoiceDate
  const dueDate = body.dueDate === undefined
    ? new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
    : body.dueDate
  if (!validDate(invoiceDate) || !validDate(dueDate)) {
    return res.status(400).json({ error: 'invoiceDate and dueDate must use YYYY-MM-DD format.' })
  }

  const invoiceNumber = optionalText(body.invoiceNumber, 'invoiceNumber', 60)
  if (invoiceNumber.error) return res.status(400).json({ error: invoiceNumber.error })
  const notes = optionalText(body.notes, 'notes', 2000)
  const terms = optionalText(body.terms, 'terms', 2000)
  if (notes.error || terms.error) return res.status(400).json({ error: notes.error || terms.error })

  const discountRate = body.discountRate === undefined ? 0 : Number(body.discountRate)
  if (!Number.isFinite(discountRate) || discountRate < 0 || discountRate > 100) {
    return res.status(400).json({ error: 'discountRate must be between 0 and 100.' })
  }

  const company = db.data.companies.find(item => item.id === req.user.companyId || item.ownerId === req.user.id)
  const companyInvoices = db.data.invoices.filter(invoice => invoice.companyId === req.user.companyId)
  const year = new Date().getFullYear()
  const nextNumber = `INV-${year}-${String(companyInvoices.length + 1).padStart(3, '0')}`
  const seller = company ? {
    name: company.name || req.user.companyName || req.user.name,
    gstin: company.gstin || '',
    phone: company.phone || '',
    email: company.email || req.user.email,
    address: company.address || '',
    city: company.city || '',
    state: company.state || '',
    pincode: company.pincode || ''
  } : { name: req.user.companyName || req.user.name, email: req.user.email }

  const invoice = {
    id: `inv_${randomUUID()}`,
    companyId: req.user.companyId,
    userId: req.user.id,
    invoiceNumber: invoiceNumber.value || nextNumber,
    invoiceDate,
    dueDate,
    status: 'Unpaid',
    theme: 'emerald',
    layout: 'band',
    seller,
    client,
    items,
    discountRate,
    paymentDetails: company ? {
      bankName: company.bankName || '',
      accountNumber: company.accountNumber || '',
      ifsc: company.ifsc || '',
      upiId: company.upiId || ''
    } : {},
    notes: notes.value,
    terms: terms.value,
    createdAt: new Date().toISOString()
  }

  db.data.invoices.unshift(invoice)
  db.save()
  return res.status(201).json({ message: 'Invoice created successfully.', invoice })
}
