import React, { useState, useEffect } from 'react'
import { api } from '../utils/apiClient'
import Icon from './ui/Icon'

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode) // 'signin' | 'signup' | 'forgot'
  const [tab, setTab] = useState('email') // 'email' | 'phone' (for signin)

  // Registration Form Fields
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Signin Phone OTP State
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [sentOtpHint, setSentOtpHint] = useState('')

  // Email Signup Verification State
  const [signupStep, setSignupStep] = useState('form') // 'form' or 'verify'
  const [signupEmailOtp, setSignupEmailOtp] = useState('')

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState('email') // 'email' or 'reset'
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotResetOtp, setForgotResetOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setErrorMsg('')
      setSentOtpHint('')
      setOtpStep(false)
      setOtp('')
      setSignupStep('form')
      setSignupEmailOtp('')
      setForgotStep('email')
      setForgotResetOtp('')
      setForgotNewPassword('')
      setForgotSuccessMsg('')
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  // ─────────────────────────────────────────────────────────────
  // SIGN IN: Mobile Phone OTP
  // ─────────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number')
      return
    }
    setErrorMsg('')
    setIsSubmitting(true)
    try {
      const data = await api.sendOtp(phoneNumber)
      setOtpStep(true)

      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').slice(-10)

      if (data.smsDelivered) {
        setSentOtpHint(` Official SMS dispatched to +91 ${cleanPhone}! Check your phone messages.`)
      } else {
        setErrorMsg(data.message || 'SMS delivery failed. Please check your SMS gateway settings.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp || otp.length < 4) {
      setErrorMsg('Please enter the verification OTP')
      return
    }
    setErrorMsg('')
    setIsSubmitting(true)
    try {
      const data = await api.verifyOtp(phoneNumber, otp)
      localStorage.setItem('invoxa_token', data.token)
      onLoginSuccess(data.user)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP. Please check and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SIGN IN: Email & Password
  // ─────────────────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      const data = await api.login(email, password)
      localStorage.setItem('invoxa_token', data.token)
      onLoginSuccess(data.user)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SIGN UP: Step 1 — Send Email Verification Code
  // ─────────────────────────────────────────────────────────────
  const handleStartSignup = async (e) => {
    if (e) e.preventDefault()
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid business email address.')
      return
    }
    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.sendRegistrationOtp({
        name: name.trim(),
        email: email.trim()
      })
      setSignupEmailOtp('')
      setSignupStep('verify')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch email verification code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SIGN UP: Step 2 — Verify Email Code & Create Account
  // ─────────────────────────────────────────────────────────────
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!signupEmailOtp || signupEmailOtp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit Email verification code.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await api.verifyRegistrationOtp({
        name: name.trim(),
        companyName: companyName.trim() || `${name.trim()}'s Business`,
        email: email.trim(),
        phone: phoneNumber ? phoneNumber.replace(/[^0-9]/g, '').slice(-10) : '',
        password,
        emailOtp: signupEmailOtp.trim()
      })
      localStorage.setItem('invoxa_token', data.token)
      onLoginSuccess(data.user)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please check your email code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FORGOT PASSWORD: Step 1 — Send Reset Code to Email
  // ─────────────────────────────────────────────────────────────
  const handleForgotSendOtp = async (e) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.forgotPasswordSendOtp(forgotEmail.trim())
      setForgotResetOtp('')
      setForgotNewPassword('')
      setForgotStep('reset')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch password reset code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FORGOT PASSWORD: Step 2 — Verify Reset Code & Set New Password
  // ─────────────────────────────────────────────────────────────
  const handleForgotResetPassword = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!forgotResetOtp || forgotResetOtp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification code.')
      return
    }
    if (!forgotNewPassword || forgotNewPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await api.forgotPasswordReset({
        email: forgotEmail.trim(),
        resetOtp: forgotResetOtp.trim(),
        newPassword: forgotNewPassword
      })
      localStorage.setItem('invoxa_token', data.token)
      onLoginSuccess(data.user)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed. Please check the code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container swipe-auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="brand-icon small">I</span>
            <h3>
              {mode === 'signup' && 'Create Business Account'}
              {mode === 'signin' && 'Sign in to Invoxa'}
              {mode === 'forgot' && 'Reset Password'}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Mode Switch: Sign In vs Sign Up (hidden when in forgot password view) */}
        {mode !== 'forgot' && (
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: 'none',
                borderBottom: mode === 'signin' ? '2.5px solid #15865a' : '2.5px solid transparent',
                color: mode === 'signin' ? '#15865a' : '#64748b',
                fontWeight: mode === 'signin' ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); setSignupStep('form'); }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: 'none',
                borderBottom: mode === 'signup' ? '2.5px solid #15865a' : '2.5px solid transparent',
                color: mode === 'signup' ? '#15865a' : '#64748b',
                fontWeight: mode === 'signup' ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              Create Account 
            </button>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 14 }}>
             {errorMsg}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SIGN UP FLOW (Email Verification Only)                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mode === 'signup' && signupStep === 'form' && (
          <form onSubmit={handleStartSignup} className="auth-form">
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: 6, fontSize: '0.82rem', color: '#166534', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="mail" size={17} />
              <span>A real 6-digit verification code will be sent to your email.</span>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Business / Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sharma Enterprises"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Business Email <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>(Verification code will be sent here)</span></label>
              <input
                type="email"
                required
                placeholder="rahul@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mobile Number <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>(Optional — for invoice header)</span></label>
              <div className="phone-input-row">
                <span className="country-prefix">+91</span>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Create Password</label>
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
              <Icon name={isSubmitting ? 'clock' : 'arrowUpRight'} size={15} />
              {isSubmitting ? 'Sending Verification Code…' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SIGN UP STEP 2: EMAIL OTP VERIFICATION                         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mode === 'signup' && signupStep === 'verify' && (
          <form onSubmit={handleVerifyAndRegister} className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="auth-status-mark"><Icon name="shieldCheck" size={22} /></div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#1e293b' }}>Verify Your Email</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                We sent a 6-digit verification code to:
              </p>
              <div style={{ fontWeight: 700, color: '#15865a', fontSize: '0.95rem', marginTop: 2 }}>
                {email}
              </div>
            </div>

            <div className="form-group">
              <label style={{ textAlign: 'center', display: 'block', marginBottom: 8 }}>Enter 6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="••••••"
                value={signupEmailOtp}
                onChange={(e) => setSignupEmailOtp(e.target.value)}
                className="otp-field-input"
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.4rem', fontWeight: 800 }}
                autoFocus
              />
            </div>

            <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying & Creating Account…' : 'Verify & Enter Workspace '}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: '0.82rem' }}>
              <button
                type="button"
                onClick={handleStartSignup}
                disabled={isSubmitting}
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontWeight: 600 }}
              >
                 Resend Code
              </button>
              <button
                type="button"
                onClick={() => setSignupStep('form')}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
              >
                <Icon name="arrowLeft" size={14} /> Edit Details
              </button>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SIGN IN FORM                                                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mode === 'signin' && (
          <>
            <div className="role-switch">
              <button
                type="button"
                className={`role-btn ${tab === 'email' ? 'active' : ''}`}
                onClick={() => setTab('email')}
              >
                 Email &amp; Password
              </button>
              <button
                type="button"
                className={`role-btn ${tab === 'phone' ? 'active' : ''}`}
                onClick={() => {
                  setTab('phone')
                  setOtpStep(false)
                }}
              >
                 Mobile OTP
              </button>
            </div>

            {/* Tab 1: Phone + OTP */}
            {tab === 'phone' && !otpStep && (
              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div className="phone-input-row">
                    <span className="country-prefix">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    />
                  </div>
                </div>

                <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
                  <Icon name={isSubmitting ? 'clock' : 'arrowUpRight'} size={15} />
                  {isSubmitting ? 'Sending OTP…' : 'Send SMS OTP'}
                </button>
              </form>
            )}

            {tab === 'phone' && otpStep && (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                {sentOtpHint && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 6, padding: '8px 12px', fontSize: '0.85rem', marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
                     {sentOtpHint}
                  </div>
                )}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ margin: 0 }}>Enter 6-Digit OTP</label>
                    <span
                      style={{ fontSize: '0.78rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => { setOtpStep(false); setOtp(''); setSentOtpHint(''); }}
                    >
                      <Icon name="arrowLeft" size={14} /> Change (+91 {phoneNumber})
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="otp-field-input"
                    autoFocus
                  />
                </div>

                <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
                  <Icon name={isSubmitting ? 'clock' : 'arrowUpRight'} size={15} />
                  {isSubmitting ? 'Verifying…' : 'Verify & Enter Workspace'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Didn't receive code? Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Email & Password */}
            {tab === 'email' && (
              <form onSubmit={handleEmailLogin} className="auth-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ margin: 0 }}>Password</label>
                    <span
                      onClick={() => {
                        setMode('forgot')
                        setErrorMsg('')
                        setForgotEmail(email || '')
                        setForgotStep('email')
                      }}
                      style={{ fontSize: '0.78rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Forgot Password?
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
                  <Icon name={isSubmitting ? 'clock' : 'arrowUpRight'} size={15} />
                  {isSubmitting ? 'Signing In…' : 'Sign In'}
                </button>
              </form>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FORGOT PASSWORD FLOW (Reset via Email Code)                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mode === 'forgot' && (
          <div className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="auth-status-mark"><Icon name="key" size={22} /></div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#1e293b' }}>
                {forgotStep === 'email' ? 'Forgot Password?' : 'Set New Password'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                {forgotStep === 'email'
                  ? 'Enter your registered email address to receive a 6-digit reset code.'
                  : `Enter the code sent to ${forgotEmail} and choose a new password.`}
              </p>
            </div>

            {forgotStep === 'email' && (
              <form onSubmit={handleForgotSendOtp}>
                <div className="form-group">
                  <label>Registered Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    autoFocus
                  />
                </div>

                <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
                  <Icon name={isSubmitting ? 'clock' : 'arrowUpRight'} size={15} />
                  {isSubmitting ? 'Sending Reset Code…' : 'Send Reset Code to Email'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <span
                    onClick={() => { setMode('signin'); setErrorMsg(''); }}
                    style={{ fontSize: '0.82rem', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    <Icon name="arrowLeft" size={14} /> Back to Sign In
                  </span>
                </div>
              </form>
            )}

            {forgotStep === 'reset' && (
              <form onSubmit={handleForgotResetPassword}>
                <div className="form-group">
                  <label>6-Digit Reset Code (from email)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="••••••"
                    value={forgotResetOtp}
                    onChange={(e) => setForgotResetOtp(e.target.value)}
                    className="otp-field-input"
                    style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.3rem', fontWeight: 800 }}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Create New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
                  {isSubmitting ? 'Resetting Password…' : 'Reset Password & Sign In '}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: '0.82rem' }}>
                  <button
                    type="button"
                    onClick={handleForgotSendOtp}
                    disabled={isSubmitting}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                  >
                     Resend Code
                  </button>
                  <span
                    onClick={() => { setMode('signin'); setErrorMsg(''); }}
                    style={{ color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    <Icon name="arrowLeft" size={14} /> Back to Sign In
                  </span>
                </div>
              </form>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: '#64748b' }}>
          {mode === 'signin' && (
            <span>New to Invoxa? <strong style={{ color: '#15865a', cursor: 'pointer' }} onClick={() => { setMode('signup'); setSignupStep('form'); setErrorMsg(''); }}>Create an account</strong></span>
          )}
          {mode === 'signup' && (
            <span>Already have an account? <strong style={{ color: '#15865a', cursor: 'pointer' }} onClick={() => { setMode('signin'); setErrorMsg(''); }}>Sign in</strong></span>
          )}
          {mode === 'forgot' && (
            <span>Remembered your password? <strong style={{ color: '#15865a', cursor: 'pointer' }} onClick={() => { setMode('signin'); setErrorMsg(''); }}>Sign in</strong></span>
          )}
        </div>
      </div>
    </div>
  )
}
