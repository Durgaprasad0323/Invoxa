import React from 'react'
import TemplateMixer from '../TemplateMixer'

export default function IndustryTemplatesView({
  invoiceToEdit,
  onClearEditInvoice,
  onSaveInvoice,
  onNavigateToInvoices,
  isPro = false,
  onUpgrade,
  businessProfile = {}
}) {
  return (
    <div className="workspace-view-container">
      <TemplateMixer
        invoiceToEdit={invoiceToEdit}
        onClearEditInvoice={onClearEditInvoice}
        onSaveInvoice={onSaveInvoice}
        onNavigateToInvoices={onNavigateToInvoices}
        isPro={isPro}
        onUpgrade={onUpgrade}
        businessProfile={businessProfile}
      />
    </div>
  )
}
