import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import InvoiceEditor from './components/InvoiceEditor'
import AuthModal from './components/AuthModal'
import InvoicePreview from './components/InvoicePreview'
import AppWorkspace from './components/workspace/AppWorkspace'
import SuperAdminDashboard from './components/admin/SuperAdminDashboard'
import SubscriptionModal from './components/subscription/SubscriptionModal'
import Icon from './components/ui/Icon'
import { api } from './utils/apiClient'
import { initialSampleInvoices } from './utils/sampleInvoices'
import { initialCustomers, initialProducts, initialQuotations, initialBusinessProfile } from './utils/workspaceData'
import { parseInvoicePrompt } from './utils/aiParser'
import { getEffectivePlan } from './utils/plans'
import { loadHtml2Pdf } from './utils/pdfGenerator'
import { calculateInvoiceTotals, formatINR } from './utils/calculations'
import { allocateCustomerCredits, getAvailableCustomerCredits } from './utils/customerCredits'
import './App.css'

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

export default function App() {
  // States: 'public' (landing page) | 'workspace' (Swipe-style logged-in app) | 'admin' (Super Admin platform control)
  const [appState, setAppState] = useState('public')
  const [currentView, setCurrentView] = useState('home') // for public: 'home' | 'editor'
  const [currentUser, setCurrentUser] = useState(null)
  const [proTrial, setProTrial] = useState(null)
  const [workspaceTab, setWorkspaceTab] = useState('invoices')
  const [editorOrigin, setEditorOrigin] = useState(null)

  // Global data stores (persist to localStorage)
  const [invoices, setInvoices] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invoxa_invoices')) || initialSampleInvoices } catch { return initialSampleInvoices }
  })
  const [quotations, setQuotations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invoxa_quotations')) || initialQuotations } catch { return initialQuotations }
  })
  const [customers, setCustomers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invoxa_customers')) || initialCustomers } catch { return initialCustomers }
  })
  const [products, setProducts] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('invoxa_products')) || initialProducts).map(normalizeProduct) } catch { return initialProducts.map(normalizeProduct) }
  })
  const [creditNotes, setCreditNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invoxa_credit_notes_v2')) || [] } catch { return [] }
  })
  const [businessProfile, setBusinessProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invoxa_profile')) || initialBusinessProfile } catch { return initialBusinessProfile }
  })

  const [activeInvoice, setActiveInvoice] = useState(initialSampleInvoices[0])
  const [editingInvoiceInTemplate, setEditingInvoiceInTemplate] = useState(null)
  const [printTargetInvoice, setPrintTargetInvoice] = useState(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)
  const [planToBuy, setPlanToBuy] = useState('pro')
  const [billingCycleToBuy, setBillingCycleToBuy] = useState('yearly')
  const planAccessUser = currentUser ? { ...currentUser, proTrial } : currentUser
  const handleOpenSubscription = (plan = 'pro', billingCycle = 'yearly') => {
    setPlanToBuy(plan)
    setBillingCycleToBuy(billingCycle)
    setIsSubscribeOpen(true)
  }

  const handleOpenAuth = (mode = 'signin') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  // Persist all data to localStorage
  useEffect(() => {
    try { localStorage.setItem('invoxa_invoices', JSON.stringify(invoices)) } catch { }
  }, [invoices])
  useEffect(() => {
    try { localStorage.setItem('invoxa_quotations', JSON.stringify(quotations)) } catch { }
  }, [quotations])
  useEffect(() => {
    try { localStorage.setItem('invoxa_customers', JSON.stringify(customers)) } catch { }
  }, [customers])
  useEffect(() => {
    try { localStorage.setItem('invoxa_products', JSON.stringify(products)) } catch { }
  }, [products])
  useEffect(() => {
    try { localStorage.setItem('invoxa_credit_notes_v2', JSON.stringify(creditNotes)) } catch { }
  }, [creditNotes])
  useEffect(() => {
    try { localStorage.setItem('invoxa_profile', JSON.stringify(businessProfile)) } catch { }
  }, [businessProfile])

  // Sync with cloud backend on load
  useEffect(() => {
    const token = localStorage.getItem('invoxa_token')
    if (token) {
      api.getMe().then(data => {
        if (data.user) {
          setCurrentUser(data.user)
          if (data.user.role === 'super_admin') {
            setAppState('admin')
          } else {
            setAppState('workspace')
          }
        }
        if (data.company) {
          setBusinessProfile(data.company)
        }
      }).catch(() => {
        localStorage.removeItem('invoxa_token')
      })

      api.getInvoices().then(data => {
        if (data.invoices) setInvoices(data.invoices)
      }).catch(() => {})

      api.getCustomers().then(data => {
        if (data.customers) setCustomers(data.customers)
      }).catch(() => {})

      api.getProducts().then(data => {
        if (data.products) setProducts(data.products.map(normalizeProduct))
      }).catch(() => {})

      api.getCreditNotes().then(data => {
        if (data.creditNotes) setCreditNotes(data.creditNotes)
      }).catch(() => {})
    }
  }, [])

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = async (user) => {
    setProTrial(null)
    setCurrentUser(user)
    if (user && user.role === 'super_admin') {
      setAppState('admin')
    } else {
      setAppState('workspace')
    }

    // Refresh company, invoices, customers, products for this specific user
    try {
      const meData = await api.getMe()
      if (meData.user) setCurrentUser(meData.user)
      if (meData.company) {
        setBusinessProfile(meData.company)
      } else {
        setBusinessProfile({
          name: user.companyName || `${user.name}'s Business`,
          gstin: '',
          phone: user.phone || '',
          email: user.email,
          address: '',
          city: '',
          state: 'Maharashtra',
          pincode: '',
          bankName: '',
          accountNumber: '',
          ifsc: '',
          branch: '',
          upiId: '',
          upiQrUrl: ''
        })
      }

      const invData = await api.getInvoices()
      setInvoices(invData.invoices || [])

      const custData = await api.getCustomers()
      setCustomers(custData.customers || [])

      const prodData = await api.getProducts()
      setProducts((prodData.products || []).map(normalizeProduct))

      const creditData = await api.getCreditNotes()
      setCreditNotes(creditData.creditNotes || [])
    } catch (err) {
      console.warn('Failed to load user specific data:', err.message)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToPublicSite = () => {
    localStorage.removeItem('invoxa_token')
    localStorage.removeItem('invoxa_invoices')
    localStorage.removeItem('invoxa_customers')
    localStorage.removeItem('invoxa_products')
    localStorage.removeItem('invoxa_profile')
    localStorage.removeItem('invoxa_credit_notes_v2')
    setCurrentUser(null)
    setProTrial(null)
    setInvoices(initialSampleInvoices)
    setCustomers(initialCustomers)
    setProducts(initialProducts.map(normalizeProduct))
    setCreditNotes([])
    setBusinessProfile(initialBusinessProfile)
    setAppState('public')
    setCurrentView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- INVOICE HANDLERS ---
  const handleInvoiceGenerated = (invoice) => {
    setInvoices(prev => [invoice, ...prev.filter(i => i.id !== invoice.id)])
    setActiveInvoice(invoice)
    setCurrentView('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStartNewInvoice = (prefillArg = {}, origin = null) => {
    // Sanitize prefillArg: React synthetic events passed from onClick={onNewInvoice} have circular structures
    const prefill = (prefillArg && typeof prefillArg === 'object' && !prefillArg.nativeEvent && !prefillArg._reactName && !prefillArg.target) ? prefillArg : {}
    if (origin) {
      setEditorOrigin(origin)
    } else {
      setEditorOrigin(null)
    }
    const nextNum = prefill.invoiceNumber || `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`
    const todayStr = new Date().toISOString().split('T')[0]
    const dueObj = new Date(Date.now() + 15 * 86400000)
    const dueStr = dueObj.toISOString().split('T')[0]

    const freshInvoice = {
      id: prefill.id || `inv_${Date.now()}`,
      invoiceNumber: nextNum,
      invoiceDate: prefill.invoiceDate || todayStr,
      dueDate: prefill.dueDate || dueStr,
      docType: prefill.docType || 'invoice',
      status: prefill.status || 'Unpaid',
      theme: prefill.theme || 'emerald',
      seller: {
        name: businessProfile.companyName || businessProfile.name || '',
        gstin: businessProfile.gstin || '',
        pan: businessProfile.pan || '',
        address: businessProfile.address || '',
        city: businessProfile.city || '',
        state: businessProfile.state || '',
        pincode: businessProfile.pincode || '',
        phone: businessProfile.phone || '',
        email: businessProfile.email || '',
        ...(prefill.seller || {})
      },
      client: {
        name: 'Cash / Walk-in Customer',
        gstin: '',
        address: 'Commercial Plaza, MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '',
        email: '',
        ...(prefill.client || {})
      },
      items: (prefill.items && prefill.items.length > 0) ? prefill.items : [
        {
          id: `item_${Date.now()}`,
          description: 'Consulting & Professional Services',
          hsnSac: '998314',
          quantity: 1,
          rate: 5000,
          taxRate: 18,
          unit: 'nos'
        }
      ],
      discountRate: prefill.discountRate || 0,
      notes: prefill.notes || 'Thank you for your business. Please make payments before due date.',
      terms: prefill.terms || 'Payment due within 15 days of invoice date. 18% p.a. interest applicable on late payments.',
      paymentDetails: {
        bankName: businessProfile.bankName || '',
        accountNumber: businessProfile.accountNumber || '',
        ifsc: businessProfile.ifsc || '',
        branch: businessProfile.branch || '',
        upiId: businessProfile.upiId || '',
        upiQrUrl: businessProfile.upiQrUrl || '',
        ...(prefill.paymentDetails || {})
      },
      layout: prefill.layout || 'classic',
      themeColor: prefill.themeColor || '#15865a',
      artStyle: prefill.artStyle || 'none',
      stampStyle: prefill.stampStyle || 'brand',
      sigType: prefill.sigType || 'script',
      verifiedSeal: prefill.verifiedSeal !== undefined ? prefill.verifiedSeal : true,
      logoImgUrl: prefill.logoImgUrl || null,
      upiQrUrl: prefill.upiQrUrl || businessProfile.upiQrUrl || null,
      originalPhotoUrl: prefill.originalPhotoUrl || null,
      renderedHtml: null
    }
    setActiveInvoice(freshInvoice)
    setCurrentView('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStartNewQuotation = (prefillArg = {}) => {
    const prefill = (prefillArg && typeof prefillArg === 'object' && !prefillArg.nativeEvent && !prefillArg._reactName && !prefillArg.target) ? prefillArg : {}
    const nextNum = `QT-2026-${String(quotations.length + 1).padStart(3, '0')}`
    const baseInvoice = parseInvoicePrompt('Create a quotation for New Customer for Consulting Services worth ₹30,000 with 18% GST')
    const freshQuote = {
      ...baseInvoice,
      id: `qt_${Date.now()}`,
      invoiceNumber: prefill.invoiceNumber || prefill.quoteNumber || nextNum,
      quoteNumber: prefill.quoteNumber || prefill.invoiceNumber || nextNum,
      quoteDate: prefill.quoteDate || new Date().toISOString().split('T')[0],
      validUntil: prefill.validUntil || prefill.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Draft',
      docType: 'quote',
      ...prefill,
      client: { ...baseInvoice.client, ...(prefill.client || {}) },
      items: prefill.items || baseInvoice.items
    }
    setEditorOrigin('quotations')
    setActiveInvoice(freshQuote)
    setCurrentView('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveInvoice = async (savedInvoice) => {
    const documentType = savedInvoice.docType === 'quotation' ? 'quote' : (savedInvoice.docType || 'invoice')
    if (documentType === 'quote' || documentType === 'estimate') {
      const existingQuotation = quotations.find(quotation => quotation.id === savedInvoice.id)
      const numberPrefix = documentType === 'estimate' ? 'EST' : 'QT'
      let quoteNumber = savedInvoice.quoteNumber || savedInvoice.invoiceNumber || `${numberPrefix}-2026-${String(quotations.length + 1).padStart(3, '0')}`
      if (quotations.some(quotation => quotation.id !== savedInvoice.id && quotation.quoteNumber === quoteNumber)) {
        let serial = quotations.length + 1
        do {
          quoteNumber = `${numberPrefix}-2026-${String(serial++).padStart(3, '0')}`
        } while (quotations.some(quotation => quotation.id !== savedInvoice.id && quotation.quoteNumber === quoteNumber))
      }
      const quotation = {
        ...savedInvoice,
        docType: documentType,
        invoiceNumber: quoteNumber,
        quoteNumber,
        quoteDate: savedInvoice.invoiceDate || savedInvoice.quoteDate,
        validUntil: savedInvoice.validUntil || savedInvoice.dueDate
      }
      setQuotations(previous => [quotation, ...previous.filter(item => item.id !== quotation.id)])
      setActiveInvoice(quotation)
      const label = documentType === 'estimate' ? 'Estimate' : 'Quotation'
      return {
        savedToAccount: false,
        tone: 'success',
        message: `${label} saved to your Quotations list on this device.`,
        invoice: quotation
      }
    }

    const invoiceDocument = { ...savedInvoice, docType: 'invoice' }
    const availableCredits = getAvailableCustomerCredits(creditNotes, invoices, invoiceDocument.client, invoiceDocument.id)
    const requestedCredit = Math.max(0, Number(invoiceDocument.customerCreditApplied) || 0)
    const availableTotal = availableCredits.reduce((sum, credit) => sum + credit.available, 0)
    const invoiceTotal = calculateInvoiceTotals(invoiceDocument).grandTotal
    const maxCredit = Math.min(availableTotal, invoiceTotal)
    if (requestedCredit > maxCredit + 0.01) {
      throw new Error(`This customer can apply up to ${formatINR(maxCredit)} of available credit to this invoice.`)
    }
    const applications = allocateCustomerCredits(availableCredits, requestedCredit)
    invoiceDocument.customerCreditApplications = applications
    invoiceDocument.customerCreditApplied = applications.reduce((sum, application) => sum + application.amount, 0)
    const token = localStorage.getItem('invoxa_token')
    let invoiceToStore = invoiceDocument

    if (token) {
      const alreadyExists = invoices.some(invoice => invoice.id === invoiceDocument.id)
      const response = alreadyExists
        ? await api.updateInvoice(invoiceDocument.id, invoiceDocument)
        : await api.createInvoice(invoiceDocument)
      invoiceToStore = response.invoice || invoiceDocument
    }

    setInvoices(previous => [invoiceToStore, ...previous.filter(invoice => invoice.id !== invoiceToStore.id)])
    setQuotations(previous => previous.filter(quotation => quotation.id !== invoiceToStore.id))
    setActiveInvoice(invoiceToStore)
    return { savedToAccount: Boolean(token), invoice: invoiceToStore }
  }

  const handleEditInvoiceInMixer = (inv) => {
    setEditingInvoiceInTemplate(inv)
    setWorkspaceTab('templates')
    setAppState('workspace')
    setCurrentView('workspace')
  }

  const handlePrint = async (invoiceToPrint) => {
    if (!invoiceToPrint) {
      window.print()
      return
    }

    setPrintTargetInvoice(invoiceToPrint)
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    if (document.fonts?.ready) await document.fonts.ready.catch(() => {})
    const printable = document.getElementById('printable-invoice')
    if (!printable) {
      setPrintTargetInvoice(null)
      return
    }

    const docType = invoiceToPrint.docType === 'quotation' ? 'quote' : invoiceToPrint.docType
    const prefix = docType === 'estimate' ? 'Estimate' : docType === 'quote' ? 'Quotation' : 'Invoice'
    const fileNumber = invoiceToPrint.quoteNumber || invoiceToPrint.invoiceNumber || 'draft'
    try {
      const html2pdf = await loadHtml2Pdf()
      await html2pdf().set({
          margin: 0,
          filename: `${prefix}_${String(fileNumber).replace(/[^a-z0-9_-]/gi, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: invoiceToPrint.layout === 'thermal'
            ? { unit: 'px', format: [300, 1100] }
            : invoiceToPrint.layout === 'phone'
            ? { unit: 'px', format: [390, 1100] }
            : { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(printable).save()
    } catch (error) {
      console.warn('Invoice PDF download failed; opening print dialog instead.', error)
      const clearPrintTarget = () => setPrintTargetInvoice(null)
      window.addEventListener('afterprint', clearPrintTarget, { once: true })
      window.print()
      return
    }
      setPrintTargetInvoice(null)
      return
  }

  // =========================================================
  // RENDER: Super Admin Master Platform Dashboard
  // =========================================================
  if (appState === 'admin') {
    return (
      <SuperAdminDashboard
        user={currentUser}
        onSwitchToWorkspace={() => setAppState('workspace')}
        onLogout={handleBackToPublicSite}
      />
    )
  }

  // =========================================================
  // RENDER: If logged in → Swipe-Style Workspace (no Navbar)
  // =========================================================
  if (appState === 'workspace' && currentView !== 'editor') {
    return (
      <>
        {currentUser?.role === 'super_admin' && (
          <div style={{
            background: '#0b1329',
            color: '#38bdf8',
            padding: '8px 20px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1e3a8a'
          }}>
            <span> Super Admin Preview Mode: Viewing workspace as a business owner.</span>
            <button
              onClick={() => setAppState('admin')}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Icon name="arrowLeft" size={14} /> Back to Admin Command Center
            </button>
          </div>
        )}
        <AppWorkspace
          activeTab={workspaceTab}
          setActiveTab={setWorkspaceTab}
          editingInvoiceInTemplate={editingInvoiceInTemplate}
          setEditingInvoiceInTemplate={setEditingInvoiceInTemplate}
          invoices={invoices}
          setInvoices={setInvoices}
          quotations={quotations}
          setQuotations={setQuotations}
          customers={customers}
          setCustomers={setCustomers}
          creditNotes={creditNotes}
          setCreditNotes={setCreditNotes}
          products={products}
          setProducts={setProducts}
          businessProfile={businessProfile}
          setBusinessProfile={setBusinessProfile}
          onNewInvoice={handleStartNewInvoice}
          onNewQuotation={handleStartNewQuotation}
          onEditInvoice={handleEditInvoiceInMixer}
          onEditQuotation={(q) => {
            setActiveInvoice({
              ...q,
              docType: q.docType === 'quotation' ? 'quote' : (q.docType || 'quote'),
              invoiceNumber: q.invoiceNumber || q.quoteNumber,
              invoiceDate: q.invoiceDate || q.quoteDate,
              dueDate: q.dueDate || q.validUntil
            })
            setCurrentView('editor')
            setEditorOrigin(null)
          }}
          onPrintDocument={handlePrint}
          onBackToPublicSite={handleBackToPublicSite}
          onSubscribe={handleOpenSubscription}
          onProTrialChange={setProTrial}
          currentUser={currentUser}
        />

        <SubscriptionModal
          isOpen={isSubscribeOpen}
          onClose={() => setIsSubscribeOpen(false)}
          currentUser={currentUser}
          initialPlan={planToBuy}
          initialBillingCycle={billingCycleToBuy}
          onSubscriptionSuccess={(updatedUser) => setCurrentUser(updatedUser)}
        />

        {printTargetInvoice && (
          <div className="print-target-overlay">
            <InvoicePreview invoice={printTargetInvoice} isPrintOnly={true} isPro={getEffectivePlan(planAccessUser) !== 'free'} />
          </div>
        )}
      </>
    )
  }

  // =========================================================
  // RENDER: Editor (accessible from both public & workspace)
  // =========================================================
  if (currentView === 'editor') {
    return (
      <>
        <InvoiceEditor
          key={activeInvoice?.id || 'editor'}
          initialInvoice={activeInvoice}
          invoices={invoices}
          creditNotes={creditNotes}
          isPro={getEffectivePlan(planAccessUser) !== 'free'}
          originTab={editorOrigin}
          onSave={handleSaveInvoice}
          onBack={(document) => {
            if (appState === 'workspace') {
              if (editorOrigin === 'templates') {
                setWorkspaceTab('templates')
              } else if (editorOrigin === 'quotations' || ['quote', 'quotation', 'estimate'].includes(document?.docType)) {
                setWorkspaceTab('quotations')
              }
              setCurrentView('workspace')
              setEditorOrigin(null)
            } else {
              setCurrentView('home')
            }
          }}
          onPrint={(document) => handlePrint(document || activeInvoice)}
          onUpgrade={handleOpenSubscription}
        />
        <SubscriptionModal
          isOpen={isSubscribeOpen}
          onClose={() => setIsSubscribeOpen(false)}
          currentUser={currentUser}
          initialPlan={planToBuy}
          initialBillingCycle={billingCycleToBuy}
          onSubscriptionSuccess={(updatedUser) => setCurrentUser(updatedUser)}
        />
        {printTargetInvoice && (
          <div className="print-target-overlay">
            <InvoicePreview invoice={printTargetInvoice} isPrintOnly={true} isPro={getEffectivePlan(planAccessUser) !== 'free'} />
          </div>
        )}
      </>
    )
  }

  // =========================================================
  // RENDER: Public Invoxa Landing Page (default)
  // =========================================================
  return (
    <div className="website">
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onOpenAuth={handleOpenAuth}
        onNewInvoice={handleStartNewInvoice}
      />

      <LandingPage
        onInvoiceGenerated={handleInvoiceGenerated}
        onCreateInvoice={() => handleStartNewInvoice()}
        onOpenDashboard={() => handleOpenAuth('signin')}
        onOpenAuth={handleOpenAuth}
      />

      {printTargetInvoice && (
        <div className="print-target-overlay">
          <InvoicePreview invoice={printTargetInvoice} isPrintOnly={true} isPro={getEffectivePlan(planAccessUser) !== 'free'} />
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}
