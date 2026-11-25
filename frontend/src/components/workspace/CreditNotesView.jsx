import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../../utils/apiClient'
import { formatINR } from '../../utils/calculations'
import { getAvailableCustomerCredits, sumAvailableCustomerCredits } from '../../utils/customerCredits'

const LOCAL_KEY = 'invoxa_credit_notes_v2'
const today = () => new Date().toISOString().slice(0, 10)

const readLocalNotes = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [] } catch { return [] }
}

const itemName = item => item?.itemName || item?.description || item?.name || ''
const roundMoney = amount => Math.round((amount + Number.EPSILON) * 100) / 100

const totalsFor = form => {
  const subtotal = roundMoney((form.items || []).reduce((sum, item) => (
    sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0)
  ), 0) + (Number(form.adjustmentAmount) || 0))
  const tax = roundMoney((form.items || []).reduce((sum, item) => (
    sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0) * (Number(item.taxRate) || 0) / 100
  ), 0) + (Number(form.adjustmentAmount) || 0) * (Number(form.adjustmentTaxRate) || 0) / 100)
  return { subtotal, tax, total: roundMoney(subtotal + tax) }
}

const emptyForm = () => ({
  date: today(),
  customer: {},
  invoiceId: '',
  reason: 'Sales return',
  reasonDetails: '',
  items: [],
  amountOnly: false,
  adjustmentAmount: '',
  adjustmentTaxRate: 0,
  settlementMethod: 'account-credit',
  notes: '',
  terms: ''
})

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]))

const dateLabel = value => {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}

