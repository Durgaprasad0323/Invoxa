import React, { useState } from 'react'

const SAMPLE_CREDIT_NOTES = [
  { id: 'cn1', cnNumber: 'CN-2026-001', date: '2026-11-10', customer: 'Arjun Mehta', against: 'INV-2026-001', reason: 'Damaged goods returned', amount: 4720, status: 'Issued' },
  { id: 'cn2', cnNumber: 'CN-2026-002', date: '2026-11-08', customer: 'Priya Sharma', against: 'INV-2026-002', reason: 'Service not rendered', amount: 11800, status: 'Adjusted' },
]

export default function CreditNotesView({ searchQuery = '' }) {
  const [notes, setNotes] = useState(SAMPLE_CREDIT_NOTES)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ customer: '', against: '', reason: '', amount: '' })

  const filtered = notes.filter(n =>
    n.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.cnNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!form.customer || !form.amount) return
    const newCN = {
      id: `cn_${Date.now()}`,
      cnNumber: `CN-2026-${String(notes.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customer: form.customer,
      against: form.against || '—',
      reason: form.reason || 'Adjustment',
      amount: parseFloat(form.amount),
      status: 'Issued'
    }
    setNotes(prev => [newCN, ...prev])
    setForm({ customer: '', against: '', reason: '', amount: '' })
    setShowModal(false)
  }

  const totalAmount = notes.reduce((s, n) => s + n.amount, 0)

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Credit Notes</h3>
          <p className="section-subtext">Issue refunds or adjust billing errors with GST-compliant credit notes.</p>
        </div>
        <button className="btn-primary-action" onClick={() => setShowModal(true)}>+ New Credit Note</button>
      </div>

      {/* Metrics */}
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Total Credit Notes</span>
          <span className="metric-value">{notes.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Amount Credited</span>
          <span className="metric-value">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Adjusted</span>
          <span className="metric-value">{notes.filter(n => n.status === 'Adjusted').length}</span>
        </div>
      </div>

      <div className="swipe-table-wrap">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>CN Number</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Against Invoice</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="empty-row">No credit notes found.</td></tr>
            ) : filtered.map(n => (
              <tr key={n.id}>
                <td><strong>{n.cnNumber}</strong></td>
                <td>{n.date}</td>
                <td>{n.customer}</td>
                <td><span className="text-link">{n.against}</span></td>
                <td>{n.reason}</td>
                <td><strong>₹{n.amount.toLocaleString('en-IN')}</strong></td>
                <td>
                  <span className={`status-pill ${n.status === 'Issued' ? 'pill-unpaid' : 'pill-paid'}`}>
                    {n.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="row-action-btn" title="WhatsApp"
                      onClick={() => window.open(`https://wa.me/?text=Credit+Note+${n.cnNumber}+of+₹${n.amount}+has+been+issued+against+${n.against}.`, '_blank')}>
                      💬
                    </button>
                    <button className="row-action-btn" title="Print" onClick={() => window.print()}>🖨️</button>
                    <button className="row-action-btn danger" title="Delete" onClick={() => setNotes(p => p.filter(x => x.id !== n.id))}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Credit Note</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Customer Name *</label>
                <input className="form-input" placeholder="e.g. Arjun Mehta"
                  value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Against Invoice #</label>
                <input className="form-input" placeholder="e.g. INV-2026-001"
                  value={form.against} onChange={e => setForm(p => ({ ...p, against: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Reason for Credit</label>
                <input className="form-input" placeholder="e.g. Goods returned, billing error"
                  value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Credit Amount (₹) *</label>
                <input className="form-input" type="number" placeholder="e.g. 5000"
                  value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-action" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-action" onClick={handleAdd}>Issue Credit Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
