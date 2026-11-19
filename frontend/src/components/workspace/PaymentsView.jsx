import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Icon from '../ui/Icon'

export default function PaymentsView({ profile = {} }) {
  const [testAmount, setTestAmount] = useState('5000')
  const [copied, setCopied] = useState(false)

  const upiId = profile.upiId?.trim() || ''
  const businessName = profile.companyName || profile.name || 'Your business'
  const upiUrl = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}${testAmount ? `&am=${encodeURIComponent(testAmount)}` : ''}&cu=INR`
    : ''
  const bankDetails = [
    ['Bank Name', profile.bankName],
    ['Account Number', profile.accountNumber],
    ['IFSC Code', profile.ifsc],
    ['Branch', profile.branch]
  ].filter(([, value]) => value)

  const handleCopy = async () => {
    if (!upiId || !navigator.clipboard?.writeText) return
    try {
      await navigator.clipboard.writeText(upiId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Payments & Scan-to-Pay UPI QR</h3>
          <p className="section-subtext">Your saved UPI and bank details are used on invoices. Update them any time in Settings.</p>
        </div>
      </div>

      <div className="payments-grid">
        <div className="upi-qr-card">
          <div className="qr-badge">UPI PAYMENT DETAILS</div>
          <h4 className="qr-business-title">{businessName}</h4>
          {upiId ? <p className="qr-upi-id">UPI ID: <strong>{upiId}</strong></p> : <p className="qr-upi-id">Add your UPI ID or upload a QR in Settings.</p>}

          <div className="qr-box-wrapper">
            {profile.upiQrUrl ? (
              <img className="payments-uploaded-qr" src={profile.upiQrUrl} alt={`${businessName} UPI payment QR`} />
            ) : upiUrl ? (
              <QRCodeSVG value={upiUrl} size={180} level="M" includeMargin />
            ) : (
              <div className="payments-no-qr">No UPI QR configured</div>
            )}
            <div className="upi-app-logos"><span>GPay</span><span>·</span><span>PhonePe</span><span>·</span><span>Paytm</span><span>·</span><span>BHIM</span></div>
          </div>

          {profile.upiQrUrl ? (
            <p className="payments-qr-note">This is your uploaded QR. Its payment details and amount are set by the QR image.</p>
          ) : upiId ? (
            <div className="test-amount-row">
              <label htmlFor="payments-test-amount">QR preview amount (₹):</label>
              <input id="payments-test-amount" type="number" min="1" value={testAmount} onChange={event => setTestAmount(event.target.value)} className="amount-input-small" />
            </div>
          ) : null}

          <button className="copy-upi-btn" onClick={handleCopy} disabled={!upiId}>
            <Icon name={copied ? 'checkCircle' : 'copy'} size={14} /> {copied ? 'Copied UPI ID' : 'Copy UPI ID'}
          </button>
        </div>

        <div className="bank-info-card">
          <h4>Direct Bank Transfer (NEFT / RTGS / IMPS)</h4>
          <p className="card-subtext">These saved details are included on new invoices.</p>

          {bankDetails.length > 0 ? (
            <div className="bank-details-list">
              {bankDetails.map(([label, value]) => (
                <div className="bank-item" key={label}>
                  <span className="bank-label">{label}</span>
                  <strong className="bank-val">{value}</strong>
                </div>
              ))}
              {businessName && <div className="bank-item"><span className="bank-label">Account Holder</span><strong className="bank-val">{businessName}</strong></div>}
            </div>
          ) : (
            <p className="payments-empty-details">No bank details saved yet. Add your account in Settings.</p>
          )}

          <div className="payment-tip-box">
            <span><Icon name="info" size={18} /></span>
            <p>UPI payments go directly to the account linked to your UPI ID. Invoxa does not process these transfers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
