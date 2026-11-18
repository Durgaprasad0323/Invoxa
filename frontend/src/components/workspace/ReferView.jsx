import React, { useState } from 'react'

export default function ReferView() {
  const [copied, setCopied] = useState(false)
  const referralLink = 'https://invoxa.io/signup?ref=KRISHNA_EXP2026'

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="workspace-view-container" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '24px 0 12px' }}>
        <span style={{ fontSize: 48 }}>🎁</span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '12px 0 6px', color: '#111827' }}>
          Refer a Fellow Business Owner &amp; Earn ₹500
        </h2>
        <p style={{ color: '#4b5563', fontSize: '0.95rem', maxWidth: 560, margin: '0 auto 24px' }}>
          Give your friends 3 months free on Invoxa Pro. When they issue their first 5 GST invoices, you get ₹500 directly in your bank account or invoice discount credits.
        </p>
      </div>

      {/* Referral Link Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: 24,
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        marginBottom: 28
      }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Your Personal Referral Link
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            readOnly
            value={referralLink}
            style={{ fontFamily: 'monospace', fontSize: '0.9rem', background: '#f9fafb' }}
          />
          <button className="btn-primary-action" onClick={handleCopy} style={{ minWidth: 120 }}>
            {copied ? '✅ Copied!' : '📋 Copy Link'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            className="btn-secondary-action"
            style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}
            onClick={() => window.open(`https://wa.me/?text=Hey!+I+use+Invoxa+for+super-fast+GST+invoicing,+e-way+bills+and+WhatsApp+quotes.+Get+3+months+free+with+my+link:+${encodeURIComponent(referralLink)}`, '_blank')}
          >
            <span>💬</span> Share on WhatsApp
          </button>
          <button
            className="btn-secondary-action"
            style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}
            onClick={() => window.open(`mailto:?subject=Try%20Invoxa%20Invoicing&body=Hey,%20check%20out%20Invoxa%20for%20GST%20billing:%20${encodeURIComponent(referralLink)}`)}
          >
            <span>✉️</span> Share via Email
          </button>
        </div>
      </div>

      {/* Rewards Milestones */}
      <div className="metrics-row" style={{ marginBottom: 28 }}>
        <div className="metric-card">
          <span className="metric-label">Businesses Referred</span>
          <span className="metric-value">4</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Successful Activations</span>
          <span className="metric-value" style={{ color: '#16a34a' }}>2</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Rewards Earned</span>
          <span className="metric-value" style={{ color: '#2563eb' }}>₹1,000</span>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>How the referral program works</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: '0.85rem', color: '#475569' }}>
          <div>
            <strong style={{ display: 'block', color: '#0f172a', marginBottom: 4 }}>1. Share your link</strong>
            Send to suppliers, retailers, or business network on WhatsApp or LinkedIn.
          </div>
          <div>
            <strong style={{ display: 'block', color: '#0f172a', marginBottom: 4 }}>2. They sign up</strong>
            They get 3 months of Pro features with custom invoice templates, design mixer and POS billing free.
          </div>
          <div>
            <strong style={{ display: 'block', color: '#0f172a', marginBottom: 4 }}>3. You get rewarded</strong>
            Instant ₹500 credited to your registered UPI handle upon their 5th invoice.
          </div>
        </div>
      </div>
    </div>
  )
}
