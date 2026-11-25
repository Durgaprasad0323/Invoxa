import { db } from '../config/db.js'

const roundMoney = amount => Math.round((Number(amount || 0) + Number.EPSILON) * 100) / 100
const customerKey = customer => String(customer?.name || '').trim().replace(/\s+/g, ' ').toLowerCase()

const validateCustomerCreditApplications = (data, user, replacingInvoiceId = '') => {
  const appliedAmount = roundMoney(data.customerCreditApplied)
  const applications = Array.isArray(data.customerCreditApplications) ? data.customerCreditApplications : []
  if (appliedAmount <= 0 && !applications.length) return null
  if (appliedAmount <= 0 || !applications.length) return 'Choose the customer credit to apply again before saving this invoice.'

  const identity = customerKey(data.client)
  if (!identity) return 'Add the customer name before applying customer credit.'

  const eligibleNotes = (db.data.creditNotes || []).filter(note => (
    note.companyId === user.companyId &&
    note.settlementMethod === 'account-credit' &&
    (note.status || 'Issued') !== 'Voided' &&
    customerKey(note.customer) === identity
  ))
  const usedByNote = new Map()
  db.data.invoices
    .filter(invoice => invoice.id !== replacingInvoiceId && invoice.companyId === user.companyId)
    .flatMap(invoice => invoice.customerCreditApplications || [])
    .forEach(application => {
      const id = String(application.creditNoteId || '')
      usedByNote.set(id, roundMoney((usedByNote.get(id) || 0) + Number(application.amount || 0)))
    })

  const availableById = new Map(eligibleNotes.map(note => [String(note.id), Math.max(0, roundMoney(Number(note.total) - (usedByNote.get(String(note.id)) || 0)))]))
  const seen = new Set()
  let total = 0
  for (const application of applications) {
    const id = String(application.creditNoteId || '')
    const amount = roundMoney(application.amount)
    if (!id || seen.has(id) || !Number.isFinite(amount) || amount <= 0) {
      return 'The customer credit allocation is invalid. Review the credit amount and try again.'
    }
    seen.add(id)
    const available = availableById.get(id)
    if (available === undefined) return 'One of the selected credits is no longer available for this customer.'
    if (amount > available + 0.01) return 'One of the selected customer credits has already been used on another invoice.'
    total = roundMoney(total + amount)
  }
  if (Math.abs(total - appliedAmount) > 0.01) return 'The customer credit total does not match its allocations.'

  const subtotal = (data.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0)
  const tax = (data.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0) * (Number(item.taxRate) || 0) / 100, 0)
  const invoiceTotal = Math.round(Math.max(0, subtotal - subtotal * (Number(data.discountRate) || 0) / 100) + tax)
  if (appliedAmount > invoiceTotal + 0.01) return 'Customer credit cannot exceed the invoice total.'
  return null
}

export const getInvoices = (req, res) => {
  try {
    const isSuper = req.user.role === 'super_admin'
    const companyId = req.user.companyId

    const invoices = isSuper
      ? db.data.invoices
      : db.data.invoices.filter(inv => inv.companyId === companyId || inv.userId === req.user.id)

    return res.json({ count: invoices.length, invoices })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve invoices.' })
  }
}

export const getInvoiceById = (req, res) => {
  try {
    const { id } = req.params
    const invoice = db.data.invoices.find(inv => inv.id === id)
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' })
    }

    if (req.user.role !== 'super_admin' && invoice.companyId !== req.user.companyId && invoice.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this invoice.' })
    }

    return res.json(invoice)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve invoice.' })
  }
}

export const createInvoice = async (req, res) => {
  try {
    const data = req.body
    const creditError = validateCustomerCreditApplications(data, req.user)
    if (creditError) return res.status(400).json({ error: creditError })
    const companyInvoices = db.data.invoices.filter(i => i.companyId === req.user.companyId)
    const nextNum = `INV-2026-${String(companyInvoices.length + 1).padStart(3, '0')}`

    const newInvoice = {
      ...data,
      id: data.id || `inv_${Date.now()}`,
      companyId: req.user.companyId,
      userId: req.user.id,
      invoiceNumber: data.invoiceNumber || nextNum,
      invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: data.status || 'Unpaid',
      items: data.items || [],
      client: data.client || {},
      theme: data.theme || 'emerald',
      layout: data.layout || 'band',
      createdAt: new Date().toISOString()
    }

    await db.persistInvoice(newInvoice)
    db.data.invoices = [newInvoice, ...db.data.invoices.filter(invoice => invoice.id !== newInvoice.id)]

    return res.status(201).json({ message: 'Invoice created successfully!', invoice: newInvoice })
  } catch (err) {
    console.error('Create invoice error:', err)
    return res.status(503).json({ error: 'Invoice could not be saved. Please try again when the database is available.' })
  }
}

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params
    const idx = db.data.invoices.findIndex(inv => inv.id === id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Invoice not found.' })
    }

    const existing = db.data.invoices[idx]
    if (req.user.role !== 'super_admin' && existing.companyId !== req.user.companyId && existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this invoice.' })
    }

    const creditError = validateCustomerCreditApplications(req.body, req.user, id)
    if (creditError) return res.status(400).json({ error: creditError })

    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      companyId: existing.companyId,
      updatedAt: new Date().toISOString()
    }

    await db.persistInvoice(updated)
    db.data.invoices[idx] = updated

    return res.json({ message: 'Invoice updated successfully!', invoice: updated })
  } catch (err) {
    console.error('Update invoice persistence error:', err)
    return res.status(503).json({ error: 'Invoice changes could not be saved. Please try again when the database is available.' })
  }
}

export const deleteInvoice = (req, res) => {
  try {
    const { id } = req.params
    const idx = db.data.invoices.findIndex(inv => inv.id === id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Invoice not found.' })
    }

    const existing = db.data.invoices[idx]
    if (req.user.role !== 'super_admin' && existing.companyId !== req.user.companyId && existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this invoice.' })
    }

    db.data.invoices.splice(idx, 1)
    db.save()
    db.removeInvoice(id)

    return res.json({ message: 'Invoice deleted successfully!' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete invoice.' })
  }
}
