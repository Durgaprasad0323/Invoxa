const API_BASE_URL = typeof window !== 'undefined'
  ? (window.location.port === '5173' ? '/api' : `http://${window.location.hostname}:5000/api`)
  : 'http://localhost:5000/api'

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
      throw new Error(data.error || 'API Request failed')
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

  // Developer API keys and API integration
  getDeveloperKeys: () => request('/developer/keys'),
  createDeveloperKey: (name) => request('/developer/keys', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  revokeDeveloperKey: (id) => request(`/developer/keys/${id}`, {
    method: 'DELETE'
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
  deleteCustomer: (id) => request(`/customers/${id}`, {
    method: 'DELETE'
  }),

  // Products
  getProducts: () => request('/products'),
  createProduct: (prod) => request('/products', {
    method: 'POST',
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
  createSubscriptionOrder: (plan = 'pro') => request('/payments/order', {
    method: 'POST',
    body: JSON.stringify({ plan })
  }),
  verifySubscriptionPayment: (orderId, plan = 'pro') => request('/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ orderId, plan })
  })
}
