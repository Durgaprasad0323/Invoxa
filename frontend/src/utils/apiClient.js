const API_BASE_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.replace(/\/+$/, '').endsWith('/api') ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`)
  : (typeof window !== 'undefined'
      ? (window.location.port === '5173' ? '/api' : `http://${window.location.hostname}:5000/api`)
      : 'http://localhost:5000/api')

// Helper for authorized API calls
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('invoxa_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    const data = await res.json()
    if (!res.ok) {
      const error = new Error(data.error || 'API Request failed')
      Object.assign(error, data)
      throw error
    }
    return data
  } catch (err) {
    console.warn(`[API error] ${endpoint}:`, err.message)
    throw err
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  sendRegistrationOtp: (data) => request('/auth/register-send-otp', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  verifyRegistrationOtp: (data) => request('/auth/register-verify', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  sendOtp: (phone) => request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  }),

  verifyOtp: (phone, otp) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp })
  }),

  googleAuth: (googleData) => request('/auth/google', {
    method: 'POST',
    body: JSON.stringify(googleData)
  }),

  forgotPasswordSendOtp: (email) => request('/auth/forgot-password-send', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  forgotPasswordReset: (data) => request('/auth/forgot-password-reset', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getMe: () => request('/auth/me'),

  updateCompanyProfile: (profile) => request('/auth/company', {
    method: 'PUT',
    body: JSON.stringify(profile)
  }),

  // Invoices
  getInvoices: () => request('/invoices'),
  createInvoice: (inv) => request('/invoices', {
    method: 'POST',
    body: JSON.stringify(inv)
  }),
  updateInvoice: (id, inv) => request(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inv)
  }),
  deleteInvoice: (id) => request(`/invoices/${id}`, {
    method: 'DELETE'
  }),

  // Credit notes
  getCreditNotes: () => request('/credit-notes'),
  createCreditNote: (creditNote) => request('/credit-notes', {
    method: 'POST',
    body: JSON.stringify(creditNote)
  }),
  deleteCreditNote: (id) => request(`/credit-notes/${id}`, {
    method: 'DELETE'
  }),

  // Developer API keys and API integration
  getDeveloperKeys: () => request('/developer/keys'),
  createDeveloperKey: (name, environment = 'live', developerInfo) => request('/developer/keys', {
    method: 'POST',
    body: JSON.stringify({ name, environment, developerInfo })
  }),
  revokeDeveloperKey: (id) => request(`/developer/keys/${id}`, {
    method: 'DELETE'
  }),
  verifyDeveloperKey: (secret) => request('/v1/status', {
    method: 'GET',
    headers: { Authorization: `Bearer ${secret}` }
  }),
  createApiSampleInvoice: (secret) => request('/v1/invoices', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
    body: JSON.stringify({
      client: { name: 'Invoxa API Sample Customer', city: 'Mumbai', state: 'Maharashtra' },
      items: [{ description: 'Sample item created from the Developer API page', quantity: 1, rate: 100, taxRate: 18 }],
      notes: 'Created by the Invoxa Developer API sample request.'
    })
  }),

  // Customers
  getCustomers: () => request('/customers'),
  createCustomer: (cust) => request('/customers', {
    method: 'POST',
    body: JSON.stringify(cust)
  }),
  updateCustomer: (id, cust) => request(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cust)
  }),
  deleteCustomer: (id) => request(`/customers/${id}`, {
    method: 'DELETE'
  }),

  // Products
  getProducts: () => request('/products'),
  createProduct: (prod) => request('/products', {
    method: 'POST',
    body: JSON.stringify(prod)
  }),
  updateProduct: (id, prod) => request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(prod)
  }),
  deleteProduct: (id) => request(`/products/${id}`, {
    method: 'DELETE'
  }),

  // Super Admin
  getAdminStats: () => request('/admin/stats'),
  getAllUsers: () => request('/admin/users'),
  updateUserPlan: (id, plan) => request(`/admin/users/${id}/plan`, {
    method: 'PUT',
    body: JSON.stringify({ plan })
  }),
  toggleUserStatus: (id) => request(`/admin/users/${id}/status`, {
    method: 'PUT'
  }),

  // Payments & Subscriptions
  createSubscriptionOrder: (plan = 'pro', billingCycle = 'yearly') => request('/payments/order', {
    method: 'POST',
    body: JSON.stringify({ plan, billingCycle })
  }),
  verifySubscriptionPayment: (payment) => request('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payment)
  }),

  // Free Pro trial
  getProTrial: () => request('/plans/pro-trial'),
  startProTrial: () => request('/plans/pro-trial/start', { method: 'POST' }),
  consumeProTrialCreation: (usage) => request('/plans/pro-trial/creation', {
    method: 'POST',
    body: JSON.stringify(usage)
  })
}
