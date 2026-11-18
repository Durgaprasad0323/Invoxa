import { db } from '../config/db.js'

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
      id: data.id || `prod_${Date.now()}`,
      companyId: req.user.companyId,
      price: parseFloat(data.price || 0),
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
      price: req.body.price !== undefined ? parseFloat(req.body.price) : existing.price,
      taxRate: req.body.taxRate !== undefined ? parseFloat(req.body.taxRate) : existing.taxRate,
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
