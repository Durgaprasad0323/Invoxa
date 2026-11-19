import React, { useMemo, useState } from 'react'
import { calculateInvoiceTotals, formatINR } from '../../utils/calculations'
import Icon from '../ui/Icon'

const gstinIsValid = value => /^[0-9A-Z]{15}$/.test(String(value || '').trim().toUpperCase())
const money = value => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
const formatDate = value => {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}
const toIrpDate = value => {
  const [year, month, day] = String(value || '').split('-')
  return year && month && day ? `${day}/${month}/${year}` : ''
}
const escapeName = value => String(value || 'invoice').replace(/[^a-z0-9_-]+/gi, '_')

const resolveParty = (primary = {}, fallback = {}) => {
  const fields = ['name', 'tradeName', 'gstin', 'address', 'city', 'state', 'pincode', 'phone', 'email']
  const party = Object.fromEntries(fields.map(field => [field, primary[field] || fallback[field] || '']))
  if (!party.state && gstinIsValid(party.gstin)) party.state = party.gstin.slice(0, 2)
  return party
}

const findExistingEInvoice = invoice => invoice.eInvoice || invoice.einvoice || invoice.eInvoiceDetails || null

const getInvoiceReadiness = (invoice, businessProfile, customers) => {
  const relatedCustomer = customers.find(customer => (
    String(customer.name || '').trim().toLowerCase() === String(invoice.client?.name || '').trim().toLowerCase()
  ))
  const seller = resolveParty(invoice.seller, businessProfile)
  const buyer = resolveParty(invoice.client, relatedCustomer)
  const issues = []

  if (!invoice.invoiceNumber) issues.push('Invoice number is required.')
  if (!invoice.invoiceDate) issues.push('Invoice date is required.')
  if (!seller.name) issues.push('Seller business name is missing.')
  if (!gstinIsValid(seller.gstin)) issues.push('Seller GSTIN must be a valid 15-character GSTIN.')
  if (!seller.address) issues.push('Seller address is missing.')
  if (!seller.city) issues.push('Seller city or location is missing.')
  if (!/^\d{6}$/.test(String(seller.pincode || ''))) issues.push('Seller PIN code must contain 6 digits.')
  if (!buyer.name) issues.push('Buyer name is missing.')
  if (!gstinIsValid(buyer.gstin)) issues.push('Buyer GSTIN must be a valid 15-character GSTIN for a B2B e-invoice.')
  if (!buyer.address) issues.push('Buyer address is missing.')
  if (!buyer.city) issues.push('Buyer city or location is missing.')
  if (!/^\d{6}$/.test(String(buyer.pincode || ''))) issues.push('Buyer PIN code must contain 6 digits.')
  if (!invoice.items?.length) issues.push('Add at least one invoice item.')
  invoice.items?.forEach((item, index) => {
    const label = item.description || `Item ${index + 1}`
    if (!/^\d{4}(?:\d{2})?(?:\d{2})?$/.test(String(item.hsnSac || '').trim())) {
      issues.push(`${label}: add a numeric HSN/SAC code (4, 6, or 8 digits).`)
    }
    if (!(Number(item.quantity) > 0)) issues.push(`${label}: quantity must be greater than zero.`)
    if (!(Number(item.rate) >= 0)) issues.push(`${label}: enter a valid rate.`)
  })

  const invoiceForTotals = { ...invoice, seller, client: buyer }
  const totals = calculateInvoiceTotals(invoiceForTotals)
  return { seller, buyer, issues, totals, existing: findExistingEInvoice(invoice) }
}

