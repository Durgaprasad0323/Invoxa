import React from 'react'

export default function WorkspaceHeader({
  activeTab,
  onNewInvoice,
  onNewQuotation,
  onOpenPos,
  searchQuery,
  setSearchQuery,
  onToggleMobileMenu
}) {
  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'invoices': return 'Sales ▶ Invoices'
      case 'quotations': return 'Sales ▶ Quotations & Estimates'
      case 'ai-generator': return 'Invoxa AI ▶ Prompt Invoicing'
      case 'templates': return 'Invoice Template & Mixers'
      case 'customers': return 'Directory ▶ Customers'
      case 'products': return 'Inventory ▶ Products & Services'
      case 'payments': return 'Payments ▶ UPI QR & Bank'
      case 'api': return 'Developer ▶ API Keys & Claude MCP'
      case 'settings': return 'Configuration ▶ Business Settings'
      case 'pos': return 'POS Terminal ▶ 80mm Thermal Receipt'
      default: return 'Sales'
    }
  }

  return (
    <header className="swipe-header">
      <div className="swipe-header-left">
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <span className="breadcrumb-title">{getBreadcrumbTitle()}</span>
        <span className="mobile-breadcrumb-title">
          {activeTab === 'invoices' ? 'Invoices' :
           activeTab === 'templates' ? 'Templates' :
           activeTab === 'pos' ? 'POS Billing' :
           activeTab === 'payments' ? 'Payments' :
           activeTab === 'ai-generator' ? 'AI Invoice' : 'Invoxa'}
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="swipe-search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="swipe-search-input"
          placeholder="Ask Invoxa AI or search invoices, clients, HSN... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="shortcut-badge">ctrl+k</span>
      </div>

      {/* Right Action Buttons */}
      <div className="swipe-header-right">
        <button
          className="header-action-btn ghost-btn"
          onClick={() => alert('Document Settings: Prefix, Terms, Due date defaults')}
        >
          ⚙️ Settings
        </button>

        <button
          className="header-action-btn pos-btn"
          onClick={onOpenPos}
          title="Print 80mm thermal receipt"
        >
          POS Billing
        </button>

        <button
          className="header-action-btn quote-action-btn"
          onClick={onNewQuotation}
        >
          + Quotation
        </button>

        <button
          className="header-action-btn primary-action-btn"
          onClick={onNewInvoice}
        >
          + Create Invoice
        </button>

        <div className="header-user-avatar" aria-label="Current user">D</div>

      </div>
    </header>
  )
}
