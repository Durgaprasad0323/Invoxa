import React, { useState } from 'react'
import Icon from '../ui/Icon'

export default function WorkspaceSidebar({
  activeTab,
  setActiveTab,
  onBackToPublicSite,
  currentUser,
  businessProfile,
  invoicesCount = 0,
  quotesCount = 0,
  customersCount = 0,
  productsCount = 0,
  mobileOpen = false,
  onCloseMobile
}) {
  const [salesOpen, setSalesOpen] = useState(true)

  const companyDisplayName = businessProfile?.name || currentUser?.companyName || currentUser?.name || 'My Company'
  const userInitials = (currentUser?.name || companyDisplayName || 'ME')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ME'

  const handleNav = (tab) => {
    setActiveTab(tab)
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <aside className={`swipe-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand & Company Switcher */}
      <div className="swipe-sidebar-header">
        <div className="company-badge-row">
          <div className="company-avatar">{userInitials}</div>
          <div className="company-info" style={{ overflow: 'hidden' }}>
            <h4 className="company-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {companyDisplayName}
            </h4>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser?.email || 'Logged In'}
            </span>
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            className="mobile-sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close Sidebar"
          >
            <Icon name="x" size={19} />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="swipe-nav-list">
        {/* Sales Group (Expandable) */}
        <div className="nav-group">
          <div
            className={`nav-item has-submenu ${['invoices', 'pos', 'credit-notes', 'einvoices', 'ewaybills', 'subscriptions'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => setSalesOpen(!salesOpen)}
          >
            <div className="nav-item-left">
              <span className="nav-icon"><Icon name="receipt" /></span>
              <span className="nav-label">Sales</span>
            </div>
            <span className="submenu-caret">{salesOpen ? '▾' : '▸'}</span>
          </div>

          {salesOpen && (
            <div className="nav-submenu">
              <div
                className={`submenu-item ${activeTab === 'invoices' ? 'active' : ''}`}
                onClick={() => handleNav('invoices')}
              >
                <span>Invoices</span>
                {invoicesCount > 0 && <span className="item-counter">{invoicesCount}</span>}
              </div>
              <div
                className={`submenu-item ${activeTab === 'pos' ? 'active' : ''}`}
                onClick={() => handleNav('pos')}
              >
                <span>POS Billing</span>
              </div>
              <div
                className={`submenu-item ${activeTab === 'credit-notes' ? 'active' : ''}`}
                onClick={() => handleNav('credit-notes')}
              >
                <span>Credit Notes</span>
              </div>
              <div
                className={`submenu-item ${activeTab === 'einvoices' ? 'active' : ''}`}
                onClick={() => handleNav('einvoices')}
              >
                <span>E-Invoices</span>
              </div>
              <div
                className={`submenu-item ${activeTab === 'ewaybills' ? 'active' : ''}`}
                onClick={() => handleNav('ewaybills')}
              >
                <span>E-Way Bills</span>
              </div>
              <div
                className={`submenu-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
                onClick={() => handleNav('subscriptions')}
              >
                <span>Subscriptions</span>
              </div>
            </div>
          )}
        </div>

        {/* Purchases */}
        <div
          className={`nav-item ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => handleNav('purchases')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="shoppingCart" /></span>
            <span className="nav-label">Purchases</span>
          </div>
        </div>

        {/* Quotations+ */}
        <div
          className={`nav-item ${activeTab === 'quotations' ? 'active' : ''}`}
          onClick={() => handleNav('quotations')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="fileCheck" /></span>
            <span className="nav-label">Quotations+</span>
          </div>
          {quotesCount > 0 && <span className="item-counter quote-counter">{quotesCount}</span>}
        </div>

        {/* Expenses+ */}
        <div
          className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => handleNav('expenses')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="chartDown" /></span>
            <span className="nav-label">Expenses+</span>
          </div>
        </div>

        {/* AI Invoicing (SwipeAI style) */}
        <div
          className={`nav-item ai-nav-item ${activeTab === 'ai-generator' ? 'active' : ''}`}
          onClick={() => handleNav('ai-generator')}
        >
          <div className="nav-item-left">
            <span className="nav-icon ai-sparkle"><Icon name="sparkles" /></span>
            <span className="nav-label">Invoxa AI</span>
          </div>
          <span className="badge-pill ai-pill">Fast</span>
        </div>

        {/* Products & Services */}
        <div
          className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleNav('products')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="package" /></span>
            <span className="nav-label">Products & Services</span>
          </div>
          {productsCount > 0 && <span className="item-counter">{productsCount}</span>}
        </div>

        {/* Inventory */}
        <div
          className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleNav('inventory')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="boxes" /></span>
            <span className="nav-label">Inventory</span>
          </div>
        </div>

        {/* Payments */}
        <div
          className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => handleNav('payments')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="creditCard" /></span>
            <span className="nav-label">Payments</span>
          </div>
        </div>

        {/* Customers */}
        <div
          className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => handleNav('customers')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="users" /></span>
            <span className="nav-label">Customers</span>
          </div>
          {customersCount > 0 && <span className="item-counter">{customersCount}</span>}
        </div>

        {/* Invoice Template & Mixers */}
        <div
          className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => handleNav('templates')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="layout" /></span>
            <span className="nav-label">Invoice Template &amp; Mixers</span>
          </div>
        </div>

        {/* Developer API & MCP */}
        <div
          className={`nav-item developer-api-nav-item ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => handleNav('api')}
        >
          <div className="nav-item-left">
            <span className="nav-icon"><Icon name="code" /></span>
            <span className="nav-label">Developer API</span>
          </div>
          <span className="badge-pill mcp-pill">MCP</span>
        </div>
      </nav>

      {/* Fixed Stable Bottom Section */}
      <div className="swipe-sidebar-footer">
        <div className="sidebar-fixed-nav">
          {/* Invite Users */}
          <div
            className={`nav-item ${activeTab === 'invite-users' ? 'active' : ''}`}
            onClick={() => handleNav('invite-users')}
          >
            <div className="nav-item-left">
              <span className="nav-icon"><Icon name="userPlus" /></span>
              <span className="nav-label">Invite Users</span>
            </div>
          </div>

          {/* Settings */}
          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleNav('settings')}
          >
            <div className="nav-item-left">
              <span className="nav-icon"><Icon name="settings" /></span>
              <span className="nav-label">Settings</span>
            </div>
          </div>

          {/* Refer a friend */}
          <div
            className={`nav-item ${activeTab === 'refer' ? 'active' : ''}`}
            onClick={() => handleNav('refer')}
          >
            <div className="nav-item-left">
              <span className="nav-icon"><Icon name="gift" /></span>
              <span className="nav-label">Refer a friend</span>
            </div>
          </div>
        </div>

        {/* Subscribe Promo Card */}
        <div className="subscribe-promo-card">
          <p className="promo-text">Compare plans and unlock more tools</p>
          <button className="promo-subscribe-btn" onClick={() => handleNav('subscriptions')}>View Plans</button>
        </div>

        <button className="back-website-btn" onClick={onBackToPublicSite} style={{ marginBottom: 6 }}>
          <Icon name="globe" size={16} /> View Public Website
        </button>

        <button
          className="back-website-btn"
          onClick={onBackToPublicSite}
          style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}
          title="Sign out of this account"
        >
          <Icon name="logOut" size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
