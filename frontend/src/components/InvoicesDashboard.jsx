import React, { useState } from 'react'
import { calculateInvoiceTotals, formatINR } from '../utils/calculations'

export default function InvoicesDashboard({
  invoices,
  onEditInvoice,
  onNewInvoice,
  onDeleteInvoice,
  onToggleStatus,
  onPrintInvoice
}) {
  const [filter, setFilter] = useState('all') // 'all', 'paid', 'unpaid'
  const [search, setSearch] = useState('')

  // Compute metrics
  let totalRevenue = 0
  let paidRevenue = 0
  let unpaidRevenue = 0

  invoices.forEach(inv => {
    const totals = calculateInvoiceTotals(inv)
    totalRevenue += totals.grandTotal
    if (inv.status?.toLowerCase() === 'paid') {
      paidRevenue += totals.grandTotal
    } else {
      unpaidRevenue += totals.grandTotal
    }
  })

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'paid' && inv.status?.toLowerCase() === 'paid') ||
      (filter === 'unpaid' && inv.status?.toLowerCase() !== 'paid')

    const term = search.toLowerCase()
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.client?.name?.toLowerCase().includes(term) ||
      inv.client?.city?.toLowerCase().includes(term)

    return matchesFilter && matchesSearch
  })

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Header */}
      <div className="dashboard-header-flex">
        <div>
          <h2>Billing & Invoices Dashboard</h2>
          <p>Monitor payments, track customer billings, and generate GST invoices.</p>
        </div>
        <button className="signup-btn" onClick={() => onNewInvoice && onNewInvoice()}>
          + Create New Invoice ↗
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon emerald">▤</div>
          <div>
            <span className="stat-label">Total Invoices</span>
            <strong className="stat-value">{invoices.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">₹</div>
          <div>
            <span className="stat-label">Total Billed</span>
            <strong className="stat-value">{formatINR(totalRevenue)}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div>
            <span className="stat-label">Paid Revenue</span>
            <strong className="stat-value">{formatINR(paidRevenue)}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">◷</div>
          <div>
            <span className="stat-label">Pending / Unpaid</span>
            <strong className="stat-value">{formatINR(unpaidRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filter Tabs */}
      <div className="dashboard-controls-card">
        <div className="filter-tabs">
          <button
            className={`filter-tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            className={`filter-tab-btn ${filter === 'paid' ? 'active' : ''}`}
            onClick={() => setFilter('paid')}
          >
            Paid ({invoices.filter(i => i.status?.toLowerCase() === 'paid').length})
          </button>
          <button
            className={`filter-tab-btn ${filter === 'unpaid' ? 'active' : ''}`}
            onClick={() => setFilter('unpaid')}
          >
            Unpaid / Due ({invoices.filter(i => i.status?.toLowerCase() !== 'paid').length})
          </button>
        </div>

        <div className="search-wrap">
          <input
            type="text"
            placeholder="Search by client or invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="invoices-table-card">
        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📄</span>
            <h3>No invoices found</h3>
            <p>Create your first invoice using the AI generator or adjust your search.</p>
            <button className="primary-btn" style={{ marginTop: '16px' }} onClick={() => onNewInvoice && onNewInvoice()}>
              Create Invoice with AI
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client Name</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const totals = calculateInvoiceTotals(inv)
                  const isPaid = inv.status?.toLowerCase() === 'paid'

                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong className="inv-num-link" onClick={() => onEditInvoice(inv)}>
                          {inv.invoiceNumber}
                        </strong>
                      </td>
                      <td>
                        <strong>{inv.client?.name || 'N/A'}</strong>
                        <small className="client-sub">{inv.client?.city || ''}</small>
                      </td>
                      <td>{inv.invoiceDate}</td>
                      <td>{inv.dueDate}</td>
                      <td>
                        <strong>{formatINR(totals.grandTotal)}</strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`badge-status-btn ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}
                          onClick={() => onToggleStatus(inv.id)}
                          title="Click to toggle Paid/Unpaid"
                        >
                          {isPaid ? '✓ Paid' : '● Unpaid'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-actions">
                          <button
                            className="action-btn edit"
                            onClick={() => onEditInvoice(inv)}
                            title="Edit & View"
                          >
                            ✎ Edit
                          </button>
                          <button
                            className="action-btn print"
                            onClick={() => onPrintInvoice(inv)}
                            title="Print / PDF"
                          >
                            🖨 Print
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => onDeleteInvoice(inv.id)}
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
