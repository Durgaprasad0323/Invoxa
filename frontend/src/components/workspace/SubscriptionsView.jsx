import React, { useState } from 'react'

const SAMPLE_SUBSCRIPTIONS = [
  { id: 'sub1', subId: 'SUB-2026-001', plan: 'Monthly Retainer', customer: 'TechSoft Solutions', amount: 25000, cycle: 'Monthly', nextDate: '2026-12-01', status: 'Active' },
  { id: 'sub2', subId: 'SUB-2026-002', plan: 'Annual Maintenance', customer: 'Priya Sharma', amount: 18000, cycle: 'Annually', nextDate: '2027-01-15', status: 'Active' },
  { id: 'sub3', subId: 'SUB-2026-003', plan: 'Quarterly SLA', customer: 'Arjun Mehta', amount: 12000, cycle: 'Quarterly', nextDate: '2026-12-31', status: 'Paused' },
]

export default function SubscriptionsView({ searchQuery = '' }) {
  const [subs, setSubs] = useState(SAMPLE_SUBSCRIPTIONS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ plan: '', customer: '', amount: '', cycle: 'Monthly', nextDate: '' })

  const filtered = subs.filter(s =>
    s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!form.plan || !form.customer || !form.amount) return
    const newSub = {
      id: `sub_${Date.now()}`,
      subId: `SUB-2026-${String(subs.length + 1).padStart(3, '0')}`,
      plan: form.plan,
      customer: form.customer,
      amount: parseFloat(form.amount),
      cycle: form.cycle,
      nextDate: form.nextDate || '2026-12-01',
      status: 'Active'
    }
    setSubs(prev => [newSub, ...prev])
    setForm({ plan: '', customer: '', amount: '', cycle: 'Monthly', nextDate: '' })
    setShowModal(false)
  }

  const toggleStatus = (id) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s))
  }

  const totalMRR = subs.filter(s => s.status === 'Active').reduce((sum, s) => {
    if (s.cycle === 'Monthly') return sum + s.amount
    if (s.cycle === 'Annually') return sum + s.amount / 12
    if (s.cycle === 'Quarterly') return sum + s.amount / 3
    return sum
  }, 0)

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Subscriptions</h3>
          <p className="section-subtext">Manage recurring billing plans — auto-generate invoices on each cycle.</p>
        </div>
        <button className="btn-primary-action" onClick={() => setShowModal(true)}>+ New Subscription</button>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Active Subscriptions</span>
          <span className="metric-value">{subs.filter(s => s.status === 'Active').length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Monthly Recurring Revenue</span>
          <span className="metric-value">₹{Math.round(totalMRR).toLocaleString('en-IN')}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Paused</span>
          <span className="metric-value">{subs.filter(s => s.status === 'Paused').length}</span>
        </div>
      </div>

      <div className="swipe-table-wrap">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plan</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Cycle</th>
              <th>Next Invoice</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="empty-row">No subscriptions found.</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td><strong>{s.subId}</strong></td>
                <td>{s.plan}</td>
                <td>{s.customer}</td>
                <td><strong>₹{s.amount.toLocaleString('en-IN')}</strong></td>
                <td><span className="badge-pill template-pill">{s.cycle}</span></td>
                <td>{s.nextDate}</td>
                <td>
                  <span className={`status-pill ${s.status === 'Active' ? 'pill-paid' : 'pill-draft'}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="row-action-btn" title={s.status === 'Active' ? 'Pause' : 'Activate'} onClick={() => toggleStatus(s.id)}>
                      {s.status === 'Active' ? '⏸️' : '▶️'}
                    </button>
                    <button className="row-action-btn" title="WhatsApp reminder"
                      onClick={() => window.open(`https://wa.me/?text=Hi+${s.customer},+your+subscription+${s.plan}+of+₹${s.amount}+renews+on+${s.nextDate}.`, '_blank')}>
                      💬
                    </button>
                    <button className="row-action-btn danger" title="Cancel" onClick={() => setSubs(p => p.filter(x => x.id !== s.id))}>🗑️</button>
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
              <h3>New Subscription Plan</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Plan Name *</label>
                <input className="form-input" placeholder="e.g. Monthly Retainer"
                  value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Customer *</label>
                <input className="form-input" placeholder="e.g. TechSoft Solutions"
                  value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Amount per Cycle (₹) *</label>
                <input className="form-input" type="number" placeholder="e.g. 25000"
                  value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Billing Cycle</label>
                <select className="form-input" value={form.cycle} onChange={e => setForm(p => ({ ...p, cycle: e.target.value }))}>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Annually</option>
                </select>
              </div>
              <div className="form-row">
                <label>First Invoice Date</label>
                <input className="form-input" type="date"
                  value={form.nextDate} onChange={e => setForm(p => ({ ...p, nextDate: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-action" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-action" onClick={handleAdd}>Create Subscription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
