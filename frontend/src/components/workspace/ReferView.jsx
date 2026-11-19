import React, { useState } from 'react'
import Icon from '../ui/Icon'

export default function ReferView({ currentUser = {} }) {
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const shareUrl = typeof window === 'undefined' ? '' : ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'https://invoxa-lime.vercel.app' : window.location.origin
  const businessName = currentUser.companyName || currentUser.name || 'a business owner'
  const shareMessage = `I use Invoxa to create invoices and manage business records. Take a look: ${shareUrl}`

  const copyLink = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable in this browser.')
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setMessage('Link copied. You can share it with a friend.')
      setTimeout(() => setCopied(false), 2500)
    } catch (error) {
      setMessage(error.message || 'Could not copy the link. Select and copy it from the field.')
    }
  }

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank', 'noopener,noreferrer')
  const shareEmail = () => window.location.href = `mailto:?subject=${encodeURIComponent(`${businessName} recommends Invoxa`)}&body=${encodeURIComponent(`Hello,\n\nI use Invoxa for my business invoices and records. You can see the platform here: ${shareUrl}\n\n${businessName}`)}`

  return (
    <div className="workspace-view-container refer-page">
      <div className="refer-hero"><span className="refer-icon"><Icon name="link" size={25} /></span><span className="purchases-eyebrow">SHARE INVOXA</span><h2>Refer a friend</h2><p>Share Invoxa with another business owner. They can explore the platform and create an account.</p></div>

      <section className="refer-share-card">
        <label htmlFor="refer-share-url">Invoxa website link</label>
        <div className="refer-link-row"><input id="refer-share-url" readOnly value={shareUrl} onFocus={event => event.target.select()} /><button type="button" className="btn-primary-action" onClick={copyLink}>{copied ? 'Copied' : 'Copy link'}</button></div>
        <div className="refer-share-actions"><button type="button" className="btn-secondary-action" onClick={shareWhatsApp}>Share on WhatsApp</button><button type="button" className="btn-secondary-action" onClick={shareEmail}>Share by email</button></div>
        {message && <p className="refer-feedback" role="status">{message}</p>}
      </section>

      <section className="refer-status-card"><div><strong>Referral tracking and rewards</strong><p>This app currently shares the website link only. It does not track signups or award referral rewards yet.</p></div><span className="refer-status-badge">Not active</span></section>

      <section className="refer-steps-card"><h3>How sharing works</h3><div className="refer-steps-grid"><article><span>01</span><h4>Share the link</h4><p>Send it to a friend or another business owner.</p></article><article><span>02</span><h4>They explore Invoxa</h4><p>They can view the website and sign up on their own.</p></article><article><span>03</span><h4>Referral credit</h4><p>Signup attribution and reward tracking are not enabled yet.</p></article></div></section>
    </div>
  )
}
