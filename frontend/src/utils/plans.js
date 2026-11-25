export const PLAN_CATALOG = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    summary: 'Core billing tools to get started.',
    features: [
      'Create invoices and quotations',
      'Manage customers and products',
      'Payments workspace with saved UPI and bank details',
      'Invoxa AI: text, photo, voice, and platform help',
      'One Live Web integration API key for invoice creation',
      'UPI QR and bank transfer details on invoices',
      'Basic business settings'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2499,
    monthlyPrice: 299,
    yearlyPrice: 2499,
    summary: 'More invoice designs and advanced business modules.',
    popular: true,
    features: [
      'Everything in Free',
      '15+ customizable invoice templates: 18 styles, 19 industry designs, and 10 layouts',
      'Purchases and expenses workspaces with records saved in this browser',
      'POS billing workspace (session-only)',
      'Inventory workspace linked to the product catalog',
      'Credit notes, E-Invoice JSON drafts, and E-Way Bill records',
      'Remove the Invoxa watermark from bills',
      'WhatsApp support link'
    ],
    plannedFeatures: [
      'One business account with admin + 1 team member',
      'Custom invoice prefixes and suffixes',
      'GSTR-1, party ledgers, and 40+ reports',
      'Purchases, expenses, and inventory saved to the user account',
      'Priority human support'
    ],
    planNotes: [
      'Purchases and expenses are stored in this browser and do not sync across devices. Inventory updates sync through the product API when signed in. Team membership, POS persistence, GST reports, ledgers, and priority human support are not implemented yet.'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 3499,
    monthlyPrice: 499,
    yearlyPrice: 3499,
    summary: 'Everything currently available in Invoxa, plus expanded developer API access.',
    features: [
      'Everything in Free and Pro, including all currently available workspaces and customization tools',
      'Live and Sandbox access for the invoice creation API',
      'Up to 10 active named API keys',
      '60 API requests per minute per key'
    ],
    plannedFeatures: [
      'Create customers, products, payments, and stock through the API',
      'Sandbox businesses with isolated test data',
      'Webhooks for invoice, payment, and stock events',
      'API usage logs, error history, and request analytics',
      'More than 10 active keys through an Enterprise API add-on'
    ],
    planNotes: [
      'The Free plan includes one Live Web integration key. Sandbox keys validate requests without saving real invoices. Isolated sandbox businesses, other API resources, webhooks, and extra-key add-ons are planned.'
    ]
  }
]

const PLAN_RANK = { free: 0, pro: 1, enterprise: 2 }

export const TAB_PLAN_REQUIREMENTS = {
  templates: 'pro',
  pos: 'pro',
  'credit-notes': 'pro',
  einvoices: 'pro',
  ewaybills: 'pro',
  purchases: 'pro',
  expenses: 'pro',
  inventory: 'pro',
  'ai-generator': null,
  api: null
}

export const getEffectivePlan = user => {
  if (user?.role === 'super_admin') return 'enterprise'
  const plan = PLAN_RANK[user?.plan] === undefined ? 'free' : user.plan
  if (plan === 'free') return 'free'
  if (!user?.subscriptionExpiry) return 'free'
  const expiry = new Date(user.subscriptionExpiry).getTime()
  return Number.isFinite(expiry) && expiry > Date.now() ? plan : 'free'
}

export const hasActiveProTrial = user => {
  const trial = user?.proTrial
  if (getEffectivePlan(user) !== 'free') return false
  if (!trial?.startedAt || Number(trial.creationsRemaining) <= 0) return false
  const endsAt = trial.endsAt ? new Date(trial.endsAt).getTime() : 0
  return Boolean(trial.active) && Number.isFinite(endsAt) && endsAt > Date.now()
}

export const hasPlanAccess = (user, requiredPlan) => (
  !requiredPlan ||
  (PLAN_RANK[getEffectivePlan(user)] || 0) >= (PLAN_RANK[requiredPlan] || 0) ||
  (requiredPlan === 'pro' && hasActiveProTrial(user))
)
