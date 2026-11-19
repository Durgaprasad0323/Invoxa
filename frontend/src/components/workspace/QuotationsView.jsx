import React, { useState } from 'react'
import { calculateInvoiceTotals, formatINR } from '../../utils/calculations'
import Icon from '../ui/Icon'

export default function QuotationsView({
  quotations,
  onNewQuotation,
  onEditQuotation,
  onDeleteQuotation,
  onConvertQuoteToInvoice,
  onPrintQuotation,
  searchQuery = ''
}) {
  const [filter, setFilter] = useState('all')

  const totals = quotations.reduce(
    (acc, q) => {
      const { grandTotal } = calculateInvoiceTotals(q)
      acc.totalValue += grandTotal
      if (q.status === 'Converted') {
        acc.convertedCount += 1
      } else {
        acc.openValue += grandTotal
        acc.openCount += 1
      }
      return acc
    },
    { totalValue: 0, openValue: 0, openCount: 0, convertedCount: 0 }
  )

  const filteredQuotes = quotations.filter((q) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'open' && q.status !== 'Converted') ||
      (filter === 'converted' && q.status === 'Converted')

    const search = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !search ||
      q.quoteNumber.toLowerCase().includes(search) ||
      q.client?.name.toLowerCase().includes(search)

    return matchesFilter && matchesSearch
  })

  const handleWhatsAppQuote = (q) => {
    const { grandTotal } = calculateInvoiceTotals(q)
    const clientName = q.client?.name || 'Customer'
    const sellerName = q.seller?.name || 'Krishna Enterprises'
    const quoteNo = q.quoteNumber
    const documentTypeLabel = q.docType === 'estimate' ? 'Estimate' : 'Quotation'

    const message = `Dear ${clientName},\n\nThank you for your interest! Here is ${documentTypeLabel} ${quoteNo} for ${formatINR(grandTotal)} from ${sellerName}.\n\nValid Until: ${q.validUntil}\nStatus: ${q.status || 'Draft'}\n\nPlease reply to confirm or ask any questions.\n\nBest regards,\n${sellerName}`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="workspace-view-container">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL QUOTATIONS</span>
            <span className="metric-icon"><Icon name="fileText" /></span>
          </div>
          <div className="metric-value">{formatINR(totals.totalValue)}</div>
          <span className="metric-sub">{quotations.length} quotes & estimates</span>
        </div>

        <div className="metric-card pending-metric">
          <div className="metric-header">
            <span className="metric-title">OPEN PIPELINE</span>
            <span className="metric-icon"><Icon name="clock" /></span>
          </div>
          <div className="metric-value">{formatINR(totals.openValue)}</div>
          <span className="metric-sub">{totals.openCount} quotes awaiting client deal</span>
        </div>

        <div className="metric-card paid-metric">
          <div className="metric-header">
            <span className="metric-title">CONVERTED TO INVOICE</span>
            <span className="metric-icon"><Icon name="checkCircle" /></span>
          </div>
          <div className="metric-value">{totals.convertedCount} Deals</div>
          <span className="metric-sub">Closed & converted to Tax Bills</span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="table-controls-bar">
        <div className="tab-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Quotes ({quotations.length})
          </button>
          <button
            className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
            onClick={() => setFilter('open')}
          >
            Active / Open ({totals.openCount})
          </button>
          <button
            className={`filter-btn ${filter === 'converted' ? 'active' : ''}`}
            onClick={() => setFilter('converted')}
          >
            Converted ({totals.convertedCount})
          </button>
        </div>

        <button className="primary-create-btn" onClick={onNewQuotation}>
          + Create New Quotation
        </button>
      </div>

      {/* Quotes Table */}
      {filteredQuotes.length === 0 ? (
        <div className="swipe-empty-state">
          <div className="empty-illustration"><Icon name="fileCheck" size={28} /></div>
          <h3>Send quotations & close deals faster.</h3>
          <p>Create professional estimates, share via WhatsApp, and convert them to invoices with 1 click.</p>
          <button className="swipe-cta-btn" onClick={onNewQuotation}>
            + Create your first quote
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card View (visible on <= 768px) */}
          <div className="mobile-invoice-cards">
            {filteredQuotes.map((q) => {
              const { grandTotal, totalTax } = calculateInvoiceTotals(q)
              const isConverted = q.status === 'Converted'

              return (
                <div key={`mq_${q.id}`} className="mobile-inv-card">
                  <div className="mic-header">
                    <div className="mic-doc-info">
                      <strong className="mic-num quote-num">{q.quoteNumber}</strong>
                      <span className="badge-type-pill">{q.docType === 'estimate' ? 'Estimate' : 'Quotation'}</span>
                    </div>
                    <span className={`status-pill ${isConverted ? 'converted' : 'draft'}`}>
                      <Icon name={isConverted ? 'fileCheck' : 'clock'} size={13} /> {isConverted ? 'Converted' : 'Sent'}
                    </span>
                  </div>

                  <div className="mic-body">
                    <div className="mic-client-col">
                      <h4 className="mic-client-name">{q.client?.name || 'Customer'}</h4>
                      <span className="mic-client-loc">{q.client?.city || q.client?.state || 'Direct Client'}</span>
                    </div>
                    <div className="mic-amount-col">
                      <span className="mic-total">{formatINR(grandTotal)}</span>
                      <small className="mic-tax">Tax: {formatINR(totalTax)}</small>
                    </div>
                  </div>

                  <div className="mic-dates-row">
                    <span> {q.quoteDate}</span>
                    <span className="valid-until-cell">Valid: {q.validUntil}</span>
                  </div>

                  <div className="mic-actions">
                    {!isConverted ? (
                      <button
                        className="mic-btn mic-convert"
                        onClick={() => onConvertQuoteToInvoice(q)}
                        title="Convert to Tax Invoice"
                      >
                         Convert
                      </button>
                    ) : (
                      <span className="converted-label"><Icon name="checkCircle" size={13} /> Invoiced</span>
                    )}

                    <button
                      className="mic-btn mic-wa"
                      onClick={() => handleWhatsAppQuote(q)}
                      title="Share Quote on WhatsApp"
                    >
                       WA
                    </button>

                    <button
                      className="mic-btn mic-pdf"
                      onClick={() => onPrintQuotation(q)}
                      title="Download PDF"
                    >
                       PDF
                    </button>

                    <button
                      className="mic-btn mic-edit"
                      onClick={() => onEditQuotation(q)}
                      title="Edit Quote"
                    >
                       Edit
                    </button>

                    <button
                      className="mic-btn mic-delete"
                      onClick={() => {
                        if (window.confirm(`Delete quote ${q.quoteNumber}?`)) {
                          onDeleteQuotation(q.id)
                        }
                      }}
                      title="Delete"
                    >
                      Delete
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
                  <th>QUOTE NUMBER</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>VALID UNTIL</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th className="actions-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q) => {
                  const { grandTotal, totalTax } = calculateInvoiceTotals(q)
                  const isConverted = q.status === 'Converted'

                  return (
                    <tr key={q.id} className="swipe-row">
                      <td>
                        <div className="doc-num-cell">
                          <strong className="doc-num quote-num">{q.quoteNumber}</strong>
                          <span className="badge-type-pill">{q.docType === 'estimate' ? 'Estimate' : 'Quotation'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="cust-name">{q.client?.name}</span>
                          <small className="cust-city">{q.client?.city || q.client?.state}</small>
                        </div>
                      </td>
                      <td>{q.quoteDate}</td>
                      <td>
                        <span className="valid-until-cell">{q.validUntil}</span>
                      </td>
                      <td>
                        <div className="amount-cell">
                          <strong>{formatINR(grandTotal)}</strong>
                          <small>Tax: {formatINR(totalTax)}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${isConverted ? 'converted' : 'draft'}`}>
                          <Icon name={isConverted ? 'fileCheck' : 'clock'} size={13} /> {isConverted ? 'Converted' : 'Sent'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          {!isConverted ? (
                            <button
                              className="action-convert-btn"
                              onClick={() => onConvertQuoteToInvoice(q)}
                              title="Convert this quote directly into an official GST Tax Invoice"
                            >
                               Convert to Invoice
                            </button>
                          ) : (
                            <span className="converted-label"><Icon name="checkCircle" size={13} /> Invoiced</span>
                          )}

                          <button
                            className="action-icon-btn wa-btn"
                            onClick={() => handleWhatsAppQuote(q)}
                            title="Share Quote on WhatsApp"
                          >
                             WA
                          </button>

                          <button
                            className="action-icon-btn pdf-btn"
                            onClick={() => onPrintQuotation(q)}
                            title="Download Quote PDF"
                          >
                             PDF
                          </button>

                          <button
                            className="action-icon-btn edit-btn"
                            onClick={() => onEditQuotation(q)}
                            title="Edit Quote"
                          >
                            Edit
                          </button>

                          <button
                            className="action-icon-btn delete-btn"
                            onClick={() => {
                              if (window.confirm(`Delete quote ${q.quoteNumber}?`)) {
                                onDeleteQuotation(q.id)
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
