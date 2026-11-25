import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { invoxaInvoiceToEngineTemplate, render, renderA4, LAYOUTS } from '../utils/engineRenderer'
import { calculateInvoiceTotals, formatINR } from '../utils/calculations'
import { numberToIndianWords } from '../utils/numberToWords'
import { loadHtml2Pdf } from '../utils/pdfGenerator'
import Icon from './ui/Icon'
import '../templateEngine.css'

export default function InvoicePreview({ invoice, previewRef, isPrintOnly = false, isLiveEditing = false, isPro = false, onUpgrade, onLayoutChange }) {
  const [selectedLayout, setSelectedLayout] = useState(invoice?.layout || 'classic')
  const [paperTexture, setPaperTexture] = useState('white')
  const [stampActive, setStampActive] = useState('brand')
  const [isPdfDownloading, setIsPdfDownloading] = useState(false)
  const [isDirectEditable, setIsDirectEditable] = useState(true)

  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout)
    onLayoutChange?.(layout)
  }

  useEffect(() => {
    if (invoice?.layout) {
      setSelectedLayout(invoice.layout)
    }
  }, [invoice?.layout])

  if (!invoice) return null

  // Direct PDF Download with html2pdf
  const handleDownloadPdf = async () => {
    setIsPdfDownloading(true)
    const element = document.getElementById('printable-invoice')
    if (!element) {
      window.print()
      setIsPdfDownloading(false)
      return
    }

    try {
      const html2pdf = await loadHtml2Pdf()
      await html2pdf().set({
        margin: 0,
        filename: `${(invoice.seller?.name || 'Invoice').replace(/\s+/g, '_')}_${invoice.invoiceNumber || 'INV'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: selectedLayout === 'thermal'
          ? { unit: 'px', format: [300, 1100] }
          : selectedLayout === 'phone'
          ? { unit: 'px', format: [390, 1100] }
          : { unit: 'mm', format: 'a4' }
      }).from(element).save()
    } catch (error) {
      console.warn('Invoice PDF download failed; opening the print dialog instead.', error)
      window.print()
    } finally {
      setIsPdfDownloading(false)
    }
  }

  // Convert Invoxa invoice object to engine template using current selectedLayout
  const engineTemplate = invoxaInvoiceToEngineTemplate({
    ...invoice,
    layout: selectedLayout,
    artStyle: selectedLayout === 'classic' || selectedLayout === 'receipt' || selectedLayout === 'thermal' ? 'none' : invoice.artStyle
  })

  // Render modern HTML based on layout
  const renderEngineHtml = () => {
    // If invoice was saved with pre-baked HTML, only use it when NOT in the live editor
    if (invoice?.renderedHtml && !isLiveEditing && (selectedLayout === invoice.layout || !selectedLayout)) {
      return invoice.renderedHtml
    }

    const opts = {
      l: selectedLayout,
      out: selectedLayout === 'phone' ? 'phone' : selectedLayout === 'thermal' ? 'thermal' : 'a4',
      paper: paperTexture,
      stamp: invoice.stampStyle !== undefined ? invoice.stampStyle : stampActive,
      sig: invoice.sigType || 'script',
      sigImg: invoice.sigImgData || null,
      logoImg: invoice.logoImgUrl || null,
      qrImg: invoice.paymentDetails?.upiQrUrl || invoice.upiQrUrl || null,
      reviewQrImg: invoice.reviewQrUrl || null,
      msg: invoice.reviewQrUrl ? 'review' : 'none',
      msgText: 'Loved our work? Scan to rate us on Google',
      status: invoice.status?.toLowerCase() === 'paid' ? 'paid' : invoice.status?.toLowerCase() === 'draft' ? 'draft' : 'sent',
      seal: invoice.verifiedSeal !== undefined ? invoice.verifiedSeal : true
    }
    return render(engineTemplate, opts)
  }

  const totals = calculateInvoiceTotals(invoice)
  const customerCreditApplied = Math.min(Math.max(0, Number(invoice.customerCreditApplied) || 0), totals.grandTotal)
  const invoiceBalanceDue = Math.max(0, totals.grandTotal - customerCreditApplied)
  const documentType = invoice.docType === 'quotation'
    ? 'quote'
    : (['quote', 'estimate'].includes(invoice.docType) ? invoice.docType : 'invoice')
  const documentTypeLabel = documentType === 'quote' ? 'Quotation' : documentType === 'estimate' ? 'Estimate' : 'Tax Invoice'
  const paymentDetails = invoice.paymentDetails || {}
  const upiId = paymentDetails.upiId || invoice.seller?.upiId || ''
  const upiQrUrl = paymentDetails.upiQrUrl || invoice.upiQrUrl || ''
  const hasUpiDetails = Boolean(upiId || upiQrUrl)
  const bankDetails = [
    ['Bank', paymentDetails.bankName],
    ['A/C No', paymentDetails.accountNumber],
    ['IFSC', paymentDetails.ifsc],
    ['Branch', paymentDetails.branch]
  ].filter(([, value]) => Boolean(value))
  const hasPaymentDetails = bankDetails.length > 0 || hasUpiDetails
  const themeClass = `theme-${invoice.theme || 'emerald'}`
  const freePlanWatermark = !isPro && !isPrintOnly ? (
    <div className="invoice-free-plan-watermark" contentEditable={false}>
      <button
        type="button"
        className="no-print"
        data-html2canvas-ignore="true"
        onClick={onUpgrade}
        aria-label="Upgrade to remove the invoice watermark"
      >
        Remove watermark
      </button>
    </div>
  ) : null

  return (
    <div className="invoice-preview-wrapper" ref={previewRef}>
      {/* Design Engine Toolbar (hidden when in print-only mode) */}
      {!isPrintOnly && (
      <>
      <div className="preview-engine-toolbar no-print" style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 16,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             Design Layout:
          </span>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '0.85rem' }}
            value={selectedLayout}
            onChange={(e) => handleLayoutChange(e.target.value)}
          >
            <optgroup label="Physical & Traditional Formats">
              <option value="classic"> Traditional Indian GST Bill (Boxed Grid)</option>
              <option value="receipt"> Retail Store Cash Memo / Receipt</option>
              <option value="thermal"> 80mm Thermal Slip</option>
              {invoice?.originalPhotoUrl && (
                <option value="photo-clone"> Original Photo + Digital Copy</option>
              )}
            </optgroup>
            <optgroup label="Modern Engine Layouts">
              {LAYOUTS.map(([id, name]) => (
                <option key={id} value={id}>{name} Layout</option>
              ))}
            </optgroup>
            <optgroup label="Special Formats">
              <option value="phone"> Mobile Phone View</option>
              <option value="classic-invoxa"> Invoxa Classic</option>
            </optgroup>
          </select>

          {selectedLayout !== 'classic-invoxa' && (
            <>
              <select
                className="form-input"
                style={{ width: 'auto', padding: '5px 10px', fontSize: '0.85rem' }}
                value={paperTexture}
                onChange={(e) => setPaperTexture(e.target.value)}
              >
                <option value="white">Paper: White</option>
                <option value="cream">Paper: Cream</option>
                <option value="kraft">Paper: Kraft Texture</option>
                <option value="linen">Paper: Linen Texture</option>
                <option value="dotted">Paper: Dotted Grid</option>
              </select>

              <select
                className="form-input"
                style={{ width: 'auto', padding: '5px 10px', fontSize: '0.85rem' }}
                value={stampActive}
                onChange={(e) => setStampActive(e.target.value)}
              >
                <option value="brand">Seal: Brand Color</option>
                <option value="#1E3A8A">Seal: Blue Ink</option>
                <option value="#B91C1C">Seal: Red Ink</option>
                <option value="off">Seal: None</option>
              </select>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsDirectEditable(!isDirectEditable)}
            style={{
              background: isDirectEditable ? '#ecfdf5' : '#f1f5f9',
              color: isDirectEditable ? '#059669' : '#64748b',
              border: `1px solid ${isDirectEditable ? '#a7f3d0' : '#cbd5e1'}`,
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Toggle direct text editing on the preview invoice"
          >
            <Icon name={isDirectEditable ? 'edit' : 'fileText'} size={15} />
            {isDirectEditable ? 'Direct Edit: ON' : 'View Only'}
          </button>
        </div>

        <div className="invoice-preview-toolbar-actions">
        <button
          className="btn-primary-action"
          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          onClick={handleDownloadPdf}
          disabled={isPdfDownloading}
        >
          <Icon name={isPdfDownloading ? 'clock' : 'download'} size={15} />
          {isPdfDownloading ? 'Saving PDF…' : 'Download PDF'}
        </button>
        </div>
      </div>

      {isDirectEditable && (
        <div className="no-print" style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: '0.8rem',
          fontWeight: 500,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Icon name="edit" size={16} />
          <span><strong>Manual Template Editor:</strong> Click and type anywhere directly on the invoice document below to customize text, names, numbers, or terms!</span>
        </div>
      )}
      </>
      )}

      {/* Render Selected View */}
      {selectedLayout === 'photo-clone' && invoice?.originalPhotoUrl ? (
        <div id="printable-invoice" className={!isPro ? 'invoice-has-watermark' : ''} style={{ position: 'relative', width: '100%', maxWidth: 840, margin: '0 auto', background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #cbd5e1' }}>
          <div style={{ marginBottom: 20, textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: 16 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
               Original Uploaded Bill Photo:
            </span>
            <img
              src={invoice.originalPhotoUrl}
              alt="Original Bill Photo"
              style={{ maxHeight: 380, maxWidth: '100%', borderRadius: 8, border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
          </div>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15865a', textTransform: 'uppercase' }}>
              <Icon name="checkCircle" size={16} /> Digitized Tax Invoice (Exact Matching Items &amp; Calculations)
            </span>
          </div>
          <div className="invoice-preview-document-with-upgrade">
            <div
              className={`inv${!isPro ? ' invoice-has-watermark' : ''}`}
              contentEditable={isDirectEditable}
              suppressContentEditableWarning={true}
              style={{ width: '100%', outline: isDirectEditable ? '1.5px dashed #86efac' : 'none', borderRadius: 6 }}
              dangerouslySetInnerHTML={{ __html: renderA4(engineTemplate, { l: 'classic', out: 'a4', paper: paperTexture, stamp: stampActive, status: invoice.status?.toLowerCase() === 'paid' ? 'paid' : 'sent', seal: true, msg: invoice.reviewQrUrl ? 'review' : 'none', reviewQrImg: invoice.reviewQrUrl || null }) }}
            />
            {freePlanWatermark}
          </div>
        </div>
      ) : selectedLayout !== 'classic-invoxa' ? (
        <div
          id="printable-invoice"
          className={`inv${!isPro ? ' invoice-has-watermark' : ''}`}
          contentEditable={isDirectEditable && !isPrintOnly}
          suppressContentEditableWarning={true}
          style={{
            width: '100%',
            maxWidth: selectedLayout === 'thermal' ? 300 : selectedLayout === 'phone' ? 340 : 800,
            margin: '0 auto',
            outline: (isDirectEditable && !isPrintOnly) ? '1.5px dashed #86efac' : 'none',
            borderRadius: 6,
            position: 'relative'
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: renderEngineHtml() }} />
          {freePlanWatermark}
        </div>
      ) : (
        /* Classic Invoxa View */
        <div
          className={`invoice-document ${themeClass}${!isPro ? ' invoice-watermarked' : ''}`}
          id="printable-invoice"
          contentEditable={isDirectEditable}
          suppressContentEditableWarning={true}
          style={{ outline: isDirectEditable ? '1.5px dashed #86efac' : 'none', borderRadius: 6, position: 'relative' }}
        >
          <div className="doc-header">
            <div className="doc-seller">
              <div className="doc-brand">
                <span className="doc-logo-badge">I</span>
                <h2>{invoice.seller?.name || 'Your Business'}</h2>
              </div>
              <p className="doc-seller-address">{invoice.seller?.address}, {invoice.seller?.city}, {invoice.seller?.state} - {invoice.seller?.pincode}</p>
              <div className="doc-seller-tax-ids">
                <span><strong>GSTIN:</strong> {invoice.seller?.gstin || 'N/A'}</span>
                <span><strong>PAN:</strong> {invoice.seller?.pan || 'N/A'}</span>
              </div>
              <div className="doc-seller-contact">
                <span>Email: {invoice.seller?.email}</span>
                <span>Phone: {invoice.seller?.phone}</span>
              </div>
            </div>

            <div className="doc-meta">
              <div className="doc-type-title">{documentTypeLabel.toUpperCase()}</div>
              <div className={`doc-status-badge ${invoice.status?.toLowerCase() === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                {invoice.status?.toUpperCase() || 'UNPAID'}
              </div>
              <table className="doc-meta-table">
                <tbody>
                  <tr>
                    <td><strong>{documentType === 'invoice' ? 'Invoice No' : documentType === 'quote' ? 'Quotation No' : 'Estimate No'}:</strong></td>
                    <td>{invoice.invoiceNumber || invoice.quoteNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>{documentType === 'invoice' ? 'Invoice Date' : documentType === 'quote' ? 'Quotation Date' : 'Estimate Date'}:</strong></td>
                    <td>{invoice.invoiceDate || invoice.quoteDate}</td>
                  </tr>
                  <tr>
                    <td><strong>{documentType === 'invoice' ? 'Due Date' : 'Valid Until'}:</strong></td>
                    <td>{documentType === 'invoice' ? invoice.dueDate : invoice.validUntil || invoice.dueDate}</td>
                  </tr>
                  <tr>
                    <td><strong>Place of Supply:</strong></td>
                    <td>{invoice.client?.state || invoice.seller?.state || 'Maharashtra'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="doc-divider"></div>

          <div className="doc-billing-grid">
            <div className="doc-bill-box">
              <span className="doc-box-title">BILLED TO (BUYER):</span>
              <h3 className="doc-client-name">{invoice.client?.name || 'Customer Name'}</h3>
              <p className="doc-client-address">{invoice.client?.address || 'Address Line'}</p>
              <p>{invoice.client?.city}, {invoice.client?.state} {invoice.client?.pincode ? `- ${invoice.client.pincode}` : ''}</p>
              <div className="doc-client-extra">
                <p><strong>GSTIN:</strong> {invoice.client?.gstin || 'Unregistered'}</p>
                {invoice.client?.phone && <p><strong>Phone:</strong> {invoice.client.phone}</p>}
                {invoice.client?.email && <p><strong>Email:</strong> {invoice.client.email}</p>}
              </div>
            </div>

            {hasPaymentDetails && (
              <div className="doc-payment-summary-box">
                <span className="doc-box-title">PAYMENT DETAILS:</span>
                <div className="doc-bank-info">
                  {bankDetails.map(([label, value]) => <p key={label}><strong>{label}:</strong> {value}</p>)}
                  {upiId && <p><strong>UPI ID:</strong> {upiId}</p>}
                </div>
              </div>
            )}
          </div>

          <table className="doc-items-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '45%' }}>Item &amp; Description</th>
                <th style={{ width: '12%' }}>HSN/SAC</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => {
                const qty = parseFloat(item.quantity) || 0
                const rate = parseFloat(item.rate) || 0
                const lineTotal = qty * rate

                return (
                  <tr key={item.id || index}>
                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                    <td>
                      <strong>{item.description}</strong>
                      {item.taxRate ? <span className="item-tax-tag">GST: {item.taxRate}%</span> : null}
                    </td>
                    <td className="doc-mono">{item.hsnSac || '998314'}</td>
                    <td style={{ textAlign: 'center' }}>{qty}</td>
                    <td style={{ textAlign: 'right' }}>{formatINR(rate)}</td>
                    <td style={{ textAlign: 'right' }}><strong>{formatINR(lineTotal)}</strong></td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="doc-totals-section">
            <div className="doc-words-and-notes">
              <div className="doc-amount-words">
                <span className="doc-box-title">{customerCreditApplied > 0 ? 'BALANCE DUE IN WORDS:' : 'AMOUNT IN WORDS:'}</span>
                <p>{numberToIndianWords(customerCreditApplied > 0 ? invoiceBalanceDue : totals.grandTotal)}</p>
              </div>

              {invoice.notes && (
                <div className="doc-notes-box">
                  <span className="doc-box-title">NOTES:</span>
                  <p>{invoice.notes}</p>
                </div>
              )}

              {invoice.terms && (
                <div className="doc-terms-box">
                  <span className="doc-box-title">TERMS &amp; CONDITIONS:</span>
                  <p>{invoice.terms}</p>
                </div>
              )}
            </div>

            <div className="doc-breakdown-card">
              <div className="breakdown-row">
                <span>Subtotal:</span>
                <span>{formatINR(totals.subtotal)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount ({invoice.discountRate}%):</span>
                  <span>- {formatINR(totals.discountAmount)}</span>
                </div>
              )}

              <div className="breakdown-row">
                <span>Taxable Amount:</span>
                <span>{formatINR(totals.taxableAmount)}</span>
              </div>

              {totals.isInterState ? (
                <div className="breakdown-row tax">
                  <span>Integrated GST (IGST):</span>
                  <span>{formatINR(totals.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="breakdown-row tax">
                    <span>Central GST (CGST):</span>
                    <span>{formatINR(totals.cgst)}</span>
                  </div>
                  <div className="breakdown-row tax">
                    <span>State GST (SGST):</span>
                    <span>{formatINR(totals.sgst)}</span>
                  </div>
                </>
              )}

              <div className="breakdown-divider"></div>

              {customerCreditApplied > 0 && <div className="breakdown-row discount"><span>Customer credit applied:</span><span>- {formatINR(customerCreditApplied)}</span></div>}
              <div className="breakdown-row grand-total">
                <span>{customerCreditApplied > 0 ? 'Balance Due:' : 'Total Payable:'}</span>
                <span>{formatINR(invoiceBalanceDue)}</span>
              </div>
            </div>
          </div>

          <div className="doc-footer-row">
            {hasUpiDetails && (
              <div className="doc-upi-qr">
                <div className="qr-box">
                  {upiQrUrl
                    ? <img src={upiQrUrl} alt="UPI payment QR" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                    : <QRCodeSVG value={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(invoice.seller?.name || 'Business')}&am=${invoiceBalanceDue.toFixed(2)}&cu=INR&tn=Invoice%20${encodeURIComponent(invoice.invoiceNumber || 'INV')}`} size={48} level="M" />}
                </div>
                <div className="qr-info">
                  <small>Scan to pay via any UPI app</small>
                  {upiId && <strong>{upiId}</strong>}
                </div>
              </div>
            )}

            {invoice.reviewQrUrl && (
              <div className="doc-upi-qr">
                <div className="qr-box">
                  <img src={invoice.reviewQrUrl} alt="Rate us QR" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                </div>
                <div className="qr-info">
                  <small>Rate us on Google</small>
                  <strong>Scan to leave a review</strong>
                </div>
              </div>
            )}

            <div className="doc-signatory">
              <p>For <strong>{invoice.seller?.name || 'Invoxa Enterprise'}</strong></p>
              <div className="signature-space">
                <span className="sign-seal">AUTHORIZED SIGNATORY</span>
              </div>
            </div>
          </div>

          <div className="doc-bottom-note">
            This is a computer-generated tax invoice verified under GST compliance.
          </div>
          {freePlanWatermark}
        </div>
      )}
    </div>
  )
}
