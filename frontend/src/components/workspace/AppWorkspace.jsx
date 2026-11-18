import React, { useState } from 'react'
import { api } from '../../utils/apiClient'
import WorkspaceSidebar from './WorkspaceSidebar'
import WorkspaceHeader from './WorkspaceHeader'
import InvoicesView from './InvoicesView'
import QuotationsView from './QuotationsView'
import CustomersView from './CustomersView'
import ProductsView from './ProductsView'
import PaymentsView from './PaymentsView'
import IndustryTemplatesView from './IndustryTemplatesView'
import DeveloperApiWorkspaceView from './DeveloperApiWorkspaceView'
import SettingsView from './SettingsView'
import PosBillingView from './PosBillingView'
import CreditNotesView from './CreditNotesView'
import EInvoicesView from './EInvoicesView'
import SubscriptionsView from './SubscriptionsView'
import PurchasesView from './PurchasesView'
import ExpensesView from './ExpensesView'
import InventoryView from './InventoryView'
import InviteUsersView from './InviteUsersView'
import ReferView from './ReferView'
import InvoiceGenerator from '../InvoiceGenerator'

export default function AppWorkspace({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  invoices,
  setInvoices,
  quotations,
  setQuotations,
  customers,
  setCustomers,
  products,
  setProducts,
  businessProfile,
  setBusinessProfile,
  onNewInvoice,
  onNewQuotation,
  onEditInvoice,
  onEditQuotation,
  onPrintDocument,
  onBackToPublicSite,
  onSubscribe,
  currentUser,
  editingInvoiceInTemplate: propEditingInvoice,
  setEditingInvoiceInTemplate: propSetEditingInvoice
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('invoices')
  const activeTab = propActiveTab || internalActiveTab
  const setActiveTab = propSetActiveTab || setInternalActiveTab
  const [internalEditingInvoice, setInternalEditingInvoice] = useState(null)
  const editingInvoice = propEditingInvoice !== undefined ? propEditingInvoice : internalEditingInvoice
  const setEditingInvoice = propSetEditingInvoice || setInternalEditingInvoice

  const handleEditInvoiceInMixer = (inv) => {
    setEditingInvoice(inv)
    setActiveTab('templates')
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // 1-Click "Convert Quote to Invoice"
  const handleConvertQuoteToInvoice = (quote) => {
    const nextInvoiceNum = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`

    const convertedInvoice = {
      ...quote,
      id: `inv_conv_${Date.now()}`,
      invoiceNumber: nextInvoiceNum,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Unpaid',
      docType: 'invoice'
    }

    // Add to invoices
    setInvoices((prev) => [convertedInvoice, ...prev])

    // Save to backend
    try {
      if (localStorage.getItem('invoxa_token')) {
        api.createInvoice(convertedInvoice)
      }
    } catch (e) {
      console.warn('Backend sync converted invoice note:', e.message)
    }

    // Mark quote as converted
    setQuotations((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'Converted' } : q))
    )

    showToast(`⚡ Quotation ${quote.quoteNumber} converted to Tax Invoice ${nextInvoiceNum}!`)
    setActiveTab('invoices')
  }

  const handleDeleteInvoice = async (id) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    showToast('Invoice deleted')
    try {
      if (localStorage.getItem('invoxa_token')) await api.deleteInvoice(id)
    } catch (e) { console.warn('Backend delete invoice failed (removed locally)', e.message) }
  }

  const handleToggleInvoiceStatus = async (id, newStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
    )
    showToast(`Invoice marked as ${newStatus}`)
    try {
      if (localStorage.getItem('invoxa_token')) {
        await api.updateInvoice(id, { status: newStatus })
      }
    } catch (e) {
      console.warn('Backend sync invoice status note:', e.message)
    }
  }

  const handleDeleteQuotation = (id) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id))
    showToast('Quotation deleted')
  }

  const handleAddCustomer = async (cust) => {
    setCustomers((prev) => [cust, ...prev])
    showToast(`Customer ${cust.name} added!`)
    try {
      if (localStorage.getItem('invoxa_token')) await api.createCustomer(cust)
    } catch (e) { console.warn('Backend sync customer failed (saved locally)', e.message) }
  }

  const handleDeleteCustomer = async (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    showToast('Customer deleted')
    try {
      if (localStorage.getItem('invoxa_token')) await api.deleteCustomer(id)
    } catch (e) { console.warn('Backend delete customer failed (removed locally)', e.message) }
  }

  const handleAddProduct = async (prod) => {
    setProducts((prev) => [prod, ...prev])
    showToast(`Item ${prod.name} added to catalog!`)
    try {
      if (localStorage.getItem('invoxa_token')) await api.createProduct(prod)
    } catch (e) { console.warn('Backend sync product failed (saved locally)', e.message) }
  }

  const handleDeleteProduct = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    showToast('Item deleted')
    try {
      if (localStorage.getItem('invoxa_token')) await api.deleteProduct(id)
    } catch (e) { console.warn('Backend delete product failed (removed locally)', e.message) }
  }

  const handleBillCustomer = (cust) => {
    onNewInvoice({
      client: {
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        gstin: cust.gstin,
        city: cust.city,
        state: cust.state,
        address: cust.address
      }
    })
  }

  const handleSaveInvoiceFromTemplate = async (newInvoice) => {
    setInvoices((prev) => [newInvoice, ...prev.filter(i => i.id !== newInvoice.id)])
    showToast(`✓ Invoice ${newInvoice.invoiceNumber} saved successfully to your Invoices list!`)
    try {
      if (localStorage.getItem('invoxa_token')) {
        const isExisting = invoices.some(i => i.id === newInvoice.id)
        if (isExisting) {
          await api.updateInvoice(newInvoice.id, newInvoice)
        } else {
          await api.createInvoice(newInvoice)
        }
      }
    } catch (e) {
      console.warn('Backend sync note:', e.message)
    }
  }

  const handleAiInvoiceGenerated = (invoice) => {
    onNewInvoice(invoice, 'ai-generator')
  }

  const handleApiInvoiceCreated = (invoice) => {
    setInvoices((prev) => [invoice, ...prev.filter(item => item.id !== invoice.id)])
    showToast(`Invoice ${invoice.invoiceNumber} created through the Developer API.`)
  }

  const handleCompletePosBill = async (posBill) => {
    setInvoices((prev) => [posBill, ...prev])
    showToast(`POS Bill ${posBill.invoiceNumber} recorded!`)
    try {
      if (localStorage.getItem('invoxa_token')) {
        await api.createInvoice(posBill)
      }
    } catch (e) {
      console.warn('POS bill backend sync note:', e.message)
    }
  }

  return (
    <div className="swipe-workspace-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="workspace-toast-pill">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <WorkspaceSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBackToPublicSite={onBackToPublicSite}
        onSubscribe={onSubscribe}
        currentUser={currentUser}
        businessProfile={businessProfile}
        invoicesCount={invoices.length}
        quotesCount={quotations.length}
        customersCount={customers.length}
        productsCount={products.length}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace Body */}
      <div className="swipe-workspace-main">
        {/* Top Header */}
        <WorkspaceHeader
          activeTab={activeTab}
          onNewInvoice={() => onNewInvoice()}
          onNewQuotation={() => onNewQuotation()}
          onOpenPos={() => setActiveTab('pos')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Dynamic Content Views */}
        <main className="swipe-content-body">
          {activeTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              onNewInvoice={() => onNewInvoice()}
              onEditInvoice={handleEditInvoiceInMixer}
              onDeleteInvoice={handleDeleteInvoice}
              onToggleStatus={handleToggleInvoiceStatus}
              onPrintInvoice={onPrintDocument}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'pos' && (
            <PosBillingView
              products={products}
              onCompletePosBill={handleCompletePosBill}
            />
          )}

          {activeTab === 'credit-notes' && (
            <CreditNotesView searchQuery={searchQuery} />
          )}

          {activeTab === 'einvoices' && (
            <EInvoicesView searchQuery={searchQuery} />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsView searchQuery={searchQuery} />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView searchQuery={searchQuery} />
          )}

          {activeTab === 'quotations' && (
            <QuotationsView
              quotations={quotations}
              onNewQuotation={() => onNewQuotation()}
              onEditQuotation={onEditQuotation}
              onDeleteQuotation={handleDeleteQuotation}
              onConvertQuoteToInvoice={handleConvertQuoteToInvoice}
              onPrintQuotation={onPrintDocument}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView searchQuery={searchQuery} />
          )}

          {activeTab === 'inventory' && (
            <InventoryView searchQuery={searchQuery} />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onBillCustomer={handleBillCustomer}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView profile={businessProfile} />
          )}

          {activeTab === 'templates' && (
            <IndustryTemplatesView
              invoiceToEdit={editingInvoice}
              onClearEditInvoice={() => setEditingInvoice(null)}
              onSaveInvoice={(savedInv) => {
                handleSaveInvoiceFromTemplate(savedInv)
                setEditingInvoice(savedInv)
              }}
              onNavigateToInvoices={() => {
                setEditingInvoice(null)
                setActiveTab('invoices')
              }}
            />
          )}

          {activeTab === 'api' && (
            <DeveloperApiWorkspaceView
              onInvoiceCreated={handleApiInvoiceCreated}
            />
          )}

          {activeTab === 'invite-users' && (
            <InviteUsersView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              profile={businessProfile}
              onSaveProfile={async (updated) => {
                setBusinessProfile(updated)
                showToast('Settings saved successfully!')
                try {
                  if (localStorage.getItem('invoxa_token')) {
                    await api.updateCompanyProfile(updated)
                  }
                } catch (e) {
                  console.warn('Backend sync settings note:', e.message)
                }
              }}
            />
          )}

          {activeTab === 'refer' && (
            <ReferView />
          )}

          {activeTab === 'ai-generator' && (
            <div className="workspace-view-container">
              <div className="table-controls-bar">
                <div>
                  <h3>Invoxa AI Prompt-to-Invoice</h3>
                  <p className="section-subtext">Type plain English, paste a WhatsApp chat, or voice note to generate a compliant bill.</p>
                </div>
              </div>
              <InvoiceGenerator
                onInvoiceGenerated={handleAiInvoiceGenerated}
                onOpenSection={setActiveTab}
                onCreateInvoice={() => onNewInvoice()}
              />
            </div>
          )}
        </main>
      </div>

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/?text=Hello%20Invoxa%2C%20I%20have%20a%20question%20about%20billing."
        target="_blank"
        rel="noopener noreferrer"
        className="swipe-floating-wa"
        title="Chat on WhatsApp"
      >
        <span className="wa-icon">💬</span>
      </a>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={activeTab === 'invoices' ? 'active' : ''}
          onClick={() => setActiveTab('invoices')}
        >
          <span>📄</span>
          <span>Invoices</span>
        </button>
        <button
          type="button"
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => setActiveTab('templates')}
        >
          <span>🎨</span>
          <span>Templates</span>
        </button>
        <button
          type="button"
          className="mobile-create-fab"
          onClick={() => onNewInvoice()}
          title="Create New Invoice"
        >
          <span>+</span>
        </button>
        <button
          type="button"
          className={activeTab === 'payments' ? 'active' : ''}
          onClick={() => setActiveTab('payments')}
        >
          <span>💳</span>
          <span>Payments</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          title="All Menus & Sign Out"
        >
          <span>☰</span>
          <span>Menu</span>
        </button>
      </nav>

    </div>
  )
}
