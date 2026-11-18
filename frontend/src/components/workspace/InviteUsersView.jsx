import React, { useState } from 'react'

const SAMPLE_USERS = [
  { id: 'usr1', name: 'Krishna (Owner)', email: 'krishna@invoxa.io', role: 'Super Admin', status: 'Active', addedOn: '2026-10-01' },
  { id: 'usr2', name: 'Ramesh Verma', email: 'ramesh.verma@invoxa.io', role: 'Billing Operator', status: 'Active', addedOn: '2026-10-15' },
  { id: 'usr3', name: 'Sneha Patel, CA', email: 'sneha.audit@taxca.in', role: 'Accountant (Read/Export)', status: 'Active', addedOn: '2026-11-02' },
]

export default function InviteUsersView() {
  const [users, setUsers] = useState(SAMPLE_USERS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'Billing Operator' })
  const [toast, setToast] = useState('')

  const handleInvite = () => {
    if (!form.name || !form.email) return
    const newUser = {
      id: `usr_${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      status: 'Invite Sent',
      addedOn: new Date().toISOString().split('T')[0]
    }
    setUsers(prev => [...prev, newUser])
    setForm({ name: '', email: '', role: 'Billing Operator' })
    setShowModal(false)
    setToast(`✉️ Invitation sent to ${form.email}`)
    setTimeout(() => setToast(''), 3500)
  }

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Team & Access Control</h3>
          <p className="section-subtext">Invite billing clerks, warehouse managers, and external Chartered Accountants with role-based permissions.</p>
        </div>
        <button className="btn-primary-action" onClick={() => setShowModal(true)}>+ Invite Team Member</button>
      </div>

      {toast && (
        <div className="workspace-toast-pill" style={{ position: 'relative', marginBottom: 12, top: 'auto', left: 'auto', transform: 'none' }}>
          <span>{toast}</span>
        </div>
      )}

      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Team Members</span>
          <span className="metric-value">{users.length} / 5</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Assigned Roles</span>
          <span className="metric-value">3 Roles</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Workspace Plan</span>
          <span className="metric-value" style={{ color: '#2563eb' }}>Pro Multi-user</span>
        </div>
      </div>

      <div className="swipe-table-wrap">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email Address</th>
              <th>Access Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><span className="badge-pill template-pill">{u.role}</span></td>
                <td>
                  <span className={`status-pill ${u.status === 'Active' ? 'pill-paid' : 'pill-draft'}`}>
                    {u.status}
                  </span>
                </td>
                <td>{u.addedOn}</td>
                <td>
                  <div className="row-actions">
                    {u.role !== 'Super Admin' && (
                      <button className="row-action-btn danger" title="Remove User" onClick={() => setUsers(prev => prev.filter(x => x.id !== u.id))}>🗑️</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Member to Workspace</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Full Name *</label>
                <input className="form-input" placeholder="e.g. Suresh Nair"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Email Address *</label>
                <input className="form-input" type="email" placeholder="e.g. suresh@company.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Permission Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option>Billing Operator (Create & Print Invoices)</option>
                  <option>Accountant (Read All, GST & Balance Sheet Export)</option>
                  <option>Sales Manager (Invoices + Quotations)</option>
                  <option>Inventory In-charge (Stock In/Out)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-action" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-action" onClick={handleInvite}>Send Invitation Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
