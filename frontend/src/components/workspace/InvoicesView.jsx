import React, { useState } from 'react'
import { calculateInvoiceTotals, formatINR } from '../../utils/calculations'
import { invoxaInvoiceToEngineTemplate, renderA4 } from '../../utils/engineRenderer'
import { addFreeInvoiceWatermark } from '../../utils/invoiceWatermark'
import { loadHtml2Pdf } from '../../utils/pdfGenerator'
import { sanitizeInvoiceHtml } from '../../utils/sanitizeInvoiceHtml'
import Icon from '../ui/Icon'
import '../../templateEngine.css'

export default function InvoicesView({
  invoices,
  onNewInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onToggleStatus,
  onPrintInvoice,
  searchQuery = '',
  isPro = false
}) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [downloadingPdfId, setDownloadingPdfId] = useState(null)

  // Direct clean PDF download matching exact saved invoice
  const handleDownloadPdf = async (inv) => {
    setDownloadingPdfId(inv.id)
    const element = document.createElement('div')
    element.className = 'inv'
    element.style.width = inv.layout === 'thermal' ? '300px' : inv.layout === 'phone' ? '390px' : '794px'
    element.style.margin = '0 auto'
    element.style.padding = '0'
    element.style.backgroundColor = '#ffffff'

    if (inv.renderedHtml) {
      element.innerHTML = sanitizeInvoiceHtml(inv.renderedHtml)
    } else {
      const engineTemplate = invoxaInvoiceToEngineTemplate(inv)
      element.innerHTML = sanitizeInvoiceHtml(renderA4(engineTemplate, {
        l: inv.layout || 'band',
        out: 'a4',
        paper: inv.paperTexture || 'white',
        stamp: inv.stampActive || 'brand',
        status: inv.status?.toLowerCase() === 'paid' ? 'paid' : 'sent',
        seal: true
      }))
    }

    if (!isPro) addFreeInvoiceWatermark(element)

    try {
      const html2pdf = await loadHtml2Pdf()
      document.body.appendChild(element)
      await html2pdf().set({
        margin: 0,
        filename: `${(inv.seller?.name || 'Invoice').replace(/\s+/g, '_')}_${inv.invoiceNumber || 'INV'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: inv.layout === 'thermal'
          ? { unit: 'px', format: [300, 1100] }
          : inv.layout === 'phone'
          ? { unit: 'px', format: [390, 1100] }
          : { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(element).save()
    } catch (err) {
      console.warn('Invoice PDF download failed, falling back to print:', err)
      onPrintInvoice?.(inv)
    } finally {
      element.remove()
      setDownloadingPdfId(null)
    }
  }

  // Calculate high-level financial metrics
  const totals = invoices.reduce(
    (acc, inv) => {
      const { grandTotal } = calculateInvoiceTotals(inv)
      const creditApplied = Math.min(grandTotal, Math.max(0, Number(inv.customerCreditApplied) || 0))
      const balanceDue = Math.max(0, grandTotal - creditApplied)
      acc.totalSales += grandTotal
      if (inv.status === 'Paid') {
        acc.paidAmount += balanceDue
        acc.paidCount += 1
      } else {
        acc.unpaidAmount += balanceDue
        acc.unpaidCount += 1
      }
      return acc
    },
    { totalSales: 0, paidAmount: 0, unpaidAmount: 0, paidCount: 0, unpaidCount: 0 }
  )

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === 'all' ||
      inv.status.toLowerCase() === statusFilter.toLowerCase()

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.client?.name.toLowerCase().includes(q) ||
      inv.client?.city?.toLowerCase().includes(q)

    return matchesStatus && matchesSearch
  })

  const handleWhatsAppShare = (inv) => {
    const { grandTotal } = calculateInvoiceTotals(inv)
    const balanceDue = Math.max(0, grandTotal - (Number(inv.customerCreditApplied) || 0))
    const clientName = inv.client?.name || 'Customer'
    const sellerName = inv.seller?.name || 'Krishna Enterprises'
    const invoiceNo = inv.invoiceNumber
    const upiId = inv.paymentDetails?.upiId || inv.seller?.upiId || ''

    const message = `Dear ${clientName},\n\nHere is your Tax Invoice ${invoiceNo} for ${formatINR(grandTotal)} from ${sellerName}.${balanceDue < grandTotal ? `\nCustomer credit applied: ${formatINR(grandTotal - balanceDue)}\nBalance due: ${formatINR(balanceDue)}` : ''}\n\nDue Date: ${inv.dueDate}\nStatus: ${inv.status.toUpperCase()}\n\n${upiId ? `Pay instantly via UPI: ${upiId} · Amount: ${formatINR(balanceDue)}\n\n` : ''}Thank you for your business!`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="workspace-view-container">
      {/* Financial Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL SALES</span>
            <span className="metric-icon"><Icon name="wallet" /></span>
          </div>
          <div className="metric-value">{formatINR(totals.totalSales)}</div>
          <span className="metric-sub">{invoices.length} invoices generated</span>
        </div>

        <div className="metric-card paid-metric">
          <div className="metric-header">
            <span className="metric-title">COLLECTED (PAID)</span>
            <span className="metric-icon"><Icon name="checkCircle" /></span>
          </div>
          <div className="metric-value">{formatINR(totals.paidAmount)}</div>
          <span className="metric-sub">{totals.paidCount} payments received</span>
        </div>

        <div className="metric-card pending-metric">
          <div className="metric-header">
            <span className="metric-title">PENDING COLLECTION</span>
            <span className="metric-icon"><Icon name="clock" /></span>
          </div>
          <div className="metric-value">{formatINR(totals.unpaidAmount)}</div>
          <span className="metric-sub">{totals.unpaidCount} unpaid invoices</span>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="table-controls-bar">
        <div className="tab-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'unpaid' ? 'active' : ''}`}
            onClick={() => setStatusFilter('unpaid')}
          >
            Unpaid ({totals.unpaidCount})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'paid' ? 'active' : ''}`}
            onClick={() => setStatusFilter('paid')}
          >
            Paid ({totals.paidCount})
          </button>
        </div>

        <button className="primary-create-btn" onClick={() => onNewInvoice && onNewInvoice()}>
          + Create New Invoice
        </button>
      </div>

      {/* Invoices List / Empty State */}
      {filteredInvoices.length === 0 ? (
        <div className="swipe-empty-state">
          <div className="empty-illustration"><Icon name="fileText" size={28} /></div>
          <h3>Creating invoices lightning fast.</h3>
          <p>Create GST invoices in 10 seconds, share them on WhatsApp, and track payments.</p>
          <button className="swipe-cta-btn" onClick={() => onNewInvoice && onNewInvoice()}>
            + Create your first invoice
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card View (visible on <= 768px) */}
          <div className="mobile-invoice-cards">
            {filteredInvoices.map((inv) => {
              const { grandTotal, totalTax, isInterState } = calculateInvoiceTotals(inv)
              const creditApplied = Math.min(grandTotal, Math.max(0, Number(inv.customerCreditApplied) || 0))
              const balanceDue = Math.max(0, grandTotal - creditApplied)
              const isPaid = inv.status === 'Paid'

              return (
                <div key={`m_${inv.id}`} className="mobile-inv-card">
                  <div className="mic-header">
                    <div className="mic-doc-info">
                      <strong className="mic-num">{inv.invoiceNumber}</strong>
                      <span className="badge-tax-type">
                        {isInterState ? 'IGST' : 'CGST+SGST'}
                      </span>
                    </div>
                    <span
                      className={`status-pill ${isPaid ? 'paid' : 'unpaid'}`}
                      onClick={() => onToggleStatus(inv.id, isPaid ? 'Unpaid' : 'Paid')}
                      title="Tap to toggle status"
                    >
                      <Icon name={isPaid ? 'checkCircle' : 'clock'} size={13} /> {isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="mic-body">
                    <div className="mic-client-col">
                      <h4 className="mic-client-name">{inv.client?.name || 'Customer'}</h4>
                      <span className="mic-client-loc">{inv.client?.city || inv.client?.state || 'Direct Client'}</span>
                    </div>
                    <div className="mic-amount-col">
                      <span className="mic-total">{formatINR(grandTotal)}</span>
                      <small className="mic-tax">Tax: {formatINR(totalTax)}</small>
                      {creditApplied > 0 && <small className="mic-tax">Credit applied: -{formatINR(creditApplied)} · Due: {formatINR(balanceDue)}</small>}
                    </div>
                  </div>

                  <div className="mic-dates-row">
                    <span> {inv.invoiceDate || 'Today'}</span>
                    <span className={!isPaid ? 'due-alert' : ''}>
                      Due: {inv.dueDate || 'Immediate'}
                    </span>
                  </div>

                  <div className="mic-actions">
                    <button
                      className="mic-btn mic-wa"
                      onClick={() => handleWhatsAppShare(inv)}
                      title="Share on WhatsApp"
                    >
                       WhatsApp
                    </button>
                    <button
                      className="mic-btn mic-pdf"
                      onClick={() => handleDownloadPdf(inv)}
                      disabled={downloadingPdfId === inv.id}
                      title="Download PDF"
                    >
                      {downloadingPdfId === inv.id ? ' PDF…' : ' PDF'}
                    </button>
                    <button
                      className="mic-btn mic-edit"
                      onClick={() => onEditInvoice(inv)}
                      title="Edit in Template Mixer"
                    >
                      <Icon name="edit" size={15} /> Edit
                    </button>
                    <button
                      type="button"
                      className="mic-btn mic-delete"
                      onClick={() => {
                        if (window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                          onDeleteInvoice(inv.id)
                        }
                      }}
                      title="Delete invoice"
                      aria-label={`Delete invoice ${inv.invoiceNumber}`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View (visible on > 768px) */}
          <div className="table-wrapper desktop-table-wrapper">
            <table className="swipe-table">
              <thead>
                <tr>
                  <th>INVOICE NUMBER</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>DUE DATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th className="actions-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const { grandTotal, totalTax, isInterState } = calculateInvoiceTotals(inv)
                  const creditApplied = Math.min(grandTotal, Math.max(0, Number(inv.customerCreditApplied) || 0))
                  const balanceDue = Math.max(0, grandTotal - creditApplied)
                  const isPaid = inv.status === 'Paid'

                  return (
                    <tr key={inv.id} className="swipe-row">
                      <td>
                        <div className="doc-num-cell">
                          <strong className="doc-num">{inv.invoiceNumber}</strong>
                          <span className="badge-tax-type">
                            {isInterState ? 'IGST' : 'CGST+SGST'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="cust-name">{inv.client?.name}</span>
                          <small className="cust-city">{inv.client?.city || inv.client?.state}</small>
                        </div>
                      </td>
                      <td>{inv.invoiceDate}</td>
                      <td>
                        <span className={!isPaid ? 'due-alert' : ''}>{inv.dueDate}</span>
                      </td>
                      <td>
                        <div className="amount-cell">
                          <strong>{formatINR(grandTotal)}</strong>
                          <small>Tax: {formatINR(totalTax)}</small>
                          {creditApplied > 0 && <small>Credit: -{formatINR(creditApplied)} · Due: {formatINR(balanceDue)}</small>}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${isPaid ? 'paid' : 'unpaid'}`}
                          onClick={() => onToggleStatus(inv.id, isPaid ? 'Unpaid' : 'Paid')}
                          title="Click to toggle status"
                        >
                          <Icon name={isPaid ? 'checkCircle' : 'clock'} size={13} /> {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="action-icon-btn wa-btn"
                            onClick={() => handleWhatsAppShare(inv)}
                            title="Share on WhatsApp"
                          >
                             WhatsApp
                          </button>

                          <button
                            className="action-icon-btn pdf-btn"
                            onClick={() => handleDownloadPdf(inv)}
                            disabled={downloadingPdfId === inv.id}
                            title="Download PDF"
                          >
                            {downloadingPdfId === inv.id ? ' PDF…' : ' PDF'}
                          </button>

                          <button
                            className="action-icon-btn edit-btn"
                            onClick={() => onEditInvoice(inv)}
                            title="Edit Invoice"
                          >
                            Edit
                          </button>

                          <button
                            className="action-icon-btn delete-btn"
                            onClick={() => {
                              if (window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                                onDeleteInvoice(inv.id)
                              }
                            }}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
