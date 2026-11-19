import React, { useState } from 'react'
import { formatINR } from '../../utils/calculations'

const todayIso = () => new Date().toISOString().slice(0, 10)

export default function PosBillingView({ products = [], businessProfile = {}, onCompletePosBill }) {
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({
    name: 'Walk-in Customer',
    phone: '',
    email: '',
    gstin: '',
    address: '',
    city: businessProfile.city || '',
    state: businessProfile.state || 'Maharashtra'
  })
  const [seller, setSeller] = useState({
    name: businessProfile.name || 'My Business',
    gstin: businessProfile.gstin || '',
    phone: businessProfile.phone || '',
    email: businessProfile.email || '',
    address: businessProfile.address || '',
    city: businessProfile.city || '',
    state: businessProfile.state || 'Maharashtra',
    bankName: businessProfile.bankName || '',
    accountNumber: businessProfile.accountNumber || '',
    ifsc: businessProfile.ifsc || '',
    upiId: businessProfile.upiId || ''
  })
  const [invoiceDate, setInvoiceDate] = useState(todayIso)
  const [billNumber, setBillNumber] = useState(() => `POS-${Date.now().toString().slice(-6)}`)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [discountRate, setDiscountRate] = useState(0)
  const [editingItemId, setEditingItemId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const updateCustomer = (field, value) => setCustomer(previous => ({ ...previous, [field]: value }))
  const updateSeller = (field, value) => setSeller(previous => ({ ...previous, [field]: value }))

  const addToCart = (product) => {
    const existingIndex = cart.findIndex(item => item.id === product.id)
    if (existingIndex > -1) {
      setCart(previous => previous.map((item, index) => index === existingIndex
        ? { ...item, qty: item.qty + 1 }
        : item))
    } else {
      setCart(previous => [...previous, {
        ...product,
        rate: Number(product.rate) || 0,
        taxRate: Number(product.taxRate) || 0,
        qty: 1
      }])
    }
  }

  const updateCartItem = (id, field, value) => {
    setCart(previous => previous.map(item => {
      if (item.id !== id) return item
      if (field === 'rate' || field === 'taxRate') {
        return { ...item, [field]: value === '' ? '' : Number(value) }
      }
      return { ...item, [field]: value }
    }))
  }

  const updateQty = (id, delta) => {
    setCart(previous => previous
      .map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0))
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.rate) || 0) * item.qty, 0)
  const safeDiscountRate = Math.min(100, Math.max(0, Number(discountRate) || 0))
  const discountAmount = subtotal * safeDiscountRate / 100
  const taxableSubtotal = subtotal - discountAmount
  const tax = cart.reduce((sum, item) => {
    const itemBase = (Number(item.rate) || 0) * item.qty * (1 - safeDiscountRate / 100)
    return sum + itemBase * (Number(item.taxRate) || 0) / 100
  }, 0)
  const total = Math.round(taxableSubtotal + tax)
  const displayDate = invoiceDate
    ? new Date(`${invoiceDate}T00:00:00`).toLocaleDateString('en-IN')
    : ''

  const handlePrintReceipt = async () => {
    if (cart.length === 0) {
      alert('Please add at least one item to print a receipt.')
      return
    }
    if (!seller.name.trim() || !customer.name.trim() || !billNumber.trim()) {
      alert('Business name, customer name, and bill number are required.')
      return
    }

    const newInvoice = {
      id: `inv_pos_${Date.now()}`,
      docType: 'pos',
      invoiceNumber: billNumber.trim(),
      invoiceDate,
      dueDate: invoiceDate,
      status: paymentStatus,
      theme: 'emerald',
      layout: 'thermal',
      seller: { ...seller },
      client: { ...customer },
      items: cart.map(item => ({
        id: item.id,
        description: item.name,
        hsnSac: item.hsnSac || '',
        quantity: item.qty,
        rate: Number(item.rate) || 0,
        taxRate: Number(item.taxRate) || 0
      })),
      discountRate: safeDiscountRate,
      paymentDetails: {
        bankName: seller.bankName,
        accountNumber: seller.accountNumber,
        ifsc: seller.ifsc,
        upiId: seller.upiId
      },
      notes: `Payment method: ${paymentMethod}`
    }

    setIsSaving(true)
    try {
      const saved = await onCompletePosBill?.(newInvoice)
      if (saved === false) return
      window.print()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>POS Terminal &amp; 80mm Thermal Receipt</h3>
          <p className="section-subtext">Quick counter billing optimized for thermal receipt printers. Edit bill and item details before saving.</p>
        </div>
      </div>

      <div className="pos-terminal-layout">
        <div className="pos-items-catalog">
          <h4>Tap Item to Add</h4>
          <div className="pos-items-grid">
            {products.map(product => (
              <button key={product.id} type="button" className="pos-item-card" onClick={() => addToCart(product)}>
                <span className="pos-item-name">{product.name}</span>
                <span className="pos-item-price">{formatINR(Number(product.rate) || 0)}</span>
                <small className="pos-item-hsn">HSN {product.hsnSac || '—'} · {Number(product.taxRate) || 0}%</small>
              </button>
            ))}
            {products.length === 0 && <p className="empty-row">Add products in Products &amp; Services to use POS billing.</p>}
          </div>
        </div>

        <div className="thermal-receipt-container">
          <details className="pos-details-editor">
            <summary>Edit bill details</summary>
            <div className="pos-edit-fields">
              <h5>Business details</h5>
              <label>Business name<input value={seller.name} onChange={event => updateSeller('name', event.target.value)} /></label>
              <label>GSTIN<input value={seller.gstin} onChange={event => updateSeller('gstin', event.target.value)} /></label>
              <label>Phone<input value={seller.phone} onChange={event => updateSeller('phone', event.target.value)} /></label>
              <label>Address<input value={seller.address} onChange={event => updateSeller('address', event.target.value)} /></label>
              <div className="pos-edit-fields-row">
                <label>City<input value={seller.city} onChange={event => updateSeller('city', event.target.value)} /></label>
                <label>State<input value={seller.state} onChange={event => updateSeller('state', event.target.value)} /></label>
              </div>
              <label>UPI ID<input value={seller.upiId} onChange={event => updateSeller('upiId', event.target.value)} /></label>

              <h5>Bill and customer</h5>
              <label>Bill number<input value={billNumber} onChange={event => setBillNumber(event.target.value)} /></label>
              <label>Bill date<input type="date" value={invoiceDate} onChange={event => setInvoiceDate(event.target.value)} /></label>
              <label>Customer name<input value={customer.name} onChange={event => updateCustomer('name', event.target.value)} /></label>
              <label>Customer phone<input type="tel" value={customer.phone} onChange={event => updateCustomer('phone', event.target.value)} /></label>
              <label>Customer email<input type="email" value={customer.email} onChange={event => updateCustomer('email', event.target.value)} /></label>
              <label>Customer GSTIN<input value={customer.gstin} onChange={event => updateCustomer('gstin', event.target.value)} /></label>
              <label>Customer address<input value={customer.address} onChange={event => updateCustomer('address', event.target.value)} /></label>
              <div className="pos-edit-fields-row">
                <label>Customer city<input value={customer.city} onChange={event => updateCustomer('city', event.target.value)} /></label>
                <label>Customer state<input value={customer.state} onChange={event => updateCustomer('state', event.target.value)} /></label>
              </div>
              <div className="pos-edit-fields-row">
                <label>Payment method
                  <select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)}>
                    <option>UPI</option><option>Cash</option><option>Card</option><option>Bank transfer</option><option>Credit</option>
                  </select>
                </label>
                <label>Payment status
                  <select value={paymentStatus} onChange={event => setPaymentStatus(event.target.value)}>
                    <option>Paid</option><option>Unpaid</option>
                  </select>
                </label>
              </div>
              <label>Discount (%)<input type="number" min="0" max="100" step="0.01" value={discountRate} onChange={event => setDiscountRate(event.target.value)} /></label>
            </div>
          </details>

          <div className="thermal-paper">
            <div className="thermal-header">
              <h3>{seller.name || 'Business Name'}</h3>
              <p>TAX INVOICE / POS RECEIPT</p>
              {seller.gstin && <p>GSTIN: {seller.gstin}</p>}
              {seller.phone && <p>Phone: {seller.phone}</p>}
              {seller.address && <p>{seller.address}</p>}
              {(seller.city || seller.state) && <p>{[seller.city, seller.state].filter(Boolean).join(', ')}</p>}
              <p>Date: {displayDate}</p>
              <p>Bill No: {billNumber}</p>
              <div className="dotted-line">--------------------------------</div>
            </div>

            <div className="pos-receipt-customer">
              <strong>{customer.name || 'Customer'}</strong>
              {customer.phone && <span>{customer.phone}</span>}
              {customer.email && <span>{customer.email}</span>}
              {customer.gstin && <span>GSTIN: {customer.gstin}</span>}
              {customer.address && <span>{customer.address}</span>}
              {(customer.city || customer.state) && <span>{[customer.city, customer.state].filter(Boolean).join(', ')}</span>}
            </div>

            <div className="dotted-line">--------------------------------</div>

            <div className="thermal-items-list">
              {cart.length === 0 ? (
                <p className="empty-cart-hint">Tap items on the left to add</p>
              ) : cart.map(item => (
                <div key={item.id} className="thermal-item-row">
                  <div className="item-meta">
                    <span className="name">{item.name}</span>
                    <small>{item.qty} × {formatINR(Number(item.rate) || 0)} · GST {Number(item.taxRate) || 0}%</small>
                    {item.hsnSac && <small>HSN/SAC {item.hsnSac}</small>}
                    {editingItemId === item.id && (
                      <div className="pos-item-edit-panel no-print">
                        <label>Description<input value={item.name} onChange={event => updateCartItem(item.id, 'name', event.target.value)} /></label>
                        <label>HSN/SAC<input value={item.hsnSac || ''} onChange={event => updateCartItem(item.id, 'hsnSac', event.target.value)} /></label>
                        <div className="pos-edit-fields-row">
                          <label>Rate<input type="number" min="0" step="0.01" value={item.rate} onChange={event => updateCartItem(item.id, 'rate', event.target.value)} /></label>
                          <label>GST %<input type="number" min="0" max="100" step="0.01" value={item.taxRate} onChange={event => updateCartItem(item.id, 'taxRate', event.target.value)} /></label>
                        </div>
                      </div>
                    )}
                    <button type="button" className="pos-item-edit-toggle no-print" onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)}>
                      {editingItemId === item.id ? 'Done editing' : 'Edit item details'}
                    </button>
                  </div>
                  <div className="item-qty-actions no-print">
                    <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => updateQty(item.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button type="button" aria-label={`Add one ${item.name}`} onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                  <span className="item-sub">{formatINR(item.qty * (Number(item.rate) || 0))}</span>
                </div>
              ))}
            </div>

            <div className="dotted-line">--------------------------------</div>

            <div className="thermal-totals">
              <div className="calc-row"><span>Subtotal:</span><span>{formatINR(subtotal)}</span></div>
              {discountAmount > 0 && <div className="calc-row"><span>Discount ({safeDiscountRate}%):</span><span>-{formatINR(discountAmount)}</span></div>}
              <div className="calc-row"><span>GST:</span><span>{formatINR(tax)}</span></div>
              <div className="calc-row grand-total-row"><strong>GRAND TOTAL:</strong><strong>{formatINR(total)}</strong></div>
            </div>

            <div className="dotted-line">--------------------------------</div>

            <div className="thermal-footer">
              <p>Payment: {paymentMethod} · {paymentStatus}</p>
              {paymentMethod === 'UPI' && seller.upiId && <p>UPI ID: {seller.upiId}</p>}
              <p className="thankyou-msg">*** THANK YOU! VISIT AGAIN ***</p>
            </div>

            <button className="thermal-print-btn no-print" onClick={handlePrintReceipt} disabled={isSaving}>
              {isSaving ? 'Saving bill…' : ' Save & Print 80mm Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
