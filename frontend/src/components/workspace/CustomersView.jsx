import React, { useState } from 'react'
import { formatINR } from '../../utils/calculations'

export default function CustomersView({
  customers,
  onAddCustomer,
  onDeleteCustomer,
  onBillCustomer,
  searchQuery = ''
}) {
  const [showModal, setShowModal] = useState(false)
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    gstin: '',
    city: '',
    state: 'Maharashtra',
    address: ''
  })

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstandingDue || 0), 0)

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.gstin && c.gstin.toLowerCase().includes(q))
    )
  })

  const handleSave = (e) => {
    e.preventDefault()
    if (!newCust.name.trim()) return
    onAddCustomer({
      ...newCust,
      id: `cust_${Date.now()}`,
      totalPurchases: 0,
      outstandingDue: 0
    })
    setNewCust({
      name: '',
      phone: '',
      email: '',
      gstin: '',
      city: '',
      state: 'Maharashtra',
      address: ''
    })
    setShowModal(false)
  }

  const handleWhatsAppReminder = (c) => {
    if (!c.outstandingDue) {
      alert(`${c.name} has no outstanding balance. All payments clear!`)
      return
    }
    const msg = `Dear ${c.name},\n\nThis is a polite reminder regarding your pending balance of ${formatINR(c.outstandingDue)} with Krishna Enterprises.\n\nPlease clear the dues at your earliest convenience via UPI or NEFT.\n\nThank you!`
    const url = `https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  return (
    <div className="workspace-view-container">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL CUSTOMERS</span>
            <span className="metric-icon">👥</span>
          </div>
          <div className="metric-value">{customers.length} Clients</div>
          <span className="metric-sub">Active client database</span>
        </div>

        <div className="metric-card pending-metric">
          <div className="metric-header">
            <span className="metric-title">TOTAL RECEIVABLES</span>
            <span className="metric-icon">⚠️</span>
          </div>
          <div className="metric-value">{formatINR(totalOutstanding)}</div>
          <span className="metric-sub">Payment pending from buyers</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="table-controls-bar">
        <h3>Customer Directory ({filteredCustomers.length})</h3>
        <button className="primary-create-btn" onClick={() => setShowModal(true)}>
          + Add New Customer
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>CUSTOMER NAME</th>
              <th>PHONE & EMAIL</th>
              <th>GSTIN</th>
              <th>LOCATION</th>
              <th>TOTAL PURCHASES</th>
              <th>OUTSTANDING</th>
              <th className="actions-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="swipe-row">
                <td>
                  <strong className="cust-title">{c.name}</strong>
                </td>
                <td>
                  <div className="contact-cell">
                    <span>{c.phone}</span>
                    <small>{c.email || '-'}</small>
                  </div>
                </td>
                <td>
                  <span className="gstin-badge">{c.gstin || 'Unregistered'}</span>
                </td>
                <td>{c.city ? `${c.city}, ${c.state}` : c.state}</td>
                <td>
                  <strong>{formatINR(c.totalPurchases || 0)}</strong>
                </td>
                <td>
                  <span className={c.outstandingDue > 0 ? 'due-alert' : 'cleared-balance'}>
                    {formatINR(c.outstandingDue || 0)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-group">
                    <button
                      className="action-icon-btn wa-btn"
                      onClick={() => handleWhatsAppReminder(c)}
                      title="Send payment reminder on WhatsApp"
                    >
                      💬 Reminder
                    </button>

                    <button
                      className="action-icon-btn bill-btn"
                      onClick={() => onBillCustomer(c)}
                      title="Create invoice for this customer"
                    >
                      + Bill
                    </button>

                    <button
                      className="action-icon-btn delete-btn"
                      onClick={() => onDeleteCustomer(c.id)}
                      title="Delete Customer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add New Customer</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Customer / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Innovations Pvt Ltd"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                />
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 00000"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="billing@acme.com"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Customer GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="27AABCI1234F1Z5"
                    value={newCust.gstin}
                    onChange={(e) => setNewCust({ ...newCust, gstin: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={newCust.state}
                    onChange={(e) => setNewCust({ ...newCust, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Billing Address</label>
                <input
                  type="text"
                  placeholder="Street, Area, Pincode"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
