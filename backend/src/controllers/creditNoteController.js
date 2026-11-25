import { db } from '../config/db.js'

const belongsToCompany = (record, user) => (
  user.role === 'super_admin' || record.companyId === user.companyId || record.userId === user.id
)

const roundMoney = amount => Math.round((amount + Number.EPSILON) * 100) / 100

const getCompanyNotes = user => db.data.creditNotes.filter(note => (
  user.role === 'super_admin' || note.companyId === user.companyId || note.userId === user.id
))

export const getCreditNotes = (req, res) => {
  return res.json({ creditNotes: getCompanyNotes(req.user) })
}

export const createCreditNote = async (req, res) => {
  try {
    const body = req.body || {}
    const customer = body.customer && typeof body.customer === 'object' ? body.customer : {}
    const customerName = String(customer.name || '').trim()
    if (!customerName) return res.status(400).json({ error: 'Choose or enter a customer before saving the credit note.' })

    const items = (Array.isArray(body.items) ? body.items : [])
      .map(item => ({
        id: String(item.id || `cni_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
        sourceItemId: String(item.sourceItemId || ''),
        itemName: String(item.itemName || '').trim(),
        hsnSac: String(item.hsnSac || '').trim(),
        unit: String(item.unit || '').trim(),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        taxRate: Number(item.taxRate) || 0
      }))
      .filter(item => item.itemName)

    if (items.some(item => !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.rate) || item.rate < 0 || !Number.isFinite(item.taxRate) || item.taxRate < 0)) {
      return res.status(400).json({ error: 'Enter valid positive quantities, rates, and tax rates for each credit note item.' })
    }

    const adjustmentAmount = Number(body.adjustmentAmount) || 0
    const adjustmentTaxRate = Number(body.adjustmentTaxRate) || 0
    const settlementMethod = body.settlementMethod === 'refund' ? 'refund' : 'account-credit'
    if (adjustmentAmount < 0 || adjustmentTaxRate < 0) {
      return res.status(400).json({ error: 'Adjustment amount and tax rate cannot be negative.' })
    }
    if (!items.length && adjustmentAmount <= 0) {
      return res.status(400).json({ error: 'Add at least one item or enter an amount-only adjustment.' })
    }

    let sourceInvoice = null
    let relatedNotes = []
    const invoiceId = String(body.invoiceId || '')
    if (invoiceId) {
      sourceInvoice = db.data.invoices.find(invoice => invoice.id === invoiceId)
      if (!sourceInvoice || !belongsToCompany(sourceInvoice, req.user)) {
        return res.status(400).json({ error: 'The selected invoice could not be found in this account.' })
      }

      relatedNotes = getCompanyNotes(req.user).filter(note => note.invoiceId === sourceInvoice.id)
      for (const item of items) {
        if (!item.sourceItemId) {
          return res.status(400).json({ error: 'Items on an invoice-linked credit note must come from the selected invoice.' })
        }
        const sourceItem = (sourceInvoice.items || []).find((source, index) => (
          String(source.id || `legacy:${index}`) === item.sourceItemId
        ))
        if (!sourceItem) return res.status(400).json({ error: 'A selected credit note item does not belong to this invoice.' })
        const alreadyCredited = relatedNotes.reduce((sum, note) => sum + (note.items || [])
          .filter(previous => String(previous.sourceItemId) === item.sourceItemId)
          .reduce((quantity, previous) => quantity + (Number(previous.quantity) || 0), 0), 0)
        const remainingQuantity = Math.max(0, (Number(sourceItem.quantity) || 0) - alreadyCredited)
        if (item.quantity > remainingQuantity + 0.000001) {
          return res.status(400).json({ error: `${item.itemName} has only ${remainingQuantity} uncredited units remaining on this invoice.` })
        }
        item.itemName = String(sourceItem.description || sourceItem.itemName || item.itemName)
        item.hsnSac = String(sourceItem.hsnSac || '')
        item.unit = String(sourceItem.unit || '')
        item.rate = Number(sourceItem.rate) || 0
        item.taxRate = Number(sourceItem.taxRate) || 0
      }
    }

    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.quantity * item.rate, 0) + adjustmentAmount)
    const taxAmount = roundMoney(items.reduce((sum, item) => sum + item.quantity * item.rate * item.taxRate / 100, 0) + adjustmentAmount * adjustmentTaxRate / 100)
    const total = roundMoney(subtotal + taxAmount)
    if (sourceInvoice) {
      const invoiceSubtotal = (sourceInvoice.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0)
      const invoiceTax = (sourceInvoice.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0) * (Number(item.taxRate) || 0) / 100, 0)
      const invoiceDiscount = invoiceSubtotal * (Number(sourceInvoice.discountRate) || 0) / 100
      const invoiceTotal = roundMoney(Math.max(0, invoiceSubtotal - invoiceDiscount) + invoiceTax)
      const alreadyCredited = relatedNotes.reduce((sum, note) => sum + (Number(note.total) || 0), 0)
      if (total > Math.max(0, invoiceTotal - alreadyCredited) + 0.01) {
        return res.status(400).json({ error: `Only ${roundMoney(Math.max(0, invoiceTotal - alreadyCredited)).toFixed(2)} remains available to credit on this invoice.` })
      }
    }
    const year = new Date().getFullYear()
    const companyNotes = getCompanyNotes(req.user)
    const nextNumber = companyNotes.reduce((max, note) => {
      const match = String(note.creditNoteNumber || '').match(new RegExp(`^CN-${year}-(\\d+)$`))
      return match ? Math.max(max, Number(match[1])) : max
    }, 0) + 1

    const creditNote = {
      id: `cn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      companyId: req.user.companyId,
      userId: req.user.id,
      creditNoteNumber: `CN-${year}-${String(nextNumber).padStart(3, '0')}`,
      date: String(body.date || new Date().toISOString().slice(0, 10)),
      customer: { ...customer, name: customerName },
      invoiceId: sourceInvoice?.id || '',
      invoiceNumber: sourceInvoice?.invoiceNumber || '',
      reason: String(body.reason || 'Other'),
      reasonDetails: String(body.reasonDetails || '').trim(),
      items,
      adjustmentAmount,
      adjustmentTaxRate,
      notes: String(body.notes || '').trim(),
      terms: String(body.terms || '').trim(),
      settlementMethod,
      subtotal,
      taxAmount,
      total,
      status: 'Issued',
      createdAt: new Date().toISOString()
    }

    await db.persistCreditNote(creditNote)
    return res.status(201).json({ message: 'Credit note saved successfully.', creditNote })
  } catch (err) {
    console.error('Create credit note error:', err)
    return res.status(503).json({ error: 'Credit note could not be saved. Please try again when the database is available.' })
  }
}

export const deleteCreditNote = async (req, res) => {
  try {
    const existing = db.data.creditNotes.find(note => note.id === req.params.id)
    if (!existing) return res.status(404).json({ error: 'Credit note not found.' })
    if (!belongsToCompany(existing, req.user)) return res.status(403).json({ error: 'You are not allowed to delete this credit note.' })
    const isApplied = db.data.invoices.some(invoice => (invoice.customerCreditApplications || []).some(application => application.creditNoteId === existing.id))
    if (isApplied) return res.status(409).json({ error: 'This customer credit has already been applied to an invoice and cannot be deleted.' })

    const previousNotes = db.data.creditNotes
    db.data.creditNotes = previousNotes.filter(note => note.id !== existing.id)
    try {
      await db.removeCreditNote(existing.id)
      if (!db.saveLocal()) throw new Error('Could not write the updated credit notes to storage.')
    } catch (err) {
      db.data.creditNotes = previousNotes
      throw err
    }

    return res.json({ message: 'Credit note deleted successfully.' })
  } catch (err) {
    console.error('Delete credit note error:', err)
    return res.status(503).json({ error: 'Credit note could not be deleted. Please try again.' })
  }
}