const createIrpDraft = (invoice, seller, buyer, totals) => {
  const interState = totals.isInterState
  const sellerStateCode = String(seller.gstin || '').slice(0, 2)
  const buyerStateCode = String(buyer.gstin || '').slice(0, 2)
  const itemList = (invoice.items || []).map((item, index) => {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.rate) || 0
    const taxableAmount = money(quantity * unitPrice)
    const gstRate = Number(item.taxRate) || 0
    const taxAmount = money(taxableAmount * gstRate / 100)
    return {
      SlNo: String(index + 1),
      PrdDesc: String(item.description || `Item ${index + 1}`),
      IsServc: String(item.hsnSac || '').startsWith('99') ? 'Y' : 'N',
      HsnCd: String(item.hsnSac || ''),
      Qty: quantity,
      UnitPrice: unitPrice,
      TotAmt: taxableAmount,
      Discount: 0,
      AssAmt: taxableAmount,
      GstRt: gstRate,
      CgstAmt: interState ? 0 : money(taxAmount / 2),
      SgstAmt: interState ? 0 : money(taxAmount / 2),
      IgstAmt: interState ? taxAmount : 0,
      TotItemVal: money(taxableAmount + taxAmount)
    }
  })

  return {
    Version: '1.1',
    usergstin: seller.gstin,
    TranDtls: { TaxSch: 'GST', SupTyp: 'B2B', RegRev: 'N', IgstOnIntra: 'N' },
    DocDtls: { Typ: 'INV', No: invoice.invoiceNumber, Dt: toIrpDate(invoice.invoiceDate) },
    SellerDtls: {
      Gstin: seller.gstin,
      LglNm: seller.name,
      ...(seller.tradeName ? { TrdNm: seller.tradeName } : {}),
      Addr1: seller.address,
      Loc: seller.city,
      Pin: Number(seller.pincode),
      Stcd: sellerStateCode,
      ...(seller.phone ? { Ph: String(seller.phone).replace(/\D/g, '').slice(-10) } : {}),
      ...(seller.email ? { Em: seller.email } : {})
    },
    BuyerDtls: {
      Gstin: buyer.gstin,
      LglNm: buyer.name,
      Pos: buyerStateCode,
      Addr1: buyer.address,
      Loc: buyer.city,
      Pin: Number(buyer.pincode),
      Stcd: buyerStateCode,
      ...(buyer.phone ? { Ph: String(buyer.phone).replace(/\D/g, '').slice(-10) } : {}),
      ...(buyer.email ? { Em: buyer.email } : {})
    },
    ItemList: itemList,
    ValDtls: {
      AssVal: money(totals.subtotal),
      CgstVal: money(totals.cgst),
      SgstVal: money(totals.sgst),
      IgstVal: money(totals.igst),
      Discount: money(totals.discountAmount),
      TotInvVal: money(totals.grandTotal)
    }
  }
}