export default function CreditNotesView({
  invoices = [],
  customers = [],
  products = [],
  businessProfile = {},
  onCreditNotesChange,
  searchQuery = '',
  onTrialUsageUpdated
}) {
  const [notes, setNotes] = useState(readLocalNotes)
  const [showModal, setShowModal] = useState(false)
  const [previewNote, setPreviewNote] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [customerChoice, setCustomerChoice] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [storageMessage, setStorageMessage] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('invoxa_token')) return
    let active = true
    api.getCreditNotes()
      .then(data => { if (active) setNotes(data.creditNotes || []) })
      .catch(err => { if (active) setError(`Credit notes could not be loaded: ${err.message}`) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(notes)) } catch { /* Browser storage can be unavailable in private mode. */ }
  }, [notes])

  useEffect(() => {
    onCreditNotesChange?.(notes)
  }, [notes, onCreditNotesChange])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return notes
    return notes.filter(note => [
      note.creditNoteNumber,
      note.customer?.name,
      note.invoiceNumber,
      note.reason
    ].some(value => String(value || '').toLowerCase().includes(query)))
  }, [notes, searchQuery])

  const aggregate = useMemo(() => ({
    total: notes.reduce((sum, note) => sum + (Number(note.total) || 0), 0),
    linked: notes.filter(note => note.invoiceId).length,
    available: sumAvailableCustomerCredits(notes.flatMap(note => getAvailableCustomerCredits([note], invoices, note.customer)))
  }), [notes, invoices])

  const formTotals = totalsFor(form)
  const currentInvoice = invoices.find(invoice => invoice.id === form.invoiceId)
  const invoiceChoices = invoices.filter(invoice => {
    if (!invoice.invoiceNumber || invoice.docType === 'quotation') return false
    return !form.customer?.name || String(invoice.client?.name || '').toLowerCase() === String(form.customer.name).toLowerCase()
  })

  const openCreateForm = () => {
    setForm(emptyForm())
    setCustomerChoice('')
    setError('')
    setStorageMessage('')
    setShowModal(true)
  }

  const chooseCustomer = value => {
    setCustomerChoice(value)
    const customer = customers.find(entry => entry.id === value)
    setForm(previous => ({ ...previous, customer: customer ? { ...customer } : {}, invoiceId: '', items: [] }))
  }

  const chooseInvoice = invoiceId => {
    if (!invoiceId) {
      setForm(previous => ({ ...previous, invoiceId: '', items: [] }))
      return
    }
    const invoice = invoices.find(entry => entry.id === invoiceId)
    if (!invoice) return

    const knownCustomer = customers.find(entry => String(entry.name || '').toLowerCase() === String(invoice.client?.name || '').toLowerCase())
    const customer = {
      ...(knownCustomer || {}),
      ...(invoice.client || {}),
      name: invoice.client?.name || knownCustomer?.name || ''
    }
    const lines = (invoice.items || []).map((item, index) => {
      const sourceItemId = String(item.id || `legacy:${index}`)
      const credited = notes
        .filter(note => note.invoiceId === invoice.id)
        .flatMap(note => note.items || [])
        .filter(creditItem => String(creditItem.sourceItemId || '') === sourceItemId)
        .reduce((sum, creditItem) => sum + (Number(creditItem.quantity) || 0), 0)
      const maxQuantity = Math.max(0, (Number(item.quantity) || 0) - credited)
      return {
        id: `cni_${Date.now()}_${index}`,
        sourceItemId,
        itemName: itemName(item),
        billedQuantity: Number(item.quantity) || 0,
        hsnSac: item.hsnSac || '',
        unit: item.unit || '',
        quantity: 0,
        maxQuantity,
        rate: Number(item.rate) || 0,
        taxRate: Number(item.taxRate) || 0
      }
    }).filter(item => item.maxQuantity > 0)

    setCustomerChoice(knownCustomer?.id || '__new__')
    setForm(previous => ({ ...previous, invoiceId, customer, items: lines, amountOnly: false, adjustmentAmount: '' }))
  }

  const updateItem = (id, changes) => {
    setForm(previous => ({
      ...previous,
      items: previous.items.map(item => item.id === id ? { ...item, ...changes } : item)
    }))
  }

  const addItem = () => {
    setForm(previous => ({
      ...previous,
      items: [...previous.items, {
        id: `cni_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        itemName: '', hsnSac: '', unit: '', quantity: 1, rate: 0, taxRate: 0
      }]
    }))
  }

  const setAmountOnly = checked => {
    setForm(previous => ({
      ...previous,
      amountOnly: checked,
      invoiceId: checked ? '' : previous.invoiceId,
      items: checked ? [] : previous.items,
      adjustmentAmount: checked ? previous.adjustmentAmount : ''
    }))
  }

  const handleCreate = async event => {
    event.preventDefault()
    setError('')
    const customer = form.customer || {}
    if (!String(customer.name || '').trim()) {
      setError('Choose a customer or enter the customer name.')
      return
    }
    const cleanItems = form.amountOnly ? [] : form.items
      .filter(item => itemName(item).trim() && Number(item.quantity) > 0)
      .map(item => ({
        id: item.id,
        sourceItemId: item.sourceItemId || '',
        itemName: itemName(item).trim(),
        hsnSac: item.hsnSac || '',
        unit: item.unit || '',
        quantity: Number(item.quantity),
        rate: Number(item.rate) || 0,
        taxRate: Number(item.taxRate) || 0
      }))
    const adjustmentAmount = form.amountOnly ? Number(form.adjustmentAmount) || 0 : 0
    if (!cleanItems.length && adjustmentAmount <= 0) {
      setError(form.amountOnly ? 'Enter an adjustment amount greater than zero.' : 'Add at least one item with a quantity, or choose an amount-only adjustment.')
      return
    }
    if (formTotals.total <= 0) {
      setError('The credit note total must be greater than zero.')
      return
    }
    if (currentInvoice && cleanItems.some(item => !item.sourceItemId)) {
      setError('Items on an invoice-linked credit note must come from the selected invoice.')
      return
    }
    if (currentInvoice) {
      const quantityExceeded = form.items.some(item => (
        item.sourceItemId && Number(item.quantity) > Number(item.maxQuantity) + 0.000001
      ))
      if (quantityExceeded) {
        setError('A return quantity is greater than the quantity remaining on the selected invoice.')
        return
      }
      const invoiceSubtotal = (currentInvoice.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0)
      const invoiceTax = (currentInvoice.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0) * (Number(item.taxRate) || 0) / 100, 0)
      const invoiceTotal = roundMoney(Math.max(0, invoiceSubtotal - invoiceSubtotal * (Number(currentInvoice.discountRate) || 0) / 100) + invoiceTax)
      const alreadyCredited = notes.filter(note => note.invoiceId === currentInvoice.id).reduce((sum, note) => sum + (Number(note.total) || 0), 0)
      if (formTotals.total > Math.max(0, invoiceTotal - alreadyCredited) + 0.01) {
        setError(`Only ${formatINR(Math.max(0, invoiceTotal - alreadyCredited))} remains available to credit on this invoice.`)
        return
      }
    }

    const payload = {
      date: form.date,
      customer,
      invoiceId: form.invoiceId,
      reason: form.reason,
      reasonDetails: form.reasonDetails,
      items: cleanItems,
      adjustmentAmount,
      adjustmentTaxRate: form.amountOnly ? Number(form.adjustmentTaxRate) || 0 : 0,
      settlementMethod: form.settlementMethod,
      notes: form.notes,
      terms: form.terms
    }

    setSaving(true)
    try {
      let creditNote
      if (localStorage.getItem('invoxa_token')) {
        const response = await api.createCreditNote(payload)
        creditNote = response.creditNote
        setStorageMessage('Saved to your Invoxa account.')
        await onTrialUsageUpdated?.()
      } else {
        const year = new Date().getFullYear()
        const latestNumber = notes.reduce((max, note) => {
          const match = String(note.creditNoteNumber || '').match(new RegExp(`^CN-${year}-(\\d+)$`))
          return match ? Math.max(max, Number(match[1])) : max
        }, 0) + 1
        creditNote = {
          ...payload,
          id: `cn_${Date.now()}`,
          creditNoteNumber: `CN-${year}-${String(latestNumber).padStart(3, '0')}`,
          invoiceNumber: currentInvoice?.invoiceNumber || '',
          subtotal: formTotals.subtotal,
          taxAmount: formTotals.tax,
          total: formTotals.total,
          status: 'Issued',
          createdAt: new Date().toISOString()
        }
        setStorageMessage('Saved in this browser. Sign in to sync notes to your Invoxa account.')
      }
      setNotes(previous => [creditNote, ...previous.filter(note => note.id !== creditNote.id)])
      setShowModal(false)
      setForm(emptyForm())
    } catch (err) {
      if (localStorage.getItem('invoxa_token')) await onTrialUsageUpdated?.()
      setError(err.message || 'The credit note could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async note => {
    const usedCredit = invoices.some(invoice => (invoice.customerCreditApplications || []).some(application => application.creditNoteId === note.id))
    if (usedCredit) {
      setError(`${note.creditNoteNumber} has already been applied to an invoice and cannot be deleted.`)
      return
    }
    if (!window.confirm(`Delete ${note.creditNoteNumber}?`)) return
    setError('')
    try {
      if (localStorage.getItem('invoxa_token')) await api.deleteCreditNote(note.id)
      setNotes(previous => previous.filter(entry => entry.id !== note.id))
    } catch (err) {
      setError(err.message || 'The credit note could not be deleted.')
    }
  }

  const printNote = note => {
    const popup = window.open('', '_blank', 'width=900,height=740')
    if (!popup) {
      setError('Allow pop-ups to print this credit note.')
      return
    }
    const sellerState = String(businessProfile.state || '').trim().toLowerCase()
    const customerState = String(note.customer?.state || '').trim().toLowerCase()
    const interstate = sellerState && customerState && sellerState !== customerState
    const itemRows = (note.items || []).map(item => {
      const quantity = Number(item.quantity) || 0
      const rate = Number(item.rate) || 0
      const lineTax = quantity * rate * (Number(item.taxRate) || 0) / 100
      return `<tr><td>${escapeHtml(item.itemName || item.description)}</td><td>${escapeHtml(item.hsnSac || '—')}</td><td>${quantity}</td><td>${escapeHtml(item.unit || '—')}</td><td>${escapeHtml(formatINR(rate))}</td><td>${Number(item.taxRate) || 0}%</td><td>${escapeHtml(formatINR(quantity * rate + lineTax))}</td></tr>`
    }).join('')
    const adjustmentRow = Number(note.adjustmentAmount) > 0
      ? `<tr><td>Credit adjustment</td><td>—</td><td>1</td><td>—</td><td>${escapeHtml(formatINR(note.adjustmentAmount))}</td><td>${Number(note.adjustmentTaxRate) || 0}%</td><td>${escapeHtml(formatINR(Number(note.adjustmentAmount) * (1 + (Number(note.adjustmentTaxRate) || 0) / 100)))}</td></tr>`
      : ''
    const tax = Number(note.taxAmount) || 0
    const subtotal = Number(note.subtotal) || 0
    const profileName = businessProfile.name || 'Business'
    const taxRows = interstate
      ? `<div>IGST: ${escapeHtml(formatINR(tax))}</div>`
      : `<div>CGST: ${escapeHtml(formatINR(tax / 2))}</div><div>SGST: ${escapeHtml(formatINR(tax / 2))}</div>`
    popup.document.write(`<!doctype html><html><head><title>${escapeHtml(note.creditNoteNumber)}</title><style>
      *{box-sizing:border-box}body{font:14px Arial,sans-serif;color:#172033;margin:0;padding:36px}.sheet{max-width:900px;margin:auto;border:1px solid #dbe3ee;padding:34px}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #12213d;padding-bottom:20px}.title{font-size:26px;font-weight:700;letter-spacing:.03em}.muted{color:#64748b;font-size:12px;line-height:1.7}.info{display:flex;justify-content:space-between;gap:24px;margin:24px 0}.info h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin:0 0 7px}.info p{margin:2px 0;line-height:1.5}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#f1f5f9;color:#475569;text-align:left;text-transform:uppercase;font-size:10px;letter-spacing:.05em}th,td{padding:10px 8px;border-bottom:1px solid #e2e8f0}td{font-size:12px}.totals{width:280px;margin:20px 0 0 auto;line-height:1.9}.grand{font-size:18px;font-weight:700;border-top:1px solid #cbd5e1;padding-top:9px}.notes{margin-top:28px;font-size:12px;line-height:1.6}.sign{margin-top:54px;text-align:right;font-size:12px}.footer{margin-top:44px;text-align:center;border-top:1px solid #e2e8f0;padding-top:14px;color:#64748b;font-size:11px}@media print{body{padding:0}.sheet{border:0;padding:12mm;max-width:none}@page{size:A4;margin:0}}
      </style></head><body><main class="sheet"><div class="top"><div><div style="font-size:20px;font-weight:700">${escapeHtml(profileName)}</div><div class="muted">${escapeHtml(businessProfile.address || '')}<br>${escapeHtml([businessProfile.city, businessProfile.state, businessProfile.pincode].filter(Boolean).join(', '))}<br>${escapeHtml(businessProfile.phone || '')}${businessProfile.email ? ` · ${escapeHtml(businessProfile.email)}` : ''}<br>${businessProfile.gstin ? `GSTIN: ${escapeHtml(businessProfile.gstin)}` : ''}</div></div><div style="text-align:right"><div class="title">CREDIT NOTE</div><div class="muted">${escapeHtml(note.creditNoteNumber)}<br>Date: ${escapeHtml(dateLabel(note.date))}<br>${note.invoiceNumber ? `Against invoice: ${escapeHtml(note.invoiceNumber)}` : ''}</div></div></div><div class="info"><div><h3>Credit to</h3><p><strong>${escapeHtml(note.customer?.name || '')}</strong></p><p>${escapeHtml(note.customer?.address || '')}</p><p>${escapeHtml([note.customer?.city, note.customer?.state].filter(Boolean).join(', '))}</p><p>${escapeHtml(note.customer?.phone || note.customer?.email || '')}</p>${note.customer?.gstin ? `<p>GSTIN: ${escapeHtml(note.customer.gstin)}</p>` : ''}</div><div><h3>Reason</h3><p>${escapeHtml(note.reason || 'Other')}</p><p>${escapeHtml(note.reasonDetails || '')}</p></div></div><table><thead><tr><th>Item / service</th><th>HSN/SAC</th><th>Qty</th><th>Unit</th><th>Rate</th><th>GST</th><th>Credit value</th></tr></thead><tbody>${itemRows}${adjustmentRow}</tbody></table><div class="totals"><div>Subtotal: ${escapeHtml(formatINR(subtotal))}</div>${taxRows}<div class="grand">Total credit: ${escapeHtml(formatINR(note.total))}</div></div>${note.notes ? `<div class="notes"><strong>Notes</strong><br>${escapeHtml(note.notes)}</div>` : ''}${note.terms ? `<div class="notes"><strong>Terms</strong><br>${escapeHtml(note.terms)}</div>` : ''}<div class="sign">For ${escapeHtml(profileName)}<br><br><br>Authorized signatory</div><div class="footer">This credit note was created with Invoxa.</div></main><script>window.onload=()=>window.print()</script></body></html>`)
    popup.document.close()
  }

  const shareNote = note => {
    const settlement = note.settlementMethod === 'account-credit'
      ? 'This amount is saved as customer credit for a future invoice.'
      : 'The refund will be handled separately by the business.'
    const message = `${note.creditNoteNumber} for ${formatINR(note.total)} has been issued to ${note.customer?.name || 'you'}${note.invoiceNumber ? ` against invoice ${note.invoiceNumber}` : ''}. ${settlement}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="workspace-view-container credit-note-page">
      <div className="table-controls-bar">
        <div>
          <h3>Credit Notes</h3>
          <p className="section-subtext">Record sales returns, billing corrections, and customer credits.</p>
        </div>
        <button className="primary-create-btn" onClick={openCreateForm}>+ Create Credit Note</button>
      </div>

      {error && <div className="credit-note-alert" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
      {storageMessage && <div className="credit-note-save-message">{storageMessage}</div>}

      <div className="metrics-row">
        <div className="metric-card"><span className="metric-label">Credit notes</span><span className="metric-value">{notes.length}</span><span className="metric-sub">All issued notes</span></div>
        <div className="metric-card"><span className="metric-label">Total credited</span><span className="metric-value">{formatINR(aggregate.total)}</span><span className="metric-sub">Across all credit notes</span></div>
        <div className="metric-card"><span className="metric-label">Customer credit available</span><span className="metric-value">{formatINR(aggregate.available)}</span><span className="metric-sub">Can be applied to a future invoice</span></div>
      </div>

      <div className="table-wrapper credit-note-table-wrap">
        <table className="swipe-table">
          <thead><tr><th>Credit note</th><th>Date</th><th>Customer</th><th>Against invoice</th><th>Reason</th><th>Credit amount</th><th>Status</th><th className="actions-header">Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="empty-row">{searchQuery ? 'No credit notes match your search.' : 'No credit notes yet. Create one to record a return or customer credit.'}</td></tr>
            ) : filtered.map(note => (
              <tr key={note.id} className="swipe-row">
                <td><button className="credit-note-number" onClick={() => setPreviewNote(note)}>{note.creditNoteNumber}</button></td>
                <td>{dateLabel(note.date)}</td>
                <td><strong>{note.customer?.name || '—'}</strong></td>
                <td>{note.invoiceNumber || <span className="credit-note-unlinked">Unlinked</span>}</td>
                <td>{note.reason || 'Other'}</td>
                <td><strong>{formatINR(note.total)}</strong></td>
                <td><span className="credit-note-status-issued">{note.settlementMethod === 'account-credit'
                  ? `${formatINR(getAvailableCustomerCredits([note], invoices, note.customer).reduce((sum, credit) => sum + credit.available, 0))} available`
                  : 'Refund separately'}</span></td>
                <td><div className="row-actions">
                  <button className="row-action-btn" title="View credit note" onClick={() => setPreviewNote(note)}>View</button>
                  <button className="row-action-btn" title="Share on WhatsApp" onClick={() => shareNote(note)}></button>
                  <button className="row-action-btn" title="Print or save as PDF" onClick={() => printNote(note)}>⎙</button>
                  <button className="row-action-btn danger" title="Delete credit note" onClick={() => handleDelete(note)}>×</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="credit-note-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setShowModal(false) }}>
          <form className="credit-note-editor" onSubmit={handleCreate}>
            <div className="credit-note-editor-header">
              <div><span className="credit-note-kicker">SALES</span><h2>Create Credit Note</h2><p>Create a sales return or add a credit adjustment for a customer.</p></div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)} disabled={saving} aria-label="Close">×</button>
              <button type="submit" className="credit-note-mobile-save" disabled={saving}>{saving ? 'Saving…' : 'Save Credit Note'}</button>
            </div>
            <div className="credit-note-editor-body">
              {error && <div className="credit-note-alert" role="alert">{error}</div>}
              <section className="credit-note-form-section">
                <div className="credit-note-section-heading"><span>01</span><div><h3>Customer and reference</h3><p>Choose the customer and optionally link the original invoice.</p></div></div>
                <div className="credit-note-grid">
                  <label className="credit-note-field"><span>Customer *</span>
                    <select value={customerChoice} onChange={event => chooseCustomer(event.target.value)} required>
                      <option value="">Select a customer</option>
                      {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                      <option value="__new__">+ Enter customer details</option>
                    </select>
                  </label>
                  <label className="credit-note-field"><span>Against invoice</span>
                    <select value={form.invoiceId} onChange={event => chooseInvoice(event.target.value)}>
                      <option value="">No invoice reference</option>
                      {invoiceChoices.map(invoice => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber} · {formatINR(invoice.grandTotal || invoice.total || 0)}</option>)}
                    </select>
                  </label>
                  <label className="credit-note-field"><span>Credit note date *</span><input type="date" value={form.date} onChange={event => setForm(previous => ({ ...previous, date: event.target.value }))} required /></label>
                  <label className="credit-note-field"><span>Reason</span>
                    <select value={form.reason} onChange={event => setForm(previous => ({ ...previous, reason: event.target.value }))}>
                      <option>Sales return</option><option>Damaged goods</option><option>Excess billing</option><option>Price adjustment</option><option>Service cancelled</option><option>Other</option>
                    </select>
                  </label>
                  {customerChoice === '__new__' && <>
                    <label className="credit-note-field"><span>Customer name *</span><input value={form.customer.name || ''} onChange={event => setForm(previous => ({ ...previous, customer: { ...previous.customer, name: event.target.value } }))} placeholder="Customer or business name" required /></label>
                    <label className="credit-note-field"><span>Phone</span><input value={form.customer.phone || ''} onChange={event => setForm(previous => ({ ...previous, customer: { ...previous.customer, phone: event.target.value } }))} placeholder="Phone number" /></label>
                    <label className="credit-note-field"><span>Email</span><input type="email" value={form.customer.email || ''} onChange={event => setForm(previous => ({ ...previous, customer: { ...previous.customer, email: event.target.value } }))} placeholder="name@example.com" /></label>
                    <label className="credit-note-field"><span>GSTIN</span><input value={form.customer.gstin || ''} onChange={event => setForm(previous => ({ ...previous, customer: { ...previous.customer, gstin: event.target.value } }))} placeholder="Optional GSTIN" /></label>
                    <label className="credit-note-field"><span>City</span><input value={form.customer.city || ''} onChange={event => setForm(previous => ({ ...previous, customer: { ...previous.customer, city: event.target.value } }))} placeholder="City" /></label>
                    <label className="credit-note-field"><span>State</span><input value={form.customer.state || ''} onChange={event => setForm(previous => ({ ...previous, customer: { ...previous.customer, state: event.target.value } }))} placeholder="State" /></label>
                    <label className="credit-note-field credit-note-field-wide"><span>Billing address</span><input value={form.customer.address || ''} onChange={event => setForm(previous => ({ ...previous, customer: { ...previous.customer, address: event.target.value } }))} placeholder="Street and area" /></label>
                  </>}
                  <label className="credit-note-field credit-note-field-wide"><span>Reason details</span><input value={form.reasonDetails} onChange={event => setForm(previous => ({ ...previous, reasonDetails: event.target.value }))} placeholder="Add a short explanation (optional)" /></label>
                </div>
                {currentInvoice && <div className="credit-note-linked-hint">Items are copied from {currentInvoice.invoiceNumber}. In “Qty to credit,” enter only the units not sent or returned (for example, enter 1 if 1 of 5 was unavailable). Previously credited quantities are excluded.</div>}
              </section>

              <section className="credit-note-form-section">
                <div className="credit-note-section-heading"><span>02</span><div><h3>Items and credit value</h3><p>Choose returned items or enter a credit amount without product lines.</p></div></div>
                <label className="credit-note-checkbox"><input type="checkbox" checked={form.amountOnly} onChange={event => setAmountOnly(event.target.checked)} /><span>Create an amount-only adjustment without products</span></label>
                {!form.amountOnly ? <>
                  <div className="credit-note-line-table">
                    <div className="credit-note-line-head"><span>Item / service</span><span>HSN/SAC</span><span>Qty to credit</span><span>Rate</span><span>GST</span><span>Credit value</span><span></span></div>
                    {form.items.map(item => {
                      const lineTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0)
                      const lineWithTax = lineTotal * (1 + (Number(item.taxRate) || 0) / 100)
                      return <div className="credit-note-line" key={item.id}>
                        <div className="credit-note-item-picker">
                          <span className="credit-note-line-field-label">Item / service</span>
                          {item.sourceItemId
                            ? <span className="credit-note-readonly-name">{item.itemName}</span>
                            : <>
                              <select aria-label="Select catalog item" value={item.productId || '__custom__'} onChange={event => {
                                const product = products.find(entry => entry.id === event.target.value)
                                if (!product) { updateItem(item.id, { productId: '', itemName: '', hsnSac: '', rate: 0, taxRate: 0, unit: '' }); return }
                                updateItem(item.id, { productId: product.id, itemName: product.name, hsnSac: product.hsnSac || '', rate: Number(product.rate ?? product.price) || 0, taxRate: Number(product.taxRate) || 0, unit: product.unit || '' })
                              }}>
                                <option value="__custom__">Custom item</option>
                                {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                              </select>
                              {!item.productId && <input aria-label="Custom item name" value={item.itemName} onChange={event => updateItem(item.id, { itemName: event.target.value })} placeholder="Item or service" />}
                              {item.productId && <span className="credit-note-readonly-name">{item.itemName}</span>}
                            </>}
                          {item.sourceItemId && <small className="credit-note-item-quantity-hint">On invoice: {item.billedQuantity} · Remaining to credit: {item.maxQuantity}</small>}
                        </div>
                        <label className="credit-note-line-field"><span>HSN/SAC</span><input aria-label="HSN or SAC code" value={item.hsnSac || ''} onChange={event => updateItem(item.id, { hsnSac: event.target.value })} placeholder="Code" /></label>
                        <label className="credit-note-line-field"><span>Qty to credit</span><input aria-label="Quantity to credit" type="number" min="0" max={item.maxQuantity} step="0.01" value={item.quantity} onChange={event => updateItem(item.id, { quantity: event.target.value })} /></label>
                        <label className="credit-note-line-field"><span>Rate (₹)</span><input aria-label="Item rate" type="number" min="0" step="0.01" value={item.rate} disabled={Boolean(item.sourceItemId)} onChange={event => updateItem(item.id, { rate: event.target.value })} /></label>
                        <label className="credit-note-line-field"><span>GST %</span><input aria-label="GST percent" type="number" min="0" max="100" step="0.01" value={item.taxRate} disabled={Boolean(item.sourceItemId)} onChange={event => updateItem(item.id, { taxRate: event.target.value })} /></label>
                        <div className="credit-note-line-field credit-note-line-value"><span>Credit value</span><strong className="credit-note-line-total">{formatINR(lineWithTax)}</strong></div>
                        <button type="button" className="credit-note-remove-line" disabled={Boolean(item.sourceItemId)} onClick={() => setForm(previous => ({ ...previous, items: previous.items.filter(line => line.id !== item.id) }))} aria-label="Remove item">×</button>
                      </div>
                    })}
                    {form.items.length === 0 && <div className="credit-note-empty-lines">{currentInvoice ? 'All quantities on this invoice have already been credited.' : 'Add a catalog item or enter a custom item.'}</div>}
                  </div>
                  {!currentInvoice && <button type="button" className="credit-note-add-line" onClick={addItem}>+ Add item or service</button>}
                </> : <div className="credit-note-adjustment-box">
                  <label className="credit-note-field"><span>Credit adjustment amount *</span><input type="number" min="0.01" step="0.01" value={form.adjustmentAmount} onChange={event => setForm(previous => ({ ...previous, adjustmentAmount: event.target.value }))} placeholder="0.00" /></label>
                  <label className="credit-note-field"><span>GST rate</span><select value={form.adjustmentTaxRate} onChange={event => setForm(previous => ({ ...previous, adjustmentTaxRate: event.target.value }))}><option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option></select></label>
                </div>}
                <div className="credit-note-totals"><div><span>Subtotal</span><strong>{formatINR(formTotals.subtotal)}</strong></div><div><span>GST</span><strong>{formatINR(formTotals.tax)}</strong></div><div className="credit-note-total-due"><span>Total credit</span><strong>{formatINR(formTotals.total)}</strong></div></div>
              </section>

              <section className="credit-note-form-section">
                <div className="credit-note-section-heading"><span>03</span><div><h3>How should this credit be settled?</h3><p>Choose whether you will refund the customer or keep the amount for their next purchase.</p></div></div>
                <div className="credit-note-grid">
                  <label className="credit-note-field credit-note-field-wide"><span>Settlement</span>
                    <select value={form.settlementMethod} onChange={event => setForm(previous => ({ ...previous, settlementMethod: event.target.value }))}>
                      <option value="account-credit">Keep as customer credit for a future invoice</option>
                      <option value="refund">Refund the customer separately</option>
                    </select>
                  </label>
                  <p className="credit-note-linked-hint credit-note-field-wide">{form.settlementMethod === 'account-credit'
                    ? 'This amount will appear as available credit when you create the same customer’s next invoice. Invoxa records the credit; no money is transferred automatically.'
                    : 'Invoxa records this credit note but does not send the refund. Refund the customer using your payment method outside Invoxa.'}</p>
                </div>
              </section>

              <section className="credit-note-form-section">
                <div className="credit-note-section-heading"><span>04</span><div><h3>Additional details</h3><p>Add any message or conditions that should appear on the credit note.</p></div></div>
                <div className="credit-note-grid">
                  <label className="credit-note-field"><span>Notes</span><textarea rows="3" value={form.notes} onChange={event => setForm(previous => ({ ...previous, notes: event.target.value }))} placeholder="Message for your customer" /></label>
                  <label className="credit-note-field"><span>Terms and conditions</span><textarea rows="3" value={form.terms} onChange={event => setForm(previous => ({ ...previous, terms: event.target.value }))} placeholder="Optional terms" /></label>
                </div>
              </section>
            </div>
            <div className="credit-note-editor-footer"><span>Credit note will be issued when you save it.</span><div><button type="button" className="btn-secondary-action" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button><button type="submit" className="btn-primary-action" disabled={saving}>{saving ? 'Saving…' : 'Save Credit Note'}</button></div></div>
          </form>
        </div>
      )}

      {previewNote && <div className="credit-note-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setPreviewNote(null) }}><div className="credit-note-preview-card">
        <div className="credit-note-preview-header"><div><span className="credit-note-kicker">CREDIT NOTE</span><h2>{previewNote.creditNoteNumber}</h2><p>{dateLabel(previewNote.date)} · {previewNote.status || 'Issued'}</p></div><button className="modal-close-btn" onClick={() => setPreviewNote(null)} aria-label="Close">×</button></div>
        <div className="credit-note-preview-content"><div className="credit-note-preview-meta"><div><span>Customer</span><strong>{previewNote.customer?.name || '—'}</strong><small>{previewNote.customer?.phone || previewNote.customer?.email || ''}</small></div><div><span>Against invoice</span><strong>{previewNote.invoiceNumber || 'No invoice reference'}</strong></div><div><span>Reason</span><strong>{previewNote.reason || 'Other'}</strong><small>{previewNote.reasonDetails || ''}</small></div><div><span>Settlement</span><strong>{previewNote.settlementMethod === 'account-credit' ? 'Keep as customer credit' : 'Refund separately'}</strong><small>{previewNote.settlementMethod === 'account-credit' ? `${formatINR(getAvailableCustomerCredits([previewNote], invoices, previewNote.customer).reduce((sum, credit) => sum + credit.available, 0))} remains available` : 'Refund is handled outside Invoxa.'}</small></div></div>
          {previewNote.items?.length > 0 && <div className="credit-note-preview-items">{previewNote.items.map(item => <div key={item.id}><span>{item.itemName || item.description}<small>{item.quantity} × {formatINR(item.rate)} · GST {Number(item.taxRate) || 0}%</small></span><strong>{formatINR((Number(item.quantity) || 0) * (Number(item.rate) || 0) * (1 + (Number(item.taxRate) || 0) / 100))}</strong></div>)}</div>}
          {Number(previewNote.adjustmentAmount) > 0 && <div className="credit-note-preview-items"><div><span>Credit adjustment<small>GST {Number(previewNote.adjustmentTaxRate) || 0}%</small></span><strong>{formatINR(Number(previewNote.adjustmentAmount) * (1 + (Number(previewNote.adjustmentTaxRate) || 0) / 100))}</strong></div></div>}
          <div className="credit-note-preview-total"><span>Subtotal</span><strong>{formatINR(previewNote.subtotal)}</strong><span>GST</span><strong>{formatINR(previewNote.taxAmount)}</strong><span>Total credit</span><strong>{formatINR(previewNote.total)}</strong></div>
          {previewNote.notes && <p className="credit-note-preview-note"><strong>Notes:</strong> {previewNote.notes}</p>}{previewNote.terms && <p className="credit-note-preview-note"><strong>Terms:</strong> {previewNote.terms}</p>}
        </div><div className="credit-note-preview-footer"><button className="btn-secondary-action" onClick={() => shareNote(previewNote)}>Share on WhatsApp</button><button className="btn-primary-action" onClick={() => printNote(previewNote)}>Print / Save PDF</button></div>
      </div></div>}
    </div>
  )
}
