import React, { useState } from 'react'
import { formatINR } from '../../utils/calculations'
import { getEffectivePlan, hasPlanAccess, PLAN_CATALOG } from '../../utils/plans'
import Icon from '../ui/Icon'

const dateLabel = value => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}

export default function SubscriptionsView({ currentUser = {}, proTrial, onChoosePlan }) {
  const [billingCycle, setBillingCycle] = useState('yearly')
  const currentPlan = getEffectivePlan(currentUser)
  const storedPlan = currentUser.plan || 'free'
  const expiryDate = dateLabel(currentUser.subscriptionExpiry)
  const hasExpired = storedPlan !== 'free' && currentPlan === 'free'

  return (
    <div className="workspace-view-container plans-page">
      <div className="plans-page-heading">
        <div>
          <span className="plans-eyebrow">INVOXA PLANS</span>
          <h2>Choose the right plan for your business</h2>
          <p>Compare the tools in each plan. Paid access starts after payment is verified; features marked as planned are not available yet.</p>
        </div>
        <div className="plans-current-card">
          <span>YOUR CURRENT PLAN</span>
          <strong>{PLAN_CATALOG.find(plan => plan.id === currentPlan)?.name || 'Free'}</strong>
          {hasExpired ? <small>Your previous plan expired. Choose a plan to restore its features.</small> : expiryDate ? <small>Access through {expiryDate}</small> : <small>Core billing access</small>}
          {proTrial?.active && <small>Free Pro trial: {proTrial.creationsRemaining} creations left · {proTrial.daysRemaining} days left.</small>}
          {proTrial?.started && !proTrial.active && <small>Your free Pro trial has ended. Subscribe to keep Pro features.</small>}
        </div>
      </div>

      <div className="plans-billing-switch" role="group" aria-label="Billing period">
        <button type="button" aria-pressed={billingCycle === 'monthly'} className={billingCycle === 'monthly' ? 'selected' : ''} onClick={() => setBillingCycle('monthly')}>Monthly</button>
        <button type="button" aria-pressed={billingCycle === 'yearly'} className={billingCycle === 'yearly' ? 'selected' : ''} onClick={() => setBillingCycle('yearly')}>Annual</button>
      </div>

      <div className="plans-grid">
        {PLAN_CATALOG.map(plan => {
          const isCurrent = currentPlan === plan.id
          const isIncluded = hasPlanAccess(currentUser, plan.id) && !isCurrent
          const canBuy = plan.id !== 'free' && !isCurrent && !isIncluded
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
          return (
            <article className={`plan-card ${plan.popular ? 'plan-card-popular' : ''} ${isCurrent ? 'plan-card-current' : ''}`} key={plan.id}>
              {plan.popular && <span className="plan-popular-ribbon">MOST POPULAR</span>}
              <div className="plan-card-top">
                <div>
                  <h3>{plan.name}</h3>
                  <p>{plan.summary}</p>
                </div>
                {isCurrent && <span className="plan-current-badge">Current plan</span>}
              </div>
              <div className="plan-price-row">
                <strong>{price === 0 ? 'Free' : formatINR(price)}</strong>
                {price > 0 && <span>/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>}
              </div>
              <div className="plan-billing-note">{price > 0 ? `${billingCycle === 'monthly' ? 'One month' : 'One year'} of access · no automatic renewal` : 'Free forever · Pro trial starts on your first Pro feature'}</div>
              <ul className="plan-feature-list">
                {plan.features.map(feature => <li key={feature}><Icon name="checkCircle" size={14} />{feature}</li>)}
              </ul>
              {plan.plannedFeatures?.length > 0 && (
                <div className="plan-planned-features">
                  <strong>Planned for {plan.name} · not unlocked yet</strong>
                  <ul>{plan.plannedFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
                  {plan.planNotes?.map(note => <p key={note}>{note}</p>)}
                </div>
              )}
              <button
                type="button"
                className={`plan-choose-button ${plan.popular ? 'plan-choose-primary' : ''}`}
                disabled={!canBuy}
                onClick={() => canBuy && onChoosePlan?.(plan.id, billingCycle)}
              >
                {isCurrent ? 'Current plan' : isIncluded ? `Included with ${PLAN_CATALOG.find(entry => entry.id === currentPlan)?.name}` : plan.id === 'free' ? 'Included on signup' : `Choose ${plan.name}`}
              </button>
            </article>
          )
        })}
      </div>

      <div className="plans-access-note">
        <strong>How plan access works</strong>
        <p>Eligible free accounts get Pro access for 7 days or 3 Pro document creations, whichever comes first. The trial starts when a user first opens a Pro feature. Invoxa AI stays free. A paid plan activates only after payment is verified; cancelled or failed payments do not change the current plan.</p>
      </div>
    </div>
  )
}
