import React, { useState } from 'react'
import { formatINR } from '../../utils/calculations'

export default function ProductsView({
  products,
  onAddProduct,
  onDeleteProduct,
  searchQuery = ''
}) {
  const [showModal, setShowModal] = useState(false)
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'General',
    hsnSac: '998314',
    unit: 'Unit',
    rate: '',
    taxRate: 18
  })

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.hsnSac.toLowerCase().includes(q)
    )
  })

  const handleSave = (e) => {
    e.preventDefault()
    if (!newProd.name.trim() || !newProd.rate) return
    onAddProduct({
      ...newProd,
      id: `prod_${Date.now()}`,
      rate: parseFloat(newProd.rate) || 0,
      taxRate: parseFloat(newProd.taxRate) || 0
    })
    setNewProd({
      name: '',
      category: 'General',
      hsnSac: '998314',
      unit: 'Unit',
      rate: '',
      taxRate: 18
    })
    setShowModal(false)
  }

  return (
    <div className="workspace-view-container">
      {/* Control Bar */}
      <div className="table-controls-bar">
        <div>
          <h3>Products & Services Catalog</h3>
          <p className="section-subtext">Manage items, preset rates, and HSN/SAC tax codes for fast billing.</p>
        </div>
        <button className="primary-create-btn" onClick={() => setShowModal(true)}>
          + Add New Item
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="swipe-table">
          <thead>
            <tr>
              <th>ITEM / SERVICE NAME</th>
              <th>CATEGORY</th>
              <th>HSN / SAC</th>
              <th>UNIT</th>
              <th>BASE RATE</th>
              <th>GST RATE</th>
              <th className="actions-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="swipe-row">
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>
                  <span className="badge-category">{p.category}</span>
                </td>
                <td>
                  <code>{p.hsnSac}</code>
                </td>
                <td>{p.unit}</td>
                <td>
                  <strong>{formatINR(p.rate)}</strong>
                </td>
                <td>
                  <span className="badge-tax">{p.taxRate}%</span>
                </td>
                <td>
                  <button
                    className="action-icon-btn delete-btn"
                    onClick={() => onDeleteProduct(p.id)}
                    title="Delete Item"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add Product or Service</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3D Architectural Elevation"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                />
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Design Services"
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>HSN / SAC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 998314"
                    value={newProd.hsnSac}
                    onChange={(e) => setNewProd({ ...newProd, hsnSac: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Price / Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={newProd.rate}
                    onChange={(e) => setNewProd({ ...newProd, rate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Project, Hours, Pcs"
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>GST Rate (%)</label>
                <select
                  value={newProd.taxRate}
                  onChange={(e) => setNewProd({ ...newProd, taxRate: e.target.value })}
                >
                  <option value={0}>0% (Exempt / Healthcare)</option>
                  <option value={3}>3% (Gold & Jewelry)</option>
                  <option value={5}>5% (Transport / F&B)</option>
                  <option value={12}>12% (Pharma / Hotel)</option>
                  <option value={18}>18% (Standard Services / IT)</option>
                  <option value={28}>28% (Luxury Goods)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
