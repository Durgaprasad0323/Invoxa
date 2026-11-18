export const initialSampleInvoices = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-001',
    invoiceDate: '2026-11-14',
    dueDate: '2026-11-29',
    status: 'Unpaid',
    theme: 'emerald',
    seller: {
      name: 'Invoxa Enterprise Solutions',
      gstin: '27AABCI1234F1Z5',
      pan: 'AABCI1234F',
      address: 'Suite 402, Trade Tower, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      phone: '+91 98200 12345',
      email: 'billing@invoxa.com'
    },
    client: {
      name: 'Mehta Homes',
      gstin: '27AACCM9876E1Z2',
      address: '14 Skyline Avenue, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      phone: '+91 98111 22233',
      email: 'accounts@mehtahomes.com'
    },
    items: [
      {
        id: 'item_1',
        description: 'Kitchen Interior Design & 3D Render',
        hsnSac: '998314',
        quantity: 1,
        rate: 45000,
        taxRate: 18
      }
    ],
    discountRate: 0,
    notes: 'Thank you for your business. Please make payments before the due date.',
    terms: 'Payment due within 15 days of invoice date. 18% p.a. interest applicable on late payments.',
    paymentDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0000240',
      upiId: 'invoxa.pay@okhdfcbank'
    }
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2026-002',
    invoiceDate: '2026-11-10',
    dueDate: '2026-11-25',
    status: 'Paid',
    theme: 'navy',
    seller: {
      name: 'Invoxa Enterprise Solutions',
      gstin: '27AABCI1234F1Z5',
      pan: 'AABCI1234F',
      address: 'Suite 402, Trade Tower, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      phone: '+91 98200 12345',
      email: 'billing@invoxa.com'
    },
    client: {
      name: 'Sharma Tech Labs',
      gstin: '29AABCS5544R1Z8',
      address: 'Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      phone: '+91 99000 88776',
      email: 'finance@sharmatech.io'
    },
    items: [
      {
        id: 'item_2',
        description: 'React SaaS Architecture & Consulting',
        hsnSac: '998313',
        quantity: 40,
        rate: 2500,
        taxRate: 18
      },
      {
        id: 'item_3',
        description: 'Cloud Infrastructure Setup (AWS)',
        hsnSac: '998315',
        quantity: 1,
        rate: 35000,
        taxRate: 18
      }
    ],
    discountRate: 5,
    notes: 'Payment received via NEFT on 12-Nov-2026. Thank you!',
    terms: 'Services delivered as per SOW dated 01-Nov-2026.',
    paymentDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0000240',
      upiId: 'invoxa.pay@okhdfcbank'
    }
  }
]
