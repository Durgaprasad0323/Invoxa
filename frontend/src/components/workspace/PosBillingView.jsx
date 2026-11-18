import React, { useState } from 'react'
import { formatINR } from '../../utils/calculations'

export default function PosBillingView({ products, onCompletePosBill }) {
  const [cart, setCart] = useState([])
  const [todayDate] = useState(() => new Date().toLocaleDateString('en-IN'))
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('Walk-in Customer')
  const [billNumber] = useState(() => `POS-${Date.now().toString().slice(-6)}`)

  const addToCart = (product) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id)
    if (existingIndex > -1) {
      const updated = [...cart]
      updated[existingIndex].qty += 1
      setCart(updated)
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
  }

  const updateQty = (id, delta) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta
          return newQty > 0 ? { ...item, qty: newQty } : null
        }
        return item
      })
      .filter(Boolean)
    setCart(updated)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.rate * item.qty, 0)
  const tax = cart.reduce((sum, item) => sum + (item.rate * item.qty * item.taxRate) / 100, 0)
  const total = Math.round(subtotal + tax)

  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      alert('Please add at least one item to print a receipt.')
      return
    }

    const newInvoice = {
      id: `inv_pos_${Date.now()}`,
      invoiceNumber: billNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Paid',
      theme: 'emerald',
      seller: {
        name: 'Krishna Enterprises',
        gstin: '27AABCI1234F1Z5',
        phone: '+91 98200 12345',
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      client: {
        name: customerName,
        phone: customerPhone,
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      items: cart.map((item) => ({
        id: item.id,
        description: item.name,
        hsnSac: item.hsnSac,
        quantity: item.qty,
        rate: item.rate,
        taxRate: item.taxRate
      })),
      discountRate: 0,
      paymentDetails: {
        upiId: 'krishna.pay@okhdfcbank'
      }
    }

    onCompletePosBill(newInvoice)
    window.print()
  }

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>POS Terminal & 80mm Thermal Receipt</h3>
          <p className="section-subtext">Quick counter billing optimized for speed and thermal receipt printers.</p>
        </div>
      </div>

      <div className="pos-terminal-layout">
        {/* Left: Quick Items Grid */}
        <div className="pos-items-catalog">
          <h4>Tap Item to Add</h4>
          <div className="pos-items-grid">
            {products.map((p) => (
              <div key={p.id} className="pos-item-card" onClick={() => addToCart(p)}>
                <div className="pos-item-name">{p.name}</div>
                <div className="pos-item-price">{formatINR(p.rate)}</div>
                <small className="pos-item-hsn">HSN {p.hsnSac} • {p.taxRate}%</small>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 80mm Receipt Simulator */}
        <div className="thermal-receipt-container">
          <div className="thermal-paper">
            <div className="thermal-header">
              <h3>KRISHNA ENTERPRISES</h3>
              <p>TAX INVOICE / POS RECEIPT</p>
              <p>GSTIN: 27AABCI1234F1Z5</p>
              <p>Date: {todayDate}</p>
              <p>Bill No: {billNumber}</p>
              <div className="dotted-line">--------------------------------</div>
            </div>

            <div className="pos-customer-inputs">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pos-input-field"
              />
              <input
                type="text"
                placeholder="Mobile (+91)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="pos-input-field"
              />
            </div>

            <div className="dotted-line">--------------------------------</div>

            <div className="thermal-items-list">
              {cart.length === 0 ? (
                <p className="empty-cart-hint">Tap items on the left to add</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="thermal-item-row">
                    <div className="item-meta">
                      <span className="name">{item.name}</span>
                      <small>{item.qty} x {item.rate}</small>
                    </div>
                    <div className="item-qty-actions">
                      <button onClick={() => updateQty(item.id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <span className="item-sub">{formatINR(item.qty * item.rate)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="dotted-line">--------------------------------</div>

            <div className="thermal-totals">
              <div className="calc-row">
                <span>Subtotal:</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="calc-row">
                <span>GST:</span>
                <span>{formatINR(tax)}</span>
              </div>
              <div className="calc-row grand-total-row">
                <strong>GRAND TOTAL:</strong>
                <strong>{formatINR(total)}</strong>
              </div>
            </div>

            <div className="dotted-line">--------------------------------</div>

            <div className="thermal-footer">
              <p>Scan & Pay via UPI</p>
              <p>UPI ID: krishna.pay@okhdfcbank</p>
              <p className="thankyou-msg">*** THANK YOU! VISIT AGAIN ***</p>
            </div>

            <button className="thermal-print-btn" onClick={handlePrintReceipt}>
              🖨️ Print 80mm Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
