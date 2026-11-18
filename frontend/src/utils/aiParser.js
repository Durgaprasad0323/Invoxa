// Comprehensive Intelligent Parser for Natural Language, Voice Transcripts, WhatsApp Chats, and Scanned Bills
export function parseInvoicePrompt(promptText) {
  const text = (promptText || '').trim()
  if (!text) return null

  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  const dueDateObj = new Date(today)
  dueDateObj.setDate(dueDateObj.getDate() + 15)
  const dueDateStr = dueDateObj.toISOString().split('T')[0]

  // Base invoice structure
  const invoice = {
    id: 'inv_' + Date.now(),
    invoiceNumber: `INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
    invoiceDate: dateStr,
    dueDate: dueDateStr,
    status: 'Unpaid',
    theme: 'emerald',
    seller: {
      name: 'Krishna Enterprises',
      gstin: '27AABCI1234F1Z5',
      pan: 'AABCI1234F',
      address: 'Shop No. 4, Commercial Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 98200 12345',
      email: 'billing@krishnaenterprises.com'
    },
    client: {
      name: '',
      gstin: '',
      address: 'Commercial Plaza, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '',
      email: ''
    },
    items: [],
    discountRate: 0,
    notes: 'Thank you for your business. Goods once sold will not be taken back.',
    terms: 'Payment due within 15 days of invoice date. 18% p.a. interest applicable on late payments.',
    paymentDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0000240',
      upiId: 'krishna@okhdfc'
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. EXTRACT INVOICE NUMBER & DATE
  // ─────────────────────────────────────────────────────────────
  const invNoMatch = text.match(/(?:invoice|bill|inv|memo|estimate)\s*(?:no\.?|#|num|number)\s*[:=-]?\s*([A-Za-z0-9/-]{2,20})/i) ||
                     text.match(/(?:invoice|bill|inv|memo)\s*[:=-]\s*([A-Za-z0-9/-]{2,20})/i)
  if (invNoMatch && invNoMatch[1] && !/^(?:to|for|date|of|no|number)$/i.test(invNoMatch[1])) {
    invoice.invoiceNumber = invNoMatch[1].trim()
  }

  const dateMatch = text.match(/(?:date|dated)\s*[:=-]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i)
  if (dateMatch && dateMatch[1]) {
    const rawDate = dateMatch[1].replace(/\./g, '-')
    // Attempt standard ISO format
    const parts = rawDate.split(/[-/]/)
    if (parts.length === 3) {
      let y = parts[2].length === 2 ? '20' + parts[2] : parts[2]
      let m = parts[1].padStart(2, '0')
      let d = parts[0].padStart(2, '0')
      // If year is first (YYYY-MM-DD)
      if (parts[0].length === 4) {
        y = parts[0]
        m = parts[1].padStart(2, '0')
        d = parts[2].padStart(2, '0')
      }
      invoice.invoiceDate = `${y}-${m}-${d}`
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. EXTRACT SELLER / SHOP NAME & GSTIN FROM BILL
  // ─────────────────────────────────────────────────────────────
  const allGstins = Array.from(text.matchAll(/\b(\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/gi)).map(m => m[1].toUpperCase())
  if (allGstins.length > 0) {
    invoice.seller.gstin = allGstins[0]
    invoice.seller.pan = allGstins[0].substring(2, 12)
    if (allGstins.length > 1) {
      invoice.client.gstin = allGstins[1]
    }
  }

  // Check lines for Seller / Shop name (usually in the first 3 lines of an uploaded bill)
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (rawLines.length > 0) {
    for (let i = 0; i < Math.min(4, rawLines.length); i++) {
      const line = rawLines[i]
      // Skip generic titles
      if (/^(?:tax invoice|invoice|cash memo|bill|estimate|retail invoice|original|quotation)/i.test(line)) continue
      if (/^(?:gstin|date|bill to|phone|ph|tel|address)/i.test(line)) continue
      if (line.length >= 3 && line.length <= 50 && !/^\d+$/.test(line)) {
        // Likely the shop or seller name!
        const cleanedSeller = line.replace(/^(?:m\/s\.?|from|seller)\s*[:=-]?\s*/i, '').trim()
        if (cleanedSeller) {
          invoice.seller.name = cleanedSeller
          break
        }
      }
    }
  }

  // Phone from text
  const phoneMatch = text.match(/(?:ph|phone|mob|tel|mobile|contact)\s*[:=-]?\s*([+0-9\s-]{10,14})/i)
  if (phoneMatch && phoneMatch[1]) {
    invoice.seller.phone = phoneMatch[1].trim()
  }

  // ─────────────────────────────────────────────────────────────
  // 3. EXTRACT CLIENT / BUYER NAME
  // ─────────────────────────────────────────────────────────────
  let clientName = ''

  // Look for explicit labels: "Client:", "Customer:", "Bill to:", "To:", "For:", "Buyer:", "M/s"
  const explicitClient = text.match(/(?:client|customer|bill to|billed to|invoice to|buyer|buyer name|to|m\/s\.?)\s*[:=-]\s*([^\n,]+)/i)
  if (explicitClient && explicitClient[1]) {
    clientName = explicitClient[1].trim()
  } else {
    // Look for phrases like "bill for Sharma Traders", "invoice for Mehta Homes", "to Kumar and Sons"
    const phraseClient = text.match(/(?:create\s+(?:an?\s+)?(?:bill|invoice)\s+(?:for|to)|bill\s+(?:to|for)|invoice\s+(?:to|for)|to|for)\s+([A-Z0-9][A-Za-z0-9&.\s'-]{2,35}?)(?=\s+(?:for|worth|with|at|amount|having|\d|₹|Rs|gst|paid|in|\n|,|$))/i)
    if (phraseClient && phraseClient[1]) {
      const candidate = phraseClient[1].trim()
      const blacklist = ['an invoice', 'a bill', 'invoice', 'bill', 'client', 'customer', 'new customer', 'urgent', 'please', 'cash']
      if (!blacklist.includes(candidate.toLowerCase()) && candidate.length > 2) {
        clientName = candidate
      }
    }
  }

  // Look for Hindi patterns: "XYZ ko bill bhej do", "XYZ ka bill"
  if (!clientName) {
    const hindiClient = text.match(/([A-Z][A-Za-z0-9&.\s'-]{2,30}?)\s+(?:ko|ka|ke liye)\s+(?:bill|invoice)/i)
    if (hindiClient && hindiClient[1]) {
      clientName = hindiClient[1].trim()
    }
  }

  if (clientName) {
    invoice.client.name = clientName
    invoice.client.email = `accounts@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client'}.com`
  } else {
    invoice.client.name = 'Cash / Walk-in Customer'
  }

  // ─────────────────────────────────────────────────────────────
  // 4. EXTRACT GST RATE
  // ─────────────────────────────────────────────────────────────
  let detectedGst = 18
  const gstMatch = text.match(/(\d{1,2})\s*%\s*(?:gst|tax|vat)?/i) || text.match(/(?:gst|tax|vat)\s*(?:@|of)?\s*(\d{1,2})/i)
  if (gstMatch && gstMatch[1]) {
    const rateNum = parseFloat(gstMatch[1])
    if ([0, 3, 5, 12, 18, 28].includes(rateNum)) {
      detectedGst = rateNum
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. EXTRACT STATUS (Paid / Unpaid)
  // ─────────────────────────────────────────────────────────────
  if (/\b(?:paid|payment received|received|cleared|settled|cash memo)\b/i.test(text) && !/\b(?:unpaid|not paid|pending)\b/i.test(text)) {
    invoice.status = 'Paid'
  } else {
    invoice.status = 'Unpaid'
  }

  // ─────────────────────────────────────────────────────────────
  // 6. EXTRACT CLIENT LOCATION / CITY / STATE
  // ─────────────────────────────────────────────────────────────
  const citiesMap = {
    mumbai: 'Maharashtra',
    pune: 'Maharashtra',
    nagpur: 'Maharashtra',
    nashik: 'Maharashtra',
    delhi: 'Delhi',
    noida: 'Uttar Pradesh',
    gurgaon: 'Haryana',
    bengaluru: 'Karnataka',
    bangalore: 'Karnataka',
    hyderabad: 'Telangana',
    chennai: 'Tamil Nadu',
    kolkata: 'West Bengal',
    ahmedabad: 'Gujarat',
    surat: 'Gujarat',
    jaipur: 'Rajasthan',
    lucknow: 'Uttar Pradesh',
    chandigarh: 'Punjab',
    indore: 'Madhya Pradesh'
  }

  for (const [city, state] of Object.entries(citiesMap)) {
    const regex = new RegExp(`\\b${city}\\b`, 'i')
    if (regex.test(text)) {
      invoice.client.city = city.charAt(0).toUpperCase() + city.slice(1)
      invoice.client.state = state
      break
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 7. EXTRACT LINE ITEMS, QUANTITIES & PRICES (Line-by-line & NLP)
  // ─────────────────────────────────────────────────────────────
  const items = []
  const lines = text.split(/\r?\n|;|(?<=\d)\s*,\s*(?=[A-Za-z])/)

  for (const rawLine of lines) {
    let line = rawLine.trim()
    if (!line) continue

    // Ignore header / metadata lines
    if (/^(?:bill\s*no|bill\b|gstin\b|gst\b|client\b|customer\b|to\b|from\b|bill\s*to\b|tax\b|date\b|dated\b|status\b|phone\b|mob\b|ph\b|tel\b|address\b|invoice\b|total\b|grand\s*total\b|subtotal\b|balance\b|cgst\b|sgst\b|igst\b|hsn\b|s\.?no\b|sr\.?no\b|item\b|qty\b|rate\b|amount\b|rupees\b|m\/s\b)/i.test(line)) {
      continue
    }

    // Clean leading bullets, numbers, dashes (e.g. "1. ", "- ", "* ", "1) ")
    line = line.replace(/^[\d.)\s*•-]+/, '').trim()
    if (!line) continue

    const UNITS = '(?:nos|pcs|units|bags|kg|boxes|box|sets|hrs|hours|mtr|sqft|items|pkts|pack|bottles|can|ltr|litre|litres|gm|grams|pair|pairs|rolls|roll|meter|meters|sqm|bundle|bundles)?'

    // Pattern A1: Right-anchored [Description] [Qty] [Unit] [@/at] [Rate]
    // e.g., "LED Batten 20W 10 pcs @ 250", "Copper Wire 1.5 sqmm 2 rolls @ 1400"
    const patternA1 = new RegExp(`^(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*${UNITS}\\s*(?:@|at|rate)\\s*(?:rs\\.?|₹|inr)?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:each|per\\s*\\w+|/-\\s*)?$`, 'i').exec(line)

    // Pattern A2: Quantity first: [Qty] [Unit] [Description] [@/at] [Price]
    // e.g., "5 bags Cement @ 420 each", "10 kg Sugar at Rs 45"
    const patternA2 = new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*${UNITS}\\s*(?:of|x)?\\s+(.+?)\\s*(?:@|at|worth|for|rs\\.?|₹|inr|rate)\\s*(?:rs\\.?|₹|inr)?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:each|per\\s*\\w+|/-\\s*)?$`, 'i').exec(line)

    // Pattern B: [Description] - [Qty] [Unit] [@/at] [Price]
    const patternB = new RegExp(`^(.+?)[:\\s-]+(\\d+(?:\\.\\d+)?)\\s*${UNITS}\\s*(?:@|at|worth|for)?\\s*(?:rs\\.?|₹|inr)?\\s*([\\d,]+(?:\\.\\d+)?)`, 'i').exec(line)

    // Pattern C: [Description] + Price (single quantity assumed)
    // e.g., "Kitchen Interior Design & 3D Render ₹45,000", "AWS Cloud Setup 35000"
    const patternC = line.match(/^([A-Za-z0-9&.\s/-]+?)\s*(?:worth|costing|for|amount|at|@)?\s*(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d+)?)/i)

    // Pattern D: Casual / Spoken format: "2 Dell monitors 15000 each", "5 chairs 3000"
    const patternD = line.match(/^(\d+)\s+([A-Za-z0-9&.\s/-]+?)\s+([\d,]+(?:\.\d+)?)\s*(?:each|ka\s*ek|per\s*piece)?$/i)

    // Pattern E: Tabular: Description ... Qty ... Rate
    const patternE = line.match(/^([A-Za-z0-9&.\s/-]{2,35})\s+(\d+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)$/)

    if (patternA1 && patternA1[1] && patternA1[2] && patternA1[3]) {
      const desc = cleanDescription(patternA1[1])
      const qty = parseFloat(patternA1[2]) || 1
      const rate = parseFloat(patternA1[3].replace(/,/g, ''))
      if (desc && rate > 0) items.push(createItem(desc, qty, rate, detectedGst))
    } else if (patternA2 && patternA2[1] && patternA2[2] && patternA2[3]) {
      const qty = parseFloat(patternA2[1]) || 1
      const desc = cleanDescription(patternA2[2])
      const rate = parseFloat(patternA2[3].replace(/,/g, ''))
      if (desc && rate > 0) items.push(createItem(desc, qty, rate, detectedGst))
    } else if (patternB && patternB[1] && patternB[2] && patternB[3]) {
      const desc = cleanDescription(patternB[1])
      const qty = parseFloat(patternB[2]) || 1
      const rate = parseFloat(patternB[3].replace(/,/g, ''))
      if (desc && rate > 0) items.push(createItem(desc, qty, rate, detectedGst))
    } else if (patternE && patternE[1] && patternE[2] && patternE[3]) {
      const desc = cleanDescription(patternE[1])
      const qty = parseFloat(patternE[2]) || 1
      const rate = parseFloat(patternE[3].replace(/,/g, ''))
      if (desc && rate > 0) items.push(createItem(desc, qty, rate, detectedGst))
    } else if (patternD && patternD[1] && patternD[2] && patternD[3]) {
      const qty = parseFloat(patternD[1]) || 1
      const desc = cleanDescription(patternD[2])
      const rate = parseFloat(patternD[3].replace(/,/g, ''))
      if (desc && rate > 0) items.push(createItem(desc, qty, rate, detectedGst))
    } else if (patternC && patternC[1] && patternC[2]) {
      const desc = cleanDescription(patternC[1])
      const rate = parseFloat(patternC[2].replace(/,/g, ''))
      if (desc && rate > 0) items.push(createItem(desc, 1, rate, detectedGst))
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 8. FALLBACK IF NO REGEX MATCHED LINES: SMART INLINE EXTRACTOR
  // ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    const matches = Array.from(text.matchAll(/(\d+)\s*([A-Za-z][A-Za-z0-9\s-]{2,25}?)\s*(?:@|at|worth|for|rs\.?|₹)?\s*(?:rs\.?|₹)?\s*([\d,]{3,})/gi))
    for (const m of matches) {
      const qty = parseInt(m[1], 10) || 1
      const desc = cleanDescription(m[2])
      const rate = parseFloat(m[3].replace(/,/g, ''))
      if (desc && rate > 0 && !items.some(it => it.description === desc)) {
        items.push(createItem(desc, qty, rate, detectedGst))
      }
    }
  }

  // Absolute fallback: extract any number from text and use cleaned prompt as description
  if (items.length === 0) {
    const numMatch = text.match(/(?:₹|rs\.?|inr)?\s*([\d,]{2,}(?:\.\d+)?)/i)
    const rateVal = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : 1000

    let fallbackDesc = text
      .replace(/create\s+(?:an?\s+)?(?:bill|invoice)\s+(?:for|to)?/gi, '')
      .replace(/bill\s+(?:to|for)?/gi, '')
      .replace(/invoice\s+(?:to|for)?/gi, '')
      .replace(/gst\s*\d+%/gi, '')
      .replace(/(?:₹|rs\.?|inr)?\s*[\d,]+/gi, '')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!fallbackDesc || fallbackDesc.length < 3) {
      fallbackDesc = 'Goods / Professional Services'
    }

    items.push(createItem(fallbackDesc.slice(0, 45), 1, rateVal, detectedGst))
  }

  // Auto-detect best layout matching document type
  if (/(?:cash memo|receipt|store receipt|counter receipt)/i.test(text)) {
    invoice.layout = 'receipt'
  } else if (/(?:thermal|pos slip|token bill)/i.test(text)) {
    invoice.layout = 'thermal'
  } else {
    invoice.layout = 'classic'
  }

  invoice.items = items
  return invoice
}

function cleanDescription(desc) {
  return desc
    .replace(/^(?:for|and|with|please|bhai|sir|create|send|bill)\s+/gi, '')
    .replace(/\s+(?:worth|at|each|per|rate|costing)$/gi, '')
    .trim()
}

function createItem(description, quantity, rate, taxRate) {
  // Auto-detect Indian HSN/SAC
  const lower = description.toLowerCase()
  let hsn = '998314' // IT & Consulting default

  if (lower.includes('cement') || lower.includes('tile') || lower.includes('granite') || lower.includes('brick')) {
    hsn = '252329' // Building Materials
  } else if (lower.includes('laptop') || lower.includes('computer') || lower.includes('monitor') || lower.includes('keyboard')) {
    hsn = '847130' // Electronics
  } else if (lower.includes('chair') || lower.includes('desk') || lower.includes('table') || lower.includes('sofa') || lower.includes('furniture')) {
    hsn = '940310' // Furniture
  } else if (lower.includes('cloth') || lower.includes('scrub') || lower.includes('coat') || lower.includes('shirt') || lower.includes('apparel')) {
    hsn = '620342' // Textiles & Apparel
  } else if (lower.includes('interior') || lower.includes('design') || lower.includes('render')) {
    hsn = '998391' // Interior Design Services
  } else if (lower.includes('transport') || lower.includes('freight') || lower.includes('delivery')) {
    hsn = '996511' // Transport Services
  }

  return {
    id: 'item_' + Math.random().toString(36).substr(2, 9),
    description,
    hsnSac: hsn,
    quantity: Math.max(1, quantity),
    rate: Math.max(0, rate),
    taxRate: taxRate || 18
  }
}
