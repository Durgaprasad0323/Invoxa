import React, { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon'

export default function SettingsView({ profile, onSaveProfile }) {
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const qrInputRef = useRef(null)

  useEffect(() => {
    setForm({ ...profile })
  }, [profile])

  const handleQrUpload = event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setUploadError('')
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Choose an image file for your UPI QR.')
      return
    }
    if (file.size > 1.25 * 1024 * 1024) {
      setUploadError('Choose a QR image smaller than 1.25 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setForm(current => ({ ...current, upiQrUrl: String(reader.result || '') }))
    reader.onerror = () => setUploadError('This QR image could not be read. Try another image.')
    reader.readAsDataURL(file)
  }

  const removeQr = () => {
    setForm(current => ({ ...current, upiQrUrl: '' }))
    setUploadError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSaveProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Business & Document Settings</h3>
          <p className="section-subtext">Manage your business profile, tax information, and banking details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form-wrapper">
        {/* Business Identity */}
        <div className="settings-card">
          <h4><Icon name="building" size={18} /> Business Identity</h4>
          <div className="form-row two-col">
            <div className="form-group">
              <label>Company / Legal Trade Name *</label>
              <input
                type="text"
                required
                value={form.companyName || ''}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Business Tagline / Subtitle</label>
              <input
                type="text"
                value={form.tagline || ''}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>GSTIN (15 Digits)</label>
              <input
                type="text"
                placeholder="27AABCI1234F1Z5"
                value={form.gstin || ''}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input
                type="text"
                placeholder="AABCI1234F"
                value={form.pan || ''}
                onChange={(e) => setForm({ ...form, pan: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Billing Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Registered Street Address</label>
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={form.city || ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                required
                value={form.state || ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                value={form.pincode || ''}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bank & UPI QR Setup */}
        <div className="settings-card">
          <h4><Icon name="wallet" size={18} /> Banking &amp; Scan-to-Pay UPI QR</h4>
          <div className="form-row two-col">
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                value={form.bankName || ''}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                value={form.accountNumber || ''}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                value={form.ifsc || ''}
                onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Branch Location</label>
              <input
                type="text"
                value={form.branch || ''}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>UPI ID (For dynamic QR Code)</label>
            <input
              type="text"
              placeholder="e.g. krishna.pay@okhdfcbank"
              value={form.upiId || ''}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
            />
            <small className="field-hint">Used to generate an invoice QR when you have not uploaded a custom UPI QR.</small>
          </div>

          <div className="form-group settings-qr-upload">
            <label htmlFor="settings-upi-qr">Upload UPI QR image</label>
            <p className="field-hint">The uploaded QR is saved with your business payment details and printed on invoices.</p>
            <input
              ref={qrInputRef}
              id="settings-upi-qr"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleQrUpload}
            />
            {form.upiQrUrl && (
              <div className="settings-qr-preview">
                <img src={form.upiQrUrl} alt="Uploaded UPI payment QR" />
                <button type="button" className="settings-qr-remove" onClick={removeQr}>Remove QR</button>
              </div>
            )}
            {uploadError && <small className="settings-qr-error" role="alert">{uploadError}</small>}
          </div>
        </div>

        {/* Action Button */}
        <div className="settings-action-bar">
          {saved && <span className="save-success-msg"><Icon name="checkCircle" size={14} /> Settings saved successfully!</span>}
          <button type="submit" className="save-settings-btn">
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  )
}
