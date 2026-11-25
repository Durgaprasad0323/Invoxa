import { db } from '../config/db.js'
import { randomUUID } from 'crypto'

export const getProducts = (req, res) => {
  try {
    const isSuper = req.user.role === 'super_admin'
    const companyId = req.user.companyId

    const products = isSuper
      ? db.data.products
      : db.data.products.filter(p => p.companyId === companyId)

    return res.json({ count: products.length, products })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve products.' })
  }
}

export const createProduct = (req, res) => {
  try {
    const data = req.body
    if (!data.name) {
      return res.status(400).json({ error: 'Product/Service name is required.' })
    }

    const newProduct = {
      ...data,
      id: `prod_${randomUUID()}`,
      companyId: req.user.companyId,
      price: parseFloat(data.price ?? data.rate ?? 0),
      buyPrice: parseFloat(data.buyPrice || 0),
      stock: Math.max(0, parseFloat(data.stock || 0)),
      minStock: Math.max(0, parseFloat(data.minStock || 0)),
      trackInventory: Boolean(data.trackInventory),
      sku: data.sku || '',
      stockMovements: Array.isArray(data.stockMovements) ? data.stockMovements : [],
      taxRate: parseFloat(data.taxRate || 18),
      hsnSac: data.hsnSac || '998314',
      unit: data.unit || 'nos',
      createdAt: new Date().toISOString()
    }

    db.data.products.unshift(newProduct)
    db.save()

    return res.status(201).json({ message: 'Product added successfully!', product: newProduct })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add product.' })
  }
}

export const updateProduct = (req, res) => {
  try {
    const { id } = req.params
    const idx = db.data.products.findIndex(p => p.id === id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    const existing = db.data.products[idx]
    if (req.user.role !== 'super_admin' && existing.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'Unauthorized to update this product.' })
    }

    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      companyId: existing.companyId,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : req.body.rate !== undefined ? parseFloat(req.body.rate) : existing.price,
      taxRate: req.body.taxRate !== undefined ? parseFloat(req.body.taxRate) : existing.taxRate,
      buyPrice: req.body.buyPrice !== undefined ? parseFloat(req.body.buyPrice) : existing.buyPrice,
      stock: req.body.stock !== undefined ? Math.max(0, parseFloat(req.body.stock)) : existing.stock,
      minStock: req.body.minStock !== undefined ? Math.max(0, parseFloat(req.body.minStock)) : existing.minStock,
      trackInventory: req.body.trackInventory !== undefined ? Boolean(req.body.trackInventory) : existing.trackInventory,
      sku: req.body.sku !== undefined ? req.body.sku : existing.sku,
      updatedAt: new Date().toISOString()
    }

    db.data.products[idx] = updated
    db.save()

    return res.json({ message: 'Product updated successfully!', product: updated })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update product.' })
  }
}

export const deleteProduct = (req, res) => {
  try {
    const { id } = req.params
    const idx = db.data.products.findIndex(p => p.id === id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    const existing = db.data.products[idx]
    if (req.user.role !== 'super_admin' && existing.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'Unauthorized to delete this product.' })
    }

    db.data.products.splice(idx, 1)
    db.save()
    db.removeProduct(id)

    return res.json({ message: 'Product deleted successfully!' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product.' })
  }
}
