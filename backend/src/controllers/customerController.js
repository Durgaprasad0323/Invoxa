import { db } from '../config/db.js'
import { randomUUID } from 'crypto'

export const getCustomers = (req, res) => {
  try {
    const isSuper = req.user.role === 'super_admin'
    const companyId = req.user.companyId

    const customers = isSuper
      ? db.data.customers
      : db.data.customers.filter(c => c.companyId === companyId)

    return res.json({ count: customers.length, customers })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve customers.' })
  }
}

export const createCustomer = (req, res) => {
  try {
    const data = req.body
    if (!data.name) {
      return res.status(400).json({ error: 'Customer name is required.' })
    }

    const newCustomer = {
      ...data,
      id: `cust_${randomUUID()}`,
      companyId: req.user.companyId,
      createdAt: new Date().toISOString()
    }

    db.data.customers.unshift(newCustomer)
    db.save()

    return res.status(201).json({ message: 'Customer added successfully!', customer: newCustomer })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add customer.' })
  }
}

export const updateCustomer = (req, res) => {
  try {
    const { id } = req.params
    const idx = db.data.customers.findIndex(c => c.id === id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Customer not found.' })
    }

    const existing = db.data.customers[idx]
    if (req.user.role !== 'super_admin' && existing.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'Unauthorized to update this customer.' })
    }

    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      companyId: existing.companyId,
      updatedAt: new Date().toISOString()
    }

    db.data.customers[idx] = updated
    db.save()

    return res.json({ message: 'Customer updated successfully!', customer: updated })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update customer.' })
  }
}

export const deleteCustomer = (req, res) => {
  try {
    const { id } = req.params
    const idx = db.data.customers.findIndex(c => c.id === id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Customer not found.' })
    }

    const existing = db.data.customers[idx]
    if (req.user.role !== 'super_admin' && existing.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'Unauthorized to delete this customer.' })
    }

    db.data.customers.splice(idx, 1)
    db.save()
    db.removeCustomer(id)

    return res.json({ message: 'Customer deleted successfully!' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete customer.' })
  }
}
