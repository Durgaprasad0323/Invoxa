import { db } from '../config/db.js'

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

export const createInvoice = (req, res) => {
  try {
    const data = req.body
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

    db.data.invoices.unshift(newInvoice)
    db.save()

    return res.status(201).json({ message: 'Invoice created successfully!', invoice: newInvoice })
  } catch (err) {
    console.error('Create invoice error:', err)
    return res.status(500).json({ error: 'Failed to create invoice.' })
  }
}

export const updateInvoice = (req, res) => {
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

    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      companyId: existing.companyId,
      updatedAt: new Date().toISOString()
    }

    db.data.invoices[idx] = updated
    db.save()

    return res.json({ message: 'Invoice updated successfully!', invoice: updated })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update invoice.' })
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
