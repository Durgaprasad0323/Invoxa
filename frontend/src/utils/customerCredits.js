const roundMoney = value => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100

export const customerCreditKey = customer => {
  if (!customer) return ''
  const name = String(customer.name || '').trim().replace(/\s+/g, ' ').toLowerCase()
  if (name) return `name:${name}`
  const email = String(customer.email || '').trim().toLowerCase()
  if (email) return `email:${email}`
  const phone = String(customer.phone || '').replace(/\D/g, '')
  if (phone) return `phone:${phone}`
  return ''
}

export const getAvailableCustomerCredits = (creditNotes = [], invoices = [], customer, excludeInvoiceId = '') => {
  const customerKey = customerCreditKey(customer)
  if (!customerKey) return []

  const issuedCredits = creditNotes.filter(note => (
    note.settlementMethod === 'account-credit' &&
    (note.status || 'Issued') !== 'Voided' &&
    customerCreditKey(note.customer) === customerKey
  ))
  const usedByNote = new Map()
  invoices
    .filter(invoice => invoice.id !== excludeInvoiceId)
    .flatMap(invoice => invoice.customerCreditApplications || [])
    .forEach(application => {
      const id = String(application.creditNoteId || '')
      usedByNote.set(id, roundMoney((usedByNote.get(id) || 0) + Number(application.amount || 0)))
    })

  return issuedCredits.map(note => ({
    creditNoteId: note.id,
    creditNoteNumber: note.creditNoteNumber,
    date: note.date,
    total: roundMoney(note.total),
    applied: roundMoney(usedByNote.get(String(note.id)) || 0),
    available: Math.max(0, roundMoney(Number(note.total) - (usedByNote.get(String(note.id)) || 0)))
  })).filter(note => note.available > 0.009)
}

export const allocateCustomerCredits = (availableCredits = [], amount = 0) => {
  let remaining = roundMoney(amount)
  const applications = []
  for (const credit of availableCredits) {
    if (remaining <= 0) break
    const applied = Math.min(remaining, roundMoney(credit.available))
    if (applied > 0) {
      applications.push({ creditNoteId: credit.creditNoteId, amount: roundMoney(applied) })
      remaining = roundMoney(remaining - applied)
    }
  }
  return applications
}

export const sumAvailableCustomerCredits = credits => roundMoney((credits || []).reduce((sum, credit) => sum + credit.available, 0))
