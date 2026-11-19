import React, { useEffect, useState, useRef } from 'react'
import Tesseract from 'tesseract.js'
import { parseInvoicePrompt } from '../utils/aiParser'
import { getPlatformHelpAnswer, platformHelpSuggestions } from '../utils/platformHelp'
import Icon from './ui/Icon'

const PLATFORM_SECTION_LABELS = {
  templates: 'Invoice Template & Mixers',
  customers: 'Customers',
  products: 'Products & Services',
  quotations: 'Quotations+',
  invoices: 'Invoices',
  payments: 'Payments',
  settings: 'Settings',
  inventory: 'Inventory',
  expenses: 'Expenses+',
  purchases: 'Purchases',
  api: 'Developer API',
  einvoices: 'E-Invoices',
  'credit-notes': 'Credit Notes',
  subscriptions: 'Subscriptions',
  'invite-users': 'Invite Users'
}

export default function InvoiceGenerator({ onInvoiceGenerated, onOpenSection, onCreateInvoice }) {
  const [assistantMode, setAssistantMode] = useState('create')
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // null, 'photo', 'voice', 'whatsapp'

  // Photo / OCR State
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageFileName, setImageFileName] = useState('')
  const [isOcrScanning, setIsOcrScanning] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrExtractedText, setOcrExtractedText] = useState('')
  const [ocrStatusMessage, setOcrStatusMessage] = useState('')
  const [billFormat, setBillFormat] = useState('classic') // 'classic', 'receipt', 'thermal', 'photo-clone'
  const fileInputRef = useRef(null)
  const ocrRequestRef = useRef(0)

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const recognitionInstanceRef = useRef(null)
  const isRecordingRef = useRef(false)
  const isManuallyStoppedRef = useRef(false)

  // WhatsApp Message State
  const [whatsappText, setWhatsappText] = useState('')
  const [helpQuestion, setHelpQuestion] = useState('')
  const [helpMessages, setHelpMessages] = useState([])
  const helpConversationRef = useRef(null)

  useEffect(() => {
    helpConversationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [helpMessages])

  const samplePrompts = [
    {
      label: 'Kitchen Interior Design',
      text: 'Create an invoice for Mehta Homes, Mumbai: Kitchen Interior Design & 3D Render ₹45,000 with 18% GST'
    },
    {
      label: 'IT Consulting & Cloud',
      text: 'Invoice to Sharma Tech Labs, Bengaluru: 40 hours React Consulting @ ₹2,500/hr and AWS Cloud Setup ₹35,000. 18% GST. Paid.'
    },
    {
      label: 'Office Furniture & Hardware',
      text: 'Bill to Apex Logistics, Pune: 5 Ergonomic Mesh Chairs at ₹8,500 each and 2 Executive Desks at ₹16,000 each with 12% GST.'
    },
    {
      label: 'Freelance Design Retainer',
      text: 'Invoice for GreenTree Organics: Brand Identity & Packaging Guidelines ₹60,000, 18% GST.'
    }
  ]

  const handleGenerate = (customText) => {
    const textToUse = (customText ?? prompt).trim()
    if (!textToUse || !textToUse.trim()) return

    if (isRecordingRef.current) stopVoiceRecording()

    setIsProcessing(true)
    setTimeout(() => {
      const parsedInvoice = parseInvoicePrompt(textToUse)
      setIsProcessing(false)
      setActiveModal(null)
      onInvoiceGenerated(parsedInvoice)
    }, 300)
  }

  // ─────────────────────────────────────────────────────────────
  // 1. ROBUST OCR PHOTO SCANNING WITH TIMEOUT & INSTANT FALLBACK
  // ─────────────────────────────────────────────────────────────
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ''
    if (file.type && !file.type.startsWith('image/')) {
      setSelectedImage(null)
      setImageFileName('')
      setOcrStatusMessage('Please choose an image file. PDF files cannot be scanned by the photo OCR tool.')
      return
    }

    const requestId = ++ocrRequestRef.current

    setImageFileName(file.name)
    const reader = new FileReader()

    reader.onload = async (event) => {
      if (requestId !== ocrRequestRef.current) return
      const imageUri = event.target.result
      setSelectedImage(imageUri)
      setIsOcrScanning(true)
      setOcrProgress(10)
      setOcrStatusMessage('Loading OCR engine...')
      setOcrExtractedText('')

      try {
        setOcrProgress(20)
        setOcrStatusMessage('Analyzing bill image...')

        const result = await Tesseract.recognize(imageUri, 'eng', {
          logger: (m) => {
            if (requestId !== ocrRequestRef.current) return
            if (m.status === 'loading tesseract core') {
              setOcrStatusMessage('Loading OCR engine (first time ~10s)...')
              setOcrProgress(15)
            } else if (m.status === 'initializing tesseract') {
              setOcrStatusMessage('Initializing text engine...')
              setOcrProgress(25)
            } else if (m.status === 'loading language traineddata') {
              setOcrStatusMessage('Loading language model...')
              setOcrProgress(35)
            } else if (m.status === 'initializing api') {
              setOcrProgress(45)
              setOcrStatusMessage('Preparing to scan text...')
            } else if (m.status === 'recognizing text') {
              const pct = Math.min(95, Math.round((m.progress || 0) * 100))
              setOcrProgress(pct)
              setOcrStatusMessage(`Reading text from bill... (${pct}%)`)
            }
          }
        })

        if (requestId !== ocrRequestRef.current) return
        const rawText = result?.data?.text?.trim()
        if (rawText) {
          // Clean up OCR noise: remove lines with only symbols/numbers that are too short
          const cleanedLines = rawText.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 1)
            .join('\n')
          setOcrExtractedText(cleanedLines)
          if (cleanedLines) {
            setOcrStatusMessage(' Bill scanned successfully! Review the text below and click Generate.')
          } else {
            setOcrStatusMessage(' No readable bill text found. Type or paste the details below.')
          }
          setOcrProgress(100)
        } else {
          setOcrExtractedText('')
          setOcrStatusMessage(' Could not read text clearly. Please type the bill details manually below.')
          setOcrProgress(100)
        }
      } catch (err) {
        if (requestId !== ocrRequestRef.current) return
        console.warn('OCR error:', err.message)
        setOcrExtractedText('')
        setOcrStatusMessage(` OCR could not scan this image. ${err.message || 'Please try a clear JPG or PNG photo, or type the details below.'}`)
        setOcrProgress(0)
      } finally {
        if (requestId === ocrRequestRef.current) setIsOcrScanning(false)
      }
    }

    reader.onerror = () => {
      if (requestId !== ocrRequestRef.current) return
      setIsOcrScanning(false)
      setOcrStatusMessage(' Could not open this image. Please choose another JPG or PNG photo.')
    }

    reader.readAsDataURL(file)
  }

  const handleConfirmOcrInvoice = () => {
    const text = ocrExtractedText || prompt
    if (!text.trim()) return
    const parsed = parseInvoicePrompt(text)
    if (parsed) {
      parsed.layout = billFormat
      parsed.originalPhotoUrl = selectedImage
      parsed.themeColor = billFormat === 'classic' || billFormat === 'receipt' ? '#1e293b' : '#0E5E5A'
      parsed.artStyle = 'none'
      onInvoiceGenerated(parsed)
      setActiveModal(null)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. LIVE VOICE NOTE RECORDING (Native Web Speech API)
  // ─────────────────────────────────────────────────────────────
  const startVoiceRecording = () => {
    setVoiceError('')
    setVoiceTranscript('')
    isManuallyStoppedRef.current = false

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError(' Your browser does not support Web Speech Recognition. Please open this app in Google Chrome or Microsoft Edge to use voice recording.')
      return
    }

    if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      setVoiceError(' Voice recording requires a secure HTTPS connection. Open the site over HTTPS and allow microphone access.')
      return
    }

    try {
      if (recognitionInstanceRef.current) {
        try { recognitionInstanceRef.current.abort() } catch {}
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-IN'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        isRecordingRef.current = true
        setIsRecording(true)
        setVoiceError('')
      }

      recognition.onresult = (event) => {
        let full = ''
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript + ' '
        }
        if (full.trim()) {
          setVoiceTranscript(full.trim())
        }
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error)
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          isRecordingRef.current = false
          setVoiceError(' Microphone permission blocked. Please click the lock  icon next to localhost in your browser address bar, set Microphone to "Allow", and try again.')
          setIsRecording(false)
        } else if (event.error === 'no-speech') {
          // Do not stop, user might just be pausing between words
        } else if (event.error === 'network') {
          isRecordingRef.current = false
          setVoiceError(' Speech recognition network timeout. You can dictate by typing directly or use the quick sample chips below.')
          setIsRecording(false)
        } else {
          isRecordingRef.current = false
          setVoiceError(` Voice note (${event.error}). You can dictate by typing or editing below.`)
          setIsRecording(false)
        }
      }

      recognition.onend = () => {
        // SpeechRecognition can end after a pause even in continuous mode. Re-start while active.
        if (!isManuallyStoppedRef.current && isRecordingRef.current) {
          try {
            recognition.start()
            return
          } catch {}
        }
        isRecordingRef.current = false
        setIsRecording(false)
      }

      recognitionInstanceRef.current = recognition
      isRecordingRef.current = true
      recognition.start()
    } catch (err) {
      console.error('Could not start recognition:', err)
      isRecordingRef.current = false
      setVoiceError(`Could not start voice recognition: ${err.message}. Please click Allow when prompted for Microphone.`)
      setIsRecording(false)
    }
  }

  const stopVoiceRecording = () => {
    isManuallyStoppedRef.current = true
    isRecordingRef.current = false
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop()
      } catch { }
    }
    setIsRecording(false)
  }

  const handleConfirmVoiceInvoice = () => {
    const text = voiceTranscript.trim() || prompt.trim()
    if (!text) return
    stopVoiceRecording()
    handleGenerate(text)
  }

  useEffect(() => {
    if (activeModal !== 'voice' && isRecordingRef.current) stopVoiceRecording()
  }, [activeModal])

  useEffect(() => () => {
    isManuallyStoppedRef.current = true
    isRecordingRef.current = false
    if (recognitionInstanceRef.current) {
      try { recognitionInstanceRef.current.abort() } catch {}
    }
  }, [])

  // ─────────────────────────────────────────────────────────────
  // 3. WHATSAPP MESSAGE PARSER
  // ─────────────────────────────────────────────────────────────
  const handleParseWhatsApp = () => {
    if (!whatsappText.trim()) return
    handleGenerate(whatsappText.trim())
  }

  const handleAskPlatformHelp = (question = helpQuestion) => {
    const asked = question.trim()
    if (!asked) return
    setHelpMessages(prev => [
      ...prev,
      { role: 'user', text: asked },
      { role: 'assistant', answer: getPlatformHelpAnswer(asked) }
    ])
    setHelpQuestion('')
  }

  const selectAssistantMode = (mode) => {
    setAssistantMode(mode)
    setActiveModal(null)
    if (isRecordingRef.current) stopVoiceRecording()
  }

  return (
    <section className="generator-section" id="ai-generator">
      <div className="section-heading">
        <span className="eyebrow">YOUR AI ASSISTANT</span>
        <h2>Invoices and platform help, step by step.</h2>
        <p>Create an invoice from text, voice, or a bill photo, or ask Invoxa AI how to use a feature.</p>
      </div>

      <div className="generator-box">
        <div className="generator-top">
          <span className="ai-symbol"><Icon name="sparkles" size={22} /></span>
          <div>
            <strong>{assistantMode === 'create' ? 'AI Invoice Generator' : 'Ask Invoxa AI'}</strong>
            <small>{assistantMode === 'create' ? 'Create invoices from text, voice, photos, or messages' : 'Get step-by-step help with Invoxa features'}</small>
          </div>
          <span className="online-status"><Icon name="checkCircle" size={13} /> AI Ready</span>
        </div>

        <div className="generator-mode-switch" role="tablist" aria-label="Choose Invoxa AI mode">
          <button type="button" role="tab" aria-selected={assistantMode === 'create'} className={assistantMode === 'create' ? 'active' : ''} onClick={() => selectAssistantMode('create')}>
            Create an invoice
          </button>
          <button type="button" role="tab" aria-selected={assistantMode === 'help'} className={assistantMode === 'help' ? 'active' : ''} onClick={() => selectAssistantMode('help')}>
            Ask about Invoxa
          </button>
        </div>

        {assistantMode === 'create' ? (<>
        <textarea
          placeholder="Example: Create an invoice for Mehta Homes for kitchen design worth ₹45,000 with 18% GST..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />

        {/* Quick Suggestion Chips */}
        <div className="prompt-chips">
          <span className="chips-label">Try quick prompts:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="chip-btn"
              onClick={() => {
                setPrompt(p.text)
                handleGenerate(p.text)
              }}
            >
              <Icon name="sparkles" size={13} /> {p.label}
            </button>
          ))}
        </div>

        <div className="generator-bottom">
          <span className="generator-badge"><Icon name="shieldCheck" size={14} /> Smart Indian GST Calculation & Auto HSN</span>
          <button
            className="generate-action-btn"
            disabled={isProcessing || !prompt.trim()}
            onClick={() => handleGenerate()}
          >
            {isProcessing ? 'Generating Invoice...' : <>Generate Invoice <Icon name="arrowUpRight" size={16} /></>}
          </button>
        </div>
        </>
        ) : (
          <div className="platform-help-panel">
            <div className="platform-help-chat" aria-live="polite">
              {helpMessages.length === 0 ? (
                <div className="platform-help-welcome">
                  <strong>What would you like to do?</strong>
                  <p>Ask about invoices, templates, customers, payments, settings, or any other screen. I’ll lay out the steps and point you to the relevant section.</p>
                </div>
              ) : helpMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`platform-help-message ${message.role}`}>
                  {message.role === 'user' ? (
                    <p>{message.text}</p>
                  ) : (
                    <>
                      <strong>{message.answer.title}</strong>
                      <ol>
                        {message.answer.steps.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}
                      </ol>
                      {message.answer.action === 'createInvoice' && onCreateInvoice && (
                        <button type="button" className="platform-help-action" onClick={onCreateInvoice}>Open Create Invoice</button>
                      )}
                      {message.answer.tab && onOpenSection && (
                        <button type="button" className="platform-help-action" onClick={() => onOpenSection(message.answer.tab)}>
                          Open {PLATFORM_SECTION_LABELS[message.answer.tab] || 'related section'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div ref={helpConversationRef} />
            </div>

            <div className="platform-help-suggestions">
              <span>Try asking:</span>
              {platformHelpSuggestions.map(question => (
                <button key={question} type="button" onClick={() => handleAskPlatformHelp(question)}>{question}</button>
              ))}
            </div>

            <div className="platform-help-composer">
              <textarea
                value={helpQuestion}
                onChange={e => setHelpQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAskPlatformHelp()
                  }
                }}
                rows={2}
                placeholder="Ask how to do something in Invoxa..."
                aria-label="Ask Invoxa AI for platform help"
              />
              <button type="button" className="generate-action-btn" disabled={!helpQuestion.trim()} onClick={() => handleAskPlatformHelp()}>
                Ask Invoxa AI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multimodal Options Buttons */}
      <div className="input-options" style={{ display: assistantMode === 'create' ? undefined : 'none' }}>
        <span>Other ways to generate with AI:</span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={activeModal === 'photo' ? 'active-mode' : ''}
            onClick={() => {
              setActiveModal(activeModal === 'photo' ? null : 'photo')
              setVoiceError('')
            }}
          >
            <Icon name="camera" size={17} /> Upload Bill / Estimate Photo
          </button>
          <button
            type="button"
            className={activeModal === 'voice' ? 'active-mode' : ''}
            onClick={() => {
              setActiveModal(activeModal === 'voice' ? null : 'voice')
              setVoiceError('')
            }}
          >
            <Icon name="microphone" size={17} /> Record Voice Note
          </button>
          <button
            type="button"
            className={activeModal === 'whatsapp' ? 'active-mode' : ''}
            onClick={() => {
              setActiveModal(activeModal === 'whatsapp' ? null : 'whatsapp')
              setVoiceError('')
            }}
          >
            <Icon name="message" size={17} /> Paste WhatsApp / Client Message
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. PHOTO OCR SCANNER (Powered by Tesseract.js)                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeModal === 'photo' && (
        <div style={{
          marginTop: 16,
          background: '#ffffff',
          border: '2px dashed #15865a',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handlePhotoSelect}
          />
          <div style={{ color: '#64748b', marginBottom: 8 }}><Icon name="image" size={28} /></div>
          <h3 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '1.15rem' }}>Scan Physical Bill / Receipt Photo</h3>
          <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.88rem' }}>
            Upload any photo of a paper receipt, handwritten bill, or estimate to extract the customer and item details.
          </p>

          {!selectedImage ? (
            <button
              type="button"
              className="primary-btn"
              onClick={() => fileInputRef.current?.click()}
              style={{ background: '#15865a', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Choose Bill Image from Device 
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}>
                <div>
                  <img
                    src={selectedImage}
                    alt="Uploaded Bill Preview"
                    style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                    {imageFileName}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 260, textAlign: 'left' }}>
                  {isOcrScanning ? (
                    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <div style={{ marginBottom: 6 }}><Icon name="scan" size={20} /></div>
                      <strong style={{ color: '#15865a', display: 'block', marginBottom: 6 }}>
                        {ocrStatusMessage || `Scanning… (${ocrProgress}%)`}
                      </strong>
                      <div style={{ height: 8, width: '100%', background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${ocrProgress}%`, background: 'linear-gradient(90deg,#15865a,#22c55e)', transition: 'width 0.4s' }} />
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 8px' }}>
                        First scan may take 15–30 seconds to load the OCR engine.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          ocrRequestRef.current += 1
                          setIsOcrScanning(false)
                          setOcrStatusMessage(' Skipped scanning. Type or paste the bill details below.')
                          setOcrExtractedText('')
                        }}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Skip scanning &amp; type details manually <Icon name="arrowUpRight" size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      {ocrStatusMessage && (
                        <div style={{ fontSize: '0.8rem', color: /no readable|could not|skipped/i.test(ocrStatusMessage) ? '#b45309' : '#15865a', fontWeight: 600, marginBottom: 8, padding: '6px 10px', background: /no readable|could not|skipped/i.test(ocrStatusMessage) ? '#fffbeb' : '#f0fdf4', borderRadius: 6 }}>
                          {ocrStatusMessage}
                        </div>
                      )}
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                         Bill Details (Review / Edit, then click Generate):
                      </label>
                      <textarea
                        rows={7}
                        value={ocrExtractedText}
                        onChange={(e) => setOcrExtractedText(e.target.value)}
                        placeholder={`Type or paste the bill details here.\nExample:\nClient: Sharma Traders\n5 bags Cement @ 420\n2 rolls Wire @ 1500\nGST: 18%`}
                        style={{
                          width: '100%',
                          padding: 10,
                          borderRadius: 6,
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box',
                          lineHeight: 1.6
                        }}
                        autoFocus={!ocrExtractedText}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Format Matcher for Uploaded Bill */}
              <div style={{ margin: '14px 0 18px', textAlign: 'left', background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 8 }}>
                   Select Invoice Format to Match Your Uploaded Photo:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: billFormat === 'classic' ? '#dcfce7' : '#ffffff', border: billFormat === 'classic' ? '1.5px solid #15865a' : '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem' }}>
                    <input type="radio" name="billFormat" value="classic" checked={billFormat === 'classic'} onChange={() => setBillFormat('classic')} />
                    <span> <strong>Traditional Indian GST Bill</strong><br/><small style={{ color: '#64748b' }}>Standard boxed tables</small></span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: billFormat === 'receipt' ? '#dcfce7' : '#ffffff', border: billFormat === 'receipt' ? '1.5px solid #15865a' : '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem' }}>
                    <input type="radio" name="billFormat" value="receipt" checked={billFormat === 'receipt'} onChange={() => setBillFormat('receipt')} />
                    <span> <strong>Retail Cash Memo / Receipt</strong><br/><small style={{ color: '#64748b' }}>Shop & counter receipt</small></span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: billFormat === 'thermal' ? '#dcfce7' : '#ffffff', border: billFormat === 'thermal' ? '1.5px solid #15865a' : '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem' }}>
                    <input type="radio" name="billFormat" value="thermal" checked={billFormat === 'thermal'} onChange={() => setBillFormat('thermal')} />
                    <span> <strong>Thermal POS Slip</strong><br/><small style={{ color: '#64748b' }}>80mm counter slip</small></span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: billFormat === 'photo-clone' ? '#dcfce7' : '#ffffff', border: billFormat === 'photo-clone' ? '1.5px solid #15865a' : '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.82rem' }}>
                    <input type="radio" name="billFormat" value="photo-clone" checked={billFormat === 'photo-clone'} onChange={() => setBillFormat('photo-clone')} />
                    <span> <strong>Photo Clone View</strong><br/><small style={{ color: '#64748b' }}>Original photo + digital copy</small></span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={isOcrScanning || !ocrExtractedText.trim()}
                  onClick={handleConfirmOcrInvoice}
                  style={{
                    background: '#15865a',
                    color: '#fff',
                    padding: '10px 22px',
                    borderRadius: 8,
                    fontWeight: 700,
                    border: 'none',
                    cursor: (isOcrScanning || !ocrExtractedText.trim()) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(21,134,90,0.2)'
                  }}
                >
                  Generate Invoice from Scanned Bill 
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Upload Different Photo
                </button>
                <button
                  type="button"
                  onClick={() => { ocrRequestRef.current += 1; setIsOcrScanning(false); setSelectedImage(null); setOcrExtractedText(''); setActiveModal(null); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. REAL VOICE NOTE RECORDER (Web Speech API)                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeModal === 'voice' && (
        <div style={{
          marginTop: 16,
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'inline-flex', color: isRecording ? '#b91c1c' : '#64748b', marginBottom: 8 }}>
            <Icon name="microphone" size={26} />
          </div>
          <h3 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '1.15rem' }}>
            {isRecording ? 'Listening... Speak Now' : 'Voice Invoice Dictation'}
          </h3>
          <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: '0.88rem' }}>
            {isRecording
              ? 'Speak customer name, items, quantities, and rates. Words will appear live below.'
              : 'Click "Start Recording" to speak your bill. (Allow microphone access when prompted).'}
          </p>

          {voiceError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.85rem',
              marginBottom: 14,
              textAlign: 'left'
            }}>
              {voiceError}
            </div>
          )}

          <div style={{ marginBottom: 14, textAlign: 'left' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
              What you spoke (Live Transcript):
            </label>
            <textarea
              rows={3}
              value={voiceTranscript}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              placeholder={isRecording ? 'Listening to your voice... Speak now!' : 'Your words will appear here as you speak. You can also edit or type directly.'}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: isRecording ? '2px solid #dc2626' : '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Quick Voice Simulation Buttons for Easy Testing */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', alignSelf: 'center' }}>Or click to dictate:</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'Invoice for Sharma Traders: 5 Laptops at 45000 each and 2 Dell Monitors at 12000 each with 18% GST'
                setVoiceTranscript(sample)
              }}
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              <Icon name="sparkles" size={13} /> Laptops &amp; Monitors
            </button>
            <button
              type="button"
              onClick={() => {
                const sample = 'Bill for Apex Logistics: 10 Ergonomic Chairs at 3500 each with 12% GST, paid'
                setVoiceTranscript(sample)
              }}
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              <Icon name="sparkles" size={13} /> Chairs Order
            </button>
            <button
              type="button"
              onClick={() => {
                const sample = 'Ramesh Builders ko 50 bags cement 420 each aur transport 2000 18 percent gst'
                setVoiceTranscript(sample)
              }}
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              <Icon name="sparkles" size={13} /> Cement &amp; Transport (Hindi)
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isRecording ? (
              <button
                type="button"
                onClick={startVoiceRecording}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(220,38,38,0.25)'
                }}
              >
                <Icon name="microphone" size={17} /> Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopVoiceRecording}
                style={{
                  background: '#e11d48',
                  color: '#fff',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Icon name="x" size={17} /> Stop Recording
              </button>
            )}

            {voiceTranscript && (
              <button
                type="button"
                onClick={handleConfirmVoiceInvoice}
                style={{
                  background: '#15865a',
                  color: '#fff',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(21,134,90,0.25)'
                }}
              >
                <Icon name="fileCheck" size={17} /> Generate Invoice from Speech
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isRecording && recognitionInstanceRef.current) {
                  try { recognitionInstanceRef.current.stop() } catch {}
                }
                setIsRecording(false)
                setActiveModal(null)
                setVoiceError('')
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. PASTE WHATSAPP / CLIENT MESSAGE                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeModal === 'whatsapp' && (
        <div style={{
          marginTop: 16,
          background: '#ffffff',
          border: '1.5px solid #25d366',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Icon name="message" size={20} />
            <div>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem' }}>Paste WhatsApp or Client Chat Message</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Paste the real message or order sent by your client. Invoxa AI will extract client name, items, quantities, and GST rates.
              </p>
            </div>
          </div>

          <textarea
            rows={5}
            placeholder={`Paste your client's message here, e.g.:\nClient: Apex Constructions\n1. UltraTech Cement 50 bags @ 420\n2. Steel rods 200 kg @ 75\nGST: 18%\nStatus: Unpaid`}
            value={whatsappText}
            onChange={(e) => setWhatsappText(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1.5px solid #cbd5e1',
              fontSize: '0.92rem',
              marginBottom: 12,
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            autoFocus
          />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleParseWhatsApp}
              disabled={!whatsappText.trim()}
              style={{
                background: '#25d366',
                color: '#ffffff',
                border: 'none',
                padding: '9px 20px',
                borderRadius: 6,
                fontWeight: 700,
                cursor: whatsappText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(37,211,102,0.25)'
              }}
            >
              <Icon name="sparkles" size={16} /> Extract &amp; Generate Invoice
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
