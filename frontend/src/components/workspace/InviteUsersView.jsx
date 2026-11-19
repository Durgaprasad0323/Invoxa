import React, { useEffect, useMemo, useState } from 'react'
import Icon from '../ui/Icon'

const ROLES = ['Admin', 'Sales', 'Accountant', 'Staff']
const dateLabel = value => value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'
const getShareUrl = () => typeof window === 'undefined' ? '' : ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'https://invoxa-lime.vercel.app' : window.location.origin

export default function InviteUsersView({ currentUser = {}, searchQuery = '' }) {
  const storageKey = `invoxa_invite_drafts_${currentUser.companyId || currentUser.id || currentUser.email || 'workspace'}`
  const [invites, setInvites] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(storageKey)); return Array.isArray(saved) ? saved : [] } catch { return [] }
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'Staff' })
  const [error, setError] = useState('')
  const query = searchQuery.trim().toLowerCase()
  const visible = useMemo(() => invites.filter(invite => !query || [invite.name, invite.email, invite.role].some(value => String(value || '').toLowerCase().includes(query))), [invites, query])

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(invites)) } catch { }
  }, [storageKey, invites])

  const prepareInvite = event => {
    event.preventDefault()
    if (!form.email.trim()) { setError('Enter the email address for the invite.'); return }
    const invite = { id: `invite_${Date.now()}`, name: form.name.trim(), email: form.email.trim(), role: form.role, status: 'Email draft prepared', createdAt: new Date().toISOString() }
    const company = currentUser.companyName || 'your business'
    const subject = `Invoxa workspace invitation for ${company}`
    const body = `Hello,\n\nI would like to invite you to collaborate with ${company} on Invoxa as a ${form.role}.\n\nOpen ${getShareUrl()} to visit Invoxa. Workspace membership and role permissions must be enabled by the account administrator after signup.\n\nThank you.`
    const nextInvites = [invite, ...invites]
    try { localStorage.setItem(storageKey, JSON.stringify(nextInvites)) } catch { }
    setInvites(nextInvites)
    setForm({ name: '', email: '', role: 'Staff' })
    setShowForm(false)
    setError('')
    window.location.href = `mailto:${encodeURIComponent(invite.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const removeDraft = invite => {
    if (window.confirm(`Remove the invite draft for ${invite.email}?`)) setInvites(previous => previous.filter(item => item.id !== invite.id))
  }

  const ownerName = currentUser.name || 'Workspace owner'
  const ownerEmail = currentUser.email || ''

  return (
    <div className="workspace-view-container invite-users-page">
      <div className="table-controls-bar purchases-heading"><div><h3>Team members</h3><p className="section-subtext">Prepare team invitations and keep track of the people you plan to add.</p></div><button type="button" className="btn-primary-action" onClick={() => { setError(''); setShowForm(true) }}>+ Invite member</button></div>
      <div className="metrics-row purchases-metrics"><div className="metric-card"><span className="metric-label">Workspace owner</span><span className="metric-value invite-owner-name">{ownerName}</span></div><div className="metric-card"><span className="metric-label">Invite drafts</span><span className="metric-value">{invites.length}</span></div><div className="metric-card"><span className="metric-label">Active team members</span><span className="metric-value">1</span></div></div>
      <div className="invite-status-note"><strong>Invitations are not activated in the app yet.</strong><span>This page prepares an email draft and saves it on this device. Team login, shared access and role permissions still need backend support.</span></div>
      <div className="swipe-table-wrap purchases-table-wrap"><table className="swipe-table purchases-table"><thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Status</th><th>Added</th><th>Action</th></tr></thead><tbody>
        {ownerEmail && <tr><td><strong>{ownerName}</strong></td><td>{ownerEmail}</td><td><span className="badge-pill template-pill">Owner</span></td><td><span className="status-pill pill-paid">Active</span></td><td>Account owner</td><td>—</td></tr>}
        {visible.map(invite => <tr key={invite.id}><td><strong>{invite.name || 'New team member'}</strong></td><td>{invite.email}</td><td><span className="badge-pill template-pill">{invite.role}</span></td><td><span className="status-pill purchase-status-unpaid">{invite.status}</span></td><td>{dateLabel(invite.createdAt)}</td><td><button type="button" className="row-action-btn danger" title="Remove draft" aria-label={`Remove draft for ${invite.email}`} onClick={() => removeDraft(invite)}><Icon name="trash" size={15} /></button></td></tr>)}
        {!ownerEmail && visible.length === 0 && <tr><td colSpan={6} className="empty-row">No invite drafts yet. Prepare an email draft to get started.</td></tr>}
        {ownerEmail && visible.length === 0 && <tr><td colSpan={6} className="empty-row">No team invitations prepared yet.</td></tr>}
      </tbody></table></div>

      {showForm && <div className="purchase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false) }}><form className="purchase-modal invite-modal" onSubmit={prepareInvite} role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
        <header className="purchase-modal-header"><div><span className="purchases-eyebrow">TEAM</span><h2 id="invite-modal-title">Prepare an invite</h2><p>This opens a message in your email app for you to send.</p></div><button type="button" className="purchase-modal-close" aria-label="Close invite form" onClick={() => setShowForm(false)}>×</button></header>
        <div className="purchase-modal-content"><div className="purchase-form-grid"><label className="purchase-field">Name<input autoFocus value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Optional" /></label><label className="purchase-field">Email address *<input type="email" required value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} /></label><label className="purchase-field purchase-field-wide">Requested role<select value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value }))}>{ROLES.map(role => <option key={role}>{role}</option>)}</select></label></div>{error && <p className="purchase-form-error" role="alert">{error}</p>}<p className="invite-role-note">The requested role is included in the email only. It does not grant permissions yet.</p></div>
        <footer className="purchase-modal-footer"><button type="button" className="btn-secondary-action" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary-action">Open email draft</button></footer>
      </form></div>}
    </div>
  )
}