export default function EInvoicesView({
  invoices = [],
  customers = [],
  businessProfile = {},
  searchQuery = '',
  onNewInvoice,
  onEditInvoice,
  onConsumeTrialCreation = async () => true
}) {
  const [filter, setFilter] = useState('all')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [message, setMessage] = useState('')
  const [draftPreview, setDraftPreview] = useState(null)
  const [copyMessage, setCopyMessage] = useState('')
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const salesInvoices = useMemo(() => invoices.filter(invoice => invoice.docType !== 'quotation' && invoice.invoiceNumber), [invoices])
  const selectedInvoice = salesInvoices.find(invoice => invoice.id === selectedInvoiceId)
  const selectedReadiness = selectedInvoice ? getInvoiceReadiness(selectedInvoice, businessProfile, customers) : null

  const rows = useMemo(() => salesInvoices.map(invoice => {
    const readiness = getInvoiceReadiness(invoice, businessProfile, customers)
    const q = searchQuery.trim().toLowerCase()
    const generated = Boolean(readiness.existing?.irn || invoice.irn)
    const matchesSearch = !q || [
      invoice.invoiceNumber,
      invoice.client?.name,
      invoice.client?.gstin,
      readiness.existing?.irn,
      readiness.existing?.ackNo || readiness.existing?.ackNumber
    ].some(value => String(value || '').toLowerCase().includes(q))
    const matchesFilter = filter === 'all' ||
      (filter === 'ready' && !generated && readiness.issues.length === 0) ||
      (filter === 'missing' && !generated && readiness.issues.length > 0) ||
      (filter === 'generated' && generated)
    return { invoice, readiness, generated, matchesSearch, matchesFilter }
  }), [salesInvoices, businessProfile, customers, searchQuery, filter])

  const counts = useMemo(() => {
    const invoiceReadiness = salesInvoices.map(invoice => ({
      generated: Boolean(findExistingEInvoice(invoice)?.irn || invoice.irn),
      issues: getInvoiceReadiness(invoice, businessProfile, customers).issues
    }))
    return {
      all: salesInvoices.length,
      generated: invoiceReadiness.filter(entry => entry.generated).length,
      ready: invoiceReadiness.filter(entry => !entry.generated && !entry.issues.length).length,
      missing: invoiceReadiness.filter(entry => !entry.generated && entry.issues.length > 0).length
    }
  }, [salesInvoices, businessProfile, customers])

  const openReview = invoiceId => {
    setSelectedInvoiceId(invoiceId)
    setShowPicker(false)
    setMessage('')
  }

  const closeReview = () => {
    setSelectedInvoiceId('')
    setMessage('')
  }

  const openDraftPreview = async () => {
    if (!selectedInvoice || !selectedReadiness || selectedReadiness.issues.length) return
    setIsCreatingDraft(true)
    const allowed = await onConsumeTrialCreation('E-Invoice draft')
    setIsCreatingDraft(false)
    if (!allowed) return
    const payload = createIrpDraft(selectedInvoice, selectedReadiness.seller, selectedReadiness.buyer, selectedReadiness.totals)
    setDraftPreview({
      fileName: `${escapeName(selectedInvoice.invoiceNumber)}_IRP_draft.json`,
      jsonText: JSON.stringify(payload, null, 2)
    })
    setCopyMessage('')
  }

  const downloadDraftFile = () => {
    if (!draftPreview) return
    const blob = new Blob([draftPreview.jsonText], { type: 'application/json' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = draftPreview.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    setMessage('JSON draft downloaded. This has not been registered, and no IRN has been issued.')
  }

  const copyDraft = async () => {
    if (!draftPreview) return
    try {
      await navigator.clipboard.writeText(draftPreview.jsonText)
      setCopyMessage('JSON copied to clipboard.')
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = draftPreview.jsonText
      textArea.setAttribute('readonly', '')
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      const copied = document.execCommand('copy')
      textArea.remove()
      setCopyMessage(copied ? 'JSON copied to clipboard.' : 'Copy is unavailable here. Select the JSON text above to copy it.')
    }
  }

  const getStatus = row => {
    if (row.generated) return { label: row.readiness.existing?.status === 'Cancelled' ? 'Cancelled' : 'IRN generated', className: 'einvoice-status-generated' }
    if (row.readiness.issues.length) return { label: 'Needs details', className: 'einvoice-status-missing' }
    return { label: 'Ready to register', className: 'einvoice-status-ready' }
  }

  return (
    <div className="workspace-view-container einvoice-page">
      <div className="table-controls-bar">
        <div>
          <h3>E-Invoices</h3>
          <p className="section-subtext">Review sales invoices and prepare their e-invoice data for registration.</p>
        </div>
        <button className="primary-create-btn" onClick={() => { setShowPicker(true); setMessage('') }} disabled={!salesInvoices.length}>+ Create E-Invoice</button>
      </div>

      <div className="einvoice-connection-banner">
        <span className="einvoice-connection-icon"><Icon name="fileCheck" size={20} /></span>
        <div>
          <strong>IRP connection not configured</strong>
          <p>Invoxa can review invoice details and download a JSON draft. Registering it with an Invoice Registration Portal and receiving a real IRN requires an IRP/API connection.</p>
        </div>
        <a href="https://einvoice6.gst.gov.in/content/api-integration/" target="_blank" rel="noreferrer">IRP setup guide</a>
      </div>

      <div className="metrics-row einvoice-metrics">
        <div className="metric-card"><span className="metric-label">Sales invoices</span><span className="metric-value">{counts.all}</span><span className="metric-sub">Available to review</span></div>
        <div className="metric-card"><span className="metric-label">Ready to register</span><span className="metric-value">{counts.ready}</span><span className="metric-sub">Required details are present</span></div>
        <div className="metric-card"><span className="metric-label">Needs details</span><span className="metric-value">{counts.missing}</span><span className="metric-sub">Review missing invoice data</span></div>
        <div className="metric-card"><span className="metric-label">IRNs generated</span><span className="metric-value">{counts.generated}</span><span className="metric-sub">Registered e-invoices</span></div>
      </div>

      <div className="einvoice-filter-row">
        <div className="tab-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({counts.all})</button>
          <button className={`filter-btn ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}>Ready ({counts.ready})</button>
          <button className={`filter-btn ${filter === 'missing' ? 'active' : ''}`} onClick={() => setFilter('missing')}>Needs details ({counts.missing})</button>
          <button className={`filter-btn ${filter === 'generated' ? 'active' : ''}`} onClick={() => setFilter('generated')}>IRN generated ({counts.generated})</button>
        </div>
      </div>

      <div className="table-wrapper einvoice-table-wrap">
        <table className="swipe-table">
          <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Customer GSTIN</th><th>Amount</th><th>IRP status</th><th className="actions-header">Actions</th></tr></thead>
          <tbody>
            {rows.filter(row => row.matchesSearch && row.matchesFilter).length === 0 ? (
              <tr><td colSpan={7} className="empty-row">{salesInvoices.length ? 'No invoices match this filter or search.' : <><span>Create a sales invoice first, then prepare its e-invoice here.</span>{onNewInvoice && <button className="einvoice-empty-create" onClick={onNewInvoice}>+ Create an invoice</button>}</>}</td></tr>
            ) : rows.filter(row => row.matchesSearch && row.matchesFilter).map(row => {
              const status = getStatus(row)
              return <tr key={row.invoice.id} className="swipe-row">
                <td><strong>{row.invoice.invoiceNumber}</strong></td>
                <td>{formatDate(row.invoice.invoiceDate)}</td>
                <td>{row.invoice.client?.name || '—'}</td>
                <td><span className={gstinIsValid(row.readiness.buyer.gstin) ? '' : 'einvoice-muted'}>{row.readiness.buyer.gstin || 'Missing'}</span></td>
                <td><strong>{formatINR(row.readiness.totals.grandTotal)}</strong></td>
                <td><span className={`einvoice-status ${status.className}`}>{status.label}</span></td>
                <td><div className="row-actions"><button className="row-action-btn" onClick={() => openReview(row.invoice.id)}>{row.generated ? 'View IRN' : 'Review / Create'}</button></div></td>
              </tr>
            })}
          </tbody>
        </table>
      </div>

      {showPicker && <div className="einvoice-modal-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setShowPicker(false) }}>
        <div className="einvoice-picker-card">
          <div className="einvoice-modal-header"><div><span className="einvoice-kicker">SALES</span><h2>Create E-Invoice</h2><p>Select a saved invoice to review its registration details.</p></div><button className="modal-close-btn" onClick={() => setShowPicker(false)} aria-label="Close">×</button></div>
          <div className="einvoice-picker-list">
            {salesInvoices.map(invoice => {
              const readiness = getInvoiceReadiness(invoice, businessProfile, customers)
              const generated = Boolean(readiness.existing?.irn || invoice.irn)
              return <button className="einvoice-picker-row" key={invoice.id} onClick={() => openReview(invoice.id)}>
                <span><strong>{invoice.invoiceNumber}</strong><small>{invoice.client?.name || 'Customer'} · {formatDate(invoice.invoiceDate)}</small></span>
                <span className="einvoice-picker-total">{formatINR(readiness.totals.grandTotal)}<small>{generated ? 'IRN generated' : readiness.issues.length ? 'Needs details' : 'Ready to register'}</small></span>
                <span className="einvoice-picker-arrow">›</span>
              </button>
            })}
          </div>
          <div className="einvoice-modal-footer"><span>Select an invoice to review before preparing it.</span><button className="btn-secondary-action" onClick={() => setShowPicker(false)}>Close</button></div>
        </div>
      </div>}

      {selectedInvoice && selectedReadiness && <div className="einvoice-modal-overlay" onMouseDown={event => { if (event.target === event.currentTarget) closeReview() }}>
        <div className="einvoice-review-card">
          <div className="einvoice-modal-header"><div><span className="einvoice-kicker">REVIEW BEFORE REGISTRATION</span><h2>{selectedInvoice.invoiceNumber}</h2><p>{selectedInvoice.client?.name || 'Customer'} · {formatDate(selectedInvoice.invoiceDate)}</p></div><button className="modal-close-btn" onClick={closeReview} aria-label="Close">×</button></div>
          <div className="einvoice-review-body">
            {message && <div className="einvoice-success-message" role="status">{message}</div>}
            {selectedReadiness.existing?.irn || selectedInvoice.irn ? <div className="einvoice-registered-banner"><strong>IRN is present on this invoice</strong><code>{selectedReadiness.existing?.irn || selectedInvoice.irn}</code><span>Acknowledgement: {selectedReadiness.existing?.ackNo || selectedReadiness.existing?.ackNumber || selectedInvoice.ackNo || '—'}</span></div> : <>
              <div className={selectedReadiness.issues.length ? 'einvoice-validation einvoice-validation-error' : 'einvoice-validation einvoice-validation-ready'}>
                <strong>{selectedReadiness.issues.length ? `Complete ${selectedReadiness.issues.length} required detail${selectedReadiness.issues.length === 1 ? '' : 's'} before preparing this invoice` : 'Required invoice details are present'}</strong>
                {selectedReadiness.issues.length > 0 && <ul>{selectedReadiness.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
              </div>
              <div className="einvoice-party-grid">
                <section><h3>Seller details</h3><strong>{selectedReadiness.seller.name || '—'}</strong><span>GSTIN: {selectedReadiness.seller.gstin || '—'}</span><span>{selectedReadiness.seller.address || 'Address missing'}</span><span>{[selectedReadiness.seller.city, selectedReadiness.seller.state, selectedReadiness.seller.pincode].filter(Boolean).join(', ') || 'Location missing'}</span><span>{selectedReadiness.seller.email || selectedReadiness.seller.phone || ''}</span></section>
                <section><h3>Buyer details</h3><strong>{selectedReadiness.buyer.name || '—'}</strong><span>GSTIN: {selectedReadiness.buyer.gstin || '—'}</span><span>{selectedReadiness.buyer.address || 'Address missing'}</span><span>{[selectedReadiness.buyer.city, selectedReadiness.buyer.state, selectedReadiness.buyer.pincode].filter(Boolean).join(', ') || 'Location missing'}</span><span>{selectedReadiness.buyer.email || selectedReadiness.buyer.phone || ''}</span></section>
              </div>
              <div className="einvoice-doc-summary"><span>Document type<strong>Tax invoice</strong></span><span>Invoice date<strong>{formatDate(selectedInvoice.invoiceDate)}</strong></span><span>Supply type<strong>B2B</strong></span><span>Place of supply<strong>{selectedReadiness.buyer.state || '—'}</strong></span></div>
              <div className="einvoice-review-table-wrap"><table className="einvoice-review-table"><thead><tr><th>Item</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>GST</th><th>Line total</th></tr></thead><tbody>
                {(selectedInvoice.items || []).map((item, index) => {
                  const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0)
                  const lineTotal = base + base * (Number(item.taxRate) || 0) / 100
                  return <tr key={item.id || index}><td>{item.description || `Item ${index + 1}`}</td><td>{item.hsnSac || '—'}</td><td>{Number(item.quantity) || 0}</td><td>{formatINR(item.rate)}</td><td>{Number(item.taxRate) || 0}%</td><td>{formatINR(lineTotal)}</td></tr>
                })}
              </tbody></table></div>
              <div className="einvoice-total-summary"><span>Subtotal<strong>{formatINR(selectedReadiness.totals.subtotal)}</strong></span><span>Discount<strong>{formatINR(selectedReadiness.totals.discountAmount)}</strong></span><span>GST<strong>{formatINR(selectedReadiness.totals.totalTax)}</strong></span><span className="einvoice-grand-total">Invoice total<strong>{formatINR(selectedReadiness.totals.grandTotal)}</strong></span></div>
              <div className="einvoice-irp-note"><strong>IRN registration is not connected in this account.</strong><p>You can download a JSON draft for review. It will not be registered, and it will not contain an IRN or signed QR code.</p></div>
            </>}
          </div>
          <div className="einvoice-modal-footer">
            <a className="einvoice-setup-link" href="https://einvoice6.gst.gov.in/content/api-integration/" target="_blank" rel="noreferrer">IRP API setup</a>
            <div><button className="btn-secondary-action" onClick={closeReview}>Close</button>
              {selectedReadiness.issues.length > 0 && onEditInvoice && <button className="btn-secondary-action" onClick={() => { const invoice = selectedInvoice; closeReview(); onEditInvoice(invoice) }}>Edit invoice details</button>}
              {!selectedReadiness.existing?.irn && !selectedInvoice.irn && <button className="btn-primary-action" onClick={openDraftPreview} disabled={selectedReadiness.issues.length > 0 || isCreatingDraft} title={selectedReadiness.issues.length ? 'Complete the required invoice details first.' : 'Preview an unregistered JSON draft.'}>{isCreatingDraft ? 'Preparing…' : 'View JSON Draft'}</button>}
            </div>
          </div>
        </div>
      </div>}

      {draftPreview && <div className="einvoice-modal-overlay einvoice-json-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setDraftPreview(null) }}>
        <div className="einvoice-json-card">
          <div className="einvoice-modal-header"><div><span className="einvoice-kicker">UNREGISTERED DRAFT</span><h2>{draftPreview.fileName}</h2><p>Preview the JSON here or download it to your device.</p></div><button className="modal-close-btn" onClick={() => setDraftPreview(null)} aria-label="Close">×</button></div>
          <div className="einvoice-json-body">
            <div className="einvoice-json-warning">This is data only. It has no IRN, acknowledgement number, or signed QR code until an IRP accepts it.</div>
            {copyMessage && <div className="einvoice-success-message" role="status">{copyMessage}</div>}
            <pre className="einvoice-json-preview">{draftPreview.jsonText}</pre>
          </div>
          <div className="einvoice-modal-footer einvoice-json-footer"><button className="btn-secondary-action" onClick={copyDraft}>Copy JSON</button><div><button className="btn-secondary-action" onClick={() => setDraftPreview(null)}>Close</button><button className="btn-primary-action" onClick={downloadDraftFile}>Download JSON</button></div></div>
        </div>
      </div>}
    </div>
  )
}
