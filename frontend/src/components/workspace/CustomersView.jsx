import React, { useMemo, useState } from 'react'
import { formatINR } from '../../utils/calculations'
import Icon from '../ui/Icon'

const blankCustomer = () => ({ name: '', phone: '', email: '', gstin: '', city: '', state: '', pincode: '', address: '', creditPeriod: 'Due on receipt' })

export default function CustomersView({ customers = [], onAddCustomer, onUpdateCustomer, onDeleteCustomer, onBillCustomer, searchQuery = '' }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blankCustomer)
  const [filter, setFilter] = useState('All customers')
  const [error, setError] = useState('')
  const totalOutstanding = customers.reduce((sum, customer) => sum + (Number(customer.outstandingDue) || 0), 0)
  const totalSales = customers.reduce((sum, customer) => sum + (Number(customer.totalPurchases) || 0), 0)
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return customers.filter(customer => {
      const hasDue = Number(customer.outstandingDue) > 0
      const statusMatches = filter === 'All customers' || (filter === 'With balance' && hasDue) || (filter === 'Clear balance' && !hasDue)
      const searchMatches = !query || [customer.name, customer.phone, customer.email, customer.gstin, customer.city].some(value => String(value || '').toLowerCase().includes(query))
      return statusMatches && searchMatches
    }).sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  }, [customers, filter, searchQuery])

  const openNew = () => { setEditingId(null); setForm(blankCustomer()); setError(''); setShowForm(true) }
  const openEdit = customer => { setEditingId(customer.id); setForm({ ...blankCustomer(), ...customer }); setError(''); setShowForm(true) }
  const saveCustomer = event => {
    event.preventDefault()
    if (!form.name.trim()) { setError('Enter a customer or business name.'); return }
    const saved = { ...form, id: editingId || `cust_${Date.now()}`, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), gstin: form.gstin.trim().toUpperCase(), outstandingDue: Number(form.outstandingDue) || 0, totalPurchases: Number(form.totalPurchases) || 0 }
    if (editingId) onUpdateCustomer?.(editingId, saved)
    else onAddCustomer?.(saved)
    setShowForm(false)
    setEditingId(null)
  }
  const removeCustomer = customer => {
    if (window.confirm(`Delete ${customer.name} from your customer list?`)) onDeleteCustomer?.(customer.id)
  }
  const sendReminder = customer => {
    const phone = String(customer.phone || '').replace(/\D/g, '')
    if (!phone) { window.alert('Add a phone number to this customer before sending a WhatsApp reminder.'); return }
    const message = `Hello ${customer.name}, this is a reminder that ${formatINR(customer.outstandingDue)} is due on your Invoxa account. Please contact us if you have already paid. Thank you.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="workspace-view-container customers-page">
      <div className="table-controls-bar purchases-heading"><div><h3>Customers</h3><p className="section-subtext">Manage customer contacts, balances and billing details.</p></div><button type="button" className="btn-primary-action" onClick={openNew}>+ Add Customer</button></div>
      <div className="metrics-row purchases-metrics customers-metrics">
        <div className="metric-card"><span className="metric-label">Customers</span><span className="metric-value">{customers.length}</span></div>
        <div className="metric-card"><span className="metric-label">Total Sales</span><span className="metric-value">{formatINR(totalSales)}</span></div>
        <div className="metric-card"><span className="metric-label">Outstanding</span><span className="metric-value purchases-due-value">{formatINR(totalOutstanding)}</span></div>
      </div>
      <div className="purchases-toolbar"><div className="tab-filters" role="group" aria-label="Filter customers">{['All customers', 'With balance', 'Clear balance'].map(value => <button type="button" key={value} className={`filter-btn ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>{value}</button>)}</div><span className="purchases-count">{visible.length} {visible.length === 1 ? 'customer' : 'customers'}</span></div>
      <div className="swipe-table-wrap purchases-table-wrap"><table className="swipe-table customers-table">
        <thead><tr><th>Customer</th><th>Phone / Email</th><th>GSTIN</th><th>Location</th><th>Total Sales</th><th>Balance Due</th><th>Actions</th></tr></thead>
        <tbody>{visible.length === 0 ? <tr><td colSpan={7} className="empty-row">{customers.length ? 'No customers match your search or filter.' : 'No customers yet. Add a customer to save their details for billing.'}</td></tr> : visible.map(customer => <tr key={customer.id}>
          <td><div className="purchase-vendor-cell"><strong>{customer.name}</strong><small>{customer.address || ''}</small></div></td>
          <td><div className="purchase-vendor-cell"><span>{customer.phone || '—'}</span><small>{customer.email || ''}</small></div></td>
          <td>{customer.gstin || 'Unregistered'}</td><td>{[customer.city, customer.state].filter(Boolean).join(', ') || '—'}</td>
          <td><strong>{formatINR(Number(customer.totalPurchases) || 0)}</strong></td><td><strong className={Number(customer.outstandingDue) > 0 ? 'purchases-due-value' : 'purchases-itc-value'}>{formatINR(Number(customer.outstandingDue) || 0)}</strong></td>
          <td><div className="row-actions"><button type="button" className="row-action-btn" title="Edit customer" aria-label={`Edit ${customer.name}`} onClick={() => openEdit(customer)}><Icon name="edit" size={15} /></button>{Number(customer.outstandingDue) > 0 && <button type="button" className="row-action-btn" title="Send WhatsApp reminder" aria-label={`Send payment reminder to ${customer.name}`} onClick={() => sendReminder(customer)}><Icon name="message" size={15} /></button>}<button type="button" className="row-action-btn" title="Create invoice" aria-label={`Create invoice for ${customer.name}`} onClick={() => onBillCustomer?.(customer)}><Icon name="plus" size={15} /></button><button type="button" className="row-action-btn danger" title="Delete customer" aria-label={`Delete ${customer.name}`} onClick={() => removeCustomer(customer)}><Icon name="trash" size={15} /></button></div></td>
        </tr>)}</tbody>
      </table></div>

      {showForm && <div className="purchase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false) }}><form className="purchase-modal" onSubmit={saveCustomer} role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
        <header className="purchase-modal-header"><div><span className="purchases-eyebrow">CUSTOMERS</span><h2 id="customer-modal-title">{editingId ? 'Edit customer' : 'Add customer'}</h2><p>Save the contact and billing details used on invoices.</p></div><button type="button" className="purchase-modal-close" aria-label="Close customer form" onClick={() => setShowForm(false)}>×</button></header>
        <div className="purchase-modal-content"><div className="purchase-form-grid">
          <label className="purchase-field purchase-field-wide">Customer or business name *<input autoFocus required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} /></label>
          <label className="purchase-field">Phone<input type="tel" value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} /></label>
          <label className="purchase-field">Email<input type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} /></label>
          <label className="purchase-field">GSTIN<input maxLength={15} value={form.gstin} onChange={event => setForm(current => ({ ...current, gstin: event.target.value.toUpperCase() }))} /></label>
          <label className="purchase-field">State<input value={form.state} onChange={event => setForm(current => ({ ...current, state: event.target.value }))} /></label>
          <label className="purchase-field">City<input value={form.city} onChange={event => setForm(current => ({ ...current, city: event.target.value }))} /></label>
          <label className="purchase-field">Pincode<input inputMode="numeric" value={form.pincode} onChange={event => setForm(current => ({ ...current, pincode: event.target.value }))} /></label>
          <label className="purchase-field">Payment terms<select value={form.creditPeriod} onChange={event => setForm(current => ({ ...current, creditPeriod: event.target.value }))}>{['Due on receipt', '7 days', '15 days', '30 days', '45 days'].map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="purchase-field purchase-field-wide">Billing address<input value={form.address} onChange={event => setForm(current => ({ ...current, address: event.target.value }))} /></label>
        </div>{error && <p className="purchase-form-error" role="alert">{error}</p>}</div>
        <footer className="purchase-modal-footer"><button type="button" className="btn-secondary-action" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary-action">{editingId ? 'Save changes' : 'Save customer'}</button></footer>
      </form></div>}
    </div>
  )
}
