import React, { useEffect, useMemo, useState } from 'react'
import { formatINR } from '../../utils/calculations'
import Icon from '../ui/Icon'

const getStorageKey = user => `invoxa_purchases_${user?.companyId || user?.id || user?.email || 'workspace'}`
const todayValue = () => {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}
const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() + days)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}
const makeLine = () => ({ id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, description: '', hsnSac: '', quantity: 1, rate: '', taxRate: 18 })
const blankForm = (purchaseNo = '') => {
  const date = todayValue()
  return {
    purchaseNo,
    vendorBillNo: '',
    vendor: '',
    vendorGstin: '',
    date,
    dueDate: addDays(date, 15),
    paymentMode: 'Bank Transfer',
    status: 'Unpaid',
    notes: '',
    items: [makeLine()]
  }
}

const DEMO_SUPPLIERS = new Set(['Ambuja Cements Ltd', 'Surat Textile Hub', 'Apex Office Supplies'])
const readPurchases = storageKey => {
  try {
    const saved = localStorage.getItem(storageKey)
    const legacy = saved === null ? localStorage.getItem('invoxa_purchases') : null
    const purchases = JSON.parse(saved ?? legacy ?? '[]')
    const cleaned = Array.isArray(purchases) ? purchases.filter(purchase => !DEMO_SUPPLIERS.has(purchase.vendor)) : []
    if (legacy !== null) {
      localStorage.setItem(storageKey, JSON.stringify(cleaned))
      localStorage.removeItem('invoxa_purchases')
    }
    return cleaned
  } catch { return [] }
}

