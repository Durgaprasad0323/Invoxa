import { db } from '../config/db.js'

export const getPlatformStats = (req, res) => {
  try {
    const totalUsers = db.data.users.length
    const totalCompanies = db.data.companies.length
    const totalInvoices = db.data.invoices.length

    // Calculate total gross value invoiced across the entire platform
    const totalPlatformVolume = db.data.invoices.reduce((acc, inv) => {
      const itemsSum = (inv.items || []).reduce((sum, item) => {
        const rate = parseFloat(item.rate) || 0
        const qty = parseFloat(item.quantity) || 1
        const taxRate = parseFloat(item.taxRate) || 18
        const amount = rate * qty
        return sum + amount + (amount * taxRate / 100)
      }, 0)
      return acc + itemsSum
    }, 0)

    // Subscriptions stats
    const paidSubscriptions = db.data.users.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length
    const subscriptionRevenue = paidSubscriptions * 2999 // Simulated ₹2,999/yr Pro plan

    return res.json({
      totalUsers,
      totalCompanies,
      totalInvoices,
      totalPlatformVolume: Math.round(totalPlatformVolume),
      paidSubscriptions,
      subscriptionRevenue,
      planBreakdown: {
        free: db.data.users.filter(u => !u.plan || u.plan === 'free').length,
        pro: db.data.users.filter(u => u.plan === 'pro').length,
        enterprise: db.data.users.filter(u => u.plan === 'enterprise').length
      }
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate platform metrics.' })
  }
}

export const getAllUsers = (req, res) => {
  try {
    const users = db.data.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      companyName: u.companyName,
      companyId: u.companyId,
      plan: u.plan || 'free',
      status: u.status || 'active',
      createdAt: u.createdAt
    }))

    return res.json({ count: users.length, users })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve user list.' })
  }
}

export const updateUserPlan = (req, res) => {
  try {
    const { id } = req.params
    const { plan } = req.body

    const user = db.data.users.find(u => u.id === id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    user.plan = plan || 'free'
    db.save()

    return res.json({ message: `User plan updated to ${user.plan}`, user })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update plan.' })
  }
}

export const toggleUserStatus = (req, res) => {
  try {
    const { id } = req.params
    const user = db.data.users.find(u => u.id === id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    user.status = user.status === 'suspended' ? 'active' : 'suspended'
    db.save()

    return res.json({ message: `User status changed to ${user.status}`, user })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user status.' })
  }
}
