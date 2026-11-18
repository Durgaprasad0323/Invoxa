import React, { useState } from 'react'

const SAMPLE_EINVOICES = [
  { id: 'ei1', irn: 'a3f8c2e1b7d94a560f1e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3', invoice: 'INV-2026-001', date: '2026-11-12', customer: 'Arjun Mehta', amount: 47200, ack: 'ACK202611121234', status: 'Active' },
  { id: 'ei2', irn: 'b4g9d3f2c8e05b671g2f3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4', invoice: 'INV-2026-002', date: '2026-11-08', customer: 'TechSoft Solutions', amount: 118000, ack: 'ACK202611085678', status: 'Cancelled' },
]

export default function EInvoicesView({ searchQuery = '' }) {
  const [einvoices] = useState(SAMPLE_EINVOICES)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState('')

  const filtered = einvoices.filter(e =>
    e.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.invoice.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const simulateGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setToast('✅ IRN generated & registered on IRP portal (demo mode)')
      setTimeout(() => setToast(''), 3500)
    }, 1800)
  }

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>E-Invoices (IRP / IRN)</h3>
          <p className="section-subtext">Generate IRN & QR code for invoices above ₹5 crore turnover. Registered on GSTN Invoice Registration Portal.</p>
        </div>
        <button className="btn-primary-action" onClick={simulateGenerate} disabled={generating}>
          {generating ? '⏳ Registering on IRP...' : '⚡ Generate IRN'}
        </button>
      </div>

      {toast && <div className="workspace-toast-pill" style={{ position: 'relative', marginBottom: 12, top: 'auto', left: 'auto', transform: 'none' }}><span>{toast}</span></div>}

      {/* Info Banner */}
      <div className="info-banner" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>ℹ️</span>
        <div>
          <strong style={{ fontSize: 13 }}>E-Invoice mandatory for turnover &gt; ₹5 Cr</strong>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#4b5563' }}>
            Invoxa auto-generates IRN (Invoice Reference Number) and embeds a QR code in every invoice PDF, fully compliant with CBIC mandate.
          </p>
        </div>
      </div>

      <div className="swipe-table-wrap">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Ack Number</th>
              <th>IRN (truncated)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td><strong>{e.invoice}</strong></td>
                <td>{e.date}</td>
                <td>{e.customer}</td>
                <td><strong>₹{e.amount.toLocaleString('en-IN')}</strong></td>
                <td><code style={{ fontSize: 11 }}>{e.ack}</code></td>
                <td><code style={{ fontSize: 10, color: '#6b7280' }}>{e.irn.slice(0, 24)}…</code></td>
                <td>
                  <span className={`status-pill ${e.status === 'Active' ? 'pill-paid' : 'pill-unpaid'}`}>
                    {e.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="row-action-btn" title="Download PDF" onClick={() => window.print()}>📄</button>
                    {e.status === 'Active' && (
                      <button className="row-action-btn danger" title="Cancel IRN">❌ Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
