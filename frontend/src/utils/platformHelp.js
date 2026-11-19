const guides = [
  {
    id: 'voice',
    keywords: ['voice', 'speech', 'microphone', 'dictat', 'recording'],
    title: 'Create an invoice by voice',
    steps: [
      'Choose Create Invoice, then select Record Voice Note.',
      'Choose Start Recording and allow microphone access when your browser asks.',
      'Say the customer name, each item, quantity, rate, and GST rate. For example: “Invoice for Sharma Traders, 5 chairs at 3,500 each, 18% GST.”',
      'Stop recording, review or correct the transcript, then choose Generate Invoice from Speech.',
      'Check the filled invoice and choose Save Invoice when it is ready.'
    ],
    action: 'createInvoice'
  },
  {
    id: 'photo',
    keywords: ['photo', 'scan', 'ocr', 'picture', 'image', 'receipt', 'scanned bill'],
    title: 'Create an invoice from a bill photo',
    steps: [
      'Choose Create Invoice, then select Upload Bill / Estimate Photo.',
      'Choose a clear JPG or PNG image. The scanner reads the text from the image.',
      'Review and correct the extracted customer, item, quantity, rate, and GST details.',
      'Choose the invoice format, then select Generate Invoice from Scanned Bill.',
      'Review the filled invoice and choose Save Invoice.'
    ],
    action: 'createInvoice'
  },
  {
    id: 'text-ai',
    keywords: ['text', 'prompt', 'natural language', 'whatsapp', 'message', 'ai invoice'],
    title: 'Create an invoice from text or a client message',
    steps: [
      'Choose Create Invoice.',
      'Describe the customer and order. Include item names, quantities, prices, GST rate, and whether it is paid.',
      'For a WhatsApp order, choose Paste WhatsApp / Client Message and paste the message.',
      'Select Generate Invoice. Invoxa AI opens a filled invoice for you to review.',
      'Correct anything that needs attention, then choose Save Invoice.'
    ],
    action: 'createInvoice'
  },
  {
    id: 'qr',
    keywords: ['upi', 'qr', 'rate us', 'review code', 'payment code'],
    title: 'Add a UPI or Rate Us QR code',
    steps: [
      'Open Invoice Template & Mixers, choose a template, then select Fill Details.',
      'Upload your UPI Payment QR and/or Rate Us QR image in the QR fields.',
      'Check the preview to confirm both codes appear in the right places.',
      'Choose Save Invoice or Download PDF. You can also upload a UPI QR from Payment Details while editing a regular invoice.'
    ],
    tab: 'templates'
  },
  {
    id: 'templates',
    keywords: ['template', 'mixer', 'design', 'customize', 'layout', 'colour', 'color', 'font'],
    title: 'Choose and customize an invoice template',
    steps: [
      'Open Invoice Template & Mixers from the workspace sidebar.',
      'Choose a starter template, then adjust its layout, colours, fonts, and sections.',
      'Select Fill Details to enter your business, customer, items, and payment information.',
      'Choose Preview & Edit to review the invoice.',
      'Save Invoice to keep it in your invoice list, or Download PDF.'
    ],
    tab: 'templates'
  },
  {
    id: 'customer',
    keywords: ['customer', 'client', 'buyer', 'add person', 'contact'],
    title: 'Add or manage a customer',
    steps: [
      'Open Customers from the workspace sidebar.',
      'Choose Add Customer and enter the customer name and contact or tax details.',
      'Choose Save Customer. The customer will be available for future invoices.'
    ],
    tab: 'customers'
  },
  {
    id: 'products',
    keywords: ['product', 'service item', 'catalog', 'item list', 'add item'],
    title: 'Add a product or service',
    steps: [
      'Open Products & Services from the workspace sidebar.',
      'Choose Add Product or Service and enter its name, price, and tax details.',
      'Choose Save Item. You can then reuse it on invoices.'
    ],
    tab: 'products'
  },
  {
    id: 'quotation',
    keywords: ['quotation', 'quote', 'estimate', 'proposal'],
    title: 'Create a quotation or estimate',
    steps: [
      'Open Quotations+ from the workspace sidebar.',
      'Choose New Quotation and enter the customer, items, prices, and validity date.',
      'Save or print the quotation. You can convert it to an invoice from the quotation list.'
    ],
    tab: 'quotations'
  },
  {
    id: 'pdf',
    keywords: ['pdf', 'download', 'print', 'export', 'save invoice'],
    title: 'Save or download an invoice',
    steps: [
      'In the invoice editor, choose Save Invoice to add it to your invoice list.',
      'Choose Download PDF / Print to print it or save a PDF copy.',
      'To find it later, open Sales > Invoices.'
    ],
    tab: 'invoices'
  },
  {
    id: 'payments',
    keywords: ['payment', 'paid', 'money received', 'record receipt', 'balance due'],
    title: 'Review payments',
    steps: [
      'Open Payments from the workspace sidebar.',
      'Find the invoice or payment entry you need to review.',
      'Use the available actions to update or inspect its payment status.'
    ],
    tab: 'payments'
  },
  {
    id: 'settings',
    keywords: ['settings', 'business profile', 'company details', 'gstin', 'bank details', 'upi id', 'seller details'],
    title: 'Update your business and tax details',
    steps: [
      'Open Settings from the workspace sidebar.',
      'Update your business name, address, GSTIN, contact, or bank details.',
      'Choose Save All Changes. New invoices can use the updated profile.'
    ],
    tab: 'settings'
  },
  {
    id: 'inventory',
    keywords: ['inventory', 'stock', 'warehouse', 'quantity on hand'],
    title: 'Manage inventory',
    steps: [
      'Open Inventory from the workspace sidebar.',
      'Add or update an item and its available quantity.',
      'Save the change, then return to Inventory to review the current stock list.'
    ],
    tab: 'inventory'
  },
  {
    id: 'expenses',
    keywords: ['expense', 'record expense'],
    title: 'Record a business expense',
    steps: [
      'Open Expenses+ from the workspace sidebar.',
      'Enter the expense date, amount, category, and tax details.',
      'Save the entry to keep it in your records.'
    ],
    tab: 'expenses'
  },
  {
    id: 'purchases',
    keywords: ['purchase', 'supplier bill', 'vendor bill'],
    title: 'Record a supplier purchase',
    steps: [
      'Open Purchases from the workspace sidebar.',
      'Enter the supplier, bill date, items, amounts, and tax details.',
      'Choose Save Purchase Bill to keep it in your records.'
    ],
    tab: 'purchases'
  },
  {
    id: 'api',
    keywords: ['api', 'developer', 'integration', 'token', 'api key'],
    title: 'Set up a developer API integration',
    steps: [
      'Open Developer API from the workspace sidebar.',
      'Review the API setup instructions and available endpoints.',
      'Create or manage an API key there, then use it in your integration.'
    ],
    tab: 'api'
  },
  {
    id: 'einvoice',
    keywords: ['e-invoice', 'einvoice', 'irn', 'eway bill', 'e-way'],
    title: 'Open e-invoice tools',
    steps: [
      'Open E-Invoices from the Sales section in the workspace sidebar.',
      'Choose the invoice you want to review and use the available e-invoice actions.',
      'Check the IRN and related details before sharing or printing.'
    ],
    tab: 'einvoices'
  },
  {
    id: 'credit-notes',
    keywords: ['credit note', 'return', 'refund', 'cancel invoice'],
    title: 'Create or review a credit note',
    steps: [
      'Open Credit Notes from the Sales section in the workspace sidebar.',
      'Choose the invoice and enter the returned items or adjustment amount.',
      'Save the credit note and review it in the Credit Notes list.'
    ],
    tab: 'credit-notes'
  },
  {
    id: 'gst',
    keywords: ['gst', 'tax rate', 'taxes', 'cgst', 'sgst', 'igst'],
    title: 'Set or review GST on an invoice',
    steps: [
      'Open or create an invoice and review each line item.',
      'Set the tax rate for each item. Invoxa recalculates the GST and totals from those rates.',
      'Check the seller and customer state details so the invoice uses the correct intra-state or inter-state tax split.',
      'Review the totals before saving the invoice.'
    ],
    action: 'createInvoice'
  },
  {
    id: 'subscriptions',
    keywords: ['subscription', 'plan', 'upgrade', 'billing plan'],
    title: 'View and upgrade your Invoxa plan',
    steps: [
      'Open Subscriptions or choose View Plans in the workspace sidebar.',
      'Compare the Free, Pro, and Enterprise plans and review which workspace tools each plan unlocks.',
      'Choose Pro or Enterprise to open Razorpay Checkout. Your plan changes only after Invoxa verifies the payment.',
      'After confirmation, return to the workspace. Features outside your plan link back to the plan comparison page.'
    ],
    tab: 'subscriptions'
  },
  {
    id: 'team',
    keywords: ['invite user', 'team member', 'staff', 'employee access', 'permissions'],
    title: 'Invite a team member',
    steps: [
      'Open Invite Users from the workspace sidebar.',
      'Enter the team member’s contact details and choose an access role.',
      'Send the prepared email draft from your mail app. Workspace access and role permissions are not activated in this version.'
    ],
    tab: 'invite-users'
  },
  {
    id: 'invoice',
    keywords: ['invoice', 'bill', 'create bill', 'new invoice'],
    title: 'Create and save an invoice',
    steps: [
      'Open Sales > Invoices in the workspace sidebar.',
      'Choose + Create New Invoice and enter the customer, items, rates, and tax details.',
      'Review the invoice, then choose Save Invoice. Use Download PDF / Print if you need a copy.'
    ],
    action: 'createInvoice'
  }
]

export const platformHelpSuggestions = [
  'How do I create an invoice from text?',
  'How do I scan a bill photo?',
  'How can I record a voice invoice?',
  'How do I upload a UPI QR code?',
  'How do I add a customer?',
  'How do I download an invoice PDF?'
]

export function getPlatformHelpAnswer(question) {
  const normalized = (question || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')
  const guide = guides.find(topic => topic.keywords.some(keyword => normalized.includes(keyword)))

  if (guide) return guide

  return {
    id: 'fallback',
    title: 'I can guide you through Invoxa step by step',
    steps: [
      'Ask about a task in the platform, such as invoices, templates, customers, products, payments, settings, or PDF downloads.',
      'Include the screen or action you are trying to find, and I will show the steps that match.'
    ]
  }
}
