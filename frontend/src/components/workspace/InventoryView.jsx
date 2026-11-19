import React, { useMemo, useState } from 'react'
import { formatINR } from '../../utils/calculations'
import Icon from '../ui/Icon'

const blankForm = () => ({ name: '', sku: '', category: 'General', hsnSac: '', unit: 'Pcs', buyPrice: '', sellPrice: '', taxRate: 18, stock: 0, minStock: 5 })
const getStockStatus = item => Number(item.stock) <= 0 ? 'Out of stock' : Number(item.stock) <= Number(item.minStock || 0) ? 'Low stock' : 'In stock'
const formatMovementDate = value => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

export default function InventoryView({ products = [], onAddProduct, onUpdateProduct, searchQuery = '' }) {
  const [filter, setFilter] = useState('All stock')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(blankForm)
  const [adjustingItem, setAdjustingItem] = useState(null)
  const [historyItem, setHistoryItem] = useState(null)
  const [adjustment, setAdjustment] = useState({ quantity: '', direction: 'add', reason: 'Purchase received' })
  const [error, setError] = useState('')
  const items = products.filter(product => product.trackInventory)
  const lowStockCount = items.filter(item => getStockStatus(item) !== 'In stock').length
  const stockValue = items.reduce((sum, item) => sum + (Number(item.stock) || 0) * (Number(item.buyPrice) || 0), 0)
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return items.filter(item => {
      const status = getStockStatus(item)
      const statusMatches = filter === 'All stock' || (filter === 'Low stock' && status === 'Low stock') || (filter === 'Out of stock' && status === 'Out of stock')
      const searchMatches = !query || [item.name, item.sku, item.category, item.hsnSac].some(value => String(value || '').toLowerCase().includes(query))
      return statusMatches && searchMatches
    })
  }, [items, filter, searchQuery])

  const openAdd = () => { setForm(blankForm()); setError(''); setShowAdd(true) }
  const saveItem = event => {
    event.preventDefault()
    const stock = Number(form.stock)
    const sellPrice = Number(form.sellPrice)
    if (!form.name.trim() || !Number.isFinite(stock) || stock < 0 || !Number.isFinite(sellPrice) || sellPrice < 0) {
      setError('Enter an item name, a valid opening quantity, and a selling price.')
      return
    }
    onAddProduct?.({
      ...form,
      id: `prod_${Date.now()}`,
      name: form.name.trim(),
      category: form.category.trim() || 'General',
      sku: form.sku.trim(),
      hsnSac: form.hsnSac.trim(),
      rate: sellPrice,
      price: sellPrice,
      buyPrice: Number(form.buyPrice) || 0,
      taxRate: Number(form.taxRate) || 0,
      stock,
      minStock: Number(form.minStock) || 0,
      trackInventory: true
    })
    setShowAdd(false)
  }

  const openAdjustment = item => {
    setAdjustingItem(item)
    setAdjustment({ quantity: '', direction: 'add', reason: 'Purchase received' })
    setError('')
  }
  const saveAdjustment = event => {
    event.preventDefault()
    const quantity = Number(adjustment.quantity)
    if (!adjustingItem || !Number.isFinite(quantity) || quantity <= 0) {
      setError('Enter a quantity greater than zero.')
      return
    }
    if (adjustment.direction === 'remove' && quantity > Number(adjustingItem.stock || 0)) {
      setError('The removed quantity cannot exceed the available stock.')
      return
    }
    const nextStock = Math.max(0, Number(adjustingItem.stock || 0) + (adjustment.direction === 'add' ? quantity : -quantity))
    const movement = {
      id: `stock_${Date.now()}`,
      quantity,
      direction: adjustment.direction,
      reason: adjustment.reason,
      date: new Date().toISOString(),
      previousStock: Number(adjustingItem.stock) || 0,
      newStock: nextStock
    }
    onUpdateProduct?.(adjustingItem.id, { stock: nextStock, stockMovements: [...(adjustingItem.stockMovements || []), movement] })
    setAdjustingItem(null)
  }
  const stopTracking = item => {
    if (window.confirm(`Stop tracking stock for ${item.name}? It will remain in Products & Services.`)) onUpdateProduct?.(item.id, { trackInventory: false })
  }

  return (
    <div className="workspace-view-container inventory-page">
      <div className="table-controls-bar purchases-heading"><div><h3>Inventory</h3><p className="section-subtext">Track product quantities, stock adjustments and low stock alerts.</p></div><button type="button" className="btn-primary-action" onClick={openAdd}>+ Add Stock Item</button></div>
      <div className="metrics-row purchases-metrics">
        <div className="metric-card"><span className="metric-label">Tracked Items</span><span className="metric-value">{items.length}</span></div>
        <div className="metric-card"><span className="metric-label">Stock Cost Value</span><span className="metric-value">{formatINR(stockValue)}</span></div>
        <div className="metric-card"><span className="metric-label">Low / Out of Stock</span><span className={`metric-value ${lowStockCount ? 'purchases-due-value' : 'purchases-itc-value'}`}>{lowStockCount}</span></div>
      </div>
      <div className="purchases-toolbar"><div className="tab-filters" role="group" aria-label="Filter inventory">{['All stock', 'Low stock', 'Out of stock'].map(value => <button type="button" key={value} className={`filter-btn ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>{value}</button>)}</div><span className="purchases-count">{visible.length} tracked {visible.length === 1 ? 'item' : 'items'}</span></div>
      <div className="swipe-table-wrap purchases-table-wrap"><table className="swipe-table purchases-table">
        <thead><tr><th>Item / SKU</th><th>Category</th><th>Available</th><th>Reorder at</th><th>Cost / Unit</th><th>Stock Value</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{visible.length === 0 ? <tr><td colSpan={8} className="empty-row">{items.length ? 'No stock items match this filter.' : 'No products are tracked yet. Add an item here or enable stock tracking in Products & Services.'}</td></tr> : visible.map(item => {
          const status = getStockStatus(item)
          return <tr key={item.id}><td><div className="purchase-vendor-cell"><strong>{item.name}</strong><small>{item.sku || item.hsnSac || 'No SKU'}</small></div></td><td>{item.category || 'General'}</td><td><strong>{Number(item.stock) || 0} {item.unit || 'Pcs'}</strong></td><td>{Number(item.minStock) || 0} {item.unit || 'Pcs'}</td><td>{formatINR(Number(item.buyPrice) || 0)}</td><td><strong>{formatINR((Number(item.stock) || 0) * (Number(item.buyPrice) || 0))}</strong></td><td><span className={`status-pill ${status === 'In stock' ? 'pill-paid' : status === 'Low stock' ? 'pill-unpaid' : 'purchase-status-overdue'}`}>{status}</span></td><td><div className="row-actions"><button type="button" className="row-action-btn" title="Adjust stock" aria-label={`Adjust stock for ${item.name}`} onClick={() => openAdjustment(item)}><Icon name="settings" size={15} /></button><button type="button" className="row-action-btn" title="Stock history" aria-label={`Stock history for ${item.name}`} onClick={() => setHistoryItem(item)}><Icon name="fileText" size={15} /></button><button type="button" className="row-action-btn danger" title="Stop tracking item" aria-label={`Stop tracking ${item.name}`} onClick={() => stopTracking(item)}><Icon name="x" size={15} /></button></div></td></tr>
        })}</tbody>
      </table></div>
      <p className="purchases-storage-note">Inventory is linked to Products & Services. Stock values sync with your account when signed in.</p>

      {showAdd && <div className="purchase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowAdd(false) }}><form className="purchase-modal" onSubmit={saveItem} role="dialog" aria-modal="true" aria-labelledby="inventory-add-title">
        <header className="purchase-modal-header"><div><span className="purchases-eyebrow">INVENTORY</span><h2 id="inventory-add-title">Add stock item</h2><p>This item will also be added to Products & Services.</p></div><button type="button" className="purchase-modal-close" aria-label="Close" onClick={() => setShowAdd(false)}>×</button></header>
        <div className="purchase-modal-content"><div className="purchase-form-grid">
          <label className="purchase-field purchase-field-wide">Item name *<input autoFocus required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} /></label>
          <label className="purchase-field">SKU / barcode<input value={form.sku} onChange={event => setForm(current => ({ ...current, sku: event.target.value }))} /></label><label className="purchase-field">Category<input value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))} /></label>
          <label className="purchase-field">HSN / SAC<input value={form.hsnSac} onChange={event => setForm(current => ({ ...current, hsnSac: event.target.value }))} /></label><label className="purchase-field">Unit<input value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))} /></label>
          <label className="purchase-field">Opening stock *<input type="number" min="0" step="any" required value={form.stock} onChange={event => setForm(current => ({ ...current, stock: event.target.value }))} /></label><label className="purchase-field">Low stock alert at<input type="number" min="0" step="any" value={form.minStock} onChange={event => setForm(current => ({ ...current, minStock: event.target.value }))} /></label>
          <label className="purchase-field">Cost / buy price (₹)<input type="number" min="0" step="0.01" value={form.buyPrice} onChange={event => setForm(current => ({ ...current, buyPrice: event.target.value }))} /></label><label className="purchase-field">Selling price (₹) *<input type="number" min="0" step="0.01" required value={form.sellPrice} onChange={event => setForm(current => ({ ...current, sellPrice: event.target.value }))} /></label>
          <label className="purchase-field">GST rate<select value={form.taxRate} onChange={event => setForm(current => ({ ...current, taxRate: event.target.value }))}>{[0, 5, 12, 18, 28].map(rate => <option value={rate} key={rate}>{rate}%</option>)}</select></label>
        </div>{error && <p className="purchase-form-error" role="alert">{error}</p>}</div>
        <footer className="purchase-modal-footer"><button type="button" className="btn-secondary-action" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="btn-primary-action">Save stock item</button></footer>
      </form></div>}

      {adjustingItem && <div className="purchase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setAdjustingItem(null) }}><form className="purchase-modal inventory-adjust-modal" onSubmit={saveAdjustment} role="dialog" aria-modal="true" aria-labelledby="inventory-adjust-title">
        <header className="purchase-modal-header"><div><span className="purchases-eyebrow">STOCK MOVEMENT</span><h2 id="inventory-adjust-title">Adjust {adjustingItem.name}</h2><p>Current quantity: {adjustingItem.stock} {adjustingItem.unit}</p></div><button type="button" className="purchase-modal-close" aria-label="Close" onClick={() => setAdjustingItem(null)}>×</button></header>
        <div className="purchase-modal-content"><div className="purchase-form-grid">
          <label className="purchase-field">Adjustment<select value={adjustment.direction} onChange={event => setAdjustment(current => ({ ...current, direction: event.target.value }))}><option value="add">Add stock</option><option value="remove">Remove stock</option></select></label>
          <label className="purchase-field">Quantity *<input type="number" min="0.01" step="any" required value={adjustment.quantity} onChange={event => setAdjustment(current => ({ ...current, quantity: event.target.value }))} /></label>
          <label className="purchase-field purchase-field-wide">Reason<select value={adjustment.reason} onChange={event => setAdjustment(current => ({ ...current, reason: event.target.value }))}>{['Purchase received', 'Sale or usage', 'Return', 'Damaged stock', 'Correction', 'Other'].map(reason => <option key={reason}>{reason}</option>)}</select></label>
        </div>{error && <p className="purchase-form-error" role="alert">{error}</p>}</div>
        <footer className="purchase-modal-footer"><button type="button" className="btn-secondary-action" onClick={() => setAdjustingItem(null)}>Cancel</button><button type="submit" className="btn-primary-action">Save adjustment</button></footer>
      </form></div>}

      {historyItem && <div className="purchase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setHistoryItem(null) }}><section className="purchase-modal inventory-history-modal" role="dialog" aria-modal="true" aria-labelledby="inventory-history-title">
        <header className="purchase-modal-header"><div><span className="purchases-eyebrow">INVENTORY</span><h2 id="inventory-history-title">Stock history</h2><p>{historyItem.name} · Current stock: {historyItem.stock} {historyItem.unit || 'Pcs'}</p></div><button type="button" className="purchase-modal-close" aria-label="Close stock history" onClick={() => setHistoryItem(null)}>×</button></header>
        <div className="purchase-modal-content"><div className="inventory-history-list">{[...(historyItem.stockMovements || [])].reverse().map(movement => <article key={movement.id}><div><strong>{movement.reason || 'Stock adjustment'}</strong><small>{formatMovementDate(movement.date)}</small></div><span className={movement.direction === 'add' ? 'purchases-itc-value' : 'purchases-due-value'}>{movement.direction === 'add' ? '+' : '−'}{movement.quantity} {historyItem.unit || 'Pcs'}</span><small>{movement.previousStock ?? '—'} → {movement.newStock ?? '—'} {historyItem.unit || 'Pcs'}</small></article>)}{!(historyItem.stockMovements || []).length && <p className="empty-row">No stock adjustments recorded yet.</p>}</div></div>
        <footer className="purchase-modal-footer"><button type="button" className="btn-primary-action" onClick={() => setHistoryItem(null)}>Done</button></footer>
      </section></div>}
    </div>
  )
}
