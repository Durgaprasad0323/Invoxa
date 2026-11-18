import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import InvoiceEditor from './components/InvoiceEditor'
import AuthModal from './components/AuthModal'
import InvoicePreview from './components/InvoicePreview'
import AppWorkspace from './components/workspace/AppWorkspace'
import SuperAdminDashboard from './components/admin/SuperAdminDashboard'
import SubscriptionModal from './components/subscription/SubscriptionModal'
import { api } from './utils/apiClient'
import { initialSampleInvoices } from './utils/sampleInvoices'
import { initialCustomers, initialProducts, initialQuotations, initialBusinessProfile } from './utils/workspaceData'
import { parseInvoicePrompt } from './utils/aiParser'
import './App.css'

export default function App() {
  // States: 'public' (landing page) | 'workspace' (Swipe-style logged-in app) | 'admin' (Super Admin platform control)
  const [appState, setAppState] = useState('public')
  const [currentView, setCurrentView] = useState('home') // for public: 'home' | 'editor'
  const [currentUser, setCurrentUser] = useState(null)
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
    try { return JSON.parse(localStorage.getItem('invoxa_products')) || initialProducts } catch { return initialProducts }
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
        if (data.products) setProducts(data.products)
      }).catch(() => {})
    }
  }, [])

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user)
    if (user && user.role === 'super_admin') {
      setAppState('admin')
    } else {
      setAppState('workspace')
    }

    // Refresh company, invoices, customers, products for this specific user
    try {
      const meData = await api.getMe()
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
          upiId: ''
        })
      }

      const invData = await api.getInvoices()
      setInvoices(invData.invoices || [])

      const custData = await api.getCustomers()
      setCustomers(custData.customers || [])

      const prodData = await api.getProducts()
      setProducts(prodData.products || [])
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
    setCurrentUser(null)
    setInvoices(initialSampleInvoices)
    setCustomers(initialCustomers)
    setProducts(initialProducts)
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
      status: prefill.status || 'Unpaid',
      theme: prefill.theme || 'emerald',
      seller: {
        name: 'Krishna Enterprises',
        gstin: '27AABCI1234F1Z5',
        pan: 'AABCI1234F',
        address: 'Shop No. 4, Commercial Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '+91 98200 12345',
        email: 'billing@krishnaenterprises.com',
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
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200012345678',
        ifsc: 'HDFC0000240',
        upiId: 'krishna@okhdfc',
        ...(prefill.paymentDetails || {})
      },
      layout: prefill.layout || 'classic',
      themeColor: prefill.themeColor || '#15865a',
      artStyle: prefill.artStyle || 'none',
      stampStyle: prefill.stampStyle || 'brand',
      sigType: prefill.sigType || 'script',
      verifiedSeal: prefill.verifiedSeal !== undefined ? prefill.verifiedSeal : true,
      logoImgUrl: prefill.logoImgUrl || null,
      upiQrUrl: prefill.upiQrUrl || null,
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
      quoteNumber: nextNum,
      quoteDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Draft',
      docType: 'quotation',
      ...prefill,
      client: { ...baseInvoice.client, ...(prefill.client || {}) },
      items: prefill.items || baseInvoice.items
    }
    setActiveInvoice(freshQuote)
    setCurrentView('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveInvoice = async (savedInvoice) => {
    setInvoices(prev => {
      const idx = prev.findIndex(inv => inv.id === savedInvoice.id)
      if (idx >= 0) { const copy = [...prev]; copy[idx] = savedInvoice; return copy }
      return [savedInvoice, ...prev]
    })
    setActiveInvoice(savedInvoice)

    // Save to backend database
    try {
      if (localStorage.getItem('invoxa_token')) {
        await api.createInvoice(savedInvoice)
      }
    } catch (err) {
      console.warn('Backend sync error (saved locally):', err.message)
    }
  }

  const handleEditInvoiceInMixer = (inv) => {
    setEditingInvoiceInTemplate(inv)
    setWorkspaceTab('templates')
    setAppState('workspace')
    setCurrentView('workspace')
  }

  const handlePrint = (invoiceToPrint) => {
    if (invoiceToPrint) {
      setPrintTargetInvoice(invoiceToPrint)
      setTimeout(() => { window.print(); setPrintTargetInvoice(null) }, 150)
    } else {
      window.print()
    }
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
            <span>👑 Super Admin Preview Mode: Viewing workspace as a business owner.</span>
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
              ← Back to Admin Command Center
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
          products={products}
          setProducts={setProducts}
          businessProfile={businessProfile}
          setBusinessProfile={setBusinessProfile}
          onNewInvoice={handleStartNewInvoice}
          onNewQuotation={handleStartNewQuotation}
          onEditInvoice={handleEditInvoiceInMixer}
          onEditQuotation={(q) => { setActiveInvoice(q); setCurrentView('editor'); setEditorOrigin(null); }}
          onPrintDocument={handlePrint}
          onBackToPublicSite={handleBackToPublicSite}
          onSubscribe={() => setIsSubscribeOpen(true)}
          currentUser={currentUser}
        />

        <SubscriptionModal
          isOpen={isSubscribeOpen}
          onClose={() => setIsSubscribeOpen(false)}
          currentPlan={currentUser?.plan}
          onSubscriptionSuccess={(updatedUser) => setCurrentUser(updatedUser)}
        />

        {printTargetInvoice && (
          <div className="print-target-overlay">
            <InvoicePreview invoice={printTargetInvoice} isPrintOnly={true} />
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
          originTab={editorOrigin}
          onSave={handleSaveInvoice}
          onBack={() => {
            if (appState === 'workspace') {
              if (editorOrigin === 'templates') {
                setWorkspaceTab('templates')
              }
              setCurrentView('workspace')
              setEditorOrigin(null)
            } else {
              setCurrentView('home')
            }
          }}
          onPrint={() => handlePrint(activeInvoice)}
        />
        {printTargetInvoice && (
          <div className="print-target-overlay">
            <InvoicePreview invoice={printTargetInvoice} isPrintOnly={true} />
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
          <InvoicePreview invoice={printTargetInvoice} isPrintOnly={true} />
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
