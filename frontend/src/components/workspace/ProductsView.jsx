import React, { useMemo, useState } from 'react'
import { formatINR } from '../../utils/calculations'
import Icon from '../ui/Icon'

const blankProduct = () => ({ name: '', sku: '', category: 'General', hsnSac: '', unit: 'Pcs', rate: '', buyPrice: '', taxRate: 18, trackInventory: false, stock: 0, minStock: 0 })
const productRate = product => Number(product.rate ?? product.price ?? 0)

export default function ProductsView({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct, searchQuery = '' }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blankProduct)
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const stockProducts = products.filter(product => product.trackInventory)
  const stockValue = stockProducts.reduce((sum, product) => sum + (Number(product.stock) || 0) * (Number(product.buyPrice) || 0), 0)
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return products.filter(product => {
      const kindMatches = filter === 'All' || (filter === 'Products' ? product.trackInventory : !product.trackInventory)
      const textMatches = !query || [product.name, product.category, product.sku, product.hsnSac].some(value => String(value || '').toLowerCase().includes(query))
      return kindMatches && textMatches
    })
  }, [products, filter, searchQuery])

  const openNew = () => { setEditingId(null); setForm(blankProduct()); setError(''); setShowForm(true) }
  const openEdit = product => {
    setEditingId(product.id)
    setForm({ ...blankProduct(), ...product, rate: productRate(product), buyPrice: product.buyPrice ?? '' })
    setError('')
    setShowForm(true)
  }
  const handleSave = event => {
    event.preventDefault()
    const rate = Number(form.rate)
    if (!form.name.trim() || !Number.isFinite(rate) || rate < 0) {
      setError('Enter an item name and a valid selling price.')
      return
    }
    const saved = {
      ...form,
      id: editingId || `prod_${Date.now()}`,
      name: form.name.trim(),
      category: form.category.trim() || 'General',
      sku: form.sku.trim(),
      hsnSac: form.hsnSac.trim(),
      rate,
      price: rate,
      buyPrice: Number(form.buyPrice) || 0,
      taxRate: Number(form.taxRate) || 0,
      stock: form.trackInventory ? Math.max(0, Number(form.stock) || 0) : 0,
      minStock: form.trackInventory ? Math.max(0, Number(form.minStock) || 0) : 0,
      trackInventory: Boolean(form.trackInventory)
    }
    if (editingId) onUpdateProduct?.(editingId, saved)
    else onAddProduct?.(saved)
    setShowForm(false)
    setEditingId(null)
  }

  const removeProduct = product => {
    if (window.confirm(`Delete ${product.name} from your catalog?`)) onDeleteProduct?.(product.id)
  }

  return (
    <div className="workspace-view-container catalog-page">
      <div className="table-controls-bar purchases-heading">
        <div><h3>Products & Services</h3><p className="section-subtext">Manage your item catalog, pricing, HSN/SAC and GST defaults.</p></div>
        <button type="button" className="btn-primary-action" onClick={openNew}>+ Add Item</button>
      </div>

      <div className="metrics-row purchases-metrics">
        <div className="metric-card"><span className="metric-label">Catalog Items</span><span className="metric-value">{products.length}</span></div>
        <div className="metric-card"><span className="metric-label">Stock Tracked</span><span className="metric-value">{stockProducts.length}</span></div>
        <div className="metric-card"><span className="metric-label">Stock Cost Value</span><span className="metric-value">{formatINR(stockValue)}</span></div>
      </div>

      <div className="purchases-toolbar">
        <div className="tab-filters" role="group" aria-label="Filter catalog items">{['All', 'Products', 'Services'].map(value => <button type="button" key={value} className={`filter-btn ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>{value}</button>)}</div>
        <span className="purchases-count">{visible.length} {visible.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="swipe-table-wrap purchases-table-wrap">
        <table className="swipe-table purchases-table">
          <thead><tr><th>Item</th><th>SKU / HSN</th><th>Category</th><th>Unit</th><th>Sell Price</th><th>GST</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {visible.length === 0 ? <tr><td colSpan={8} className="empty-row">{products.length ? 'No items match your search.' : 'Your catalog is empty. Add a product or service to use it in invoices.'}</td></tr> : visible.map(product => {
              const stock = Number(product.stock) || 0
              const threshold = Number(product.minStock) || 0
              const stockStatus = !product.trackInventory ? 'Service' : stock === 0 ? 'Out of stock' : stock <= threshold ? 'Low stock' : 'In stock'
              return <tr key={product.id}>
                <td><div className="purchase-vendor-cell"><strong>{product.name}</strong>{product.trackInventory && <small>Cost: {formatINR(Number(product.buyPrice) || 0)}</small>}</div></td>
                <td><div className="purchase-vendor-cell"><span>{product.sku || '—'}</span>{product.hsnSac && <small>HSN/SAC: {product.hsnSac}</small>}</div></td>
                <td>{product.category || 'General'}</td><td>{product.unit || 'Pcs'}</td><td><strong>{formatINR(productRate(product))}</strong></td><td>{Number(product.taxRate) || 0}%</td>
                <td><span className={`status-pill ${stockStatus === 'In stock' ? 'pill-paid' : stockStatus === 'Low stock' || stockStatus === 'Out of stock' ? 'pill-unpaid' : 'pill-draft'}`}>{product.trackInventory ? `${stock} ${product.unit || 'Pcs'} · ${stockStatus}` : 'Not tracked'}</span></td>
                <td><div className="row-actions"><button type="button" className="row-action-btn" title="Edit item" aria-label={`Edit ${product.name}`} onClick={() => openEdit(product)}><Icon name="edit" size={15} /></button><button type="button" className="row-action-btn danger" title="Delete item" aria-label={`Delete ${product.name}`} onClick={() => removeProduct(product)}><Icon name="trash" size={15} /></button></div></td>
              </tr>
            })}
          </tbody>
        </table>
      </div>

      {showForm && <div className="purchase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false) }}>
        <form className="purchase-modal catalog-modal" onSubmit={handleSave} role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title">
          <header className="purchase-modal-header"><div><span className="purchases-eyebrow">ITEM CATALOG</span><h2 id="catalog-modal-title">{editingId ? 'Edit item' : 'Add product or service'}</h2><p>Set invoice defaults and choose whether to track stock.</p></div><button className="purchase-modal-close" type="button" aria-label="Close item form" onClick={() => setShowForm(false)}>×</button></header>
          <div className="purchase-modal-content">
            <div className="purchase-form-grid">
              <label className="purchase-field purchase-field-wide">Item name *<input autoFocus required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Product or service name" /></label>
              <label className="purchase-field">Category<input value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))} placeholder="General" /></label>
              <label className="purchase-field">SKU / code<input value={form.sku} onChange={event => setForm(current => ({ ...current, sku: event.target.value }))} /></label>
              <label className="purchase-field">HSN / SAC<input value={form.hsnSac} onChange={event => setForm(current => ({ ...current, hsnSac: event.target.value }))} /></label>
              <label className="purchase-field">Unit<input value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))} placeholder="Pcs, kg, hour" /></label>
              <label className="purchase-field">Selling price (₹) *<input type="number" min="0" step="0.01" required value={form.rate} onChange={event => setForm(current => ({ ...current, rate: event.target.value }))} /></label>
              <label className="purchase-field">GST rate<select value={form.taxRate} onChange={event => setForm(current => ({ ...current, taxRate: event.target.value }))}>{[0, 3, 5, 12, 18, 28].map(rate => <option key={rate} value={rate}>{rate}%</option>)}</select></label>
              <label className="purchase-field purchase-stock-toggle"><span><input type="checkbox" checked={Boolean(form.trackInventory)} onChange={event => setForm(current => ({ ...current, trackInventory: event.target.checked }))} /> Track stock for this product</span></label>
              {form.trackInventory && <>
                <label className="purchase-field">Opening stock<input type="number" min="0" step="any" value={form.stock} onChange={event => setForm(current => ({ ...current, stock: event.target.value }))} /></label>
                <label className="purchase-field">Low stock alert at<input type="number" min="0" step="any" value={form.minStock} onChange={event => setForm(current => ({ ...current, minStock: event.target.value }))} /></label>
                <label className="purchase-field">Cost / buy price (₹)<input type="number" min="0" step="0.01" value={form.buyPrice} onChange={event => setForm(current => ({ ...current, buyPrice: event.target.value }))} /></label>
              </>}
            </div>
            {error && <p className="purchase-form-error" role="alert">{error}</p>}
          </div>
          <footer className="purchase-modal-footer"><button type="button" className="btn-secondary-action" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary-action">{editingId ? 'Save changes' : 'Save item'}</button></footer>
        </form>
      </div>}
    </div>
  )
}
