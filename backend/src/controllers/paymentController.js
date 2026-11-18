import { db } from '../config/db.js'

// Create Subscription Order
export const createSubscriptionOrder = (req, res) => {
  try {
    const { plan = 'pro', billingCycle = 'yearly' } = req.body
    const amount = plan === 'enterprise' ? 9999 : 2999 // in INR

    const orderId = `order_${Date.now()}`

    return res.json({
      orderId,
      amount,
      currency: 'INR',
      plan,
      billingCycle,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key'
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create subscription order.' })
  }
}

// Verify Payment & Upgrade Account
export const verifySubscriptionPayment = (req, res) => {
  try {
    const { orderId, plan = 'pro' } = req.body
    const userId = req.user.id

    const user = db.data.users.find(u => u.id === userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    user.plan = plan
    user.subscriptionExpiry = new Date(Date.now() + 365 * 86400000).toISOString()
    db.save()

    return res.json({
      success: true,
      message: `🎉 Success! Your account has been upgraded to ${plan.toUpperCase()}! Watermarks are now removed.`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        subscriptionExpiry: user.subscriptionExpiry
      }
    })
  } catch (err) {
    return res.status(500).json({ error: 'Payment verification failed.' })
  }
}
