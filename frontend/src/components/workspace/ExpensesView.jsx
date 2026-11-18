import React, { useState } from 'react'

const SAMPLE_EXPENSES = [
  { id: 'exp1', voucherNo: 'EXP-2026-041', category: 'Office Rent', date: '2026-11-01', amount: 35000, paidVia: 'HDFC Current A/c', note: 'November office space lease' },
  { id: 'exp2', voucherNo: 'EXP-2026-042', category: 'Electricity & Utilities', date: '2026-11-05', amount: 6420, paidVia: 'UPI', note: 'BESCOM power bill' },
  { id: 'exp3', voucherNo: 'EXP-2026-043', category: 'Staff Welfare & Tea', date: '2026-11-10', amount: 2850, paidVia: 'Cash', note: 'Pantry restocking' },
  { id: 'exp4', voucherNo: 'EXP-2026-044', category: 'Software & Cloud Tools', date: '2026-11-12', amount: 8900, paidVia: 'Corporate Card', note: 'AWS & Google Workspace' },
]

export default function ExpensesView({ searchQuery = '' }) {
  const [expenses, setExpenses] = useState(SAMPLE_EXPENSES)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ category: 'Office Rent', amount: '', paidVia: 'UPI', note: '' })

  const filtered = expenses.filter(e =>
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.voucherNo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!form.amount) return
    const newExp = {
      id: `exp_${Date.now()}`,
      voucherNo: `EXP-2026-${String(expenses.length + 45).padStart(3, '0')}`,
      category: form.category,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(form.amount),
      paidVia: form.paidVia,
      note: form.note || 'Business expense'
    }
    setExpenses(prev => [newExp, ...prev])
    setForm({ category: 'Office Rent', amount: '', paidVia: 'UPI', note: '' })
    setShowModal(false)
  }

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Expenses+</h3>
          <p className="section-subtext">Track day-to-day overheads, utility bills, rent, and operational costs for clean P&amp;L accounting.</p>
        </div>
        <button className="btn-primary-action" onClick={() => setShowModal(true)}>+ Add Expense</button>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Total Expenses Logged</span>
          <span className="metric-value">₹{totalExpense.toLocaleString('en-IN')}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Vouchers Recorded</span>
          <span className="metric-value">{expenses.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Highest Category</span>
          <span className="metric-value" style={{ fontSize: '1.1rem' }}>Office Rent</span>
        </div>
      </div>

      <div className="swipe-table-wrap">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>Voucher #</th>
              <th>Date</th>
              <th>Expense Category</th>
              <th>Notes / Purpose</th>
              <th>Paid Via</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="empty-row">No expenses found.</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id}>
                <td><strong>{e.voucherNo}</strong></td>
                <td>{e.date}</td>
                <td><span className="badge-pill template-pill">{e.category}</span></td>
                <td>{e.note}</td>
                <td><span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{e.paidVia}</span></td>
                <td><strong>₹{e.amount.toLocaleString('en-IN')}</strong></td>
                <td>
                  <div className="row-actions">
                    <button className="row-action-btn danger" title="Delete" onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record New Expense</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Category *</label>
                <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option>Office Rent</option>
                  <option>Electricity & Utilities</option>
                  <option>Staff Welfare & Tea</option>
                  <option>Software & Cloud Tools</option>
                  <option>Logistics & Delivery</option>
                  <option>Marketing & Ads</option>
                  <option>Legal & Professional</option>
                  <option>Travel & Conveyance</option>
                </select>
              </div>
              <div className="form-row">
                <label>Amount (₹) *</label>
                <input className="form-input" type="number" placeholder="e.g. 4500"
                  value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Payment Method</label>
                <select className="form-input" value={form.paidVia} onChange={e => setForm(p => ({ ...p, paidVia: e.target.value }))}>
                  <option>UPI</option>
                  <option>Bank Transfer / NEFT</option>
                  <option>Corporate Card</option>
                  <option>Cash</option>
                </select>
              </div>
              <div className="form-row">
                <label>Description / Note</label>
                <input className="form-input" placeholder="e.g. Monthly internet connection recharge"
                  value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-action" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-action" onClick={handleAdd}>Save Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
