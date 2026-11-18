import React, { useState } from 'react'

export default function SettingsView({ profile, onSaveProfile }) {
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

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
          <h4>🏢 Business Identity</h4>
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
          <h4>💳 Banking & Scan-to-Pay UPI QR</h4>
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
            <small className="field-hint">This UPI ID is encoded into the scan-to-pay QR on every invoice.</small>
          </div>
        </div>

        {/* Action Button */}
        <div className="settings-action-bar">
          {saved && <span className="save-success-msg">✓ Settings saved successfully!</span>}
          <button type="submit" className="save-settings-btn">
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  )
}
