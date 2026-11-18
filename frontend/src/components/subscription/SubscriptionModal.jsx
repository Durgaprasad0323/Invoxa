import React, { useState } from 'react'
import { api } from '../../utils/apiClient'

export default function SubscriptionModal({ isOpen, onClose, currentPlan = 'free', onSubscriptionSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      // 1. Create order
      const order = await api.createSubscriptionOrder(selectedPlan)
      
      // 2. Process & verify payment
      const res = await api.verifySubscriptionPayment(order.orderId, selectedPlan)
      
      setSuccessMsg(`🎉 Success! Your account is now upgraded to ${selectedPlan.toUpperCase()}!`)
      setTimeout(() => {
        if (onSubscriptionSuccess) {
          onSubscriptionSuccess(res.user)
        }
        onClose()
      }, 1500)
    } catch (err) {
      alert('Subscription payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 620,
          background: '#ffffff',
          borderRadius: 16,
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)'
        }}
      >
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '28px 24px 20px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 18,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#ffffff',
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>

          <span style={{
            background: '#eab308',
            color: '#713f12',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}>
            PREMIUM PLAN
          </span>
          <h2 style={{ margin: '10px 0 4px', fontSize: '1.6rem', fontWeight: 800 }}>
            Unlock Pro Billing Features
          </h2>
          <p style={{ margin: 0, color: '#93c5fd', fontSize: '0.9rem' }}>
            Remove watermarks from all customer bills and unlock unlimited invoicing power.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {successMsg ? (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#15803d',
              borderRadius: 12,
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
              <h3 style={{ margin: '0 0 6px', fontWeight: 800 }}>Congratulations!</h3>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{successMsg}</p>
            </div>
          ) : (
            <>
              {/* Feature Checklist */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 24,
                background: '#f8fafc',
                padding: '16px',
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#0f172a' }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                  <strong>No Watermarks on PDFs</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#0f172a' }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                  <span>Unlimited Tax Invoices</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#0f172a' }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                  <span>Instant Scan &amp; Pay UPI QR</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#0f172a' }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                  <span>Multi-User Staff Collaboration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#0f172a' }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                  <span>All 10 Designer Templates</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#0f172a' }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                  <span>Priority WhatsApp Support</span>
                </div>
              </div>

              {/* Pricing Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {/* Pro Yearly (Selected) */}
                <div
                  onClick={() => setSelectedPlan('pro')}
                  style={{
                    border: `2px solid ${selectedPlan === 'pro' ? '#15865a' : '#e2e8f0'}`,
                    background: selectedPlan === 'pro' ? '#f0fdf4' : '#ffffff',
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: -10,
                    right: 12,
                    background: '#15865a',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    POPULAR
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Pro Plan</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15865a', margin: '6px 0 2px' }}>
                    ₹2,999 <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>/ year</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15865a', fontWeight: 600 }}>Just ₹249 / month</div>
                </div>

                {/* Enterprise */}
                <div
                  onClick={() => setSelectedPlan('enterprise')}
                  style={{
                    border: `2px solid ${selectedPlan === 'enterprise' ? '#15865a' : '#e2e8f0'}`,
                    background: selectedPlan === 'enterprise' ? '#f0fdf4' : '#ffffff',
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Enterprise</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>
                    ₹9,999 <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>/ year</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Custom domain + dedicated API</div>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #15865a 0%, #0f6342 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(21, 134, 90, 0.3)'
                }}
              >
                {loading ? 'Processing Secure Payment…' : `Pay & Activate ${selectedPlan === 'pro' ? '₹2,999' : '₹9,999'} / Year 🚀`}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.78rem', color: '#94a3b8' }}>
                🔒 256-Bit Encrypted Checkout · Supports UPI, Cards, NetBanking
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
