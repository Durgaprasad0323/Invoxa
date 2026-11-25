import React, { useEffect, useRef, useState } from 'react'
import { api } from '../../utils/apiClient'
import WorkspaceSidebar from './WorkspaceSidebar'
import Icon from '../ui/Icon'
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
import EWayBillsView from './EWayBillsView'
import SubscriptionsView from './SubscriptionsView'
import PurchasesView from './PurchasesView'
import ExpensesView from './ExpensesView'
import InventoryView from './InventoryView'
import InviteUsersView from './InviteUsersView'
import ReferView from './ReferView'
import InvoiceGenerator from '../InvoiceGenerator'
import { getEffectivePlan, hasActiveProTrial, hasPlanAccess, TAB_PLAN_REQUIREMENTS } from '../../utils/plans'
import { calculateInvoiceTotals, formatINR } from '../../utils/calculations'
import { allocateCustomerCredits, getAvailableCustomerCredits, sumAvailableCustomerCredits } from '../../utils/customerCredits'

const invoxaWhatsAppNumber = String(import.meta.env.VITE_INVOXA_WHATSAPP_NUMBER || '').replace(/\D/g, '')
const invoxaWhatsAppMessage = encodeURIComponent('Hello Invoxa, I need help with the platform.')
const invoxaWhatsAppUrl = invoxaWhatsAppNumber
  ? `https://wa.me/${invoxaWhatsAppNumber}?text=${invoxaWhatsAppMessage}`
  : `https://wa.me/?text=${invoxaWhatsAppMessage}`

const normalizeProduct = product => ({
  ...product,
  rate: Number(product?.rate ?? product?.price ?? 0),
  price: Number(product?.price ?? product?.rate ?? 0),
  taxRate: Number(product?.taxRate ?? 18),
  stock: Number(product?.stock ?? 0),
  minStock: Number(product?.minStock ?? 0),
  buyPrice: Number(product?.buyPrice ?? 0),
  trackInventory: Boolean(product?.trackInventory)
})

