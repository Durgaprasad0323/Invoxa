import React, { useEffect, useMemo, useState } from 'react'
import { formatINR } from '../../utils/calculations'
import Icon from '../ui/Icon'

const getStorageKey = user => `invoxa_expenses_${user?.companyId || user?.id || user?.email || 'workspace'}`
const CATEGORIES = ['Office rent', 'Travel', 'Utilities', 'Telephone & internet', 'Office supplies', 'Marketing', 'Professional fees', 'Repairs & maintenance', 'Other']
const readExpenses = storageKey => {
  try {
    const saved = localStorage.getItem(storageKey)
    const legacy = saved === null ? localStorage.getItem('invoxa_expenses') : null
    const expenses = JSON.parse(saved ?? legacy ?? '[]')
    const cleaned = Array.isArray(expenses) ? expenses : []
    if (legacy !== null) {
      localStorage.setItem(storageKey, JSON.stringify(cleaned))
      localStorage.removeItem('invoxa_expenses')
    }
    return cleaned
  } catch { return [] }
}
const todayValue = () => {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}
const blankForm = expenseNo => ({ expenseNo, date: todayValue(), category: 'Office supplies', payee: '', amount: '', taxRate: 0, paymentMode: 'Bank transfer', status: 'Paid', note: '' })
const getTotal = expense => {
  const amount = Number(expense.amount) || 0
  return amount + amount * (Number(expense.taxRate) || 0) / 100
}
const formatDate = value => {
  if (!value) return '—'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export default function ExpensesView({ currentUser = {}, searchQuery = '' }) {
  const storageKey = getStorageKey(currentUser)
  const [expenses, setExpenses] = useState(() => readExpenses(storageKey))
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(() => blankForm(''))
  const [error, setError] = useState('')
  const total = expenses.reduce((sum, expense) => sum + getTotal(expense), 0)
  const inputTax = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0) * (Number(expense.taxRate) || 0) / 100, 0)
  const pending = expenses.filter(expense => expense.status !== 'Paid').reduce((sum, expense) => sum + getTotal(expense), 0)
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return expenses.filter(expense => {
      const matchesFilter = filter === 'All' || expense.status === filter
      const matchesQuery = !query || [expense.expenseNo, expense.payee, expense.category, expense.note].some(value => String(value || '').toLowerCase().includes(query))
      return matchesFilter && matchesQuery
    }).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  }, [expenses, filter, searchQuery])

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(expenses)) } catch { }
  }, [storageKey, expenses])

  const newExpenseNo = () => `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, '0')}`
  const openNew = () => { setEditingId(null); setForm(blankForm(newExpenseNo())); setError(''); setShowForm(true) }
  const openEdit = expense => { setEditingId(expense.id); setForm({ ...blankForm(expense.expenseNo), ...expense }); setError(''); setShowForm(true) }

  const saveExpense = event => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.payee.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError('Add a payee and an amount greater than zero.')
      return
    }
    const saved = { ...form, id: editingId || `exp_${Date.now()}`, payee: form.payee.trim(), amount, taxRate: Number(form.taxRate) || 0, updatedAt: new Date().toISOString() }
    setExpenses(current => editingId ? current.map(expense => expense.id === editingId ? saved : expense) : [saved, ...current])
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

  const removeExpense = expense => {
    if (window.confirm(`Delete expense ${expense.expenseNo}?`)) setExpenses(current => current.filter(item => item.id !== expense.id))
  }
  const togglePaid = expense => setExpenses(current => current.map(item => item.id === expense.id ? { ...item, status: item.status === 'Paid' ? 'Unpaid' : 'Paid' } : item))

  return (
    <div className="workspace-view-container expenses-page">
      <div className="table-controls-bar purchases-heading">
        <div><h3>Expenses</h3><p className="section-subtext">Record business costs, GST and payment status.</p></div>
        <button type="button" className="btn-primary-action" onClick={openNew}>+ Add Expense</button>
      </div>

      <div className="metrics-row purchases-metrics">
        <div className="metric-card"><span className="metric-label">Total Expenses</span><span className="metric-value">{formatINR(total)}</span></div>
        <div className="metric-card"><span className="metric-label">GST Amount</span><span className="metric-value purchases-itc-value">{formatINR(inputTax)}</span></div>
        <div className="metric-card"><span className="metric-label">Unpaid Expenses</span><span className="metric-value purchases-due-value">{formatINR(pending)}</span></div>
      </div>

      <div className="purchases-toolbar">
        <div className="tab-filters" role="group" aria-label="Filter expenses"><button type="button" className={`filter-btn ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>All</button><button type="button" className={`filter-btn ${filter === 'Unpaid' ? 'active' : ''}`} onClick={() => setFilter('Unpaid')}>Unpaid</button><button type="button" className={`filter-btn ${filter === 'Paid' ? 'active' : ''}`} onClick={() => setFilter('Paid')}>Paid</button></div>
        <span className="purchases-count">{visible.length} {visible.length === 1 ? 'expense' : 'expenses'}</span>
      </div>

      <div className="swipe-table-wrap purchases-table-wrap">
        <table className="swipe-table purchases-table">
          <thead><tr><th>Expense No.</th><th>Date</th><th>Category / Payee</th><th>Amount</th><th>GST</th><th>Payment Method</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {visible.length === 0 ? <tr><td colSpan={8} className="empty-row">{expenses.length ? 'No expenses match this filter.' : 'No expenses recorded yet. Add your first business expense.'}</td></tr> : visible.map(expense => (
              <tr key={expense.id}>
                <td><strong>{expense.expenseNo}</strong></td><td>{formatDate(expense.date)}</td>
                <td><div className="purchase-vendor-cell"><strong>{expense.category}</strong><small>{expense.payee}</small></div></td>
                <td><strong>{formatINR(getTotal(expense))}</strong></td><td>{formatINR((Number(expense.amount) || 0) * (Number(expense.taxRate) || 0) / 100)}</td>
                <td>{expense.paymentMode}</td><td><span className={`status-pill purchase-status-${expense.status.toLowerCase()}`}>{expense.status}</span></td>
                <td><div className="row-actions"><button type="button" className="row-action-btn" title="Edit expense" aria-label={`Edit ${expense.expenseNo}`} onClick={() => openEdit(expense)}><Icon name="edit" size={15} /></button><button type="button" className="row-action-btn" title={expense.status === 'Paid' ? 'Mark unpaid' : 'Mark paid'} onClick={() => togglePaid(expense)}><Icon name={expense.status === 'Paid' ? 'clock' : 'checkCircle'} size={15} /></button><button type="button" className="row-action-btn danger" title="Delete expense" onClick={() => removeExpense(expense)}><Icon name="trash" size={15} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="purchases-storage-note">Expenses are saved in this browser on this device.</p>

      {showForm && <div className="purchase-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false) }}>
        <form className="purchase-modal" onSubmit={saveExpense} role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
          <header className="purchase-modal-header"><div><span className="purchases-eyebrow">EXPENSES</span><h2 id="expense-modal-title">{editingId ? 'Edit expense' : 'Add expense'}</h2><p>Enter the business expense details.</p></div><button type="button" className="purchase-modal-close" aria-label="Close expense form" onClick={() => setShowForm(false)}>×</button></header>
          <div className="purchase-modal-content">
            <div className="purchase-form-grid">
              <label className="purchase-field">Expense number<input value={form.expenseNo} onChange={event => setForm(current => ({ ...current, expenseNo: event.target.value }))} /></label>
              <label className="purchase-field">Date<input type="date" required value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} /></label>
              <label className="purchase-field">Category<select value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))}>{CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
              <label className="purchase-field">Paid to / Payee *<input required value={form.payee} onChange={event => setForm(current => ({ ...current, payee: event.target.value }))} placeholder="Business or person" /></label>
              <label className="purchase-field">Amount before GST (₹) *<input type="number" min="0.01" step="0.01" required value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} /></label>
              <label className="purchase-field">GST rate<select value={form.taxRate} onChange={event => setForm(current => ({ ...current, taxRate: event.target.value }))}>{[0, 5, 12, 18, 28].map(rate => <option value={rate} key={rate}>{rate}%</option>)}</select></label>
              <label className="purchase-field">Payment method<select value={form.paymentMode} onChange={event => setForm(current => ({ ...current, paymentMode: event.target.value }))}>{['Bank transfer', 'UPI', 'Cash', 'Cheque', 'Card'].map(method => <option key={method}>{method}</option>)}</select></label>
              <label className="purchase-field">Payment status<select value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value }))}><option>Paid</option><option>Unpaid</option></select></label>
            </div>
            <label className="purchase-field purchase-notes-field">Notes<textarea rows="3" value={form.note} onChange={event => setForm(current => ({ ...current, note: event.target.value }))} placeholder="Optional details or reference" /></label>
            <div className="purchase-totals"><div><span>GST</span><strong>{formatINR((Number(form.amount) || 0) * (Number(form.taxRate) || 0) / 100)}</strong></div><div className="purchase-grand-total"><span>Total expense</span><strong>{formatINR(getTotal(form))}</strong></div></div>
            {error && <p className="purchase-form-error" role="alert">{error}</p>}
          </div>
          <footer className="purchase-modal-footer"><button type="button" className="btn-secondary-action" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary-action">{editingId ? 'Save changes' : 'Save expense'}</button></footer>
        </form>
      </div>}
    </div>
  )
}
