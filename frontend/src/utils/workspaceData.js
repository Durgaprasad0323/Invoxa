export const initialCustomers = [
  {
    id: 'cust_1',
    name: 'Mehta Homes',
    phone: '+91 98111 22233',
    email: 'accounts@mehtahomes.com',
    gstin: '27AACCM9876E1Z2',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '14 Skyline Avenue, Andheri West',
    totalPurchases: 53100,
    outstandingDue: 53100
  },
  {
    id: 'cust_2',
    name: 'Sharma Tech Labs',
    phone: '+91 99000 88776',
    email: 'finance@sharmatech.io',
    gstin: '29AABCS5544R1Z8',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Outer Ring Road, Bellandur',
    totalPurchases: 135000,
    outstandingDue: 0
  },
  {
    id: 'cust_3',
    name: 'Dr. Roy Dental Clinic',
    phone: '+91 98765 43210',
    email: 'drroy@dentalclinic.in',
    gstin: '27AAAPL1234K1Z9',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'FC Road, Shivaji Nagar',
    totalPurchases: 24000,
    outstandingDue: 24000
  },
  {
    id: 'cust_4',
    name: 'Apex Logistics & Transport',
    phone: '+91 98450 11223',
    email: 'billing@apexlogistics.in',
    gstin: '24AAACT9988D1Z4',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: 'Transport Nagar, Narol',
    totalPurchases: 84000,
    outstandingDue: 0
  }
]

export const initialProducts = [
  {
    id: 'prod_1',
    name: 'Kitchen Interior Design & 3D Render',
    category: 'Design Services',
    hsnSac: '998314',
    unit: 'Project',
    rate: 45000,
    taxRate: 18
  },
  {
    id: 'prod_2',
    name: 'React / Full-Stack SaaS Development',
    category: 'IT Services',
    hsnSac: '998313',
    unit: 'Hours',
    rate: 2500,
    taxRate: 18
  },
  {
    id: 'prod_3',
    name: 'Dental Chair & Clinic Consultation',
    category: 'Healthcare',
    hsnSac: '999312',
    unit: 'Session',
    rate: 1500,
    taxRate: 0
  },
  {
    id: 'prod_4',
    name: 'Interstate Freight Transport (Trucking)',
    category: 'Logistics',
    hsnSac: '996511',
    unit: 'Trip',
    rate: 32000,
    taxRate: 5
  },
  {
    id: 'prod_5',
    name: 'Office Modular Workstations (4-Seater)',
    category: 'Furniture',
    hsnSac: '940330',
    unit: 'Set',
    rate: 28000,
    taxRate: 18
  }
]

export const initialQuotations = [
  {
    id: 'qt_1',
    quoteNumber: 'QT-2026-001',
    quoteDate: '2026-11-12',
    validUntil: '2026-11-27',
    status: 'Sent', // 'Draft', 'Sent', 'Converted', 'Expired'
    theme: 'indigo',
    docType: 'quotation',
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
      name: 'Dr. Roy Dental Clinic',
      gstin: '27AAAPL1234K1Z9',
      address: 'FC Road, Shivaji Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411005',
      phone: '+91 98765 43210',
      email: 'drroy@dentalclinic.in'
    },
    items: [
      {
        id: 'item_q1',
        description: 'Complete Dental Clinic Interior Renovation & Cabinetry',
        hsnSac: '998314',
        quantity: 1,
        rate: 85000,
        taxRate: 18
      },
      {
        id: 'item_q2',
        description: 'LED Panel Lighting & Medical Grade Electrical Setup',
        hsnSac: '995461',
        quantity: 1,
        rate: 22000,
        taxRate: 18
      }
    ],
    discountRate: 5,
    notes: 'Quotation valid for 15 days. 50% mobilization advance required to commence work.',
    terms: 'Work will be completed within 21 working days of site handover.',
    paymentDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0000240',
      upiId: 'invoxa.pay@okhdfcbank'
    }
  },
  {
    id: 'qt_2',
    quoteNumber: 'QT-2026-002',
    quoteDate: '2026-11-14',
    validUntil: '2026-11-29',
    status: 'Draft',
    theme: 'teal',
    docType: 'quotation',
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
      name: 'Apex Logistics & Transport',
      gstin: '24AAACT9988D1Z4',
      address: 'Transport Nagar, Narol',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382405',
      phone: '+91 98450 11223',
      email: 'billing@apexlogistics.in'
    },
    items: [
      {
        id: 'item_q3',
        description: 'Custom Warehouse ERP & GPS Dispatch Integration',
        hsnSac: '998313',
        quantity: 1,
        rate: 140000,
        taxRate: 18
      }
    ],
    discountRate: 0,
    notes: 'Estimate includes 3 months post-launch support and API maintenance.',
    terms: 'Payment milestones: 40% upfront, 40% on UAT, 20% on deployment.',
    paymentDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0000240',
      upiId: 'invoxa.pay@okhdfcbank'
    }
  }
]

export const initialBusinessProfile = {
  companyName: 'Krishna Enterprises',
  tagline: 'Simple Billing & Smart GST Invoicing',
  ownerName: 'Krishna',
  gstin: '27AABCI1234F1Z5',
  pan: 'AABCI1234F',
  email: 'krishna@invoxa.in',
  phone: '+91 98200 12345',
  address: 'Suite 402, Trade Tower, Bandra Kurla Complex',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400051',
  bankName: 'HDFC Bank Ltd',
  accountNumber: '50200012345678',
  ifsc: 'HDFC0000240',
  branch: 'BKC Branch, Mumbai',
  upiId: 'krishna.pay@okhdfcbank',
  invoicePrefix: 'INV-2026-',
  quotePrefix: 'QT-2026-'
}