export default function AppWorkspace({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  invoices,
  setInvoices,
  quotations,
  setQuotations,
  customers,
  setCustomers,
  creditNotes,
  setCreditNotes,
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
  onProTrialChange,
  currentUser,
  editingInvoiceInTemplate: propEditingInvoice,
  setEditingInvoiceInTemplate: propSetEditingInvoice
}) {
  const previewDescriptions = {
    templates: 'Choose an invoice design, customize its layout, then fill in your business and customer details.',
    payments: 'Preview the UPI and bank payment information customers can use to pay your invoices.',
    pos: 'Build a point-of-sale bill by selecting products, quantities, and a payment method.',
    'credit-notes': 'Review how credit notes record customer returns, refunds, and invoice adjustments.',
    einvoices: 'Check invoice details and preview the JSON data prepared for GST e-invoice registration.',
    ewaybills: 'Review sales invoices and record E-Way Bill numbers and transport details issued through the GST portal.',
    purchases: 'Review purchase records, supplier bills, payment status, and GST amounts.',
    expenses: 'Explore how business expenses can be categorized and tracked.',
    inventory: 'Review stock quantities and the inventory controls available to your business.'
  }
  const [internalActiveTab, setInternalActiveTab] = useState('invoices')
  const activeTab = propActiveTab || internalActiveTab
  const setActiveTab = propSetActiveTab || setInternalActiveTab
  const [internalEditingInvoice, setInternalEditingInvoice] = useState(null)
  const editingInvoice = propEditingInvoice !== undefined ? propEditingInvoice : internalEditingInvoice
  const setEditingInvoice = propSetEditingInvoice || setInternalEditingInvoice
  const [proTrial, setProTrial] = useState(null)
  const [proTrialLoading, setProTrialLoading] = useState(true)
  const [proTrialStarting, setProTrialStarting] = useState(false)
  const [proTrialError, setProTrialError] = useState('')
  const [showFeatureUpgrade, setShowFeatureUpgrade] = useState(false)
  const proTrialStartAttempted = useRef(false)

  const handleEditInvoiceInMixer = (inv) => {
    setEditingInvoice(inv)
    setActiveTab('templates')
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const planUser = currentUser ? { ...currentUser, proTrial } : currentUser
  const requiredPlanForTab = TAB_PLAN_REQUIREMENTS[activeTab]
  const featurePreviewMode = requiredPlanForTab === 'pro'
    && !hasPlanAccess(planUser, 'pro')
    && !proTrialLoading
    && !proTrialStarting
    && !proTrial?.canStart
  const expiredEnterpriseKeyManagement = activeTab === 'api'
    && currentUser?.plan === 'enterprise'
    && !hasPlanAccess(currentUser, 'enterprise')
  const planLocked = Boolean(requiredPlanForTab)
    && !hasPlanAccess(planUser, requiredPlanForTab)
    && !featurePreviewMode
    && !expiredEnterpriseKeyManagement

  const interceptFeaturePreviewAction = (event) => {
    if (!featurePreviewMode) return
    const control = event.target?.closest?.('button, a[href], input[type="submit"], [role="button"]')
    if (!control || control.closest('.feature-upgrade-modal, .pro-feature-preview-banner, [data-plan-preview-allowed="true"]')) return
    const label = [
      control.textContent,
      control.getAttribute('aria-label'),
      control.getAttribute('title'),
      control.getAttribute('href'),
      control.value
    ].filter(Boolean).join(' ').toLowerCase()
    if (!/\b(save|download|pdf|print|share|whatsapp|send|delete|add|create|generate|convert|issue|record|export|copy|approve|complete|submit|remove|upload|import|duplicate|payment|pay|collect|stock|purchase|expense|credit|draft|adjust)\b/i.test(label)) return
    event.preventDefault()
    event.stopPropagation()
    setShowFeatureUpgrade(true)
  }

  const interceptFeaturePreviewSubmit = (event) => {
    if (!featurePreviewMode) return
    const submitter = event.nativeEvent?.submitter
    if (!submitter) return
    const label = [submitter.textContent, submitter.getAttribute('aria-label'), submitter.getAttribute('title')].filter(Boolean).join(' ')
    if (!/\b(save|submit|create|generate|add|upload|send|issue|record|export|delete)\b/i.test(label)) return
    event.preventDefault()
    event.stopPropagation()
    setShowFeatureUpgrade(true)
  }

  useEffect(() => {
    let isCurrent = true
    proTrialStartAttempted.current = false
    setProTrial(null)
    if (!currentUser?.id || !localStorage.getItem('invoxa_token')) {
      setProTrialLoading(false)
      return () => { isCurrent = false }
    }
    setProTrialLoading(true)
    api.getProTrial()
      .then(({ trial }) => { if (isCurrent) setProTrial(trial) })
      .catch(() => { if (isCurrent) setProTrial(null) })
      .finally(() => { if (isCurrent) setProTrialLoading(false) })
    return () => { isCurrent = false }
  }, [currentUser?.id])

  useEffect(() => {
    onProTrialChange?.(proTrial)
  }, [proTrial, onProTrialChange])

  useEffect(() => {
    if (requiredPlanForTab !== 'pro' || proTrialLoading || !currentUser?.id || hasPlanAccess(currentUser, 'pro')) return
    if (!proTrial?.canStart || proTrialStartAttempted.current) return
    proTrialStartAttempted.current = true
    setProTrialStarting(true)
    setProTrialError('')
    api.startProTrial()
      .then(({ trial }) => setProTrial(trial))
      .catch(error => setProTrialError(error.message || 'The free Pro trial could not be started.'))
      .finally(() => setProTrialStarting(false))
  }, [requiredPlanForTab, currentUser?.id, currentUser?.plan, currentUser?.subscriptionExpiry, proTrial, proTrialLoading])

  const refreshProTrial = async () => {
    try {
      const { trial } = await api.getProTrial()
      setProTrial(trial)
      return trial
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (!proTrial?.active || !proTrial.endsAt) return undefined
    const endsAt = new Date(proTrial.endsAt).getTime()
    if (!Number.isFinite(endsAt)) return undefined
    const timer = window.setTimeout(() => { refreshProTrial() }, Math.max(0, endsAt - Date.now() + 25))
    return () => window.clearTimeout(timer)
  }, [proTrial?.active, proTrial?.endsAt])

  const consumeTrialCreation = async (feature, usageId) => {
    if (!hasActiveProTrial(planUser)) return hasPlanAccess(currentUser, 'pro')
    try {
      const result = await api.consumeProTrialCreation({
        feature,
        usageId: usageId || globalThis.crypto?.randomUUID?.() || `trial_${Date.now()}_${Math.random().toString(36).slice(2)}`
      })
      if (result.trial) setProTrial(result.trial)
      return true
    } catch (error) {
      if (error.trial) setProTrial(error.trial)
      showToast(error.message || 'Your free Pro trial has ended. Choose a plan to continue.')
      return false
    }
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleSaveEWayBill = async (invoiceId, eWayBill) => {
    const invoice = invoices.find(item => item.id === invoiceId)
    if (!invoice) throw new Error('The linked invoice could not be found.')
    const updatedInvoice = { ...invoice, eWayBill }
    if (localStorage.getItem('invoxa_token')) {
      const response = await api.updateInvoice(invoiceId, { eWayBill })
      if (response.invoice) Object.assign(updatedInvoice, response.invoice)
    }
    setInvoices(previous => previous.map(item => item.id === invoiceId ? updatedInvoice : item))
    showToast(`E-Way Bill ${eWayBill.number} saved with invoice ${invoice.invoiceNumber}.`)
  }

  // 1-Click "Convert Quote to Invoice"
  const handleConvertQuoteToInvoice = async (quote) => {
    const nextInvoiceNum = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`

    let convertedInvoice = {
      ...quote,
      id: `inv_conv_${Date.now()}`,
      invoiceNumber: nextInvoiceNum,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Unpaid',
      docType: 'invoice'
    }
    const credits = getAvailableCustomerCredits(creditNotes, invoices, convertedInvoice.client)
    const availableCredit = sumAvailableCustomerCredits(credits)
    const maxCredit = Math.min(availableCredit, calculateInvoiceTotals(convertedInvoice).grandTotal)
    const applyCredit = maxCredit > 0 && window.confirm(
      `${quote.client?.name || 'This customer'} has ${formatINR(availableCredit)} in available customer credit. Apply up to ${formatINR(maxCredit)} to this invoice?`
    )
    const applications = allocateCustomerCredits(credits, applyCredit ? maxCredit : 0)
    convertedInvoice.customerCreditApplications = applications
    convertedInvoice.customerCreditApplied = applications.reduce((sum, application) => sum + application.amount, 0)

    try {
      if (localStorage.getItem('invoxa_token')) {
        const response = await api.createInvoice(convertedInvoice)
        convertedInvoice = response.invoice || convertedInvoice
      }
      setInvoices((prev) => [convertedInvoice, ...prev.filter(invoice => invoice.id !== convertedInvoice.id)])
    } catch (e) {
      showToast(`Invoice could not be saved: ${e.message}`)
      return
    }

    // Mark quote as converted
    setQuotations((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'Converted' } : q))
    )

    showToast(` Quotation ${quote.quoteNumber} converted to Tax Invoice ${nextInvoiceNum}!`)
    setActiveTab('invoices')
  }

  const handleDeleteInvoice = async (id) => {
    try {
      if (localStorage.getItem('invoxa_token')) await api.deleteInvoice(id)
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
      showToast('Invoice deleted')
    } catch (e) { showToast(`Invoice could not be deleted: ${e.message}`) }
  }

  const handleToggleInvoiceStatus = async (id, newStatus) => {
    try {
      if (localStorage.getItem('invoxa_token')) {
        await api.updateInvoice(id, { status: newStatus })
      }
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
      )
      showToast(`Invoice marked as ${newStatus}`)
    } catch (e) {
      showToast(`Invoice status could not be saved: ${e.message}`)
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

  const handleUpdateCustomer = async (id, changes) => {
    setCustomers(previous => previous.map(customer => customer.id === id ? { ...customer, ...changes, id } : customer))
    try {
      if (localStorage.getItem('invoxa_token')) {
        const response = await api.updateCustomer(id, changes)
        if (response.customer) setCustomers(previous => previous.map(customer => customer.id === id ? response.customer : customer))
      }
      showToast('Customer details updated')
    } catch (error) {
      showToast(`Customer changes could not be saved: ${error.message}`)
    }
  }

  const handleAddProduct = async (prod) => {
    const product = normalizeProduct(prod)
    setProducts((prev) => [product, ...prev])
    showToast(`Item ${prod.name} added to catalog!`)
    try {
      if (localStorage.getItem('invoxa_token')) {
        const response = await api.createProduct({ ...product, price: product.rate })
        if (response.product) setProducts(previous => previous.map(item => item.id === product.id ? normalizeProduct(response.product) : item))
      }
    } catch (e) { console.warn('Backend sync product failed (saved locally)', e.message) }
  }

  const handleUpdateProduct = async (id, changes) => {
    const current = products.find(product => product.id === id)
    const updated = normalizeProduct({ ...current, ...changes })
    setProducts(previous => previous.map(product => product.id === id ? updated : product))
    try {
      if (localStorage.getItem('invoxa_token')) {
        const apiChanges = { ...changes }
        if (apiChanges.rate !== undefined) {
          apiChanges.price = apiChanges.rate
          delete apiChanges.rate
        }
        const response = await api.updateProduct(id, apiChanges)
        if (response.product) setProducts(previous => previous.map(product => product.id === id ? normalizeProduct(response.product) : product))
      }
    } catch (error) {
      showToast(`Product changes could not be saved: ${error.message}`)
    }
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
    const documentType = newInvoice.docType === 'quotation' ? 'quote' : (newInvoice.docType || 'invoice')
    if (documentType === 'quote' || documentType === 'estimate') {
      const prefix = documentType === 'estimate' ? 'EST' : 'QT'
      let quoteNumber = newInvoice.quoteNumber || newInvoice.invoiceNumber || `${prefix}-2026-${String(quotations.length + 1).padStart(3, '0')}`
      if (quotations.some(quotation => quotation.id !== newInvoice.id && quotation.quoteNumber === quoteNumber)) {
        let serial = quotations.length + 1
        do {
          quoteNumber = `${prefix}-2026-${String(serial++).padStart(3, '0')}`
        } while (quotations.some(quotation => quotation.id !== newInvoice.id && quotation.quoteNumber === quoteNumber))
      }
      const quotation = {
        ...newInvoice,
        docType: documentType,
        invoiceNumber: quoteNumber,
        quoteNumber,
        quoteDate: newInvoice.invoiceDate || newInvoice.quoteDate,
        validUntil: newInvoice.validUntil || newInvoice.dueDate
      }
      setQuotations(previous => [quotation, ...previous.filter(item => item.id !== quotation.id)])
      if (newInvoice.templateId && hasActiveProTrial(planUser)) await refreshProTrial()
      const label = documentType === 'estimate' ? 'Estimate' : 'Quotation'
      showToast(`${label} ${quoteNumber} saved to your Quotations list.`)
      return {
        savedToAccount: false,
        tone: 'success',
        message: `${label} saved to your Quotations list.`,
        invoice: quotation
      }
    }

    const token = localStorage.getItem('invoxa_token')
    const isExisting = invoices.some(invoice => invoice.id === newInvoice.id)
    const invoiceDocument = { ...newInvoice, docType: 'invoice' }
    if (!isExisting && !Number(invoiceDocument.customerCreditApplied)) {
      const credits = getAvailableCustomerCredits(creditNotes, invoices, invoiceDocument.client)
      const availableCredit = sumAvailableCustomerCredits(credits)
      const maxCredit = Math.min(availableCredit, calculateInvoiceTotals(invoiceDocument).grandTotal)
      if (maxCredit > 0 && window.confirm(
        `${invoiceDocument.client?.name || 'This customer'} has ${formatINR(availableCredit)} in available customer credit. Apply up to ${formatINR(maxCredit)} to this invoice?`
      )) {
        const applications = allocateCustomerCredits(credits, maxCredit)
        invoiceDocument.customerCreditApplications = applications
        invoiceDocument.customerCreditApplied = applications.reduce((sum, application) => sum + application.amount, 0)
      }
    }
    let invoiceToStore = invoiceDocument
    if (token) {
      try {
        const response = isExisting
          ? await api.updateInvoice(invoiceDocument.id, invoiceDocument)
          : await api.createInvoice(invoiceDocument)
        invoiceToStore = response.invoice || invoiceDocument
      } catch (error) {
        if (!isExisting && newInvoice.templateId && hasActiveProTrial(planUser)) await refreshProTrial()
        throw error
      }
    }

    if (!isExisting && newInvoice.templateId && hasActiveProTrial(planUser)) await refreshProTrial()

    setInvoices(previous => [invoiceToStore, ...previous.filter(invoice => invoice.id !== invoiceToStore.id)])
    setQuotations(previous => previous.filter(quotation => quotation.id !== invoiceToStore.id))
    showToast(token
      ? `Invoice ${invoiceToStore.invoiceNumber} saved to your account.`
      : `Invoice ${invoiceToStore.invoiceNumber} saved in this browser only. Sign in to sync it to your account.`)
    return { savedToAccount: Boolean(token), invoice: invoiceToStore }
  }

  const handleAiInvoiceGenerated = (invoice) => {
    onNewInvoice(invoice, 'ai-generator')
  }

  const handleApiInvoiceCreated = (invoice) => {
    setInvoices((prev) => [invoice, ...prev.filter(item => item.id !== invoice.id)])
    showToast(`Invoice ${invoice.invoiceNumber} created through the Developer API.`)
  }

  const handleCompletePosBill = async (posBill) => {
    try {
      if (localStorage.getItem('invoxa_token')) {
        const response = await api.createInvoice(posBill)
        posBill = response.invoice || posBill
        if (hasActiveProTrial(planUser)) await refreshProTrial()
      }
      setInvoices((prev) => [posBill, ...prev.filter(invoice => invoice.id !== posBill.id)])
      showToast(`POS Bill ${posBill.invoiceNumber} recorded!`)
      return true
    } catch (e) {
      if (hasActiveProTrial(planUser)) await refreshProTrial()
      showToast(`POS bill could not be saved: ${e.message}`)
      return false
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
        currentUser={planUser}
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
          onOpenTemplates={() => setActiveTab('templates')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Dynamic Content Views */}
        <main
          className={`swipe-content-body ${planLocked ? 'plan-preview-active' : ''}`}
          onClickCapture={interceptFeaturePreviewAction}
          onSubmitCapture={interceptFeaturePreviewSubmit}
        >
          {requiredPlanForTab === 'pro' && hasActiveProTrial(planUser) && (
            <div className="pro-trial-banner">
              <div>
                <strong>Free Pro trial active</strong>
                <span>{proTrial.creationsRemaining} Pro document {proTrial.creationsRemaining === 1 ? 'creation' : 'creations'} left · {proTrial.daysRemaining} {proTrial.daysRemaining === 1 ? 'day' : 'days'} remaining</span>
              </div>
              <button type="button" onClick={() => onSubscribe?.('pro')}>Subscribe to Pro</button>
            </div>
          )}
          {featurePreviewMode && (
            <div className="pro-feature-preview-banner">
              <div>
                <strong>Pro feature preview</strong>
                <span>{previewDescriptions[activeTab] || 'Explore this feature and its available tools.'} Saving, exporting, sharing, and other Pro actions require an upgrade.</span>
              </div>
              <button type="button" onClick={() => setShowFeatureUpgrade(true)}>Upgrade now</button>
            </div>
          )}
          <div
            className={`plan-preview-content ${planLocked ? 'plan-preview-content-locked' : ''}`}
            aria-hidden={planLocked}
            inert={planLocked}
          >
          {activeTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              isPro={getEffectivePlan(planUser) !== 'free'}
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
              businessProfile={businessProfile}
              onCompletePosBill={handleCompletePosBill}
            />
          )}

          {activeTab === 'credit-notes' && (
            <CreditNotesView
              invoices={invoices}
              customers={customers}
              products={products}
              businessProfile={businessProfile}
              onCreditNotesChange={setCreditNotes}
              searchQuery={searchQuery}
              onTrialUsageUpdated={refreshProTrial}
            />
          )}

          {activeTab === 'einvoices' && (
            <EInvoicesView
              invoices={invoices}
              customers={customers}
              businessProfile={businessProfile}
              searchQuery={searchQuery}
              onNewInvoice={() => onNewInvoice()}
              onEditInvoice={handleEditInvoiceInMixer}
              onConsumeTrialCreation={consumeTrialCreation}
            />
          )}

          {activeTab === 'ewaybills' && (
            <EWayBillsView
              invoices={invoices}
              searchQuery={searchQuery}
              onNewInvoice={() => onNewInvoice()}
              onSaveEWayBill={handleSaveEWayBill}
              onConsumeTrialCreation={consumeTrialCreation}
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsView currentUser={planUser} proTrial={proTrial} onChoosePlan={onSubscribe} />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView key={currentUser.companyId || currentUser.id || currentUser.email} currentUser={currentUser} searchQuery={searchQuery} />
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
            <ExpensesView key={currentUser.companyId || currentUser.id || currentUser.email} currentUser={currentUser} searchQuery={searchQuery} />
          )}

          {activeTab === 'inventory' && (
            <InventoryView products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} searchQuery={searchQuery} />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onBillCustomer={handleBillCustomer}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView profile={businessProfile} />
          )}

          {activeTab === 'templates' && (
            <IndustryTemplatesView
              isPro={getEffectivePlan(planUser) !== 'free'}
              onUpgrade={() => setShowFeatureUpgrade(true)}
              invoiceToEdit={editingInvoice}
              onClearEditInvoice={() => setEditingInvoice(null)}
              onSaveInvoice={async (savedInv) => {
                const result = await handleSaveInvoiceFromTemplate(savedInv)
                setEditingInvoice(result.invoice)
                return result
              }}
              onNavigateToInvoices={(documentType) => {
                setEditingInvoice(null)
                setActiveTab(documentType === 'quote' || documentType === 'estimate' ? 'quotations' : 'invoices')
              }}
              businessProfile={businessProfile}
            />
          )}

          {activeTab === 'api' && (
            <DeveloperApiWorkspaceView
              currentUser={currentUser}
              onInvoiceCreated={handleApiInvoiceCreated}
              onSubscribe={onSubscribe}
            />
          )}

          {activeTab === 'invite-users' && (
            <InviteUsersView key={currentUser.companyId || currentUser.id || currentUser.email} currentUser={currentUser} searchQuery={searchQuery} />
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
            <ReferView currentUser={currentUser} />
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
          </div>
          {planLocked && (
            <div className="plan-preview-upgrade" role="dialog" aria-modal="true" aria-labelledby="plan-preview-title">
              <section className="plan-preview-upgrade-card">
                <span className="plans-eyebrow">{requiredPlanForTab.toUpperCase()} FEATURE PREVIEW</span>
                <h2 id="plan-preview-title">Preview {activeTab.replaceAll('-', ' ')}</h2>
                <p>You can see what this area offers. Upgrade to {requiredPlanForTab === 'enterprise' ? 'Enterprise' : 'Pro'} to use its tools.</p>
                {requiredPlanForTab === 'pro' && (proTrialLoading || proTrialStarting) ? (
                  <p className="pro-trial-starting-message">{proTrialStarting ? 'Starting your 7-day trial with 3 Pro document creations…' : 'Checking your free Pro trial…'}</p>
                ) : (
                  <>
                    {proTrialError && <p className="pro-trial-error-message">{proTrialError}</p>}
                    <div className="plan-preview-upgrade-actions">
                      <button type="button" className="plan-choose-button plan-choose-primary" onClick={() => onSubscribe?.(requiredPlanForTab)}>Upgrade now</button>
                      <button type="button" className="plan-preview-compare-button" onClick={() => setActiveTab('subscriptions')}>Compare plans</button>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
        </main>
        {showFeatureUpgrade && (
          <div className="plan-preview-upgrade feature-upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="feature-upgrade-title" onMouseDown={event => { if (event.target === event.currentTarget) setShowFeatureUpgrade(false) }}>
            <section className="plan-preview-upgrade-card">
              <span className="plans-eyebrow">PRO FEATURE</span>
              <h2 id="feature-upgrade-title">Upgrade to use this action</h2>
              <p>You can preview and learn how this feature works. Saving, downloading, sharing, and other Pro actions require an active Pro plan.</p>
              <div className="plan-preview-upgrade-actions">
                <button type="button" className="plan-choose-button plan-choose-primary" data-plan-preview-allowed="true" onClick={() => { setShowFeatureUpgrade(false); onSubscribe?.('pro') }}>Upgrade now</button>
                <button type="button" className="plan-preview-compare-button" data-plan-preview-allowed="true" onClick={() => { setShowFeatureUpgrade(false); setActiveTab('subscriptions') }}>Compare plans</button>
                <button type="button" className="plan-preview-compare-button" data-plan-preview-allowed="true" onClick={() => setShowFeatureUpgrade(false)}>Continue preview</button>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Floating WhatsApp Action Button */}
      <a
        href={invoxaWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="swipe-floating-wa"
        title="Chat on WhatsApp"
        aria-label="Chat with Invoxa on WhatsApp"
      >
        <span className="wa-icon"><Icon name="whatsapp" size={25} strokeWidth={1.7} /></span>
      </a>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={activeTab === 'invoices' ? 'active' : ''}
          onClick={() => setActiveTab('invoices')}
        >
          <Icon name="fileText" size={20} />
          <span>Invoices</span>
        </button>
        <button
          type="button"
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => setActiveTab('templates')}
        >
          <Icon name="layout" size={20} />
          <span>Templates</span>
        </button>
        <button
          type="button"
          className="mobile-create-fab"
          onClick={() => onNewInvoice()}
          title="Create New Invoice"
        >
          <Icon name="plus" size={23} />
        </button>
        <button
          type="button"
          className={activeTab === 'payments' ? 'active' : ''}
          onClick={() => setActiveTab('payments')}
        >
          <Icon name="creditCard" size={20} />
          <span>Payments</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          title="All Menus & Sign Out"
        >
          <Icon name="menu" size={20} />
          <span>Menu</span>
        </button>
      </nav>

    </div>
  )
}
