import React from 'react'
import InvoiceGenerator from './InvoiceGenerator'
import Icon from './ui/Icon'

export default function LandingPage({
  onInvoiceGenerated,
  onCreateInvoice,
  onOpenDashboard,
  onOpenAuth: _onOpenAuth
}) {
  const features = [
    {
      icon: 'sparkles',
      title: 'AI Invoice Generator',
      description: 'Create professional GST invoices from simple text, photos, voice notes, and customer messages.'
    },
    {
      icon: 'wallet',
      title: 'Smart GST Assistant',
      description: 'Calculate CGST, SGST & IGST automatically and check invoice details for common tax errors.'
    },
    {
      icon: 'layout',
      title: 'Professional Templates',
      description: 'Choose from modern, clean templates optimized for Indian businesses and global clients.'
    },
    {
      icon: 'code',
      title: 'HSN / SAC Suggestions',
      description: 'Get automated HSN and SAC code recommendations for your products and service lines.'
    },
    {
      icon: 'clock',
      title: 'Payment Tracking',
      description: 'Keep track of paid, pending, and overdue invoices in one unified dashboard.'
    },
    {
      icon: 'download',
      title: 'Instant PDF Export',
      description: 'Download crisp, high-resolution tax invoice PDFs ready to email or WhatsApp directly.'
    }
  ]

  const industries = [
    'IT & SaaS Services',
    'Interior Design & Architecture',
    'Healthcare & Clinics',
    'Manufacturing & Supply',
    'Freelancers & Creators',
    'Consulting & Legal',
    'Retail & E-commerce',
    'Construction & Logistics'
  ]

  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <div className="announcement">
            <Icon name="sparkles" size={15} /> Smart invoicing powered by AI
          </div>

          <h1>
            Create invoices
            <br />
            <span>the smarter way.</span>
          </h1>

          <p className="hero-description">
            Transform text, photos, and voice notes into professional GST-compliant
            invoices. Manage billing, auto-calculate taxes, and export PDFs effortlessly.
          </p>

          <div className="hero-buttons">
            <a href="#ai-generator" className="primary-btn">
              Create Invoice <Icon name="arrowUpRight" size={16} />
            </a>
            <button
              type="button"
              className="secondary-btn"
              onClick={onOpenDashboard}
            >
              Open Dashboard
            </button>
          </div>

          <div className="hero-trust">
            <span><Icon name="checkCircle" size={15} /> Instant Auto GST Calculation</span>
            <span><Icon name="checkCircle" size={15} /> Undo &amp; Revert Editing</span>
            <span><Icon name="checkCircle" size={15} /> One-Click PDF Export</span>
          </div>
        </div>

        {/* HERO VISUAL PREVIEW CARD */}
        <div className="hero-visual">
          <div className="floating-label label-one">
              <Icon name="sparkles" size={15} /> AI Powered
          </div>

          <div className="invoice-card" onClick={onOpenDashboard} style={{ cursor: 'pointer' }} title="Click to view in dashboard">
            <div className="invoice-top">
              <div>
                <span className="invoice-small">LIVE PREVIEW</span>
                <h3>Invoxa Enterprise</h3>
              </div>
              <div className="invoice-logo">I</div>
            </div>

            <div className="invoice-number">
              <div>
                <span>INVOICE NUMBER</span>
                <strong>#INV-2026-001</strong>
              </div>
              <div className="paid-badge">UNPAID</div>
            </div>

            <div className="invoice-divider"></div>

            <div className="invoice-details">
              <div>
                <span>BILL TO</span>
                <strong>Mehta Homes</strong>
                <small>Mumbai, Maharashtra</small>
              </div>
              <div>
                <span>INVOICE DATE</span>
                <strong>14 Nov 2026</strong>
              </div>
            </div>

            <div className="invoice-table">
              <div className="table-heading">
                <span>DESCRIPTION</span>
                <span>AMOUNT</span>
              </div>
              <div className="table-row">
                <span>Kitchen Design & 3D Render</span>
                <strong>₹45,000</strong>
              </div>
              <div className="table-row">
                <span>GST (18%)</span>
                <strong>₹8,100</strong>
              </div>
            </div>

            <div className="invoice-total">
              <span>Total Amount</span>
              <strong>₹53,100</strong>
            </div>

            <div className="invoice-footer">
              <span><Icon name="sparkles" size={14} /> Generated with Invoxa AI</span>
              <span>PDF Ready</span>
            </div>
          </div>

          <div className="floating-label label-two">
            <Icon name="checkCircle" size={16} /> GST Calculated
          </div>
        </div>
      </section>

      {/* AI GENERATOR SECTION */}
      <InvoiceGenerator onInvoiceGenerated={onInvoiceGenerated} onCreateInvoice={onCreateInvoice} />

      {/* FEATURES SECTION */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">POWERFUL FEATURES</span>
          <h2>Everything your business needs.</h2>
          <p>Simple tools to make invoicing easier, smarter, and faster.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon"><Icon name={feature.icon} size={22} /></div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <a href="#ai-generator">Try now <Icon name="arrowUpRight" size={14} /></a>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">SIMPLE PROCESS</span>
          <h2>Three steps. One smart invoice.</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <h3>Enter your details</h3>
            <p>Type your requirements in plain English, or provide an image, voice note, or WhatsApp text.</p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <h3>Let AI structure & calculate</h3>
            <p>AI extracts client details, line items, and auto-calculates GST (CGST/SGST or IGST).</p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <h3>Edit, Undo & Download PDF</h3>
            <p>Fine-tune any field with live recalculations, undo/revert, and export a clean PDF.</p>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="industries-section" id="industries">
        <div className="section-heading">
          <span className="eyebrow">MADE FOR YOUR BUSINESS</span>
          <h2>Solutions for every industry.</h2>
          <p>Compliant invoice templates tailored for your business domain.</p>
        </div>

        <div className="industry-grid">
          {industries.map((industry, index) => (
            <div className="industry-card" key={index}>
              <Icon name="sparkles" size={15} />
              {industry}
              <span className="industry-arrow"><Icon name="arrowUpRight" size={15} /></span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div>
          <span className="eyebrow">START SMARTER BILLING</span>
          <h2>Spend less time creating invoices.</h2>
          <p>Make your business billing and GST management 10x faster with Invoxa.</p>
        </div>
        <a href="#ai-generator" className="cta-button">
          Create Invoice Now <Icon name="arrowUpRight" size={16} />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="brand">
          <span className="brand-icon">I</span>
          <span>Invoxa<span className="brand-dot">.</span></span>
        </div>

        <p>Smarter invoicing. Simpler business.</p>

        <span> 2026 Invoxa. All rights reserved.</span>
      </footer>
    </div>
  )
}
