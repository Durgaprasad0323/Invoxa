import React, { useState, useEffect, useRef } from 'react'
import InvoicePreview from './InvoicePreview'
import { calculateInvoiceTotals, formatINR } from '../utils/calculations'
import { STAMPS, SIGS } from '../utils/engineRenderer'

export default function InvoiceEditor({
  initialInvoice,
  onSave,
  onBack,
  onPrint,
  originTab
}) {
  // Direct responsive invoice state for instant, lag-free typing
  const safeClone = (inv) => {
    if (!inv) return {}
    try {
      return JSON.parse(JSON.stringify(inv))
    } catch {
      return { ...inv }
    }
  }

  const [currentInvoice, setCurrentInvoice] = useState(() => safeClone(initialInvoice))

  // History state for Undo / Redo / Revert
  const historyRef = useRef([safeClone(initialInvoice)])
  const historyIndexRef = useRef(0)
  const initialSnapshotRef = useRef(safeClone(initialInvoice))
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const historyTimeoutRef = useRef(null)
  const editorCanvasRef = useRef(null)

  // Sync state if initialInvoice changes
  useEffect(() => {
    if (initialInvoice) {
      const cloned = safeClone(initialInvoice)
      setCurrentInvoice(cloned)
      historyRef.current = [cloned]
      historyIndexRef.current = 0
      initialSnapshotRef.current = cloned
      setCanUndo(false)
      setCanRedo(false)
    }
  }, [initialInvoice?.id])

  // View mode: 'split', 'edit', 'preview'
  const [viewMode, setViewMode] = useState('split')
  const [saveToast, setSaveToast] = useState('')

  // Debounced history record to ensure typing NEVER loses focus or lags
  const recordHistory = (newInvoice) => {
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current)
    historyTimeoutRef.current = setTimeout(() => {
      const sliced = historyRef.current.slice(0, historyIndexRef.current + 1)
      sliced.push(JSON.parse(JSON.stringify(newInvoice)))
      if (sliced.length > 50) sliced.shift()
      historyRef.current = sliced
      historyIndexRef.current = sliced.length - 1
      setCanUndo(historyIndexRef.current > 0)
      setCanRedo(false)
    }, 450)
  }

  // Undo
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1
      const snap = historyRef.current[historyIndexRef.current]
      setCanUndo(historyIndexRef.current > 0)
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
      setCurrentInvoice(JSON.parse(JSON.stringify(snap)))
    }
  }

  // Redo
  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1
      const snap = historyRef.current[historyIndexRef.current]
      setCanUndo(true)
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
      setCurrentInvoice(JSON.parse(JSON.stringify(snap)))
    }
  }

  // Revert back to original generated state
  const handleRevert = () => {
    const cloned = JSON.parse(JSON.stringify(initialSnapshotRef.current))
    setCurrentInvoice(cloned)
    recordHistory(cloned)
    setSaveToast('✓ Reverted back to initial AI draft')
    setTimeout(() => setSaveToast(''), 3000)
  }

  // Reset to Starter state
  const handleResetToStarter = () => {
    const cloned = JSON.parse(JSON.stringify(initialSnapshotRef.current))
    setCurrentInvoice(cloned)
    recordHistory(cloned)
    setSaveToast('✓ Reset to starter defaults')
    setTimeout(() => setSaveToast(''), 3000)
  }

  // Handlers for fields
  const handleFieldChange = (section, field, value) => {
    setCurrentInvoice((prev) => {
      const updated = { ...prev, renderedHtml: null }
      if (section) {
        updated[section] = {
          ...updated[section],
          [field]: value
        }
      } else {
        updated[field] = value
      }
      recordHistory(updated)
      return updated
    })
  }

  // Line item handlers
  const handleItemChange = (index, field, value) => {
    setCurrentInvoice((prev) => {
      const updated = { ...prev, renderedHtml: null }
      const items = [...(updated.items || [])]
      items[index] = {
        ...items[index],
        [field]: field === 'quantity' || field === 'rate' || field === 'taxRate'
          ? (value === '' ? '' : parseFloat(value) || 0)
          : value
      }
      updated.items = items
      recordHistory(updated)
      return updated
    })
  }

  const handleAddItem = () => {
    setCurrentInvoice((prev) => {
      const updated = { ...prev, renderedHtml: null }
      updated.items = [
        ...(updated.items || []),
        {
          id: 'item_' + Date.now(),
          description: 'New Service or Product',
          hsnSac: '998314',
          quantity: 1,
          rate: 1000,
          taxRate: 18
        }
      ]
      recordHistory(updated)
      return updated
    })
  }

  const handleDeleteItem = (index) => {
    if ((currentInvoice.items || []).length <= 1) {
      alert('Invoice must have at least one line item.')
      return
    }
    setCurrentInvoice((prev) => {
      const updated = { ...prev, renderedHtml: null }
      const items = [...(updated.items || [])]
      items.splice(index, 1)
      updated.items = items
      recordHistory(updated)
      return updated
    })
  }

  // Logo upload & remove
  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      handleFieldChange(null, 'logoImgUrl', reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    handleFieldChange(null, 'logoImgUrl', null)
  }

  // Stamp & Seal
  const handleStampChange = (stamp) => {
    handleFieldChange(null, 'stampStyle', stamp)
  }

  const handleVerifiedSealChange = (checked) => {
    handleFieldChange(null, 'verifiedSeal', checked)
  }

  // Signature
  const handleSigTypeChange = (sigType) => {
    handleFieldChange(null, 'sigType', sigType)
  }

  const handleSignatureUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCurrentInvoice((prev) => {
        const updated = { ...prev, sigType: 'drawn', sigImgData: reader.result, renderedHtml: null }
        recordHistory(updated)
        return updated
      })
    }
    reader.readAsDataURL(file)
  }

  // Canvas drawing handler for signature
  useEffect(() => {
    if ((currentInvoice.sigType || 'script') !== 'drawn') return
    const canvas = editorCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1E3A8A'

    let isDrawing = false
    const getPos = (ev) => {
      const rect = canvas.getBoundingClientRect()
      return [
        (ev.clientX - rect.left) * canvas.width / rect.width,
        (ev.clientY - rect.top) * canvas.height / rect.height
      ]
    }

    const startDraw = (ev) => {
      isDrawing = true
      const [x, y] = getPos(ev)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const drawMove = (ev) => {
      if (!isDrawing) return
      const [x, y] = getPos(ev)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const endDraw = () => {
      if (!isDrawing) return
      isDrawing = false
      const data = canvas.toDataURL('image/png')
      handleFieldChange(null, 'sigImgData', data)
    }

    canvas.addEventListener('pointerdown', startDraw)
    canvas.addEventListener('pointermove', drawMove)
    canvas.addEventListener('pointerup', endDraw)
    canvas.addEventListener('pointerleave', endDraw)

    return () => {
      canvas.removeEventListener('pointerdown', startDraw)
      canvas.removeEventListener('pointermove', drawMove)
      canvas.removeEventListener('pointerup', endDraw)
      canvas.removeEventListener('pointerleave', endDraw)
    }
  }, [currentInvoice.sigType])

  // Custom UPI QR Code upload & remove
  const handleUpiQrUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCurrentInvoice((prev) => {
        const updated = {
          ...prev,
          renderedHtml: null,
          upiQrUrl: reader.result,
          paymentDetails: {
            ...(prev.paymentDetails || {}),
            upiQrUrl: reader.result
          }
        }
        recordHistory(updated)
        return updated
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveUpiQr = () => {
    setCurrentInvoice((prev) => {
      const updated = {
        ...prev,
        renderedHtml: null,
        upiQrUrl: null,
        paymentDetails: {
          ...(prev.paymentDetails || {}),
          upiQrUrl: null
        }
      }
      recordHistory(updated)
      return updated
    })
  }

  const handleReviewQrUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => handleFieldChange(null, 'reviewQrUrl', reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveReviewQr = () => {
    handleFieldChange(null, 'reviewQrUrl', null)
  }

  const handleSaveInvoice = () => {
    onSave(currentInvoice)
    setSaveToast('✓ Invoice saved successfully to your dashboard!')
    setTimeout(() => setSaveToast(''), 3000)
  }

  const handleWhatsAppShare = () => {
    const { grandTotal } = calculateInvoiceTotals(currentInvoice)
    const clientName = currentInvoice.client?.name || 'Valued Customer'
    const sellerName = currentInvoice.seller?.name || 'Invoxa'
    const invoiceNo = currentInvoice.invoiceNumber || 'INV'
    const upiId = currentInvoice.paymentDetails?.upiId || currentInvoice.seller?.upiId || 'krishna@okhdfc'

    const message = `Hello ${clientName},\n\n` +
      `Here are the invoice details from *${sellerName}*:\n` +
      `📄 *Invoice No:* ${invoiceNo}\n` +
      `💰 *Total Amount:* ${formatINR(grandTotal)}\n` +
      `📅 *Due Date:* ${currentInvoice.dueDate || 'Immediate'}\n\n` +
      `📱 *Pay via UPI:* upi://pay?pa=${upiId}&pn=${encodeURIComponent(sellerName)}&am=${grandTotal.toFixed(2)}&cu=INR\n` +
      `UPI ID: *${upiId}*\n\n` +
      `Thank you for your business!`

    const phone = (currentInvoice.client?.phone || '').replace(/[^0-9]/g, '')
    const targetUrl = phone.length >= 10
      ? `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`

    window.open(targetUrl, '_blank')
  }

  const totals = calculateInvoiceTotals(currentInvoice)

  return (
    <div className="editor-wrapper">
      {/* Top Action Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="back-link-btn" onClick={onBack}>
            {originTab === 'templates' ? '← Back to Template & Mixers' : '← Back to Invoices'}
          </button>
          <div className="invoice-title-pill">
            <span>Editing:</span>
            <strong>{currentInvoice.invoiceNumber}</strong>
          </div>
        </div>

        {/* Undo / Redo / Revert / Reset Buttons */}
        <div className="toolbar-history">
          <button
            className="history-btn"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo last change"
          >
            ↶ Undo
          </button>
          <button
            className="history-btn"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo change"
          >
            ↷ Redo
          </button>
          <button
            className="history-btn revert"
            onClick={handleRevert}
            title="Revert back to initial AI draft"
          >
            ↺ Revert to Draft
          </button>
          <button
            className="history-btn reset"
            onClick={handleResetToStarter}
            title="Reset to starter defaults"
            style={{ color: '#0284c7' }}
          >
            ⟲ Reset to Starter
          </button>
        </div>

        {/* View Switchers & Export Actions */}
        <div className="toolbar-right">
          <div className="view-toggle-group">
            <button
              className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              Split View
            </button>
            <button
              className={`view-btn ${viewMode === 'edit' ? 'active' : ''}`}
              onClick={() => setViewMode('edit')}
            >
              Edit Form
            </button>
            <button
              className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              Preview
            </button>
          </div>

          <button
            className="secondary-btn whatsapp-share-btn"
            onClick={handleWhatsAppShare}
            style={{
              background: '#25D366',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 6,
              padding: '7px 13px',
              cursor: 'pointer'
            }}
            title="Send invoice details and UPI link via WhatsApp"
          >
            💬 Share on WhatsApp
          </button>

          <button className="secondary-btn print-btn" onClick={onPrint}>
            🖨 Download PDF / Print
          </button>

          <button className="primary-btn save-btn" onClick={handleSaveInvoice}>
            💾 Save Invoice
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="save-toast-banner">
          {saveToast}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`editor-layout mode-${viewMode}`}>
        {/* LEFT: EDITABLE FORM */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className="editor-panel">
            {/* Template & Status bar */}
            <div className="form-card">
              <div className="form-row three-col">
                <div className="form-field">
                  <label>Invoice Number</label>
                  <input
                    type="text"
                    value={currentInvoice.invoiceNumber || ''}
                    onChange={(e) => handleFieldChange(null, 'invoiceNumber', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Invoice Date</label>
                  <input
                    type="date"
                    value={currentInvoice.invoiceDate || ''}
                    onChange={(e) => handleFieldChange(null, 'invoiceDate', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Payment Status</label>
                  <select
                    value={currentInvoice.status || 'Unpaid'}
                    onChange={(e) => handleFieldChange(null, 'status', e.target.value)}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="form-row two-col" style={{ marginTop: '12px' }}>
                <div className="form-field">
                  <label>Payment Due Date</label>
                  <input
                    type="date"
                    value={currentInvoice.dueDate || ''}
                    onChange={(e) => handleFieldChange(null, 'dueDate', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Design Template Theme</label>
                  <select
                    value={currentInvoice.theme || 'emerald'}
                    onChange={(e) => handleFieldChange(null, 'theme', e.target.value)}
                  >
                    <option value="emerald">✦ Invoxa Emerald (Modern)</option>
                    <option value="navy">✦ Corporate Navy Blue</option>
                    <option value="charcoal">✦ Minimal Monochrome</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bill From (Seller / Your Business Details) */}
            <div className="form-card">
              <h4 className="card-title">🏪 Billed By (Your Business Details)</h4>
              <div className="form-row two-col">
                <div className="form-field">
                  <label>Business / Company Name</label>
                  <input
                    type="text"
                    value={currentInvoice.seller?.name || ''}
                    onChange={(e) => handleFieldChange('seller', 'name', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Your GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AABCS1429R1Z5"
                    value={currentInvoice.seller?.gstin || ''}
                    onChange={(e) => handleFieldChange('seller', 'gstin', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-field">
                  <label>Business Address</label>
                  <input
                    type="text"
                    value={currentInvoice.seller?.address || ''}
                    onChange={(e) => handleFieldChange('seller', 'address', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>City &amp; State</label>
                  <input
                    type="text"
                    value={currentInvoice.seller?.city || ''}
                    onChange={(e) => handleFieldChange('seller', 'city', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>

            {/* Branding, Logo, Company Seal & Signature Card */}
            <div className="form-card">
              <h4 className="card-title">🎨 Branding, Seal, Stamp &amp; Signature</h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* 1. Company Logo */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    🏢 Company Logo
                  </label>
                  {currentInvoice.logoImgUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={currentInvoice.logoImgUrl}
                        alt="Logo"
                        style={{ width: 48, height: 48, objectFit: 'contain', background: '#fff', borderRadius: 8, border: '1px solid #cbd5e1', padding: 4 }}
                      />
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#15865a', fontWeight: 600, display: 'block' }}>✓ Logo Uploaded</span>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          style={{ padding: '3px 8px', fontSize: '11px', marginTop: 4, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer' }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="editorLogoUpload"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '7px 12px',
                          background: '#ffffff',
                          border: '1px dashed #0284c7',
                          borderRadius: 8,
                          color: '#0284c7',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <span>⬆</span> Upload Company Logo
                      </label>
                      <input
                        id="editorLogoUpload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleLogoUpload}
                      />
                      <small style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                        PNG, JPG or SVG (Transparent logo looks best)
                      </small>
                    </div>
                  )}
                </div>

                {/* 2. Company Seal / Stamp */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', margin: 0 }}>
                      💮 Company Seal / Stamp
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Circular Seal</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {STAMPS.map(([id, n]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleStampChange(id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11.5px',
                          fontWeight: (currentInvoice.stampStyle || 'brand') === id ? 700 : 500,
                          background: (currentInvoice.stampStyle || 'brand') === id
                            ? (id === '#B91C1C' ? '#b91c1c' : id === '#5B21B6' ? '#5b21b6' : id === '#1E3A8A' ? '#1e3a8a' : '#15865a')
                            : '#ffffff',
                          color: (currentInvoice.stampStyle || 'brand') === id ? '#ffffff' : '#334155',
                          border: (currentInvoice.stampStyle || 'brand') === id ? '1px solid currentColor' : '1px solid #cbd5e1',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#475569', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={currentInvoice.verifiedSeal !== false}
                      onChange={(e) => handleVerifiedSealChange(e.target.checked)}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span>✓ Tamper-Proof Verification Seal</span>
                  </label>
                </div>

                {/* 3. Signature Style */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: 6 }}>
                    ✍️ Signature Style &amp; Sign
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {SIGS.map(([id, n]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSigTypeChange(id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11.5px',
                          fontWeight: (currentInvoice.sigType || 'script') === id ? 700 : 500,
                          background: (currentInvoice.sigType || 'script') === id ? '#15865a' : '#ffffff',
                          color: (currentInvoice.sigType || 'script') === id ? '#ffffff' : '#334155',
                          border: (currentInvoice.sigType || 'script') === id ? '1px solid #15865a' : '1px solid #cbd5e1',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  {(currentInvoice.sigType || 'script') === 'drawn' ? (
                    <div style={{ marginTop: 6 }}>
                      {currentInvoice.sigImgData ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: 6, borderRadius: 6, border: '1px solid #cbd5e1' }}>
                          <img src={currentInvoice.sigImgData} alt="Signature preview" style={{ height: 36, objectFit: 'contain' }} />
                          <button
                            type="button"
                            onClick={() => handleFieldChange(null, 'sigImgData', null)}
                            style={{ padding: '2px 8px', fontSize: '11px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer' }}
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <label
                              htmlFor="editorSigUpload"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '5px 10px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              📷 Upload Sign Image
                            </label>
                            <input
                              id="editorSigUpload"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={handleSignatureUpload}
                            />
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>or draw below:</span>
                          </div>
                          <canvas
                            ref={editorCanvasRef}
                            style={{
                              width: '100%',
                              height: 80,
                              background: '#ffffff',
                              border: '1px dashed #94a3b8',
                              borderRadius: 6,
                              touchAction: 'none'
                            }}
                            width={400}
                            height={100}
                          />
                        </div>
                      )}
                    </div>
                  ) : (currentInvoice.sigType || 'script') === 'script' ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Authorized Signatory Name"
                        value={currentInvoice.seller?.authorizedSignatory || currentInvoice.seller?.name || ''}
                        onChange={(e) => handleFieldChange('seller', 'authorizedSignatory', e.target.value)}
                        style={{ fontSize: '12px', padding: '5px 8px' }}
                      />
                      <small style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                        Signs as stylish handwritten <em>{currentInvoice.seller?.authorizedSignatory || currentInvoice.seller?.name || 'Authorized Signatory'}</em>
                      </small>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      No signature block on invoice
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To (Customer Details) */}
            <div className="form-card">
              <h4 className="card-title">🏢 Billed To (Customer Details)</h4>
              <div className="form-row two-col">
                <div className="form-field">
                  <label>Client / Company Name</label>
                  <input
                    type="text"
                    value={currentInvoice.client?.name || ''}
                    onChange={(e) => handleFieldChange('client', 'name', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Client GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AACCM9876E1Z2"
                    value={currentInvoice.client?.gstin || ''}
                    onChange={(e) => handleFieldChange('client', 'gstin', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-field">
                  <label>Billing Address</label>
                  <input
                    type="text"
                    value={currentInvoice.client?.address || ''}
                    onChange={(e) => handleFieldChange('client', 'address', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>State (determines CGST/SGST vs IGST)</label>
                  <input
                    type="text"
                    value={currentInvoice.client?.state || ''}
                    onChange={(e) => handleFieldChange('client', 'state', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-field">
                  <label>Client Email</label>
                  <input
                    type="email"
                    value={currentInvoice.client?.email || ''}
                    onChange={(e) => handleFieldChange('client', 'email', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Client Phone</label>
                  <input
                    type="tel"
                    value={currentInvoice.client?.phone || ''}
                    onChange={(e) => handleFieldChange('client', 'phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table with Live Auto-Calculations */}
            <div className="form-card">
              <div className="card-header-flex">
                <h4 className="card-title">📦 Invoice Line Items</h4>
                <button type="button" className="add-item-btn" onClick={handleAddItem}>
                  + Add Item
                </button>
              </div>

              <div className="table-responsive">
                <table className="editor-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Description</th>
                      <th style={{ width: '15%' }}>HSN/SAC</th>
                      <th style={{ width: '12%' }}>Qty</th>
                      <th style={{ width: '18%' }}>Rate (₹)</th>
                      <th style={{ width: '12%' }}>GST %</th>
                      <th style={{ width: '5%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.items?.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.hsnSac || ''}
                            onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)}
                            placeholder="HSN"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            value={item.taxRate || 18}
                            onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="delete-row-btn"
                            onClick={() => handleDeleteItem(index)}
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live Totals summary inside editor */}
              <div className="editor-live-totals">
                <div className="live-totals-row">
                  <span>Subtotal:</span>
                  <strong>{formatINR(totals.subtotal)}</strong>
                </div>
                <div className="live-totals-row">
                  <span>GST ({totals.isInterState ? 'IGST' : 'CGST + SGST'}):</span>
                  <strong>{formatINR(totals.totalTax)}</strong>
                </div>
                <div className="live-totals-row grand">
                  <span>Grand Total:</span>
                  <strong>{formatINR(totals.grandTotal)}</strong>
                </div>
              </div>
            </div>

            {/* Discount, Terms & Payment Details */}
            <div className="form-card">
              <h4 className="card-title">⚙ Additional Settings &amp; Bank Details</h4>
              <div className="form-row two-col">
                <div className="form-field">
                  <label>Overall Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentInvoice.discountRate || 0}
                    onChange={(e) => handleFieldChange(null, 'discountRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-field">
                  <label>UPI ID for Payment</label>
                  <input
                    type="text"
                    value={currentInvoice.paymentDetails?.upiId || ''}
                    onChange={(e) => handleFieldChange('paymentDetails', 'upiId', e.target.value)}
                  />
                </div>
              </div>

              {/* UPI Payment QR Code Section */}
              <div style={{
                marginTop: '14px',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', margin: 0 }}>
                    📱 UPI Payment QR Code on Invoice
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Scan-to-Pay</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={handleRemoveUpiQr}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: !(currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? 700 : 500,
                      background: !(currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? '#15865a' : '#ffffff',
                      color: !(currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? '#ffffff' : '#334155',
                      border: !(currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? '1px solid #15865a' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Auto-Generate QR (from UPI ID)
                  </button>
                  <label
                    htmlFor="editorUpiQrUpload"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: (currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? 700 : 500,
                      background: (currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? '#15865a' : '#ffffff',
                      color: (currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? '#ffffff' : '#334155',
                      border: (currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? '1px solid #15865a' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>📷</span> Upload Custom UPI QR Code Image
                  </label>
                  <input
                    id="editorUpiQrUpload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleUpiQrUpload}
                  />
                </div>

                {(currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <img
                      src={currentInvoice.paymentDetails?.upiQrUrl || currentInvoice.upiQrUrl}
                      alt="Uploaded QR Preview"
                      style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15865a', display: 'block' }}>✓ Custom QR Uploaded</span>
                      <small style={{ fontSize: '0.72rem', color: '#64748b' }}>This custom QR code will be printed on the invoice for payments</small>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveUpiQr}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Remove QR
                    </button>
                  </div>
                ) : (
                  <small style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                    Currently using live generated QR code for <strong>{currentInvoice.paymentDetails?.upiId || currentInvoice.seller?.upiId || 'krishna@okhdfc'}</strong>. You can upload your GPay, PhonePe, or Paytm QR code image above.
                  </small>
                )}
              </div>

              <div style={{
                marginTop: '12px',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', margin: 0 }}>
                    Rate Us QR Code on Invoice
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer Reviews</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {currentInvoice.reviewQrUrl && (
                    <img
                      src={currentInvoice.reviewQrUrl}
                      alt="Rate us QR preview"
                      style={{ width: 52, height: 52, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  )}
                  <label
                    htmlFor="editorReviewQrUpload"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', fontSize: '12px', fontWeight: 600, background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}
                  >
                    {currentInvoice.reviewQrUrl ? 'Replace Rate Us QR Image' : 'Upload Rate Us QR Image'}
                  </label>
                  <input id="editorReviewQrUpload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReviewQrUpload} />
                  {currentInvoice.reviewQrUrl && (
                    <button type="button" onClick={handleRemoveReviewQr} style={{ padding: '5px 9px', fontSize: '11px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 5, cursor: 'pointer' }}>
                      Remove QR
                    </button>
                  )}
                  {!currentInvoice.reviewQrUrl && <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Upload an image that opens your Google review page when scanned.</small>}
                </div>
              </div>

              <div className="form-row three-col" style={{ marginTop: '10px' }}>
                <div className="form-field">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={currentInvoice.paymentDetails?.bankName || ''}
                    placeholder="e.g. HDFC Bank Ltd"
                    onChange={(e) => handleFieldChange('paymentDetails', 'bankName', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={currentInvoice.paymentDetails?.accountNumber || ''}
                    placeholder="e.g. 50200012345678"
                    onChange={(e) => handleFieldChange('paymentDetails', 'accountNumber', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={currentInvoice.paymentDetails?.ifsc || ''}
                    placeholder="e.g. HDFC0000240"
                    onChange={(e) => handleFieldChange('paymentDetails', 'ifsc', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field" style={{ marginTop: '10px' }}>
                <label>Terms &amp; Conditions</label>
                <textarea
                  rows={2}
                  value={currentInvoice.terms || ''}
                  onChange={(e) => handleFieldChange(null, 'terms', e.target.value)}
                />
              </div>

              <div className="form-field" style={{ marginTop: '10px' }}>
                <label>Customer Notes</label>
                <input
                  type="text"
                  value={currentInvoice.notes || ''}
                  onChange={(e) => handleFieldChange(null, 'notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* RIGHT: LIVE PREVIEW OF THE INVOICE */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="preview-panel">
            <div className="preview-sticky-wrap">
              <div className="preview-label-bar">
                <span>✦ Live Invoice Document Preview</span>
                <span className="live-dot">● Real-time Sync</span>
              </div>
              <InvoicePreview invoice={currentInvoice} isLiveEditing={true} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar — only shows on mobile */}
      <div className="mobile-editor-action-bar">
        <button
          className="meab-btn meab-back"
          onClick={onBack}
          title="Go back"
        >
          ← Back
        </button>
        <div className="meab-view-switch">
          <button
            className={`meab-view-btn ${viewMode === 'edit' ? 'active' : ''}`}
            onClick={() => setViewMode('edit')}
          >
            ✏️ Edit
          </button>
          <button
            className={`meab-view-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            👁 Preview
          </button>
        </div>
        <button
          className="meab-btn meab-wa"
          onClick={handleWhatsAppShare}
          title="Share on WhatsApp"
          style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
        >
          💬 WA
        </button>
        <button
          className="meab-btn meab-pdf"
          onClick={onPrint}
          title="Download PDF"
        >
          ⬇ PDF
        </button>
        <button
          className="meab-btn meab-save"
          onClick={handleSaveInvoice}
          title="Save Invoice"
        >
          💾 Save
        </button>
      </div>
    </div>
  )
}
