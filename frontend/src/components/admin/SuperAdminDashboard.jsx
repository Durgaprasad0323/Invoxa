import React, { useState, useEffect } from 'react'
import { api } from '../../utils/apiClient'
import { formatINR } from '../../utils/calculations'

export default function SuperAdminDashboard({ user, onSwitchToWorkspace, onLogout }) {
  const [stats, setStats] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers()
      ])
      setStats(statsData)
      setUsersList(usersData.users || [])
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePlanChange = async (userId, newPlan) => {
    try {
      await api.updateUserPlan(userId, newPlan)
      setActionMsg(`Plan updated to ${newPlan.toUpperCase()}!`)
      setTimeout(() => setActionMsg(''), 3000)
      loadData()
    } catch {
      alert('Failed to update plan.')
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      await api.toggleUserStatus(userId)
      setActionMsg('User status updated!')
      setTimeout(() => setActionMsg(''), 3000)
      loadData()
    } catch {
      alert('Failed to toggle user status.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b1329', color: '#f8fafc', padding: '30px 5%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '1px solid #1e293b', paddingBottom: 20, flexWrap: 'wrap', gap: 15 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800 }}>SUPER ADMIN</span>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Platform Command Center</h2>
          </div>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Logged in as <strong>{user?.name || 'Master Admin'}</strong> ({user?.email})
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={onSwitchToWorkspace}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            🏢 Open Billing Workspace →
          </button>
          <button
            onClick={onLogout}
            style={{
              background: '#334155',
              color: '#f8fafc',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ background: '#1e3a8a', border: '1px solid #3b82f6', color: '#bfdbfe', padding: '10px 16px', borderRadius: 8, marginBottom: 20 }}>
          ✓ {actionMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading platform intelligence…</div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 35 }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: 12, border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Total Registered Businesses</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#38bdf8' }}>{stats?.totalCompanies || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 4 }}>Across all industries</div>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: 12, border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Total Platform Invoices</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#34d399' }}>{stats?.totalInvoices || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 4 }}>Billed through Invoxa</div>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: 12, border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Gross Invoiced Volume</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: '#fbbf24' }}>
                {stats?.totalPlatformVolume ? formatINR(stats.totalPlatformVolume) : '₹0'}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 4 }}>Total customer economy</div>
            </div>

            <div style={{ background: '#1e293b', padding: '20px', borderRadius: 12, border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Subscription Revenue</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: '#a78bfa' }}>
                {stats?.subscriptionRevenue ? formatINR(stats.subscriptionRevenue) : '₹0'}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 4 }}>
                {stats?.paidSubscriptions || 0} Pro subscribers
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Registered Users & Companies</h3>
              <button
                onClick={loadData}
                style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                🔄 Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '12px 10px' }}>User / Owner</th>
                    <th style={{ padding: '12px 10px' }}>Company</th>
                    <th style={{ padding: '12px 10px' }}>Role</th>
                    <th style={{ padding: '12px 10px' }}>Plan</th>
                    <th style={{ padding: '12px 10px' }}>Status</th>
                    <th style={{ padding: '12px 10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #273549' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{u.companyName || '—'}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: u.role === 'super_admin' ? '#1e3a8a' : '#064e3b',
                          color: u.role === 'super_admin' ? '#93c5fd' : '#a7f3d0'
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <select
                          value={u.plan || 'free'}
                          onChange={(e) => handlePlanChange(u.id, e.target.value)}
                          style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          <option value="free">Free Plan</option>
                          <option value="pro">Pro (₹2,999/yr)</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: u.status === 'suspended' ? '#7f1d1d' : '#064e3b',
                          color: u.status === 'suspended' ? '#fca5a5' : '#a7f3d0'
                        }}>
                          {(u.status || 'active').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {u.role !== 'super_admin' && (
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            style={{
                              background: u.status === 'suspended' ? '#059669' : '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