const formatDate = value => {
  if (!value) return '—'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
const getPurchaseStatus = purchase => {
  if (purchase.status === 'Paid') return 'Paid'
  if (purchase.dueDate && purchase.dueDate < todayValue()) return 'Overdue'
  return 'Unpaid'
}
const calculateTotals = items => {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0)
  const gst = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0) * (Number(item.taxRate) || 0) / 100, 0)
  return { subtotal, gst, total: subtotal + gst }
}
const nextPurchaseNumber = purchases => {
  const year = new Date().getFullYear()
  const highest = purchases.reduce((max, item) => {
    const match = String(item.purchaseNo || '').match(/(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `PUR-${year}-${String(highest + 1).padStart(3, '0')}`
}

export default function PurchasesView({ currentUser = {}, searchQuery = '' }) {
  const storageKey = getStorageKey(currentUser)
  const [purchases, setPurchases] = useState(() => readPurchases(storageKey))
  const [activeFilter, setActiveFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(() => blankForm())
  const [formError, setFormError] = useState('')
  const totals = useMemo(() => calculateTotals(form.items), [form.items])

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(purchases)) } catch { }
  }, [storageKey, purchases])

  const query = searchQuery.trim().toLowerCase()
  const filtered = purchases
    .filter(purchase => {
      const status = getPurchaseStatus(purchase)
      const matchesStatus = activeFilter === 'All' || status === activeFilter
      const matchesSearch = !query || [purchase.purchaseNo, purchase.vendorBillNo, purchase.vendor, purchase.vendorGstin]
        .some(value => String(value || '').toLowerCase().includes(query))
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))

  const totalPurchases = purchases.reduce((sum, purchase) => sum + (Number(purchase.total) || 0), 0)
  const totalITC = purchases.reduce((sum, purchase) => sum + (Number(purchase.gstPaid) || 0), 0)
  const pendingPayables = purchases
    .filter(purchase => getPurchaseStatus(purchase) !== 'Paid')
    .reduce((sum, purchase) => sum + (Number(purchase.total) || 0), 0)

  const openNewForm = () => {
    setEditingId(null)
    setForm(blankForm(nextPurchaseNumber(purchases)))
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = purchase => {
    setEditingId(purchase.id)
    setForm({ ...blankForm(purchase.purchaseNo), ...purchase, items: purchase.items?.length ? purchase.items.map(item => ({ ...item })) : [makeLine()] })
    setFormError('')
    setShowForm(true)
  }

  const updateItem = (itemId, field, value) => {
    setForm(current => ({
      ...current,
      items: current.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }))
  }

  const handleSave = event => {
    event.preventDefault()
    const cleanItems = form.items.filter(item => item.description.trim())
    if (!form.vendor.trim() || !form.vendorBillNo.trim()) {
      setFormError('Add the supplier name and supplier bill number to continue.')
      return
    }
    if (!cleanItems.length || cleanItems.some(item => Number(item.quantity) <= 0 || Number(item.rate) < 0)) {
      setFormError('Add at least one item with a valid quantity and unit price.')
      return
    }

    const purchaseTotals = calculateTotals(cleanItems)
    const savedPurchase = {
      ...form,
      id: editingId || `pur_${Date.now()}`,
      purchaseNo: form.purchaseNo || nextPurchaseNumber(purchases),
      vendor: form.vendor.trim(),
      vendorBillNo: form.vendorBillNo.trim(),
      vendorGstin: form.vendorGstin.trim().toUpperCase(),
      items: cleanItems.map(item => ({ ...item, description: item.description.trim(), hsnSac: item.hsnSac.trim(), quantity: Number(item.quantity), rate: Number(item.rate), taxRate: Number(item.taxRate) || 0 })),
      subtotal: purchaseTotals.subtotal,
      gstPaid: purchaseTotals.gst,
      total: purchaseTotals.total,
      updatedAt: new Date().toISOString()
    }
    setPurchases(current => editingId
      ? current.map(purchase => purchase.id === editingId ? savedPurchase : purchase)
      : [savedPurchase, ...current])
    setShowForm(false)
    setEditingId(null)
    setFormError('')
  }

  const togglePaid = purchase => {
    setPurchases(current => current.map(item => item.id === purchase.id
      ? { ...item, status: getPurchaseStatus(item) === 'Paid' ? 'Unpaid' : 'Paid', updatedAt: new Date().toISOString() }
      : item))
  }

  const removePurchase = purchase => {
    if (window.confirm(`Delete purchase ${purchase.purchaseNo}?`)) {
      setPurchases(current => current.filter(item => item.id !== purchase.id))
    }
  }

  return (
    <div className="workspace-view-container purchases-page">
      <div className="table-controls-bar purchases-heading">
        <div>
          <h3>Purchases</h3>
          <p className="section-subtext">Track supplier bills, purchase items, GST and payments in one place.</p>
        </div>
        <button className="btn-primary-action" type="button" onClick={openNewForm}>+ Add Purchase</button>
      </div>

      <div className="metrics-row purchases-metrics">
        <div className="metric-card"><span className="metric-label">Total Purchases</span><span className="metric-value">{formatINR(totalPurchases)}</span></div>
        <div className="metric-card"><span className="metric-label">Input Tax Credit</span><span className="metric-value purchases-itc-value">{formatINR(totalITC)}</span></div>
        <div className="metric-card"><span className="metric-label">Outstanding Payables</span><span className="metric-value purchases-due-value">{formatINR(pendingPayables)}</span></div>
      </div>

      <div className="purchases-toolbar">
        <div className="tab-filters" role="group" aria-label="Filter purchases by payment status">
          {['All', 'Unpaid', 'Overdue', 'Paid'].map(filter => (
            <button key={filter} type="button" className={`filter-btn ${activeFilter === filter ? 'active' : ''}`} onClick={() => setActiveFilter(filter)}>{filter}</button>
          ))}
        </div>
        <span className="purchases-count">{filtered.length} {filtered.length === 1 ? 'purchase' : 'purchases'}</span>
      </div>

      <div className="swipe-table-wrap purchases-table-wrap">
        <table className="swipe-table purchases-table">
          <thead><tr><th>Purchase No.</th><th>Bill Date</th><th>Supplier</th><th>Supplier Bill No.</th><th>Total</th><th>GST / ITC</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="empty-row">{purchases.length ? 'No purchases match this filter.' : 'No purchase bills yet. Add your first supplier bill to get started.'}</td></tr>
            ) : filtered.map(purchase => {
              const status = getPurchaseStatus(purchase)
              return (
                <tr key={purchase.id}>
                  <td><strong>{purchase.purchaseNo || purchase.billNo || '—'}</strong></td>
                  <td>{formatDate(purchase.date)}</td>
                  <td><div className="purchase-vendor-cell"><strong>{purchase.vendor}</strong>{purchase.vendorGstin && <small>GSTIN: {purchase.vendorGstin}</small>}</div></td>
                  <td>{purchase.vendorBillNo || purchase.billNo || '—'}</td>
                  <td><strong>{formatINR(Number(purchase.total) || 0)}</strong></td>
                  <td><span className="purchases-itc-value">{formatINR(Number(purchase.gstPaid) || 0)}</span></td>
                  <td>{formatDate(purchase.dueDate)}</td>
                  <td><span className={`status-pill purchase-status-${status.toLowerCase()}`}>{status}</span></td>
                  <td><div className="row-actions">
                    <button type="button" className="row-action-btn" title="Edit purchase" aria-label={`Edit ${purchase.purchaseNo}`} onClick={() => openEditForm(purchase)}><Icon name="edit" size={15} /></button>
                    <button type="button" className="row-action-btn" title={status === 'Paid' ? 'Mark unpaid' : 'Mark paid'} aria-label={`${status === 'Paid' ? 'Mark unpaid' : 'Mark paid'} ${purchase.purchaseNo}`} onClick={() => togglePaid(purchase)}><Icon name={status === 'Paid' ? 'clock' : 'checkCircle'} size={15} /></button>
                    <button type="button" className="row-action-btn danger" title="Delete purchase" aria-label={`Delete ${purchase.purchaseNo}`} onClick={() => removePurchase(purchase)}><Icon name="trash" size={15} /></button>
                  </div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="purchases-storage-note">Purchases are saved in this browser on this device.</p>

      {showForm && (
        <div className="purchase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false) }}>
          <form className="purchase-modal" onSubmit={handleSave} role="dialog" aria-modal="true" aria-labelledby="purchase-modal-title">
            <header className="purchase-modal-header">
              <div><span className="purchases-eyebrow">PURCHASES</span><h2 id="purchase-modal-title">{editingId ? 'Edit purchase bill' : 'Add purchase bill'}</h2><p>Enter the supplier bill details and items.</p></div>
              <button type="button" className="purchase-modal-close" aria-label="Close purchase form" onClick={() => setShowForm(false)}>×</button>
            </header>

            <div className="purchase-modal-content">
              <section className="purchase-form-section">
                <div className="purchase-section-title"><span>01</span><div><h3>Supplier and bill details</h3><p>Use the details printed on the supplier's bill.</p></div></div>
                <div className="purchase-form-grid">
                  <label className="purchase-field purchase-field-wide">Supplier name *<input autoFocus value={form.vendor} onChange={event => setForm(current => ({ ...current, vendor: event.target.value }))} placeholder="Supplier or vendor name" required /></label>
                  <label className="purchase-field">Supplier GSTIN<input value={form.vendorGstin} onChange={event => setForm(current => ({ ...current, vendorGstin: event.target.value.toUpperCase() }))} placeholder="Optional GSTIN" maxLength={15} /></label>
                  <label className="purchase-field">Supplier bill number *<input value={form.vendorBillNo} onChange={event => setForm(current => ({ ...current, vendorBillNo: event.target.value }))} placeholder="e.g. INV-2041" required /></label>
                  <label className="purchase-field">Purchase number<input value={form.purchaseNo} onChange={event => setForm(current => ({ ...current, purchaseNo: event.target.value }))} /></label>
                  <label className="purchase-field">Bill date<input type="date" value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} required /></label>
                  <label className="purchase-field">Due date<input type="date" value={form.dueDate} onChange={event => setForm(current => ({ ...current, dueDate: event.target.value }))} /></label>
                  <label className="purchase-field">Payment method<select value={form.paymentMode} onChange={event => setForm(current => ({ ...current, paymentMode: event.target.value }))}><option>Bank Transfer</option><option>UPI</option><option>Cash</option><option>Cheque</option><option>Credit</option><option>Card</option></select></label>
                  <label className="purchase-field">Payment status<select value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value }))}><option>Unpaid</option><option>Paid</option></select></label>
                </div>
              </section>

              <section className="purchase-form-section">
                <div className="purchase-section-title"><span>02</span><div><h3>Items and taxes</h3><p>Add the products or services from this bill.</p></div></div>
                <div className="purchase-items-header"><span>Item</span><span>HSN/SAC</span><span>Qty</span><span>Rate</span><span>GST</span><span>Amount</span><span aria-hidden="true"></span></div>
                <div className="purchase-items-list">
                  {form.items.map((item, index) => {
                    const lineSubtotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0)
                    const lineTotal = lineSubtotal * (1 + (Number(item.taxRate) || 0) / 100)
                    return (
                      <div className="purchase-item-row" key={item.id}>
                        <label className="purchase-field"><span className="purchase-mobile-label">Item</span><input aria-label={`Item ${index + 1} description`} value={item.description} onChange={event => updateItem(item.id, 'description', event.target.value)} placeholder="Item or service" required /></label>
                        <label className="purchase-field"><span className="purchase-mobile-label">HSN/SAC</span><input aria-label={`Item ${index + 1} HSN/SAC`} value={item.hsnSac} onChange={event => updateItem(item.id, 'hsnSac', event.target.value)} placeholder="Code" /></label>
                        <label className="purchase-field"><span className="purchase-mobile-label">Qty</span><input aria-label={`Item ${index + 1} quantity`} type="number" min="0.01" step="any" value={item.quantity} onChange={event => updateItem(item.id, 'quantity', event.target.value)} required /></label>
                        <label className="purchase-field"><span className="purchase-mobile-label">Rate</span><input aria-label={`Item ${index + 1} rate`} type="number" min="0" step="0.01" value={item.rate} onChange={event => updateItem(item.id, 'rate', event.target.value)} placeholder="0.00" required /></label>
                        <label className="purchase-field"><span className="purchase-mobile-label">GST</span><select aria-label={`Item ${index + 1} GST rate`} value={item.taxRate} onChange={event => updateItem(item.id, 'taxRate', event.target.value)}>{[0, 5, 12, 18, 28].map(rate => <option key={rate} value={rate}>{rate}%</option>)}</select></label>
                        <strong className="purchase-line-total">{formatINR(lineTotal)}</strong>
                        <button type="button" className="purchase-remove-item" aria-label={`Remove item ${index + 1}`} disabled={form.items.length === 1} onClick={() => setForm(current => ({ ...current, items: current.items.filter(row => row.id !== item.id) }))}>×</button>
                      </div>
                    )
                  })}
                </div>
                <button type="button" className="purchase-add-item" onClick={() => setForm(current => ({ ...current, items: [...current.items, makeLine()] }))}>+ Add another item</button>
                <div className="purchase-totals">
                  <div><span>Subtotal</span><strong>{formatINR(totals.subtotal)}</strong></div>
                  <div><span>GST</span><strong>{formatINR(totals.gst)}</strong></div>
                  <div className="purchase-grand-total"><span>Bill total</span><strong>{formatINR(totals.total)}</strong></div>
                </div>
              </section>

              <label className="purchase-field purchase-notes-field">Notes<textarea rows="2" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder="Optional notes about this purchase" /></label>
              {formError && <p className="purchase-form-error" role="alert">{formError}</p>}
            </div>

            <footer className="purchase-modal-footer"><button type="button" className="btn-secondary-action" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary-action">{editingId ? 'Save changes' : 'Save purchase'}</button></footer>
          </form>
        </div>
      )}
    </div>
  )
}
