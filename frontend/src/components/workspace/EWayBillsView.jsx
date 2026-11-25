import React, { useMemo, useState } from 'react'
import { calculateInvoiceTotals, formatINR } from '../../utils/calculations'
import Icon from '../ui/Icon'

const emptyForm = {
  number: '',
  validUntil: '',
  transportMode: 'road',
  transporterName: '',
  transporterId: '',
  vehicleNumber: '',
  distanceKm: '',
  transportDocumentNumber: '',
  transportDocumentDate: ''
}

const formatDate = value => {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}

const getEWayBill = invoice => invoice.eWayBill || invoice.ewayBill || null

export default function EWayBillsView({
  invoices = [],
  searchQuery = '',
  onNewInvoice,
  onSaveEWayBill = async () => {},
  onConsumeTrialCreation = async () => true
}) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const salesInvoices = useMemo(() => invoices.filter(invoice => (
    invoice.docType !== 'quotation' && invoice.docType !== 'estimate' && invoice.invoiceNumber
  )), [invoices])
  const query = searchQuery.trim().toLowerCase()
  const visibleInvoices = salesInvoices.filter(invoice => !query || [
    invoice.invoiceNumber,
    invoice.client?.name,
    invoice.client?.gstin,
    getEWayBill(invoice)?.number
  ].some(value => String(value || '').toLowerCase().includes(query)))
  const selectedInvoice = salesInvoices.find(invoice => invoice.id === selectedInvoiceId)
  const recordedCount = salesInvoices.filter(invoice => getEWayBill(invoice)?.number).length

  const openRecord = invoice => {
    const eWayBill = getEWayBill(invoice) || {}
    setForm({ ...emptyForm, ...eWayBill, distanceKm: eWayBill.distanceKm ?? '' })
    setSelectedInvoiceId(invoice.id)
    setMessage('')
  }

  const closeRecord = () => {
    setSelectedInvoiceId('')
    setMessage('')
  }

  const updateForm = event => setForm(previous => ({ ...previous, [event.target.name]: event.target.value }))

  const saveRecord = async event => {
    event.preventDefault()
    if (!selectedInvoice) return
    const number = String(form.number || '').trim()
    if (!/^\d{12}$/.test(number)) {
      setMessage('Enter the 12-digit E-Way Bill number issued by the GST portal or your GSP.')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const existing = getEWayBill(selectedInvoice)
      if (!existing?.number) {
        const allowed = await onConsumeTrialCreation('E-Way Bill record', `ewaybill-${selectedInvoice.id}-${number}`)
        if (!allowed) return
      }
      await onSaveEWayBill(selectedInvoice.id, {
        ...form,
        number,
        distanceKm: form.distanceKm === '' ? undefined : Number(form.distanceKm),
        recordedAt: new Date().toISOString()
      })
      closeRecord()
    } catch (error) {
      setMessage(error.message || 'E-Way Bill details could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="workspace-view-container ewaybill-page">
      <div className="table-controls-bar">
        <div>
          <h3>E-Way Bills</h3>
          <p className="section-subtext">Keep E-Way Bill numbers and transport details with the sales invoice they belong to.</p>
        </div>
      </div>

      <div className="ewaybill-connection-banner">
        <span className="ewaybill-connection-icon"><Icon name="truck" size={20} /></span>
        <div>
          <strong>Government E-Way Bill connection is not configured</strong>
          <p>Generate the official E-Way Bill through the GST portal or an authorised GSP, then record its issued number here. Saving details in Invoxa does not generate or validate an official bill.</p>
        </div>
        <a href="https://ewaybillgst.gov.in/" target="_blank" rel="noreferrer">Open GST portal</a>
      </div>

      <div className="metrics-row ewaybill-metrics">
        <div className="metric-card"><span className="metric-label">Sales invoices</span><span className="metric-value">{salesInvoices.length}</span><span className="metric-sub">Available to link</span></div>
        <div className="metric-card"><span className="metric-label">Numbers recorded</span><span className="metric-value">{recordedCount}</span><span className="metric-sub">Manually recorded from the portal</span></div>
        <div className="metric-card"><span className="metric-label">Not recorded</span><span className="metric-value">{salesInvoices.length - recordedCount}</span><span className="metric-sub">No E-Way Bill number saved</span></div>
      </div>

      <div className="table-wrapper ewaybill-table-wrap">
        <table className="swipe-table">
          <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Amount</th><th>E-Way Bill status</th><th className="actions-header">Actions</th></tr></thead>
          <tbody>
            {!visibleInvoices.length ? (
              <tr><td colSpan={6} className="empty-row">{salesInvoices.length ? 'No invoices match this search.' : <><span>Create a sales invoice first, then record its E-Way Bill details here.</span>{onNewInvoice && <button className="ewaybill-empty-create" onClick={onNewInvoice}>+ Create an invoice</button>}</>}</td></tr>
            ) : visibleInvoices.map(invoice => {
              const eWayBill = getEWayBill(invoice)
              const recorded = Boolean(eWayBill?.number)
              const totals = calculateInvoiceTotals(invoice)
              return <tr key={invoice.id} className="swipe-row">
                <td><strong>{invoice.invoiceNumber}</strong></td>
                <td>{formatDate(invoice.invoiceDate)}</td>
                <td>{invoice.client?.name || '—'}</td>
                <td><strong>{formatINR(totals.grandTotal)}</strong></td>
                <td><span className={`ewaybill-status ${recorded ? 'ewaybill-status-recorded' : 'ewaybill-status-empty'}`}>{recorded ? `No. ${eWayBill.number}` : 'Not recorded'}</span></td>
                <td><div className="row-actions"><button className="row-action-btn" onClick={() => openRecord(invoice)}>{recorded ? 'View / Edit' : 'Record details'}</button></div></td>
              </tr>
            })}
          </tbody>
        </table>
      </div>

      {selectedInvoice && <div className="ewaybill-modal-overlay" onMouseDown={event => { if (event.target === event.currentTarget) closeRecord() }}>
        <form className="ewaybill-modal-card" onSubmit={saveRecord}>
          <div className="ewaybill-modal-header">
            <div><span className="ewaybill-kicker">LINK TO SALES INVOICE</span><h2>{selectedInvoice.invoiceNumber}</h2><p>{selectedInvoice.client?.name || 'Customer'} · {formatDate(selectedInvoice.invoiceDate)}</p></div>
            <button type="button" className="modal-close-btn" onClick={closeRecord} aria-label="Close"><Icon name="x" /></button>
          </div>
          <div className="ewaybill-modal-body">
            <div className="ewaybill-warning"><strong>This records an already-issued E-Way Bill.</strong><span>Create the official bill on the GST portal or through your GSP first. Invoxa is not connected to issue it directly.</span></div>
            {message && <div className="ewaybill-form-message" role="alert">{message}</div>}
            <label className="ewaybill-field"><span>E-Way Bill number <b>*</b></span><input name="number" value={form.number} onChange={updateForm} inputMode="numeric" maxLength={12} placeholder="12-digit number from the portal" required /></label>
            <div className="ewaybill-form-grid">
              <label className="ewaybill-field"><span>Valid until</span><input type="date" name="validUntil" value={form.validUntil || ''} onChange={updateForm} /></label>
              <label className="ewaybill-field"><span>Transport mode</span><select name="transportMode" value={form.transportMode || 'road'} onChange={updateForm}><option value="road">Road</option><option value="rail">Rail</option><option value="air">Air</option><option value="ship">Ship</option><option value="other">Other</option></select></label>
              <label className="ewaybill-field"><span>Transporter name</span><input name="transporterName" value={form.transporterName || ''} onChange={updateForm} placeholder="Transport company" /></label>
              <label className="ewaybill-field"><span>Transporter ID / GSTIN</span><input name="transporterId" value={form.transporterId || ''} onChange={updateForm} placeholder="Optional" /></label>
              <label className="ewaybill-field"><span>Vehicle number</span><input name="vehicleNumber" value={form.vehicleNumber || ''} onChange={updateForm} placeholder="e.g. MH12AB1234" /></label>
              <label className="ewaybill-field"><span>Distance (km)</span><input type="number" name="distanceKm" min="0" value={form.distanceKm} onChange={updateForm} placeholder="Optional" /></label>
              <label className="ewaybill-field"><span>Transport document number</span><input name="transportDocumentNumber" value={form.transportDocumentNumber || ''} onChange={updateForm} placeholder="LR / RR / AWB number" /></label>
              <label className="ewaybill-field"><span>Transport document date</span><input type="date" name="transportDocumentDate" value={form.transportDocumentDate || ''} onChange={updateForm} /></label>
            </div>
          </div>
          <div className="ewaybill-modal-footer"><span>Details are saved against this invoice.</span><div><button type="button" className="btn-secondary-action" onClick={closeRecord}>Cancel</button><button type="submit" className="btn-primary-action" disabled={saving}>{saving ? 'Saving…' : 'Save E-Way Bill details'}</button></div></div>
        </form>
      </div>}
    </div>
  )
}
