import { createHmac, randomUUID, timingSafeEqual } from 'crypto'
import { db } from '../config/db.js'
import { UserModel } from '../models/User.js'

const PAID_PLANS = {
  pro: { monthly: 299, yearly: 2499 },
  enterprise: { monthly: 499, yearly: 3499 }
}

const getPlanAmount = (plan, billingCycle) => PAID_PLANS[plan]?.[billingCycle] || 0

const extendBillingExpiry = (startTime, billingCycle) => {
  const expiry = new Date(startTime)
  const targetDay = expiry.getDate()
  if (billingCycle === 'monthly') {
    expiry.setDate(1)
    expiry.setMonth(expiry.getMonth() + 1)
    expiry.setDate(Math.min(targetDay, new Date(expiry.getFullYear(), expiry.getMonth() + 1, 0).getDate()))
  } else {
    expiry.setFullYear(expiry.getFullYear() + 1)
    if (expiry.getDate() !== targetDay) expiry.setDate(0)
  }
  return expiry.toISOString()
}

const getRazorpayCredentials = () => ({
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET
})

const razorpayRequest = async (path, { method = 'GET', body } = {}) => {
  const { keyId, keySecret } = getRazorpayCredentials()
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data?.error?.description || 'Razorpay could not complete the request.')
    error.status = response.status
    throw error
  }
  return data
}

const paymentSetupError = res => res.status(503).json({
  error: 'Online payment is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend environment.'
})

const publicUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  companyName: user.companyName,
  companyId: user.companyId,
  plan: user.plan || 'free',
  billingCycle: user.billingCycle || 'yearly',
  subscriptionExpiry: user.subscriptionExpiry || null
})

const persistSubscriptionState = async user => {
  if (db.isMongoConnected) {
    await UserModel.updateOne({ id: user.id }, {
      $set: {
        plan: user.plan || 'free',
        billingCycle: user.billingCycle || 'yearly',
        subscriptionExpiry: user.subscriptionExpiry || null,
        subscriptionOrders: user.subscriptionOrders || [],
        subscriptionPayments: user.subscriptionPayments || []
      }
    })
  }
  if (!db.saveLocal()) throw new Error('Could not save the payment state to account storage.')
}

export const createSubscriptionOrder = async (req, res) => {
  const { plan = 'pro', billingCycle = 'yearly' } = req.body || {}
  const amount = getPlanAmount(plan, billingCycle)
  if (!amount) {
    return res.status(400).json({ error: 'Choose a valid paid Invoxa plan.' })
  }

  const { keyId, keySecret } = getRazorpayCredentials()
  if (!keyId || !keySecret) return paymentSetupError(res)
  const user = db.data.users.find(entry => entry.id === req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })

  try {
    const order = await razorpayRequest('/orders', {
      method: 'POST',
      body: {
        amount: amount * 100,
        currency: 'INR',
        receipt: `invoxa_${randomUUID().replace(/-/g, '')}`,
        notes: {
          invoxaUserId: req.user.id,
          plan,
          billingCycle
        }
      }
    })

    user.subscriptionOrders ||= []
    user.subscriptionOrders.push({
      orderId: order.id,
      plan,
      billingCycle,
      amount: order.amount,
      status: 'created',
      createdAt: new Date().toISOString()
    })
    await persistSubscriptionState(user)

    return res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      billingCycle,
      keyId
    })
  } catch (err) {
    console.error('Razorpay order creation failed:', err.message)
    return res.status(502).json({ error: 'Payment checkout could not be started. Please try again.' })
  }
}

export const verifySubscriptionPayment = async (req, res) => {
  const { orderId, paymentId, signature, plan } = req.body || {}
  if (!PAID_PLANS[plan] || typeof orderId !== 'string' || typeof paymentId !== 'string' || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Payment verification details are incomplete.' })
  }

  const { keyId, keySecret } = getRazorpayCredentials()
  if (!keyId || !keySecret) return paymentSetupError(res)

  const user = db.data.users.find(entry => entry.id === req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  user.subscriptionOrders ||= []
  user.subscriptionPayments ||= []
  const recordedOrder = user.subscriptionOrders.find(entry => entry.orderId === orderId)
  const amount = getPlanAmount(plan, recordedOrder?.billingCycle)
  if (!recordedOrder || recordedOrder.plan !== plan || !amount || recordedOrder.amount !== amount * 100) {
    return res.status(400).json({ error: 'This payment order is not linked to your account and selected plan.' })
  }
  if (recordedOrder.status === 'paid') {
    const priorPayment = user.subscriptionPayments.find(entry => entry.paymentId === paymentId && entry.orderId === orderId)
    if (priorPayment) return res.json({ success: true, message: 'This payment was already applied.', user: publicUser(user) })
    return res.status(400).json({ error: 'This payment order has already been used.' })
  }

  const expectedSignature = createHmac('sha256', keySecret).update(`${recordedOrder.orderId}|${paymentId}`).digest()
  const suppliedSignature = Buffer.from(signature, 'hex')
  if (suppliedSignature.length !== expectedSignature.length || !timingSafeEqual(suppliedSignature, expectedSignature)) {
    return res.status(400).json({ error: 'Payment signature could not be verified. Your plan has not changed.' })
  }

  try {
    const [order, payment] = await Promise.all([
      razorpayRequest(`/orders/${encodeURIComponent(recordedOrder.orderId)}`),
      razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`)
    ])
    const expectedAmount = amount * 100
    const orderBelongsToUser = order.notes?.invoxaUserId === req.user.id
    const orderMatchesPlan = order.notes?.plan === plan && order.notes?.billingCycle === recordedOrder.billingCycle
    const orderWasPaid = order.status === 'paid' && Number(order.amount_paid) === expectedAmount && Number(order.amount_due) === 0
    const paymentWasCaptured = payment.status === 'captured' && payment.order_id === order.id && Number(payment.amount) === expectedAmount

    if (!orderBelongsToUser || !orderMatchesPlan || !orderWasPaid || !paymentWasCaptured) {
      return res.status(400).json({ error: 'Razorpay has not confirmed this plan payment. Your current access remains unchanged.' })
    }

    const previouslyApplied = user.subscriptionPayments.find(entry => entry.paymentId === payment.id)
    if (previouslyApplied) {
      if (previouslyApplied.orderId === order.id) {
        return res.json({ success: true, message: 'This payment was already applied.', user: publicUser(user) })
      }
      return res.status(400).json({ error: 'This payment was already applied to another order.' })
    }

    const now = Date.now()
    const currentExpiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry).getTime() : 0
    const hasActiveSamePlan = user.plan === plan && Number.isFinite(currentExpiry) && currentExpiry > now
    const accessFrom = hasActiveSamePlan ? currentExpiry : now
    user.plan = plan
    user.billingCycle = recordedOrder.billingCycle
    user.subscriptionExpiry = extendBillingExpiry(accessFrom, recordedOrder.billingCycle)
    recordedOrder.status = 'paid'
    recordedOrder.paymentId = payment.id
    user.subscriptionPayments.push({
      paymentId: payment.id,
      orderId: order.id,
      plan,
      billingCycle: recordedOrder.billingCycle,
      amount: expectedAmount,
      paidAt: new Date().toISOString()
    })

    await persistSubscriptionState(user)

    return res.json({
      success: true,
      message: `Your ${plan.toUpperCase()} plan is active.`,
      user: publicUser(user)
    })
  } catch (err) {
    console.error('Payment verification error:', err.message)
    return res.status(502).json({ error: 'Payment could not be verified with Razorpay. Your plan has not changed.' })
  }
}
