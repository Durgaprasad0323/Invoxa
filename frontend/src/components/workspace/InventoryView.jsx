import React, { useState } from 'react'

const SAMPLE_INVENTORY = [
  { id: 'inv1', sku: 'SKU-FURN-01', name: 'Executive Ergonomic Chair', stock: 18, minStock: 5, unit: 'Nos', buyPrice: 4200, sellPrice: 7500, status: 'In Stock' },
  { id: 'inv2', sku: 'SKU-FURN-02', name: 'Modular Workstation Desk (120x60)', stock: 4, minStock: 6, unit: 'Nos', buyPrice: 8500, sellPrice: 14500, status: 'Low Stock' },
  { id: 'inv3', sku: 'SKU-ELEC-09', name: 'Cat6 Ethernet Patch Cable 3m', stock: 120, minStock: 20, unit: 'Pcs', buyPrice: 85, sellPrice: 220, status: 'In Stock' },
  { id: 'inv4', sku: 'SKU-ELEC-15', name: 'Multi-plug Surge Protector 4-way', stock: 0, minStock: 10, unit: 'Pcs', buyPrice: 420, sellPrice: 890, status: 'Out of Stock' },
  { id: 'inv5', sku: 'SKU-MAT-04', name: 'Birch Plywood Sheet 18mm (8x4)', stock: 32, minStock: 15, unit: 'Sheets', buyPrice: 1950, sellPrice: 2800, status: 'In Stock' },
]

export default function InventoryView({ searchQuery = '' }) {
  const [items, setItems] = useState(SAMPLE_INVENTORY)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ sku: '', name: '', stock: '', minStock: '5', unit: 'Nos', buyPrice: '', sellPrice: '' })

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!form.name || !form.stock) return
    const stockVal = parseInt(form.stock, 10)
    const minVal = parseInt(form.minStock, 10) || 5
    const status = stockVal === 0 ? 'Out of Stock' : stockVal <= minVal ? 'Low Stock' : 'In Stock'

    const newItem = {
      id: `inv_${Date.now()}`,
      sku: form.sku || `SKU-GEN-${String(items.length + 10).padStart(2, '0')}`,
      name: form.name,
      stock: stockVal,
      minStock: minVal,
      unit: form.unit,
      buyPrice: parseFloat(form.buyPrice) || 0,
      sellPrice: parseFloat(form.sellPrice) || 0,
      status
    }
    setItems(prev => [newItem, ...prev])
    setForm({ sku: '', name: '', stock: '', minStock: '5', unit: 'Nos', buyPrice: '', sellPrice: '' })
    setShowModal(false)
  }

  const updateStock = (id, delta) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const nextStock = Math.max(0, item.stock + delta)
      const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= item.minStock ? 'Low Stock' : 'In Stock'
      return { ...item, stock: nextStock, status: nextStatus }
    }))
  }

  const totalStockValuation = items.reduce((s, i) => s + (i.stock * i.buyPrice), 0)
  const lowStockCount = items.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length

  return (
    <div className="workspace-view-container">
      <div className="table-controls-bar">
        <div>
          <h3>Inventory Management</h3>
          <p className="section-subtext">Real-time stock tracking, low-stock reorder thresholds, and warehouse valuation.</p>
        </div>
        <button className="btn-primary-action" onClick={() => setShowModal(true)}>+ Add Stock Item</button>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Total SKUs in Warehouse</span>
          <span className="metric-value">{items.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Warehouse Inventory Value</span>
          <span className="metric-value">₹{totalStockValuation.toLocaleString('en-IN')}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Reorder / Low Stock Alerts</span>
          <span className="metric-value" style={{ color: lowStockCount > 0 ? '#dc2626' : '#16a34a' }}>
            {lowStockCount} items
          </span>
        </div>
      </div>

      <div className="swipe-table-wrap">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item Name</th>
              <th>Current Stock</th>
              <th>Threshold</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock Status</th>
              <th>Quick Adjust</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="empty-row">No items found.</td></tr>
            ) : filtered.map(i => (
              <tr key={i.id}>
                <td><code>{i.sku}</code></td>
                <td><strong>{i.name}</strong></td>
                <td>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>{i.stock}</span> {i.unit}
                </td>
                <td><span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Min: {i.minStock} {i.unit}</span></td>
                <td>₹{i.buyPrice.toLocaleString('en-IN')}</td>
                <td><strong>₹{i.sellPrice.toLocaleString('en-IN')}</strong></td>
                <td>
                  <span className={`status-pill ${
                    i.status === 'In Stock' ? 'pill-paid' :
                    i.status === 'Low Stock' ? 'pill-draft' : 'pill-unpaid'
                  }`}>
                    {i.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions" style={{ display: 'flex', gap: 6 }}>
                    <button className="row-action-btn" title="Add 1 unit" onClick={() => updateStock(i.id, 1)}>+1</button>
                    <button className="row-action-btn" title="Deduct 1 unit" onClick={() => updateStock(i.id, -1)}>-1</button>
                    <button className="row-action-btn danger" title="Delete" onClick={() => setItems(prev => prev.filter(x => x.id !== i.id))}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Stock Item</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Item Name *</label>
                <input className="form-input" placeholder="e.g. Ergonomic Office Chair"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>SKU / Barcode</label>
                <input className="form-input" placeholder="e.g. SKU-FURN-03"
                  value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-row">
                  <label>Current Stock Qty *</label>
                  <input className="form-input" type="number" placeholder="25"
                    value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Min Reorder Alert</label>
                  <input className="form-input" type="number" placeholder="5"
                    value={form.minStock} onChange={e => setForm(p => ({ ...p, minStock: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-row">
                  <label>Unit</label>
                  <select className="form-input" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                    <option>Nos</option>
                    <option>Pcs</option>
                    <option>Kg</option>
                    <option>Mtr</option>
                    <option>Boxes</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Cost / Buy (₹)</label>
                  <input className="form-input" type="number" placeholder="4200"
                    value={form.buyPrice} onChange={e => setForm(p => ({ ...p, buyPrice: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Sell Price (₹)</label>
                  <input className="form-input" type="number" placeholder="7500"
                    value={form.sellPrice} onChange={e => setForm(p => ({ ...p, sellPrice: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-action" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-action" onClick={handleAdd}>Save to Inventory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
