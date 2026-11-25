// Financial and GST calculation helper for Indian tax system
export function calculateInvoiceTotals(invoice) {
  if (!invoice || !invoice.items) {
    return {
      subtotal: 0,
      discountAmount: 0,
      taxableAmount: 0,
      isInterState: false,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0,
      grandTotal: 0
    }
  }

  const items = invoice.items || []
  let subtotal = 0
  let totalTax = 0
  let cgst = 0
  let sgst = 0
  let igst = 0

  const sellerState = (invoice.seller?.state || 'Maharashtra').trim().toLowerCase()
  const clientState = (invoice.client?.state || 'Maharashtra').trim().toLowerCase()
  const isInterState = typeof invoice.isInterState === 'boolean'
    ? invoice.isInterState
    : sellerState !== clientState && clientState !== ''

  items.forEach(item => {
    const qty = parseFloat(item.quantity) || 0
    const rate = parseFloat(item.rate) || 0
    const lineTotal = qty * rate
    subtotal += lineTotal

    const taxPercent = parseFloat(item.taxRate) || 0
    const lineTax = (lineTotal * taxPercent) / 100
    totalTax += lineTax

    if (isInterState) {
      igst += lineTax
    } else {
      cgst += lineTax / 2
      sgst += lineTax / 2
    }
  })

  const discountRate = parseFloat(invoice.discountRate) || 0
  const discountAmount = (subtotal * discountRate) / 100
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const grandTotal = Math.round(taxableAmount + totalTax)

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    isInterState,
    cgst,
    sgst,
    igst,
    totalTax,
    grandTotal
  }
}

export function formatINR(amount) {
  const num = parseFloat(amount) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(num)
}
