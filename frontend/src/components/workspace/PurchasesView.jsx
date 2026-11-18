import React, { useState } from 'react'

const SAMPLE_PURCHASES = [
  { id: 'pur1', billNo: 'PB-2026-089', vendor: 'Ambuja Cements Ltd', date: '2026-11-10', total: 64800, gstPaid: 9884, status: 'Paid', paymentMode: 'NEFT' },
  { id: 'pur2', billNo: 'PB-2026-090', vendor: 'Surat Textile Hub', date: '2026-11-12', total: 32500, gstPaid: 1548, status: 'Unpaid', paymentMode: 'Credit (30 days)' },
  { id: 'pur3', billNo: 'PB-2026-091', vendor: 'Apex Office Supplies', date: '2026-11-14', total: 8400, gstPaid: 1281, status: 'Paid', paymentMode: 'UPI' },
]

export default function PurchasesView({ searchQuery = '' }) {
  const [purchases, setPurchases] = useState(SAMPLE_PURCHASES)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ billNo: '', vendor: '', total: '', gstPaid: '', paymentMode: 'Bank Transfer' })

  const filtered = purchases.filter(p =>
    p.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.billNo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!form.vendor || !form.total) return
    const newPur = {
      id: `pur_${Date.now()}`,
      billNo: form.billNo || `PB-2026-${String(purchases.length + 92).padStart(3, '0')}`,
      vendor: form.vendor,
      date: new Date().toISOString().split('T')[0],
      total: parseFloat(form.total),
      gstPaid: form.gstPaid ? parseFloat(form.gstPaid) : Math.round(parseFloat(form.total) * 0.18 / 1.18),
      status: 'Unpaid',
      paymentMode: form.paymentMode
    }
    setPurchases(prev => [newPur, ...prev])
    setForm({ billNo: '', vendor: '', total: '', gstPaid: '', paymentMode: 'Bank Transfer' })
    setShowModal(false)
  }

  const totalPurchases = purchases.reduce((s, p) => s + p.total, 0)
  const totalITC = purchases.reduce((s, p) => s + p.gstPaid, 0)

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Purchases & Inward Supplies</h3>
          <p className="section-subtext">Record vendor bills, claim Input Tax Credit (ITC - GSTR-2B), and track payables.</p>
        </div>
        <button className="btn-primary-action" onClick={() => setShowModal(true)}>+ Record Purchase Bill</button>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Total Purchases</span>
          <span className="metric-value">₹{totalPurchases.toLocaleString('en-IN')}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Eligible Input Tax Credit (ITC)</span>
          <span className="metric-value" style={{ color: '#16a34a' }}>₹{totalITC.toLocaleString('en-IN')}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Pending Payables</span>
          <span className="metric-value" style={{ color: '#dc2626' }}>
            ₹{purchases.filter(p => p.status === 'Unpaid').reduce((s, p) => s + p.total, 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="swipe-table-wrap">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Date</th>
              <th>Vendor / Supplier</th>
              <th>Bill Total</th>
              <th>GST / ITC</th>
              <th>Payment Terms</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="empty-row">No purchases found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td><strong>{p.billNo}</strong></td>
                <td>{p.date}</td>
                <td>{p.vendor}</td>
                <td><strong>₹{p.total.toLocaleString('en-IN')}</strong></td>
                <td><span style={{ color: '#16a34a', fontWeight: 600 }}>₹{p.gstPaid.toLocaleString('en-IN')}</span></td>
                <td><span className="badge-pill template-pill">{p.paymentMode}</span></td>
                <td>
                  <span className={`status-pill ${p.status === 'Paid' ? 'pill-paid' : 'pill-unpaid'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="row-action-btn"
                      title={p.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                      onClick={() => setPurchases(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'Paid' ? 'Unpaid' : 'Paid' } : x))}
                    >
                      {p.status === 'Paid' ? '↩️' : '✅'}
                    </button>
                    <button className="row-action-btn danger" title="Delete" onClick={() => setPurchases(prev => prev.filter(x => x.id !== p.id))}>🗑️</button>
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
              <h3>Record Purchase Bill</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Vendor / Supplier Name *</label>
                <input className="form-input" placeholder="e.g. Ambuja Cements Ltd"
                  value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Vendor Bill #</label>
                <input className="form-input" placeholder="e.g. PB-2026-092"
                  value={form.billNo} onChange={e => setForm(p => ({ ...p, billNo: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Total Invoice Value (₹) *</label>
                <input className="form-input" type="number" placeholder="e.g. 50000"
                  value={form.total} onChange={e => setForm(p => ({ ...p, total: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>GST Amount / ITC (₹)</label>
                <input className="form-input" type="number" placeholder="Auto-calculated if blank"
                  value={form.gstPaid} onChange={e => setForm(p => ({ ...p, gstPaid: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Payment Terms</label>
                <select className="form-input" value={form.paymentMode} onChange={e => setForm(p => ({ ...p, paymentMode: e.target.value }))}>
                  <option>Bank Transfer / NEFT</option>
                  <option>UPI</option>
                  <option>Cheque</option>
                  <option>Credit (15 days)</option>
                  <option>Credit (30 days)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-action" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-action" onClick={handleAdd}>Save Purchase Bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
