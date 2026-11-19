import React, { useEffect, useState } from 'react'
import { api } from '../../utils/apiClient'
import { PLAN_CATALOG } from '../../utils/plans'
import Icon from '../ui/Icon'

let checkoutScriptPromise

const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve()
  if (checkoutScriptPromise) return checkoutScriptPromise
  checkoutScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', () => reject(new Error('Razorpay Checkout could not be loaded.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = resolve
    script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded. Check your internet connection and try again.'))
    document.body.appendChild(script)
  }).catch(error => {
    checkoutScriptPromise = undefined
    throw error
  })
  return checkoutScriptPromise
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  initialPlan = 'pro',
  initialBillingCycle = 'yearly',
  currentUser = {},
  onSubscriptionSuccess
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle)
  const plan = PLAN_CATALOG.find(entry => entry.id === initialPlan && entry.id !== 'free') || PLAN_CATALOG.find(entry => entry.id === 'pro')
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice

  useEffect(() => {
    if (isOpen) {
      setLoading(false)
      setError('')
      setSuccessMsg('')
      setBillingCycle(initialBillingCycle)
    }
  }, [isOpen, initialPlan, initialBillingCycle])

  if (!isOpen) return null

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')
    try {
      const order = await api.createSubscriptionOrder(plan.id, billingCycle)
      await loadRazorpayCheckout()
      if (!window.Razorpay) throw new Error('Razorpay Checkout is unavailable in this browser.')

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Invoxa',
        description: `${plan.name} ${billingCycle} plan`,
        order_id: order.orderId,
        prefill: {
          name: currentUser.name || '',
          email: currentUser.email || '',
          contact: currentUser.phone || ''
        },
        theme: { color: '#15865a' },
        modal: { ondismiss: () => setLoading(false) },
        handler: async payment => {
          try {
            const result = await api.verifySubscriptionPayment({
              plan: plan.id,
              orderId: payment.razorpay_order_id,
              paymentId: payment.razorpay_payment_id,
              signature: payment.razorpay_signature
            })
            setSuccessMsg(`${plan.name} access is active through ${new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(result.user.subscriptionExpiry))}.`)
            if (onSubscriptionSuccess) onSubscriptionSuccess(result.user)
            setTimeout(() => onClose?.(), 1400)
          } catch (verificationError) {
            setError(verificationError.message || 'Payment could not be verified. Your plan has not changed.')
          } finally {
            setLoading(false)
          }
        }
      })

      checkout.on('payment.failed', response => {
        setError(response?.error?.description || 'Payment failed. Your current plan stays active.')
        setLoading(false)
      })
      checkout.open()
    } catch (checkoutError) {
      setError(checkoutError.message || 'Checkout could not be started. Your current plan stays active.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop plan-checkout-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !loading) onClose?.() }}>
      <div className="modal-container plan-checkout-modal" role="dialog" aria-modal="true" aria-labelledby="plan-checkout-title">
        <div className="plan-checkout-header">
          <div><span>INVOXA PLAN</span><h2 id="plan-checkout-title">{successMsg ? 'Payment confirmed' : `Subscribe to ${plan.name}`}</h2></div>
          <button type="button" aria-label="Close" disabled={loading} onClick={onClose}>×</button>
        </div>

        {successMsg ? (
          <div className="plan-checkout-success"><span className="plan-checkout-success-icon"><Icon name="checkCircle" size={22} /></span><h3>Plan activated</h3><p>{successMsg}</p><small>Your account access has been updated.</small></div>
        ) : (
          <>
            <div className="plan-checkout-summary">
              <div><strong>{plan.name} {billingCycle} plan</strong><span>{billingCycle === 'monthly' ? 'One month' : 'One year'} of access · no automatic renewal</span></div>
              <b>₹{price.toLocaleString('en-IN')}<small> / {billingCycle === 'monthly' ? 'month' : 'year'}</small></b>
            </div>
            <div className="plan-checkout-billing-switch" role="group" aria-label="Billing period">
              <button type="button" aria-pressed={billingCycle === 'monthly'} className={billingCycle === 'monthly' ? 'selected' : ''} onClick={() => setBillingCycle('monthly')} disabled={loading}>Monthly</button>
              <button type="button" aria-pressed={billingCycle === 'yearly'} className={billingCycle === 'yearly' ? 'selected' : ''} onClick={() => setBillingCycle('yearly')} disabled={loading}>Annual</button>
            </div>
            <ul className="plan-checkout-includes">{plan.features.slice(1).map(feature => <li key={feature}><Icon name="checkCircle" size={14} />{feature}</li>)}</ul>
            {error && <div className="plan-checkout-error" role="alert">{error}</div>}
            <button type="button" className="plan-checkout-pay-button" disabled={loading} onClick={handleSubscribe}>
              {loading ? 'Opening secure checkout…' : `Continue to payment · ₹${price.toLocaleString('en-IN')}`}
            </button>
            <p className="plan-checkout-caption">Your plan changes only after Invoxa verifies the payment with Razorpay. Cancelled or failed payments leave your current access unchanged.</p>
          </>
        )}
      </div>
    </div>
  )
}
