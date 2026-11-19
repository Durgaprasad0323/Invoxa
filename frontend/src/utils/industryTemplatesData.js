export const INDUSTRY_CATEGORIES = [
  'All',
  'Services & Consulting',
  'Logistics & Transport',
  'Healthcare & Pharma',
  'Retail & Trade',
  'Manufacturing & Construction'
]

export const INDUSTRY_STARTERS = [
  {
    id: 'interior',
    name: 'Interior Designer & Architect',
    category: 'Services & Consulting',
    tag: 'Interior',
    icon: '',
    description: 'Design consultations, 3D renderings, and turnkey site execution with advance adjustment.',
    defaultTax: 18,
    specialFields: [
      { label: 'Site / Project Location', placeholder: 'e.g. Palm Beach Road, Vashi' },
      { label: 'Architect Registration No.', placeholder: 'e.g. CA/2018/88219' }
    ],
    sampleItems: [
      { description: 'Turnkey 3BHK Living & Dining Concept Render', hsnSac: '998314', quantity: 1, rate: 45000, taxRate: 18 },
      { description: 'Modular Kitchen Fabrication & Hardware Installation', hsnSac: '998314', quantity: 1, rate: 85000, taxRate: 18 }
    ]
  },
  {
    id: 'doctor',
    name: 'Clinic & Healthcare Doctor',
    category: 'Healthcare & Pharma',
    tag: 'Healthcare',
    icon: '',
    description: 'OPD consultations, dental procedures, and health checks (GST Exempt under Notification 12/2017).',
    defaultTax: 0,
    specialFields: [
      { label: 'Doctor Medical Reg No (MMC/MCI)', placeholder: 'e.g. MMC-2015-0982' },
      { label: 'Patient Name & Age', placeholder: 'e.g. Rahul Sharma, 38 Yrs / Male' },
      { label: 'Diagnosis / Rx Note', placeholder: 'e.g. Root Canal Treatment & Crown Placement' }
    ],
    sampleItems: [
      { description: 'Specialist Dental Consultation & Digital X-Ray', hsnSac: '999312', quantity: 1, rate: 1200, taxRate: 0 },
      { description: 'Zirconia Ceramic Crown Placement (Molar 36)', hsnSac: '999312', quantity: 1, rate: 9500, taxRate: 0 }
    ]
  },
  {
    id: 'transport',
    name: 'Transporter & Logistics Fleet',
    category: 'Logistics & Transport',
    tag: 'Logistics',
    icon: '',
    description: 'Goods transport agency (GTA) with LR number, vehicle number, and 5% Reverse Charge (RCM).',
    defaultTax: 5,
    specialFields: [
      { label: 'Lorry Receipt (LR) / Bilty No.', placeholder: 'e.g. LR-MH-9812' },
      { label: 'Vehicle / Truck Registration No.', placeholder: 'e.g. MH-04-EY-4421' },
      { label: 'Transit Route (From - To)', placeholder: 'e.g. Bhiwandi to Ahmedabad' },
      { label: 'E-Way Bill Number', placeholder: 'e.g. 2410 9988 7766' }
    ],
    sampleItems: [
      { description: 'Full Truck Load (FTL) 32ft MX Container Transport', hsnSac: '996511', quantity: 1, rate: 48000, taxRate: 5 },
      { description: 'Loading & Unloading Labour Surcharge', hsnSac: '996511', quantity: 1, rate: 4500, taxRate: 5 }
    ]
  },
  {
    id: 'contractor',
    name: 'Civil Contractor & Builder',
    category: 'Manufacturing & Construction',
    tag: 'Construction',
    icon: '',
    description: 'Running Account (RA) bills, work orders, site names, and retention money deductions.',
    defaultTax: 18,
    specialFields: [
      { label: 'Running Account (RA) Bill No.', placeholder: 'e.g. RA-BILL-03' },
      { label: 'Work Order No. & Date', placeholder: 'e.g. WO/2026/041 dt 10-Oct-2026' },
      { label: 'Project Site Location', placeholder: 'e.g. Sector 18, Navi Mumbai' },
      { label: 'Retention Money (%)', placeholder: 'e.g. 5% Retention held' }
    ],
    sampleItems: [
      { description: 'RCC Slab Casting & Shuttering Work (1,200 sq.ft)', hsnSac: '995411', quantity: 1200, rate: 85, taxRate: 18 },
      { description: 'Brickwork & Internal Gypsum Plastering', hsnSac: '995411', quantity: 800, rate: 65, taxRate: 18 }
    ]
  },
  {
    id: 'jeweler',
    name: 'Gold & Diamond Jeweler',
    category: 'Retail & Trade',
    tag: 'Jewelry',
    icon: '',
    description: 'Precious ornaments with Gross/Net Weight, Making Charges, Hallmark HUID, and 3% GST.',
    defaultTax: 3,
    specialFields: [
      { label: 'Hallmark HUID 6-Digit Alphanumeric', placeholder: 'e.g. HUID-8K9M2P' },
      { label: 'Gold Purity Standard', placeholder: 'e.g. 22 Karat (916 BIS Hallmarked)' },
      { label: 'Gross Wt / Net Wt (Grams)', placeholder: 'e.g. Gross: 18.420g | Net: 17.850g' }
    ],
    sampleItems: [
      { description: '22K Gold Antique Choker Necklace (Net Wt: 24.5g)', hsnSac: '711319', quantity: 1, rate: 175000, taxRate: 3 },
      { description: 'Handcrafted Filigree Making Charges', hsnSac: '711319', quantity: 1, rate: 18500, taxRate: 3 }
    ]
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Chemist Retailer',
    category: 'Healthcare & Pharma',
    tag: 'Pharmacy',
    icon: '',
    description: 'Medicines with Drug License 20B/21B, Batch numbers, and Expiry Dates (MM/YY).',
    defaultTax: 12,
    specialFields: [
      { label: 'Drug License Nos. (Form 20B & 21B)', placeholder: 'e.g. DL-MH-TZ-29381 & 29382' },
      { label: 'Prescribing Doctor Name', placeholder: 'e.g. Dr. A. K. Joshi (MD)' }
    ],
    sampleItems: [
      { description: 'Amoxyclav 625mg (Batch #BX992, Exp: 09/27)', hsnSac: '3004', quantity: 5, rate: 195, taxRate: 12 },
      { description: 'Multivitamin Complex Strips (Batch #MV104, Exp: 12/27)', hsnSac: '3004', quantity: 3, rate: 140, taxRate: 12 }
    ]
  },
  {
    id: 'freelancer',
    name: 'Freelancer & Digital Agency',
    category: 'Services & Consulting',
    tag: 'Freelance',
    icon: '',
    description: 'Hourly rates, fixed milestones, GitHub/Figma deliveries, and international payments.',
    defaultTax: 18,
    specialFields: [
      { label: 'Project Repository / Figma Deliverable Link', placeholder: 'e.g. github.com/client/repo' },
      { label: 'Milestone / SOW Reference', placeholder: 'e.g. Milestone 2: Backend API & Auth' }
    ],
    sampleItems: [
      { description: 'Full-Stack Next.js Web Application MVP', hsnSac: '998313', quantity: 1, rate: 65000, taxRate: 18 },
      { description: 'Custom Stripe & Razorpay Webhook Integration', hsnSac: '998313', quantity: 1, rate: 20000, taxRate: 18 }
    ]
  },
  {
    id: 'export',
    name: 'Exporter & Global Trader',
    category: 'Retail & Trade',
    tag: 'Export',
    icon: '',
    description: 'Cross-border invoices with IEC Code, AD Code, Port of Loading, and LUT/Bond zero GST.',
    defaultTax: 0,
    specialFields: [
      { label: 'Import Export Code (IEC)', placeholder: 'e.g. 0310088921' },
      { label: 'Port of Loading & Discharge', placeholder: 'e.g. JNPT Nhava Sheva to Jebel Ali' },
      { label: 'Letter of Undertaking (LUT) No.', placeholder: 'e.g. ARN-AD270326001928' },
      { label: 'Currency & Exchange Rate', placeholder: 'e.g. USD @ INR 84.50' }
    ],
    sampleItems: [
      { description: 'Organic Indian Basmati Rice (1121 Extra Long, 20 MT)', hsnSac: '100630', quantity: 20, rate: 95000, taxRate: 0 },
      { description: 'Ocean Freight & Reefer Container Surcharge', hsnSac: '996521', quantity: 1, rate: 110000, taxRate: 0 }
    ]
  },
  {
    id: 'restaurant',
    name: 'Restaurant, Cafe & Cloud Kitchen',
    category: 'Retail & Trade',
    tag: 'F&B',
    icon: '',
    description: 'Food bills with 5% GST without ITC, table numbers, and counter POS receipt format.',
    defaultTax: 5,
    specialFields: [
      { label: 'Table / Token Number', placeholder: 'e.g. Table #14 (Dine-In)' },
      { label: 'FSSAI License Number', placeholder: 'e.g. 11520023000918' },
      { label: 'Server / Steward Name', placeholder: 'e.g. Rajesh K.' }
    ],
    sampleItems: [
      { description: 'Paneer Tikka Butter Masala (Chef Special)', hsnSac: '996331', quantity: 2, rate: 380, taxRate: 5 },
      { description: 'Garlic Butter Naan (Clay Oven)', hsnSac: '996331', quantity: 4, rate: 70, taxRate: 5 },
      { description: 'Fresh Lime Soda (Sweet & Salt)', hsnSac: '996331', quantity: 2, rate: 110, taxRate: 5 }
    ]
  },
  {
    id: 'garage',
    name: 'Automobile Service Garage',
    category: 'Services & Consulting',
    tag: 'Automobile',
    icon: '',
    description: 'Vehicle servicing with Odometer KM reading, Chassis/VIN, and labor vs spare parts split.',
    defaultTax: 18,
    specialFields: [
      { label: 'Vehicle Model & Number', placeholder: 'e.g. Hyundai Creta (MH-02-CD-9988)' },
      { label: 'Odometer KM Reading', placeholder: 'e.g. 42,850 KM' },
      { label: 'Job Card / Work Order No.', placeholder: 'e.g. JC-2026-1102' }
    ],
    sampleItems: [
      { description: 'Synthetic Engine Oil 5W-30 (3.5 Litres)', hsnSac: '2710', quantity: 1, rate: 3400, taxRate: 18 },
      { description: 'Front Ceramic Brake Pad Replacement', hsnSac: '8708', quantity: 1, rate: 2800, taxRate: 18 },
      { description: 'General Periodic Service & Wheel Alignment Labour', hsnSac: '998729', quantity: 1, rate: 2200, taxRate: 18 }
    ]
  },
  {
    id: 'ca',
    name: 'Chartered Accountant & Legal Firm',
    category: 'Services & Consulting',
    tag: 'CA/Legal',
    icon: '',
    description: 'Statutory audit fees, GST return filing, income tax appeals, and ICAI UDIN number.',
    defaultTax: 18,
    specialFields: [
      { label: 'ICAI / Bar Council Membership No.', placeholder: 'e.g. FCA-104928' },
      { label: 'Unique Document Identification No (UDIN)', placeholder: 'e.g. 26104928AAAAAB9918' },
      { label: 'Financial Assessment Year', placeholder: 'e.g. AY 2026-27' }
    ],
    sampleItems: [
      { description: 'Statutory Audit & Tax Audit under Sec 44AB', hsnSac: '998222', quantity: 1, rate: 45000, taxRate: 18 },
      { description: 'Quarterly TDS & Monthly GSTR-1/3B Compliance Filing', hsnSac: '998231', quantity: 3, rate: 6000, taxRate: 18 }
    ]
  },
  {
    id: 'hotel',
    name: 'Hotel, Resort & Hospitality',
    category: 'Services & Consulting',
    tag: 'Hospitality',
    icon: '',
    description: 'Room tariffs, check-in/out dates, guest ID details, and room-rate GST tiering.',
    defaultTax: 12,
    specialFields: [
      { label: 'Room Number & Category', placeholder: 'e.g. Deluxe Ocean Suite #408' },
      { label: 'Check-In & Check-Out Dates', placeholder: 'e.g. 10-Nov-2026 to 14-Nov-2026' },
      { label: 'Guest ID Proof (Aadhaar / Passport)', placeholder: 'e.g. Aadhaar ending in 8841' }
    ],
    sampleItems: [
      { description: 'Deluxe Suite Room Tariff (3 Nights @ ₹6,500)', hsnSac: '996311', quantity: 3, rate: 6500, taxRate: 12 },
      { description: 'In-Room Dining & Breakfast Buffet Charges', hsnSac: '996331', quantity: 1, rate: 4200, taxRate: 5 }
    ]
  },
  {
    id: 'retail',
    name: 'Retail Kirana & Supermarket',
    category: 'Retail & Trade',
    tag: 'Retail',
    icon: '',
    description: 'Barcode itemized counter billing with multiple GST slabs (0%, 5%, 12%, 18%).',
    defaultTax: 5,
    specialFields: [
      { label: 'Counter POS Till / Terminal ID', placeholder: 'e.g. POS-01 (Express Checkout)' },
      { label: 'Customer Loyalty Card / Mobile No.', placeholder: 'e.g. +91 98200 55443' }
    ],
    sampleItems: [
      { description: 'Fortune Sunlite Sunflower Oil (5L Jar)', hsnSac: '1512', quantity: 2, rate: 680, taxRate: 5 },
      { description: 'Aashirvaad Shudh Chakki Atta (10 Kg Bag)', hsnSac: '1101', quantity: 1, rate: 460, taxRate: 0 },
      { description: 'Surf Excel Matic Liquid Detergent (2L)', hsnSac: '3402', quantity: 1, rate: 440, taxRate: 18 }
    ]
  },
  {
    id: 'events',
    name: 'Wedding & Event Planner',
    category: 'Services & Consulting',
    tag: 'Events',
    icon: '',
    description: 'Venue setup, sound & lighting production, artist bookings, and date schedules.',
    defaultTax: 18,
    specialFields: [
      { label: 'Event Name & Dates', placeholder: 'e.g. Sangeet & Wedding Reception (18-Dec-2026)' },
      { label: 'Venue Location', placeholder: 'e.g. The Grand Palace Lawn, Mumbai' }
    ],
    sampleItems: [
      { description: 'Floral Mandap & Stage Decor Production', hsnSac: '998599', quantity: 1, rate: 150000, taxRate: 18 },
      { description: 'Concert JBL Sound & Truss Moving Head Lighting', hsnSac: '998599', quantity: 1, rate: 75000, taxRate: 18 }
    ]
  },
  {
    id: 'gym',
    name: 'Gym & Fitness Center',
    category: 'Services & Consulting',
    tag: 'Fitness',
    icon: '',
    description: 'Annual memberships, personal training packages, and member registration numbers.',
    defaultTax: 18,
    specialFields: [
      { label: 'Member ID / Access Card No.', placeholder: 'e.g. GYM-MEM-4402' },
      { label: 'Membership Plan Duration', placeholder: 'e.g. 1 Year Platinum All-Access' }
    ],
    sampleItems: [
      { description: '12-Month Annual Gym & Cardio Membership', hsnSac: '999723', quantity: 1, rate: 22000, taxRate: 18 },
      { description: 'Certified Personal Trainer Pack (24 Sessions)', hsnSac: '999723', quantity: 1, rate: 14000, taxRate: 18 }
    ]
  },
  {
    id: 'tuition',
    name: 'School & Coaching Institute',
    category: 'Services & Consulting',
    tag: 'Education',
    icon: '',
    description: 'Term tuition fees, study materials, student roll number, and exam batches.',
    defaultTax: 18,
    specialFields: [
      { label: 'Student Roll No & Course Batch', placeholder: 'e.g. BATCH-JEE-2027 (Roll #42)' },
      { label: 'Parent / Guardian Contact', placeholder: 'e.g. S. K. Verma (+91 98210 99881)' }
    ],
    sampleItems: [
      { description: 'JEE Advanced Physics & Maths Classroom Coaching (Term 1)', hsnSac: '999293', quantity: 1, rate: 45000, taxRate: 18 },
      { description: 'Printed Comprehensive Test Series & Books Kit', hsnSac: '4901', quantity: 1, rate: 6500, taxRate: 0 }
    ]
  },
  {
    id: 'photography',
    name: 'Photography & Media Studio',
    category: 'Services & Consulting',
    tag: 'Photography',
    icon: '',
    description: 'Candid wedding shoots, fashion portraits, drone video coverage, and deliverable links.',
    defaultTax: 18,
    specialFields: [
      { label: 'Shoot Date & Venue', placeholder: 'e.g. 20-Nov-2026 at JW Marriott' },
      { label: 'Online Cloud Gallery Link', placeholder: 'e.g. gallery.studio.in/client-pass' }
    ],
    sampleItems: [
      { description: 'Full Day 4K 2-Camera Cinematic Wedding Shoot', hsnSac: '998381', quantity: 1, rate: 65000, taxRate: 18 },
      { description: 'Custom Bound Flush-Mount Leatherite Album (40 Sheets)', hsnSac: '998381', quantity: 1, rate: 18000, taxRate: 18 }
    ]
  },
  {
    id: 'printing',
    name: 'Printing Press & Packaging',
    category: 'Manufacturing & Construction',
    tag: 'Printing',
    icon: '',
    description: 'Offset & digital print jobs, paper GSM specs, carton packaging, and die-punch numbers.',
    defaultTax: 12,
    specialFields: [
      { label: 'Paper Quality & GSM Specs', placeholder: 'e.g. 350 GSM Art Card with Matte Lamination' },
      { label: 'Die Cut / Plate Code', placeholder: 'e.g. PLATE-DIE-881' }
    ],
    sampleItems: [
      { description: 'Custom Embossed Product Packaging Boxes (5,000 Units)', hsnSac: '481910', quantity: 5000, rate: 14.5, taxRate: 12 },
      { description: 'Spot UV Visiting Cards (1,000 Cards)', hsnSac: '4911', quantity: 1000, rate: 2.2, taxRate: 18 }
    ]
  },
  {
    id: 'solar',
    name: 'Solar Energy & EPC Installer',
    category: 'Manufacturing & Construction',
    tag: 'Solar',
    icon: '',
    description: 'Rooftop solar plant installations, subsidy compliance, inverter capacity, and net meter.',
    defaultTax: 12,
    specialFields: [
      { label: 'Solar Plant Capacity (kW)', placeholder: 'e.g. 5 kW On-Grid Rooftop System' },
      { label: 'DISCOM Consumer No / Net Meter Application', placeholder: 'e.g. MSEDCL-029481920' },
      { label: 'Solar Inverter Serial Number', placeholder: 'e.g. INV-GROWATT-99214' }
    ],
    sampleItems: [
      { description: '5kW Mono Perc Bifacial Solar Panels (10 Nos)', hsnSac: '854143', quantity: 1, rate: 145000, taxRate: 12 },
      { description: '5kW Grid-Tied Solar Inverter & Net Metering Installation', hsnSac: '850440', quantity: 1, rate: 65000, taxRate: 12 }
    ]
  },
  {
    id: 'realestate',
    name: 'Real Estate Broker & Consultant',
    category: 'Services & Consulting',
    tag: 'Real Estate',
    icon: '',
    description: 'Property brokerage, rental leasing agreement fees, and MahaRERA agent registration.',
    defaultTax: 18,
    specialFields: [
      { label: 'MahaRERA / RERA Agent Reg No.', placeholder: 'e.g. A51900028192' },
      { label: 'Property Details & Flat No.', placeholder: 'e.g. Flat 1204, Lodha Park, Worli' }
    ],
    sampleItems: [
      { description: 'Professional Brokerage on Commercial Office Lease (1 Month Rent)', hsnSac: '997212', quantity: 1, rate: 90000, taxRate: 18 }
    ]
  },
  {
    id: 'security',
    name: 'Security Agency & Facility Guarding',
    category: 'Services & Consulting',
    tag: 'Security',
    icon: '',
    description: 'Manned guarding, armed guards, bouncers, and facility housekeeping under PSARA license.',
    defaultTax: 18,
    specialFields: [
      { label: 'PSARA License Number', placeholder: 'e.g. PSARA/MH/2021/0491' },
      { label: 'Deployment Location / Site Name', placeholder: 'e.g. IT Tech Park Tower B, Hinjewadi' },
      { label: 'EPFO & ESIC Registration Codes', placeholder: 'e.g. MH/BAN/0048192/000' }
    ],
    sampleItems: [
      { description: 'Trained Security Guard Deployment (8hr Shift x 30 Days)', hsnSac: '998525', quantity: 4, rate: 19500, taxRate: 18 },
      { description: 'Armed Security Guard Supervisor (12hr Shift)', hsnSac: '998525', quantity: 1, rate: 28000, taxRate: 18 }
    ]
  },
  {
    id: 'textiles',
    name: 'Textiles, Saree & Garment Wholesaler',
    category: 'Retail & Trade',
    tag: 'Textiles',
    icon: '',
    description: 'Fabric rolls, designer sarees, readymade apparel with 5% or 12% GST slabs and bale packaging.',
    defaultTax: 5,
    specialFields: [
      { label: 'Bale / Parcel Tracking Number', placeholder: 'e.g. BALE-SRT-9921' },
      { label: 'Weaver / Mill Lot Reference', placeholder: 'e.g. LOT-COT-881' }
    ],
    sampleItems: [
      { description: 'Pure Banarasi Silk Sarees (Boxed Collection)', hsnSac: '5007', quantity: 15, rate: 3200, taxRate: 5 },
      { description: 'Premium Cotton Kurti Fabric Roll (100 Meters)', hsnSac: '5208', quantity: 3, rate: 8500, taxRate: 5 }
    ]
  },
  {
    id: 'travel',
    name: 'Travel Agency & Tour Operator',
    category: 'Services & Consulting',
    tag: 'Travel',
    icon: '',
    description: 'Domestic & international tour packages, flight bookings, hotel vouchers, and PNR tracking.',
    defaultTax: 5,
    specialFields: [
      { label: 'Tour Package Name / Itinerary Code', placeholder: 'e.g. 5N6D Kashmir Valley Spring Tour' },
      { label: 'PNR / Hotel Confirmation Vouchers', placeholder: 'e.g. 6E-8412 / TAJ-SXR-0012' },
      { label: 'Passenger Names & Travel Dates', placeholder: 'e.g. 2 Adults, 24 Dec 2026 to 29 Dec 2026' }
    ],
    sampleItems: [
      { description: 'All-Inclusive Kashmir Valley Holiday Package (Per Couple)', hsnSac: '998553', quantity: 1, rate: 78000, taxRate: 5 },
      { description: 'Private AC Innova Crysta Sightseeing Cab (6 Days)', hsnSac: '9964', quantity: 1, rate: 24000, taxRate: 5 }
    ]
  },
  {
    id: 'hardware',
    name: 'Hardware, Sanitaryware & Building Materials',
    category: 'Retail & Trade',
    tag: 'Hardware',
    icon: '',
    description: 'Plumbing fittings, CPVC pipes, bathroom sanitaryware, and electrical switches with 18% & 28% GST.',
    defaultTax: 18,
    specialFields: [
      { label: 'Batch / Quality Inspection Ref', placeholder: 'e.g. ISI-CPVC-BATCH-84' },
      { label: 'Delivery Site / Plumber Name', placeholder: 'e.g. Mr. Santosh / Flat 402' }
    ],
    sampleItems: [
      { description: 'CPVC Pipe 1 Inch SDR-11 (3 Meter Length x 20 Nos)', hsnSac: '391723', quantity: 20, rate: 420, taxRate: 18 },
      { description: 'Brass Single Lever Diverter for Shower (Chrome Finish)', hsnSac: '848180', quantity: 2, rate: 3850, taxRate: 18 }
    ]
  },
  {
    id: 'agri',
    name: 'Agriculture, Seeds & Fertilizer Dealer',
    category: 'Retail & Trade',
    tag: 'Agriculture',
    icon: '',
    description: 'Certified seeds (0% GST), bio-fertilizers (5% GST), pesticides (18% GST), and dealer subsidy code.',
    defaultTax: 5,
    specialFields: [
      { label: 'Agriculture Department License No.', placeholder: 'e.g. AGRI-DEALER-PUN-0912' },
      { label: 'Seed Certification / Lot Batch No.', placeholder: 'e.g. MAHYCO-HYBRID-BATCH-77' },
      { label: 'Farmer Aadhaar / DBT Subsidy Code', placeholder: 'e.g. DBT-MH-2026-9921' }
    ],
    sampleItems: [
      { description: 'Certified Hybrid Cotton Seeds (450g Pack x 10 Nos)', hsnSac: '1207', quantity: 10, rate: 850, taxRate: 0 },
      { description: 'Water Soluble NPK 19:19:19 Bio-Fertilizer (25kg Bag)', hsnSac: '3105', quantity: 8, rate: 1950, taxRate: 5 }
    ]
  },
  {
    id: 'courier',
    name: 'Courier, Cargo & Express Parcel Delivery',
    category: 'Logistics & Transport',
    tag: 'Courier',
    icon: '',
    description: 'Air cargo, surface express parcel delivery, tracking docket (AWB) number, and volumetric weight.',
    defaultTax: 18,
    specialFields: [
      { label: 'Air Waybill (AWB) / Docket Number', placeholder: 'e.g. AWB-DEL-9920148' },
      { label: 'Volumetric / Chargeable Weight (kg)', placeholder: 'e.g. 14.5 kg (Box dimensions 40x30x25 cm)' },
      { label: 'Destination Pin Code', placeholder: 'e.g. 560001 (Bengaluru GPO)' }
    ],
    sampleItems: [
      { description: 'Domestic Express Next-Day Air Cargo (Up to 10kg)', hsnSac: '996812', quantity: 1, rate: 1850, taxRate: 18 },
      { description: 'Surface Heavy Parcel Transit (Additional Weight)', hsnSac: '996812', quantity: 5, rate: 120, taxRate: 18 }
    ]
  },
  {
    id: 'chemical',
    name: 'Chemical & Industrial Coating Manufacturer',
    category: 'Manufacturing & Construction',
    tag: 'Chemicals',
    icon: '',
    description: 'Solvents, epoxy floor resins, industrial pigments with MSDS sheet number and drum lot tracking.',
    defaultTax: 18,
    specialFields: [
      { label: 'Material Safety Data Sheet (MSDS) Ref', placeholder: 'e.g. MSDS-EPOXY-RESIN-2026' },
      { label: 'Drum / Batch Lot Number', placeholder: 'e.g. LOT-CHEM-2026-B11' },
      { label: 'Hazard Class / UN Code', placeholder: 'e.g. Class 3 Flammable Liquid (UN 1993)' }
    ],
    sampleItems: [
      { description: 'Two-Pack Epoxy Floor Coating Resin (20kg Drum)', hsnSac: '320890', quantity: 5, rate: 6400, taxRate: 18 },
      { description: 'Industrial Polyurethane Hardener (5 Liter Can)', hsnSac: '382490', quantity: 5, rate: 1850, taxRate: 18 }
    ]
  },
  {
    id: 'plumber_electrician',
    name: 'MEP Contractor & Electrical Plumbing Works',
    category: 'Manufacturing & Construction',
    tag: 'MEP Works',
    icon: '',
    description: 'Electrical wiring, plumbing pipelines, fire safety piping, and testing commissioning certificates.',
    defaultTax: 18,
    specialFields: [
      { label: 'Government Electrical Contractor License', placeholder: 'e.g. ELEC-MH-LIC-9821' },
      { label: 'Site Safety & Inspection Certificate No.', placeholder: 'e.g. SITE-INSPECT-2026-88' }
    ],
    sampleItems: [
      { description: 'Complete Commercial DB Box Wiring & Circuit Load Balancing', hsnSac: '995461', quantity: 1, rate: 34000, taxRate: 18 },
      { description: 'Underground Drainage & Sump Pump Pipeline Installation', hsnSac: '995462', quantity: 1, rate: 42000, taxRate: 18 }
    ]
  },
  {
    id: 'hospital',
    name: 'Multi-Specialty Hospital & Nursing Home',
    category: 'Healthcare & Pharma',
    tag: 'Hospital',
    icon: '',
    description: 'In-patient admissions, surgical OT charges, ICU bed tariffs, and mediclaim TPA cashless settlement.',
    defaultTax: 0,
    specialFields: [
      { label: 'Hospital Registration / ROHINI Code', placeholder: 'e.g. ROHINI-8902148' },
      { label: 'Patient IPD / UHID Number', placeholder: 'e.g. IPD-2026-09418' },
      { label: 'TPA Insurance Cashless Claim ID', placeholder: 'e.g. STAR-HEALTH-CLM-8819' }
    ],
    sampleItems: [
      { description: 'ICU Bed Charges with Continuous Patient Monitoring (3 Days)', hsnSac: '999311', quantity: 3, rate: 12500, taxRate: 0 },
      { description: 'Operation Theater (OT) & Surgeon Nursing Charges', hsnSac: '999311', quantity: 1, rate: 45000, taxRate: 0 }
    ]
  },
  {
    id: 'catering',
    name: 'Outdoor & Event Catering Services',
    category: 'Services & Consulting',
    tag: 'Catering',
    icon: '',
    description: 'Wedding buffets, corporate lunches, live food counters with 5% GST without Input Tax Credit.',
    defaultTax: 5,
    specialFields: [
      { label: 'FSSAI Central Food Safety License', placeholder: 'e.g. FSSAI-11520028000412' },
      { label: 'Event Date & Banquet Hall Location', placeholder: 'e.g. 18-Dec-2026, Grand Ballroom' },
      { label: 'Guaranteed Guest Plate Count', placeholder: 'e.g. 450 Pax' }
    ],
    sampleItems: [
      { description: 'Deluxe Multi-Cuisine Wedding Dinner Buffet (Per Plate)', hsnSac: '996331', quantity: 450, rate: 950, taxRate: 5 },
      { description: 'Live Woodfired Pizza & Pasta Counter Setup', hsnSac: '996331', quantity: 1, rate: 25000, taxRate: 5 }
    ]
  }
]
