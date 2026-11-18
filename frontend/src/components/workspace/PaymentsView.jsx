import React, { useState } from 'react'

export default function PaymentsView({ profile }) {
  const [testAmount, setTestAmount] = useState('5000')
  const [copied, setCopied] = useState(false)

  const upiId = profile?.upiId || 'krishna.pay@okhdfcbank'
  const businessName = profile?.companyName || 'Krishna Enterprises'

  const _upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${testAmount}&cu=INR`

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Payments & Scan-to-Pay UPI QR</h3>
          <p className="section-subtext">
            Configure your instant payment QR code that appears on every PDF invoice and quotation.
          </p>
        </div>
      </div>

      <div className="payments-grid">
        {/* UPI QR Showcase Card */}
        <div className="upi-qr-card">
          <div className="qr-badge">INSTANT UPI COLLECTION</div>
          <h4 className="qr-business-title">{businessName}</h4>
          <p className="qr-upi-id">UPI ID: <strong>{upiId}</strong></p>

          {/* SVG QR Code Simulation */}
          <div className="qr-box-wrapper">
            <svg viewBox="0 0 100 100" className="upi-qr-svg">
              {/* Corner Finders */}
              <rect x="5" y="5" width="28" height="28" fill="#1e293b" rx="4" />
              <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="2" />
              <rect x="13" y="13" width="12" height="12" fill="#1e293b" rx="2" />

              <rect x="67" y="5" width="28" height="28" fill="#1e293b" rx="4" />
              <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="2" />
              <rect x="75" y="13" width="12" height="12" fill="#1e293b" rx="2" />

              <rect x="5" y="67" width="28" height="28" fill="#1e293b" rx="4" />
              <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="2" />
              <rect x="13" y="75" width="12" height="12" fill="#1e293b" rx="2" />

              {/* Data Dots Pattern */}
              <circle cx="45" cy="15" r="3" fill="#2563eb" />
              <circle cx="55" cy="20" r="3" fill="#1e293b" />
              <circle cx="40" cy="30" r="3" fill="#1e293b" />
              <circle cx="50" cy="35" r="3.5" fill="#2563eb" />
              <circle cx="60" cy="30" r="3" fill="#1e293b" />
              <circle cx="20" cy="50" r="3" fill="#1e293b" />
              <circle cx="35" cy="50" r="3" fill="#2563eb" />
              <circle cx="50" cy="50" r="4" fill="#0f172a" />
              <circle cx="65" cy="50" r="3" fill="#2563eb" />
              <circle cx="80" cy="50" r="3" fill="#1e293b" />
              <circle cx="45" cy="65" r="3" fill="#1e293b" />
              <circle cx="55" cy="70" r="3" fill="#2563eb" />
              <circle cx="40" cy="85" r="3" fill="#1e293b" />
              <circle cx="50" cy="80" r="3" fill="#2563eb" />
              <circle cx="60" cy="85" r="3" fill="#1e293b" />
            </svg>

            <div className="upi-app-logos">
              <span>GPay</span>
              <span>•</span>
              <span>PhonePe</span>
              <span>•</span>
              <span>Paytm</span>
              <span>•</span>
              <span>BHIM</span>
            </div>
          </div>

          <div className="test-amount-row">
            <label>Preview with Amount (₹):</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              className="amount-input-small"
            />
          </div>

          <button className="copy-upi-btn" onClick={handleCopy}>
            {copied ? '✓ Copied UPI ID' : '📋 Copy UPI ID'}
          </button>
        </div>

        {/* Bank Account Details Card */}
        <div className="bank-info-card">
          <h4>Direct Bank Transfer (NEFT / RTGS / IMPS)</h4>
          <p className="card-subtext">These details are automatically printed on the bottom of all invoices.</p>

          <div className="bank-details-list">
            <div className="bank-item">
              <span className="bank-label">Bank Name</span>
              <strong className="bank-val">{profile?.bankName || 'HDFC Bank Ltd'}</strong>
            </div>

            <div className="bank-item">
              <span className="bank-label">Account Number</span>
              <strong className="bank-val code-font">{profile?.accountNumber || '50200012345678'}</strong>
            </div>

            <div className="bank-item">
              <span className="bank-label">IFSC Code</span>
              <strong className="bank-val code-font">{profile?.ifsc || 'HDFC0000240'}</strong>
            </div>

            <div className="bank-item">
              <span className="bank-label">Branch</span>
              <strong className="bank-val">{profile?.branch || 'BKC Branch, Mumbai'}</strong>
            </div>

            <div className="bank-item">
              <span className="bank-label">Account Holder</span>
              <strong className="bank-val">{profile?.companyName || 'Krishna Enterprises'}</strong>
            </div>
          </div>

          <div className="payment-tip-box">
            <span>💡</span>
            <p>
              When clients pay via UPI, money settles directly into your bank account with zero merchant transaction fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
