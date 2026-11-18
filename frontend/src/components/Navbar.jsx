import React from 'react'

export default function Navbar({ currentView, setView, onOpenAuth, onNewInvoice }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleNavClick = (view, anchorId) => {
    setView(view)
    setMobileMenuOpen(false)
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }

  return (
    <nav className="navbar">
      <div className="brand" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
        <span className="brand-icon">I</span>
        <span>Invoxa<span className="brand-dot">.</span></span>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links ${mobileMenuOpen ? 'show-menu' : ''}`}>
        <button
          className={`nav-tab-btn ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => handleNavClick('home')}
        >
          Home
        </button>
        <button
          className={`nav-tab-btn ${currentView === 'generator' ? 'active' : ''}`}
          onClick={() => onOpenAuth()}
        >
          AI Invoice Creator
        </button>
        <button
          className={`nav-tab-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onOpenAuth()}
        >
          My Invoices
        </button>
        <button
          className="nav-tab-btn"
          onClick={() => handleNavClick('home', 'features')}
        >
          Features
        </button>
        <button
          className="nav-tab-btn"
          onClick={() => handleNavClick('home', 'how-it-works')}
        >
          How it works
        </button>
      </div>

      <div className="nav-actions">
        <button className="login-btn" onClick={() => onOpenAuth('signin')}>
          Log in
        </button>
        <button className="signup-btn" onClick={() => onOpenAuth('signup')}>
          Sign Up
        </button>
      </div>
    </nav>
  )
}
