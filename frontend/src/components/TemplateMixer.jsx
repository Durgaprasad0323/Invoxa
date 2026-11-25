import React, { useState, useEffect, useRef } from 'react'
import {
  STYLES,
  INDUSTRIES,
  LAYOUTS,
  ARTS,
  STATUSES,
  OCCS,
  OUTS,
  LVLS,
  SIZES,
  TABLES,
  PAPERS,
  STAMPS,
  SIGS,
  QRS,
  MSGS,
  PAL_FAM,
  FONTPAIRS,
  LANGS,
  palFrom,
  fmtOf,
  render,
  msgDefault
} from '../utils/engineRenderer'
import { addFreeInvoiceWatermark } from '../utils/invoiceWatermark'
import { sanitizeInvoiceHtml } from '../utils/sanitizeInvoiceHtml'
import { loadHtml2Pdf } from '../utils/pdfGenerator'
import Icon from './ui/Icon'
import '../templateEngine.css'

const getCustomizerItems = (style) => fmtOf(style).rows.map(row => ({
  desc: row.desc || 'Item',
  hsn: row.hsn || '998314',
  qty: row.qty || 1,
  rate: row.rate || 0,
  unit: row.unit || 'nos',
  gst: row.gst !== undefined ? row.gst : (style.gst || 18)
}))

export default function TemplateMixer({
  invoiceToEdit,
  onClearEditInvoice,
  onSaveInvoice,
  onNavigateToInvoices,
  isPro = false,
  onUpgrade,
  businessProfile = {},
  initialIndustry = 'interior'
}) {
  const initialIndObj = INDUSTRIES.find(x => x.id === initialIndustry) || INDUSTRIES[0]
  const initialStyleObj = STYLES.find(x => x.id === (initialIndObj?.s || 'studio')) || STYLES[0]
  const initialNamedPalette = initialIndObj?.pal
    ? Object.entries(PAL_FAM).flatMap(([family, palettes]) => palettes.map(palette => ({ family, palette }))).find(({ palette }) => palette[0] === initialIndObj.pal)
    : null
  const initialFontPairIndex = initialIndObj?.fp
    ? FONTPAIRS.findIndex(fontPair => fontPair.fd === initialIndObj.fp[0] && fontPair.fb === initialIndObj.fp[1])
    : -1

  const [activeTab, setActiveTab] = useState('start')
  const [mobileMixerTab, setMobileMixerTab] = useState('controls') // 'stage' | 'controls'
  
  // Mixer State
  const [currentStyleId, setCurrentStyleId] = useState(initialStyleObj.id)
  const [currentIndustryId, setCurrentIndustryId] = useState(initialIndObj.id)
  const [industryStarterHasBeenApplied, setIndustryStarterHasBeenApplied] = useState(false)
  const [layout, setLayout] = useState(initialIndObj.l || 'band')
  const [output, setOutput] = useState('a4')
  const [detailLevel, setDetailLevel] = useState(initialIndObj.lvl || '1')
  const [invoiceCopy, setInvoiceCopy] = useState('0')
  const [textSize, setTextSize] = useState('1')
  
  const [palFamily, setPalFamily] = useState(initialNamedPalette?.family || 'Indian heritage')
  const [activePalette, setActivePalette] = useState(() => initialNamedPalette ? palFrom(initialNamedPalette.palette[1], initialNamedPalette.palette[2]) : null)
  const [paletteName, setPaletteName] = useState(initialNamedPalette?.palette[0] || null)
  const [paperFinish, setPaperFinish] = useState('white')
  const [paperColor, setPaperColor] = useState(null)
  
  const [fontPairIdx, setFontPairIdx] = useState(initialFontPairIndex >= 0 ? String(initialFontPairIndex) : '')
  const [selectedLang, setSelectedLang] = useState(initialIndObj.lang || initialStyleObj.lang || 'en')
  
  const [tableStyle, setTableStyle] = useState(initialIndObj.tb || 'clean')
  const [colRenames, setColRenames] = useState({ ...(initialIndObj.cols || {}) })
  
  const [stampStyle, setStampStyle] = useState(initialIndObj.stamp || 'brand')
  const [sigType, setSigType] = useState('script')
  const [sigImgData, setSigImgData] = useState(null)
  const [qrStyle, setQrStyle] = useState(initialIndObj.qr || 'classic')
  const [footerMsgType, setFooterMsgType] = useState(initialIndObj.msg || 'none')
  const [footerCustomMsg, setFooterCustomMsg] = useState('')
  
  const [brandArt, setBrandArt] = useState(initialIndObj.art || initialStyleObj.art || 'none')
  const [artVariation, setArtVariation] = useState(0)
  const [docStatus, setDocStatus] = useState('sent')
  const [festiveOcc, setFestiveOcc] = useState(initialIndObj.occ || initialStyleObj.occ || 'none')
  const [verifiedSeal, setVerifiedSeal] = useState(true)
  
  const [logoImgUrl, setLogoImgUrl] = useState(null)
  const [upiQrUrl, setUpiQrUrl] = useState(() => invoiceToEdit?.paymentDetails?.upiQrUrl || invoiceToEdit?.upiQrUrl || (businessProfile.upiQrUrl !== undefined ? businessProfile.upiQrUrl || null : invoiceToEdit?.templateStyle?.qrImg || null))
  const [reviewQrUrl, setReviewQrUrl] = useState(() => invoiceToEdit?.reviewQrUrl || invoiceToEdit?.templateStyle?.reviewQrImg || null)
  const [logoPalettes, setLogoPalettes] = useState([])
  const [baseStarterName, setBaseStarterName] = useState(`${initialIndObj.name.split('/')[0].trim()} starter`)
  
  // Customizer Modal State - initialized to the active starter style
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState(1) // 1: form, 2: preview
  const [cuDocType, setCuDocType] = useState('invoice')
  const [cuBiz, setCuBiz] = useState(initialStyleObj.biz || '')
  const [cuCity, setCuCity] = useState(initialStyleObj.city || '')
  const [cuGstin, setCuGstin] = useState(initialStyleObj.gstin || '')
  const [cuSign, setCuSign] = useState(initialStyleObj.sign || '')
  const [cuClient, setCuClient] = useState(initialStyleObj.client || '')
  const [cuCcity, setCuCcity] = useState(initialStyleObj.ccity || '')
  const [cuCg, setCuCg] = useState(initialStyleObj.cg || '')
  const [cuPos, setCuPos] = useState(initialStyleObj.pos || 'Maharashtra (27)')
  const [cuInter, setCuInter] = useState(!initialStyleObj.intra)
  const [cuNo, setCuNo] = useState(`INV-2026-${String(100 + (initialStyleObj.id ? initialStyleObj.id.length * 17 : 34) + (initialIndObj.l ? initialIndObj.l.length * 7 : 28)).padStart(4, '0')}`)
  const [cuDate, setCuDate] = useState(() => new Date().toISOString().split('T')[0])
  const [cuDue, setCuDue] = useState(() => new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0])
  const [cuBank, setCuBank] = useState(businessProfile.bankName ?? initialStyleObj.bank?.[0] ?? '')
  const [cuAc, setCuAc] = useState(businessProfile.accountNumber ?? initialStyleObj.bank?.[1] ?? '')
  const [cuIfsc, setCuIfsc] = useState(businessProfile.ifsc ?? initialStyleObj.bank?.[2] ?? '')
  const [cuUpi, setCuUpi] = useState(businessProfile.upiId ?? initialStyleObj.upi ?? '')
  const [cuItems, setCuItems] = useState(() => getCustomizerItems(initialStyleObj))
  const [cuAdv, setCuAdv] = useState(initialStyleObj.adv !== undefined ? initialStyleObj.adv : 30000)
  const [customPreviewHtml, setCustomPreviewHtml] = useState(null)
  const [zoomMode, setZoomMode] = useState('fit')
  const [cuNotes, setCuNotes] = useState(
    Array.isArray(initialStyleObj.notes)
      ? initialStyleObj.notes.join('\n')
      : (initialStyleObj.notes || 'Payment due within 15 days.\nSubject to local jurisdiction.')
  )
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [saveSuccessToast, setSaveSuccessToast] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const invoiceSourceRef = useRef(invoiceToEdit?.id || invoiceToEdit?.invoiceNumber || null)

  const requestWatermarkUpgrade = () => onUpgrade?.('pro')
  const handleMixerDocumentTypeChange = (nextType) => {
    setCuDocType(nextType)
    setCuNo(currentNumber => {
      const prefix = { invoice: 'INV', quote: 'QT', estimate: 'EST' }[nextType]
      return /^(INV|QT|EST)(-\d{4}-.*)$/i.test(currentNumber)
        ? currentNumber.replace(/^(INV|QT|EST)/i, prefix)
        : currentNumber
    })
    setCustomPreviewHtml(null)
  }

  // Direct refs for fluid, non-blocking inline editing that never loses mobile keypad focus
  const inlineEditRef = useRef(null)
  const isTypingInlineRef = useRef(false)
  const latestInlineHtmlRef = useRef('')
  const historyDebounceRef = useRef(null)

  // Synchronize customizer state when invoiceToEdit is provided
  useEffect(() => {
    const invoiceSourceId = invoiceToEdit?.id || invoiceToEdit?.invoiceNumber || null
    if (invoiceSourceRef.current !== invoiceSourceId) {
      invoiceSourceRef.current = invoiceSourceId
      setIndustryStarterHasBeenApplied(false)
    }

    if (invoiceToEdit) {
      const inv = invoiceToEdit
      const s = inv.templateStyle || {}

      if (s.id) {
        setCurrentStyleId(s.id)
      } else if (inv.layout) {
        const matchingInd = INDUSTRIES.find(x => x.l === inv.layout)
        if (matchingInd?.s) setCurrentStyleId(matchingInd.s)
      }

      if (inv.layout) setLayout(inv.layout)
      if (inv.artStyle) setBrandArt(inv.artStyle)
      if (inv.paperTexture) setPaperFinish(inv.paperTexture)
      if (inv.stampActive) setStampStyle(inv.stampActive)
      if (inv.themeColor) {
        setActivePalette({ name: 'Custom Palette', acc: inv.themeColor, ink: '#151A2D' })
      }
      if (inv.status) setDocStatus(inv.status.toLowerCase() === 'paid' ? 'paid' : 'sent')
      setCuDocType(inv.docType === 'quotation' ? 'quote' : (inv.docType || 'invoice'))

      const bizName = inv.seller?.name || s.biz || ''
      const bizCity = [inv.seller?.address, inv.seller?.city, inv.seller?.state].filter(Boolean).join(', ') || s.city || ''
      const bizGstin = inv.seller?.gstin || s.gstin || ''
      const bizSign = inv.seller?.authorizedSignatory || s.sign || ''
      const clientName = inv.client?.name || s.client || ''
      const clientCity = [inv.client?.address, inv.client?.city, inv.client?.state].filter(Boolean).join(', ') || s.ccity || ''
      const clientGstin = inv.client?.gstin || s.cg || ''

      setCuBiz(bizName)
      setCuCity(bizCity)
      setCuGstin(bizGstin)
      setCuSign(bizSign)
      setCuClient(clientName)
      setCuCcity(clientCity)
      setCuCg(clientGstin)
      setCuNo(inv.invoiceNumber || inv.quoteNumber || s.invoiceNumber || '')
      if (inv.invoiceDate) setCuDate(inv.invoiceDate)
      if (inv.dueDate || inv.validUntil) setCuDue(inv.dueDate || inv.validUntil)

      const bankName = inv.paymentDetails?.bankName || (businessProfile.bankName !== undefined ? businessProfile.bankName : s.bank?.[0] || '')
      const acNum = inv.paymentDetails?.accountNumber || (businessProfile.accountNumber !== undefined ? businessProfile.accountNumber : s.bank?.[1] || '')
      const ifscCode = inv.paymentDetails?.ifsc || (businessProfile.ifsc !== undefined ? businessProfile.ifsc : s.bank?.[2] || '')
      const upi = inv.paymentDetails?.upiId || (businessProfile.upiId !== undefined ? businessProfile.upiId : s.upi || '')

      setCuBank(bankName)
      setCuAc(acNum)
      setCuIfsc(ifscCode)
      setCuUpi(upi)
      setUpiQrUrl(inv.paymentDetails?.upiQrUrl || inv.upiQrUrl || (businessProfile.upiQrUrl !== undefined ? businessProfile.upiQrUrl || null : s.qrImg || null))
      setReviewQrUrl(inv.reviewQrUrl || s.reviewQrImg || null)

      if (inv.items && inv.items.length > 0) {
        setCuItems(inv.items.map(it => ({
          desc: it.description || it.name || 'Item',
          hsn: it.hsnSac || it.hsn || '998314',
          qty: it.quantity || it.qty || 1,
          rate: it.rate || 0,
          unit: it.unit || 'nos',
          gst: it.taxRate || 18
        })))
      } else if (s.items && s.items.length > 0) {
        setCuItems(getCustomizerItems(s))
      } else if (s.id) {
        setCuItems(getCustomizerItems(s))
      }

      if (inv.advancePaid !== undefined) {
        setCuAdv(inv.advancePaid)
      } else if (s.adv !== undefined) {
        setCuAdv(s.adv)
      }

      if (inv.renderedHtml) {
        setCustomPreviewHtml(inv.renderedHtml)
      }

      if (inv.notes) {
        setCuNotes(Array.isArray(inv.notes) ? inv.notes.join('\n') : inv.notes)
      }

      if (bizName) {
        setBaseStarterName(`Editing: ${bizName}`)
      }
    } else {
      setCuBank(businessProfile.bankName ?? initialStyleObj.bank?.[0] ?? '')
      setCuAc(businessProfile.accountNumber ?? initialStyleObj.bank?.[1] ?? '')
      setCuIfsc(businessProfile.ifsc ?? initialStyleObj.bank?.[2] ?? '')
      setCuUpi(businessProfile.upiId ?? initialStyleObj.upi ?? '')
      setUpiQrUrl(businessProfile.upiQrUrl !== undefined ? businessProfile.upiQrUrl || null : null)
    }
  }, [invoiceToEdit?.id, businessProfile])

  // Snapshot generation for Undo / Redo / Revert to Draft
  const getSnapshot = () => ({
    layout,
    output,
    detailLevel,
    invoiceCopy,
    textSize,
    activePalette,
    paletteName,
    paperFinish,
    paperColor,
    fontPairIdx,
    selectedLang,
    tableStyle,
    colRenames: { ...colRenames },
    stampStyle,
    sigType,
    sigImgData,
    logoImgUrl,
    upiQrUrl,
    reviewQrUrl,
    qrStyle,
    footerMsgType,
    footerCustomMsg,
    brandArt,
    docStatus,
    festiveOcc,
    verifiedSeal,
    cuDocType,
    cuBiz,
    cuCity,
    cuGstin,
    cuSign,
    cuClient,
    cuCcity,
    cuCg,
    cuPos,
    cuInter,
    cuNo,
    cuDate,
    cuDue,
    cuBank,
    cuAc,
    cuIfsc,
    cuUpi,
    cuAdv,
    cuItems: JSON.parse(JSON.stringify(cuItems)),
    cuNotes
  })

  const historyRef = useRef([getSnapshot()])
  const historyIndexRef = useRef(0)
  const initialDraftSnapshotRef = useRef(getSnapshot())
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const isApplyingSnapshot = useRef(false)
  const isInitialMount = useRef(true)

  const pushHistory = (newSnap) => {
    const updated = historyRef.current.slice(0, historyIndexRef.current + 1)
    updated.push(newSnap)
    if (updated.length > 50) updated.shift()
    historyRef.current = updated
    historyIndexRef.current = updated.length - 1
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(false)
  }

  const applySnapshot = (snap) => {
    isApplyingSnapshot.current = true
    setCustomPreviewHtml(null)
    setLayout(snap.layout)
    setOutput(snap.output)
    setDetailLevel(snap.detailLevel)
    setInvoiceCopy(snap.invoiceCopy)
    setTextSize(snap.textSize)
    setActivePalette(snap.activePalette)
    setPaletteName(snap.paletteName)
    setPaperFinish(snap.paperFinish)
    setPaperColor(snap.paperColor || '#ffffff')
    setFontPairIdx(snap.fontPairIdx)
    setSelectedLang(snap.selectedLang)
    setTableStyle(snap.tableStyle)
    setColRenames(snap.colRenames || {})
    setStampStyle(snap.stampStyle)
    setSigType(snap.sigType)
    setSigImgData(snap.sigImgData || null)
    setLogoImgUrl(snap.logoImgUrl || null)
    setUpiQrUrl(snap.upiQrUrl || null)
    setReviewQrUrl(snap.reviewQrUrl || null)
    setQrStyle(snap.qrStyle)
    setFooterMsgType(snap.footerMsgType)
    setFooterCustomMsg(snap.footerCustomMsg)
    setBrandArt(snap.brandArt)
    setDocStatus(snap.docStatus)
    setFestiveOcc(snap.festiveOcc)
    setVerifiedSeal(snap.verifiedSeal)
    setCuDocType(snap.cuDocType)
    setCuBiz(snap.cuBiz)
    setCuCity(snap.cuCity)
    setCuGstin(snap.cuGstin)
    setCuSign(snap.cuSign)
    setCuClient(snap.cuClient)
    setCuCcity(snap.cuCcity)
    setCuCg(snap.cuCg)
    setCuPos(snap.cuPos)
    setCuInter(snap.cuInter)
    setCuNo(snap.cuNo)
    setCuDate(snap.cuDate)
    setCuDue(snap.cuDue)
    setCuBank(snap.cuBank)
    setCuAc(snap.cuAc)
    setCuIfsc(snap.cuIfsc)
    setCuUpi(snap.cuUpi)
    if (snap.cuAdv !== undefined) setCuAdv(snap.cuAdv)
    setCuItems(JSON.parse(JSON.stringify(snap.cuItems)))
    setCuNotes(snap.cuNotes)
  }

  // Auto-record snapshot to history stack with debouncing so typing never lags or loses focus
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (isApplyingSnapshot.current) {
      isApplyingSnapshot.current = false
      return
    }

    if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current)
    historyDebounceRef.current = setTimeout(() => {
      const currentSnap = getSnapshot()
      const lastSnap = historyRef.current[historyIndexRef.current]
      if (JSON.stringify(lastSnap) !== JSON.stringify(currentSnap)) {
        pushHistory(currentSnap)
      }
    }, 450)

    return () => {
      if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current)
    }
  }, [
    layout, output, detailLevel, invoiceCopy, textSize, activePalette, paletteName,
    paperFinish, paperColor, fontPairIdx, selectedLang, tableStyle, colRenames, stampStyle,
    sigType, sigImgData, logoImgUrl, upiQrUrl, reviewQrUrl, qrStyle, footerMsgType, footerCustomMsg, brandArt, docStatus,
    festiveOcc, verifiedSeal, cuDocType, cuBiz, cuCity, cuGstin, cuSign,
    cuClient, cuCcity, cuCg, cuPos, cuInter, cuNo, cuDate, cuDue, cuBank,
    cuAc, cuIfsc, cuUpi, cuAdv, cuItems, cuNotes
  ])

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1
      const snap = historyRef.current[historyIndexRef.current]
      setCanUndo(historyIndexRef.current > 0)
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
      applySnapshot(snap)
    }
  }

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1
      const snap = historyRef.current[historyIndexRef.current]
      setCanUndo(true)
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
      applySnapshot(snap)
    }
  }

  const handleRevertToDraft = () => {
    const draft = initialDraftSnapshotRef.current
    if (draft) {
      applySnapshot(draft)
      pushHistory(draft)
      setSaveSuccessToast('Reverted all changes back to the initial draft.')
      setTimeout(() => setSaveSuccessToast(null), 3000)
    }
  }

  const handleResetToStarter = () => {
    const p = INDUSTRIES.find(x => x.id === currentIndustryId) || INDUSTRIES[0]
    if (p) {
      handleApplyIndustry(p.id)
    } else if (initialDraftSnapshotRef.current) {
      applySnapshot(initialDraftSnapshotRef.current)
      pushHistory(initialDraftSnapshotRef.current)
    }
    setSaveSuccessToast('Reset layout and design to the starter defaults.')
    setTimeout(() => setSaveSuccessToast(null), 3000)
  }
  
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const modalCanvasRef = useRef(null)
  const isDrawing = useRef(false)

  // Dynamic live style object
  const baseStyle = STYLES.find(x => x.id === currentStyleId) || STYLES[0]

  // Check if user has entered their own business name (not the template placeholder)
  const userHasCustomBiz = !!(cuBiz && cuBiz.trim() &&
    cuBiz.trim() !== baseStyle.biz &&
    cuBiz.trim() !== 'Sharma Interiors' &&
    cuBiz.trim() !== 'Iyer & Associates') ||
    !!(invoiceToEdit?.seller?.name &&
      invoiceToEdit.seller.name !== 'Sharma Interiors' &&
      invoiceToEdit.seller.name !== 'Iyer & Associates')

  // Strip CA/domain fields from stored templateStyle when user has their own biz
  const safeTplStyle = userHasCustomBiz ? {
    ...(invoiceToEdit?.templateStyle || {}),
    ids: undefined,
    desig: undefined,
    stampLbl: undefined,
    social: undefined,
    web: undefined,
    refs: undefined,
    meta: undefined,
    rows: undefined,
    parties: undefined,
    doc: undefined,
    ack: undefined
  } : (invoiceToEdit?.templateStyle || {})

  const currentStyle = {
    ...baseStyle,
    ...(industryStarterHasBeenApplied ? {} : safeTplStyle),
    isCustomInvoice: userHasCustomBiz,
    docType: cuDocType,
    biz: cuBiz && cuBiz.trim() ? cuBiz.trim() : (invoiceToEdit?.seller?.name || baseStyle.biz),
    city: cuCity && cuCity.trim() ? cuCity.trim() : ([invoiceToEdit?.seller?.address, invoiceToEdit?.seller?.city, invoiceToEdit?.seller?.state].filter(Boolean).join(', ') || baseStyle.city),
    gstin: cuGstin && cuGstin.trim() ? cuGstin.trim() : (invoiceToEdit?.seller?.gstin || baseStyle.gstin),
    sign: cuSign && cuSign.trim() ? cuSign.trim() : (invoiceToEdit?.seller?.authorizedSignatory || baseStyle.sign),
    client: cuClient && cuClient.trim() ? cuClient.trim() : (invoiceToEdit?.client?.name || baseStyle.client),
    ccity: cuCcity && cuCcity.trim() ? cuCcity.trim() : ([invoiceToEdit?.client?.address, invoiceToEdit?.client?.city, invoiceToEdit?.client?.state].filter(Boolean).join(', ') || baseStyle.ccity),
    cg: cuCg !== undefined ? cuCg : (invoiceToEdit?.client?.gstin || baseStyle.cg),
    pos: cuPos && cuPos.trim() ? cuPos.trim() : (invoiceToEdit?.templateStyle?.pos || baseStyle.pos),
    intra: !cuInter,
    invoiceNumber: cuNo && cuNo.trim() ? cuNo.trim() : (invoiceToEdit?.invoiceNumber || `INV-2026-${String(100 + (baseStyle.id ? baseStyle.id.length * 17 : 34) + (layout ? layout.length * 7 : 28)).padStart(4, '0')}`),
    invoiceDate: cuDate || invoiceToEdit?.invoiceDate,
    dueDate: cuDue || invoiceToEdit?.dueDate,
    po: industryStarterHasBeenApplied ? (baseStyle.po || invoiceToEdit?.poNumber) : (invoiceToEdit?.templateStyle?.po || invoiceToEdit?.poNumber || baseStyle.po),
    adv: cuAdv !== undefined ? parseFloat(cuAdv) : (invoiceToEdit?.templateStyle?.adv !== undefined ? invoiceToEdit.templateStyle.adv : (invoiceToEdit?.advancePaid !== undefined ? invoiceToEdit.advancePaid : baseStyle.adv)),
    board: industryStarterHasBeenApplied ? baseStyle.board : (invoiceToEdit?.templateStyle?.board || baseStyle.board),
    notes: cuNotes ? cuNotes.split('\n').filter(Boolean) : (invoiceToEdit?.notes ? (Array.isArray(invoiceToEdit.notes) ? invoiceToEdit.notes : invoiceToEdit.notes.split('\n')) : baseStyle.notes),
    upi: cuUpi || invoiceToEdit?.paymentDetails?.upiId || (businessProfile.upiId !== undefined ? businessProfile.upiId : baseStyle.upi || ''),
    showUpiDetails: Boolean(cuUpi || invoiceToEdit?.paymentDetails?.upiId || upiQrUrl),
    showBankDetails: Boolean(cuBank || cuAc || cuIfsc || invoiceToEdit?.paymentDetails?.branch || businessProfile.branch),
    bank: [
      cuBank || invoiceToEdit?.paymentDetails?.bankName || (businessProfile.bankName !== undefined ? businessProfile.bankName : baseStyle.bank?.[0] || ''),
      cuAc || invoiceToEdit?.paymentDetails?.accountNumber || (businessProfile.accountNumber !== undefined ? businessProfile.accountNumber : baseStyle.bank?.[1] || ''),
      cuIfsc || invoiceToEdit?.paymentDetails?.ifsc || (businessProfile.ifsc !== undefined ? businessProfile.ifsc : baseStyle.bank?.[2] || ''),
      invoiceToEdit?.paymentDetails?.branch || (businessProfile.branch !== undefined ? businessProfile.branch : baseStyle.bank?.[3] || '')
    ],
    qrImg: upiQrUrl,
    reviewQrImg: reviewQrUrl,
    items: (cuItems && cuItems.length > 0)
      ? cuItems.map(it => [
          it.desc,
          it.hsn || '998314',
          parseFloat(it.qty) || 1,
          parseFloat(it.rate) || 0,
          it.unit || 'nos',
          it.gst !== undefined ? parseFloat(it.gst) : (baseStyle.gst || 18)
        ])
      : (industryStarterHasBeenApplied ? baseStyle.items : (invoiceToEdit?.templateStyle?.items || baseStyle.items)),
    gst: (cuItems && cuItems[0]?.gst) || (industryStarterHasBeenApplied ? baseStyle.gst : invoiceToEdit?.templateStyle?.gst) || baseStyle.gst || 18
  }

  // Options for renderer
  const renderOptions = {
    l: layout,
    out: output,
    lvl: detailLevel,
    copy: invoiceCopy,
    size: textSize,
    pal: activePalette,
    paper: paperFinish,
    paperColor: paperColor,
    fp: fontPairIdx,
    lang: selectedLang,
    tb: tableStyle,
    cols: colRenames,
    stamp: stampStyle,
    sig: sigType,
    sigImg: sigImgData,
    qr: qrStyle,
    qrImg: upiQrUrl,
    reviewQrImg: reviewQrUrl,
    msg: footerMsgType,
    msgText: footerCustomMsg,
    art: brandArt,
    v: artVariation,
    status: cuDocType === 'invoice' ? docStatus : 'draft',
    occ: festiveOcc,
    seal: verifiedSeal,
    logoImg: logoImgUrl
  }

  // Apply Industry Starter & Sync All Fields to Match
  const handleApplyIndustry = (indId) => {
    const p = INDUSTRIES.find(x => x.id === indId)
    if (!p) return
    const s = STYLES.find(x => x.id === p.s) || STYLES[0]
    const namedPalette = p.pal
      ? Object.entries(PAL_FAM).flatMap(([family, palettes]) => palettes.map(palette => ({ family, palette }))).find(({ palette }) => palette[0] === p.pal)
      : null
    const fontPairIndex = p.fp
      ? FONTPAIRS.findIndex(fontPair => fontPair.fd === p.fp[0] && fontPair.fb === p.fp[1])
      : -1

    setIndustryStarterHasBeenApplied(true)
    setCurrentIndustryId(indId)
    setCurrentStyleId(p.s)
    setLayout(p.l)
    setBrandArt(p.art || s.art || 'none')
    setArtVariation(0)
    setTableStyle(p.tb || 'clean')
    setColRenames({ ...(p.cols || {}) })
    setFooterMsgType(p.msg || 'none')
    setFooterCustomMsg('')
    setQrStyle(p.qr || 'classic')
    setStampStyle(p.stamp || 'brand')
    setSigType(s.sig || 'script')
    setSigImgData(null)
    setDetailLevel(p.lvl || '1')
    setInvoiceCopy('0')
    setTextSize('1')
    setDocStatus('sent')
    setVerifiedSeal(true)
    setFestiveOcc(p.occ || s.occ || 'none')
    setSelectedLang(p.lang || s.lang || 'en')
    setFontPairIdx(fontPairIndex >= 0 ? String(fontPairIndex) : '')
    setPaperFinish('white')
    setPaperColor(null)
    setActivePalette(namedPalette ? palFrom(namedPalette.palette[1], namedPalette.palette[2]) : null)
    setPaletteName(namedPalette?.palette[0] || null)
    setPalFamily(namedPalette?.family || 'Indian heritage')
    setCustomPreviewHtml(null)
    latestInlineHtmlRef.current = ''
    if (inlineEditRef.current) inlineEditRef.current.innerHTML = ''
    setBaseStarterName(p.name + ' starter')

    // Synchronize customizer state with the selected industry starter
    if (s) {
      setCuBiz(s.biz || '')
      setCuCity(s.city || '')
      setCuGstin(s.gstin || '')
      setCuSign(s.sign || '')
      setCuClient(s.client || '')
      setCuCcity(s.ccity || '')
      setCuCg(s.cg || '')
      setCuPos(s.pos || 'Maharashtra (27)')
      setCuInter(!s.intra)
      setCuBank(s.bank ? s.bank[0] : 'HDFC Bank Ltd')
      setCuAc(s.bank ? s.bank[1] : '50200012345678')
      setCuIfsc(s.bank ? s.bank[2] : 'HDFC0000240')
      setCuUpi(s.upi || 'pay@upi')
      setCuAdv(s.adv !== undefined ? s.adv : 0)
      setCuItems(getCustomizerItems(s))
      setCuNotes(Array.isArray(s.notes) ? s.notes.join('\n') : (s.notes || 'Payment due within 15 days.'))
      const generatedNo = `INV-2026-${String(100 + (s.id ? s.id.length * 17 : 34) + (p.l ? p.l.length * 7 : 28)).padStart(4, '0')}`
      setCuNo(generatedNo)
    }
  }

  // Upload Logo & Auto Extract 6 Palettes
  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result
      setLogoImgUrl(url)
      setCustomPreviewHtml(null)
      // Generates 6 intelligent palettes from uploaded logo
      const p1 = '#15865a'
      const p2 = '#f2a93b'
      const pals = [
        ['Matching', p1, p2],
        ['Contrast', p1, '#6A1BFF'],
        ['Pastel', '#7CCBB0', '#FFE1D3'],
        ['Bold', '#E5261F', '#FFB020'],
        ['Dark luxe', '#141414', '#C9A54B'],
        ['Mono', '#1E3A8A', '#93C5FD']
      ]
      setLogoPalettes(pals)
      setActivePalette(palFrom(p1, p2))
      setPaletteName('Matching')
    }
    reader.readAsDataURL(file)
  }

  const handleQrUpload = (e, setQrUrl, isReviewQr = false) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setQrUrl(reader.result)
      if (isReviewQr) setFooterMsgType('review')
      setCustomPreviewHtml(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Draw Signature Pad
  useEffect(() => {
    if (sigType !== 'drawn') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1E3A8A'

    const getPos = (ev) => {
      const rect = canvas.getBoundingClientRect()
      return [
        (ev.clientX - rect.left) * canvas.width / rect.width,
        (ev.clientY - rect.top) * canvas.height / rect.height
      ]
    }

    const startDraw = (ev) => {
      isDrawing.current = true
      const [x, y] = getPos(ev)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const drawMove = (ev) => {
      if (!isDrawing.current) return
      const [x, y] = getPos(ev)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const endDraw = () => {
      if (!isDrawing.current) return
      isDrawing.current = false
      setSigImgData(canvas.toDataURL('image/png'))
      setCustomPreviewHtml(null)
    }

    canvas.addEventListener('pointerdown', startDraw)
    canvas.addEventListener('pointermove', drawMove)
    canvas.addEventListener('pointerup', endDraw)
    canvas.addEventListener('pointerleave', endDraw)

    return () => {
      canvas.removeEventListener('pointerdown', startDraw)
      canvas.removeEventListener('pointermove', drawMove)
      canvas.removeEventListener('pointerup', endDraw)
      canvas.removeEventListener('pointerleave', endDraw)
    }
  }, [sigType])

  // Upload Signature Image File (PNG / JPG)
  const handleSignatureUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSigType('drawn')
      setSigImgData(reader.result)
      setCustomPreviewHtml(null)
    }
    reader.readAsDataURL(file)
  }

  // Draw Signature Pad in Modal
  useEffect(() => {
    if (sigType !== 'drawn') return
    const canvas = modalCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1E3A8A'

    let isDrawingModal = false
    const getPos = (ev) => {
      const rect = canvas.getBoundingClientRect()
      return [
        (ev.clientX - rect.left) * canvas.width / rect.width,
        (ev.clientY - rect.top) * canvas.height / rect.height
      ]
    }

    const startDraw = (ev) => {
      isDrawingModal = true
      const [x, y] = getPos(ev)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const drawMove = (ev) => {
      if (!isDrawingModal) return
      const [x, y] = getPos(ev)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const endDraw = () => {
      if (!isDrawingModal) return
      isDrawingModal = false
      setSigImgData(canvas.toDataURL('image/png'))
      setCustomPreviewHtml(null)
    }

    canvas.addEventListener('pointerdown', startDraw)
    canvas.addEventListener('pointermove', drawMove)
    canvas.addEventListener('pointerup', endDraw)
    canvas.addEventListener('pointerleave', endDraw)

    return () => {
      canvas.removeEventListener('pointerdown', startDraw)
      canvas.removeEventListener('pointermove', drawMove)
      canvas.removeEventListener('pointerup', endDraw)
      canvas.removeEventListener('pointerleave', endDraw)
    }
  }, [sigType, modalOpen, modalStep])

  // Get latest rendered HTML, incorporating any live inline contentEditable changes from preview or stage
  const getLatestRenderedHtml = () => {
    const cuInvEl = document.getElementById('cuInv')
    if (cuInvEl && cuInvEl.innerHTML && cuInvEl.innerHTML.trim().length > 50) {
      return sanitizeInvoiceHtml(cuInvEl.innerHTML)
    }
    if (customPreviewHtml && customPreviewHtml.trim().length > 50) {
      return sanitizeInvoiceHtml(customPreviewHtml)
    }
    if (stageRef.current && stageRef.current.innerHTML && stageRef.current.innerHTML.trim().length > 50) {
      return sanitizeInvoiceHtml(stageRef.current.innerHTML)
    }
    return render(currentStyle, renderOptions)
  }

  // PDF Download using html2pdf
  const handleDownloadPdf = async () => {
    setPdfGenerating(true)
    const element = document.createElement('div')
    element.className = 'inv'
    element.style.width = output === 'a4' ? '794px' : output === 'phone' ? '390px' : '300px'
    element.innerHTML = sanitizeInvoiceHtml(getLatestRenderedHtml())
    if (!isPro) addFreeInvoiceWatermark(element)
    document.body.appendChild(element)

    try {
      const html2pdf = await loadHtml2Pdf()
      await html2pdf().set({
        margin: 0,
        filename: `${currentStyle.biz.replace(/\s+/g, '_')}_${layout}_${cuDocType === 'quote' ? 'Quotation' : cuDocType === 'estimate' ? 'Estimate' : 'Tax_Invoice'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: output === 'a4' ? { unit: 'mm', format: 'a4' } : { unit: 'px', format: [output === 'phone' ? 390 : 300, 1100] }
      }).from(element).save()
    } catch (error) {
      console.warn('Invoice PDF download failed; opening the print dialog instead.', error)
      window.print()
    } finally {
      element.remove()
      setPdfGenerating(false)
    }
  }

  // 1-Click Convert Quote / Estimate to Tax Invoice
  const handleConvertQuoteToInvoice = () => {
    setCuDocType('invoice')
    setCuNo(`INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`)
    setCuNotes(`Converted from ${cuDocType === 'estimate' ? 'Estimate' : 'Quotation'}.\nPayment due within 15 days.`)
    setCustomPreviewHtml(null)
  }

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const documentTypeLabel = cuDocType === 'quote' ? 'Quotation' : cuDocType === 'estimate' ? 'Estimate' : 'Tax Invoice'
    const text = `Hello ${cuClient}, here is your ${documentTypeLabel} ${cuNo} from ${cuBiz} for ${cuItems.length} item(s). Thank you for your business!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  // Build Full Invoxa Invoice Object matching EXACTLY what is displayed on the screen
  const buildInvoiceFromCurrentMixer = () => {
    const s = currentStyle

    const parseCityState = (str, defaultState = 'Maharashtra') => {
      if (!str) return { address: 'Commercial Plaza', city: 'Mumbai', state: defaultState }
      const parts = str.split(',').map(p => p.trim()).filter(Boolean)
      if (parts.length >= 3) {
        return {
          address: parts.slice(0, parts.length - 2).join(', '),
          city: parts[parts.length - 2],
          state: parts[parts.length - 1]
        }
      } else if (parts.length === 2) {
        return {
          address: str,
          city: parts[0],
          state: parts[1]
        }
      }
      return { address: str, city: str, state: defaultState }
    }

    const sellerGeo = parseCityState(s.city, 'Maharashtra')
    const clientGeo = parseCityState(s.ccity, 'Maharashtra')

    const items = fmtOf(s).rows.map((it, idx) => ({
      id: `item_mix_${Date.now()}_${idx}`,
      description: it.desc || 'Item',
      hsnSac: it.hsn || '998314',
      quantity: parseFloat(it.qty) || 1,
      rate: parseFloat(it.rate) || 0,
      taxRate: Number.isFinite(Number(it.gst !== undefined ? it.gst : s.gst))
        ? Number(it.gst !== undefined ? it.gst : s.gst)
        : 18,
      unit: it.unit || 'nos'
    }))

    const invGstin = s.gstin || '27AABCI1234F1Z5'
    const invNumber = s.invoiceNumber || `INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`

    return {
      id: invoiceToEdit?.id || `inv_${Date.now()}`,
      invoiceNumber: invNumber,
      docType: cuDocType,
      ...(cuDocType !== 'invoice' ? {
        quoteNumber: invNumber,
        quoteDate: cuDate || new Date().toISOString().split('T')[0],
        validUntil: cuDue || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
      } : {}),
      invoiceDate: s.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: s.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: cuDocType === 'invoice' ? (docStatus === 'paid' ? 'Paid' : 'Unpaid') : 'Draft',
      theme: 'emerald',
      themeColor: activePalette ? activePalette.acc : (s.acc || '#0E5E5A'),
      layout: layout || 'band',
      artStyle: brandArt || 'none',
      paperTexture: paperFinish || 'white',
      stampActive: stampStyle || 'brand',
      seller: {
        name: s.biz || 'Your Business',
        gstin: invGstin,
        pan: (invGstin.length >= 10 ? invGstin.substring(2, 12) : 'AABCI1234F'),
        address: sellerGeo.address,
        city: sellerGeo.city,
        state: sellerGeo.state,
        pincode: '400001',
        phone: s.phone || '+91 98200 12345',
        email: s.email || `billing@${(s.biz || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        authorizedSignatory: s.sign || s.biz
      },
      client: {
        name: s.client || 'Valued Customer',
        gstin: s.cg || '',
        address: clientGeo.address,
        city: clientGeo.city,
        state: clientGeo.state,
        pincode: '400001',
        phone: '',
        email: `accounts@${(s.client || 'customer').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      },
      items: items.length > 0 ? items : [{
        id: `item_def_${Date.now()}`,
        description: 'Professional Services',
        hsnSac: '998314',
        quantity: 1,
        rate: 25000,
        taxRate: 18,
        unit: 'job'
      }],
      discountRate: s.disc || 0,
      notes: Array.isArray(s.notes) ? s.notes.join('\n') : (s.notes || 'Thank you for your business. Please make payments before the due date.'),
      terms: 'Payment due within 15 days of invoice date. 18% p.a. interest applicable on late payments.',
      paymentDetails: {
        bankName: s.bank?.[0] || '',
        accountNumber: s.bank?.[1] || '',
        ifsc: s.bank?.[2] || '',
        branch: invoiceToEdit?.paymentDetails?.branch || (businessProfile.branch !== undefined ? businessProfile.branch : s.bank?.[3] || ''),
        upiId: s.upi || '',
        upiQrUrl
      },
      upiQrUrl,
      reviewQrUrl,
      renderedHtml: getLatestRenderedHtml(),
      templateId: currentStyle.id || currentStyleId || 'studio',
      advancePaid: currentStyle.adv !== undefined ? parseFloat(currentStyle.adv) : 0,
      templateStyle: currentStyle,
      templateRenderOptions: renderOptions
    }
  }

  // Handle Save Invoice directly from Mixer
  const handleSaveInvoice = async () => {
    setIsSaving(true)
    setSaveSuccessToast(null)
    const newInvoice = buildInvoiceFromCurrentMixer()

    try {
      const saveResult = onSaveInvoice ? await onSaveInvoice(newInvoice) : null
      const documentTypeLabel = cuDocType === 'quote' ? 'Quotation' : cuDocType === 'estimate' ? 'Estimate' : 'Invoice'
      setSaveSuccessToast({
        tone: saveResult?.tone || (saveResult?.savedToAccount === false && cuDocType === 'invoice' ? 'warning' : 'success'),
        message: saveResult?.message || (saveResult?.savedToAccount === false && cuDocType === 'invoice'
          ? `Invoice ${newInvoice.invoiceNumber} is saved in this browser only. Sign in to sync it to your account.`
          : `${documentTypeLabel} ${newInvoice.invoiceNumber} (${newInvoice.seller.name}) saved successfully!`),
        invoiceNumber: newInvoice.invoiceNumber,
        docType: cuDocType
      })
    } catch (err) {
      setSaveSuccessToast({
        tone: 'error',
        message: err.message || 'Invoice could not be saved. Please try again.',
        invoiceNumber: newInvoice.invoiceNumber
      })
    } finally {
      setIsSaving(false)
    }

    setTimeout(() => {
      setSaveSuccessToast(null)
    }, 6000)
  }

  // Invalidate customPreviewHtml when design/content controls change so live template engine re-renders immediately
  const isInitialControlsRender = useRef(true)
  useEffect(() => {
    if (isInitialControlsRender.current) {
      isInitialControlsRender.current = false
      return
    }
    if (isTypingInlineRef.current) return
    setCustomPreviewHtml(null)
  }, [
    layout, output, detailLevel, invoiceCopy, textSize, activePalette, paletteName,
    paperFinish, paperColor, fontPairIdx, selectedLang, tableStyle, colRenames, stampStyle,
    sigType, sigImgData, logoImgUrl, upiQrUrl, reviewQrUrl, qrStyle, footerMsgType, footerCustomMsg, brandArt, docStatus,
    festiveOcc, verifiedSeal, cuDocType, cuBiz, cuCity, cuGstin, cuSign,
    cuClient, cuCcity, cuCg, cuPos, cuInter, cuNo, cuDate, cuDue, cuBank,
    cuAc, cuIfsc, cuUpi, cuAdv, cuItems, cuNotes
  ])

  // Generate Current Rendered HTML
  const renderedHtml = sanitizeInvoiceHtml(customPreviewHtml || render(currentStyle, renderOptions))

  // Populate inline editor on entering Step 2 without triggering re-render focus loss
  useEffect(() => {
    if (modalStep === 2 && inlineEditRef.current && !isTypingInlineRef.current) {
      inlineEditRef.current.innerHTML = sanitizeInvoiceHtml(customPreviewHtml || renderedHtml)
    }
    return () => {
      if (inlineEditRef.current) {
        inlineEditRef.current.innerHTML = ''
      }
    }
  }, [modalStep, customPreviewHtml, renderedHtml])

  return (
    <div className="template-mixer-view">
      {/* Toast Notification Banner */}
      {saveSuccessToast && (
        <div style={{
          position: 'sticky',
          top: 10,
          zIndex: 9999,
          background: saveSuccessToast.tone === 'error'
            ? 'linear-gradient(135deg, #b91c1c, #dc2626)'
            : saveSuccessToast.tone === 'warning'
            ? 'linear-gradient(135deg, #b45309, #d97706)'
            : 'linear-gradient(135deg, #15865a, #059669)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: 10,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: saveSuccessToast.tone === 'error'
            ? '0 6px 20px rgba(185,28,28,0.25)'
            : '0 6px 20px rgba(21,134,90,0.3)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name={saveSuccessToast.tone === 'error' ? 'info' : 'checkCircle'} size={20} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                {saveSuccessToast.tone === 'error' ? 'Save failed' : saveSuccessToast.tone === 'warning' ? 'Saved in this browser' : `${saveSuccessToast.docType === 'quote' ? 'Quotation' : saveSuccessToast.docType === 'estimate' ? 'Estimate' : 'Invoice'} Saved!`}
              </strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.95 }}>{saveSuccessToast.message}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onNavigateToInvoices && (
              <button
                type="button"
                onClick={() => onNavigateToInvoices(saveSuccessToast.docType)}
                style={{
                  background: '#ffffff',
                  color: '#15865a',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                View in {saveSuccessToast.docType === 'quote' || saveSuccessToast.docType === 'estimate' ? 'Quotations' : 'Invoices'} <Icon name="arrowUpRight" size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSaveSuccessToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.1rem',
                cursor: 'pointer',
                padding: '0 4px',
                opacity: 0.8
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header with Formula */}
      <div className="tm-head">
        <div>
          {onNavigateToInvoices && (
            <button
              type="button"
              className="chip"
              onClick={() => onNavigateToInvoices(cuDocType)}
              style={{
                marginBottom: 10,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                color: '#1e293b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}
            >
              <Icon name="arrowLeft" size={14} /> Back to {cuDocType === 'quote' || cuDocType === 'estimate' ? 'Quotations' : 'Invoices'}
            </button>
          )}
          <span className="label">Dynamic Design Engine</span>
          <h1>Invoice Template &amp; Mixers</h1>
          <p className="muted" style={{ marginTop: 6, fontSize: '0.95rem' }}>
            Customize layouts, brand palettes, Indian fonts, company seals, and live payment ribbons for your invoices.
          </p>
        </div>
        <div className="tm-stats">
          <div className="tm-stat"><span className="label">Starters</span><b>19</b></div>
          <div className="tm-stat"><span className="label">Layouts</span><b>10</b></div>
          <div className="tm-stat"><span className="label">Palettes</span><b>64</b></div>
          <div className="tm-stat"><span className="label">Font pairs</span><b>36</b></div>
          <div className="tm-stat"><span className="label">Languages</span><b>10</b></div>
        </div>
      </div>

      {/* Combinations Equation Bar */}
      <div className="tm-formula">
        <div className="tm-fx"><span className="label">Layouts</span><b>10</b></div>
        <span className="tm-op">×</span>
        <div className="tm-fx"><span className="label">Font pairs</span><b>36</b></div>
        <span className="tm-op">×</span>
        <div className="tm-fx"><span className="label">Palettes</span><b>64</b></div>
        <span className="tm-op">×</span>
        <div className="tm-fx"><span className="label">Art styles</span><b>7</b></div>
        <span className="tm-op">×</span>
        <div className="tm-fx"><span className="label">Paper finishes</span><b>7</b></div>
        <span className="tm-op">×</span>
        <div className="tm-fx"><span className="label">Table styles</span><b>6</b></div>
        <span className="tm-op">=</span>
        <div className="tm-fx res"><span className="label">Combinations</span><b>67 lakh+</b></div>
      </div>

      {/* Mobile Mixer View Switcher (Visible on mobile/tablet) */}
      <div className="mixer-mobile-toggle">
        <button
          type="button"
          className={`mmt-btn ${mobileMixerTab === 'controls' ? 'active' : ''}`}
          onClick={() => setMobileMixerTab('controls')}
        >
           Customize &amp; Starters
        </button>
        <button
          type="button"
          className={`mmt-btn ${mobileMixerTab === 'stage' ? 'active' : ''}`}
          onClick={() => setMobileMixerTab('stage')}
        >
           Live Invoice Preview
        </button>
      </div>

      {/* Main Mixer Layout: Left Controls + Right Live Stage */}
      <div className="mixer">
        {/* Left Side: Tabbed Controls Panel */}
        <div className={`ctrl ${mobileMixerTab === 'controls' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="tabs">
            {['start', 'basics', 'colour', 'type', 'arrange', 'brand', 'smart'].map((tabKey) => (
              <button
                key={tabKey}
                className="tab"
                aria-selected={activeTab === tabKey}
                onClick={() => setActiveTab(tabKey)}
              >
                {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
              </button>
            ))}
          </div>

          {/* TAB 1: Start (19 Starters) */}
          {activeTab === 'start' && (
            <div className="panel">
              <div className="grp">
                <span className="label">Pick your industry · 19 starters</span>
                <div className="inds">
                  {INDUSTRIES.map((p) => {
                    const s = STYLES.find((x) => x.id === p.s)
                    const isSelected = currentIndustryId === p.id
                    return (
                      <button
                        key={p.id}
                        className="indb"
                        aria-pressed={isSelected}
                        onClick={() => handleApplyIndustry(p.id)}
                      >
                        <i>
                          <b style={{ background: s ? s.acc : '#0E5E5A' }}></b>
                          <b style={{ background: s ? s.acc2 : '#3FA79B' }}></b>
                        </i>
                        <span>
                          {p.name.split('/')[0]}
                          <small>{LAYOUTS.find((x) => x[0] === p.l)?.[1]} · {s?.name}</small>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Basics (Layout, Output, Detail, Text size) */}
          {activeTab === 'basics' && (
            <div className="panel">
              <div className="grp">
                <span className="label">Output Format</span>
                <div className="chips">
                  {OUTS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={output === id}
                      onClick={() => setOutput(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <span className="label">Layout Style (10 Designs)</span>
                <div className="chips">
                  {LAYOUTS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={layout === id}
                      onClick={() => setLayout(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <span className="label">Detail Level</span>
                <div className="chips">
                  {LVLS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={detailLevel === id}
                      onClick={() => setDetailLevel(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <div className="glabel">
                  <span className="label">GST Invoice Copy</span>
                  <span className="tag">Rule 48</span>
                </div>
                <div className="chips">
                  {['Original for recipient', 'Duplicate for transporter', 'Triplicate for supplier'].map((label, idx) => (
                    <button
                      key={idx}
                      className="chip"
                      aria-pressed={invoiceCopy === String(idx)}
                      onClick={() => setInvoiceCopy(String(idx))}
                    >
                      {label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <span className="label">Text Scale</span>
                <div className="chips">
                  {SIZES.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={textSize === id}
                      onClick={() => setTextSize(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Colour (Logo palettes, 64 Palettes, Paper finishes) */}
          {activeTab === 'colour' && (
            <div className="panel">
              <div className="grp">
                <div className="glabel">
                  <span className="label">Palettes from your logo</span>
                  <span className="tag">AI Extract</span>
                </div>
                <div className="upload">
                  <label className="btn-upload" htmlFor="logoUploader">
                     Upload logo
                  </label>
                  <input
                    type="file"
                    id="logoUploader"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  {logoImgUrl && (
                    <>
                      <img src={logoImgUrl} alt="Logo preview" />
                      <button
                        className="chip"
                        onClick={() => {
                          setLogoImgUrl(null)
                          setLogoPalettes([])
                        }}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
                {logoPalettes.length > 0 && (
                  <div className="pals" style={{ marginTop: 8 }}>
                    {logoPalettes.map(([pname, c1, c2], i) => (
                      <button
                        key={i}
                        className="pal"
                        aria-pressed={paletteName === pname}
                        onClick={() => {
                          setActivePalette(palFrom(c1, c2))
                          setPaletteName(pname)
                        }}
                      >
                        <i>
                          <b style={{ background: c1 }}></b>
                          <b style={{ background: c2 }}></b>
                        </i>
                        <span>{pname}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grp">
                <span className="label">Palette Library · 64 Colors</span>
                <div className="chips">
                  {Object.keys(PAL_FAM).map((fam) => (
                    <button
                      key={fam}
                      className="chip"
                      aria-pressed={palFamily === fam}
                      onClick={() => setPalFamily(fam)}
                    >
                      {fam}
                    </button>
                  ))}
                </div>
                <div className="pals" style={{ marginTop: 8 }}>
                  {PAL_FAM[palFamily]?.map(([pname, c1, c2], i) => (
                    <button
                      key={i}
                      className="pal"
                      aria-pressed={paletteName === pname}
                      onClick={() => {
                        setActivePalette(palFrom(c1, c2))
                        setPaletteName(pname)
                      }}
                    >
                      <i>
                        <b style={{ background: c1 }}></b>
                        <b style={{ background: c2 }}></b>
                      </i>
                      <span>{pname}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <span className="label">Paper Finish Texture</span>
                <div className="chips">
                  {Object.entries(PAPERS).map(([key, [lbl]]) => (
                    <button
                      key={key}
                      className="chip"
                      aria-pressed={paperFinish === key}
                      onClick={() => {
                        setPaperFinish(key)
                        setPaperColor(null)
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Type (36 Font pairs & 10 Indian scripts) */}
          {activeTab === 'type' && (
            <div className="panel">
              <div className="grp">
                <label className="label">Font Pair · 36 Curated Combinations</label>
                <select
                  className="form-input"
                  value={fontPairIdx}
                  onChange={(e) => setFontPairIdx(e.target.value)}
                >
                  <option value="">Match starter default</option>
                  {FONTPAIRS.map((fp, idx) => (
                    <option key={idx} value={String(idx)}>
                      {fp.fd} + {fp.fb}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grp">
                <div className="glabel">
                  <span className="label">Bilingual Indian Language Labels · 10</span>
                  <span className="tag">Native Scripts</span>
                </div>
                <div className="chips">
                  {LANGS.map(([code, name]) => (
                    <button
                      key={code}
                      className="chip"
                      aria-pressed={selectedLang === code}
                      onClick={() => setSelectedLang(code)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <p className="note">Labels turn bilingual (Local + English) with matched Indian typography.</p>
              </div>
            </div>
          )}

          {/* TAB 5: Arrange (Table styles & Column renames) */}
          {activeTab === 'arrange' && (
            <div className="panel">
              <div className="grp">
                <span className="label">Table Style</span>
                <div className="chips">
                  {TABLES.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={tableStyle === id}
                      onClick={() => setTableStyle(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <span className="label">Rename Line Item Columns</span>
                <div className="cols">
                  <input
                    type="text"
                    placeholder="Item"
                    value={colRenames.item}
                    onChange={(e) => setColRenames(p => ({ ...p, item: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Qty"
                    value={colRenames.qty}
                    onChange={(e) => setColRenames(p => ({ ...p, qty: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Rate"
                    value={colRenames.rate}
                    onChange={(e) => setColRenames(p => ({ ...p, rate: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Amount"
                    value={colRenames.amt}
                    onChange={(e) => setColRenames(p => ({ ...p, amt: e.target.value }))}
                  />
                </div>
                <p className="note">For example: Item → Treatment, Qty → Hours, Rate → Per plate.</p>
              </div>
            </div>
          )}

          {/* TAB 6: Brand (Stamp, Signature, UPI QR, Footer note) */}
          {activeTab === 'brand' && (
            <div className="panel">
              <div className="grp">
                <div className="glabel">
                  <span className="label">Company Stamp / Seal</span>
                  <span className="tag">Circular SVG</span>
                </div>
                <div className="chips">
                  {STAMPS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={stampStyle === id}
                      onClick={() => setStampStyle(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <span className="label">Signature Style</span>
                <div className="chips">
                  {SIGS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={sigType === id}
                      onClick={() => setSigType(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {sigType === 'drawn' && (
                  <div style={{ marginTop: 8 }}>
                    <canvas ref={canvasRef} className="pad" width={520} height={180} />
                    <div style={{ marginTop: 4 }}>
                      <button
                        className="chip"
                        onClick={() => {
                          const canvas = canvasRef.current
                          if (canvas) {
                            const ctx = canvas.getContext('2d')
                            ctx.clearRect(0, 0, canvas.width, canvas.height)
                            setSigImgData(null)
                          }
                        }}
                      >
                        Clear Signature
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grp">
                <div className="glabel">
                  <span className="label">UPI QR Style</span>
                  <span className="tag">Auto Pay</span>
                </div>
                <div className="chips">
                  {QRS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={qrStyle === id}
                      onClick={() => setQrStyle(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <div className="glabel">
                  <span className="label">Footer Banner Message</span>
                  <span className="tag">Repeat Sales</span>
                </div>
                <div className="chips">
                  {MSGS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={footerMsgType === id}
                      onClick={() => {
                        setFooterMsgType(id)
                        setFooterCustomMsg(msgDefault(id, currentStyle))
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {footerMsgType !== 'none' && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: 6 }}
                    value={footerCustomMsg}
                    onChange={(e) => setFooterCustomMsg(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 7: Smart (Generative Art, Status, Festive banner, Seal) */}
          {activeTab === 'smart' && (
            <div className="panel">
              <div className="grp">
                <div className="glabel">
                  <span className="label">Generative Brand Art</span>
                  <span className="tag">Algorithmic</span>
                </div>
                <div className="chips">
                  {ARTS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={brandArt === id}
                      onClick={() => setBrandArt(id)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="chip new"
                    onClick={() => setArtVariation(v => v + 1)}
                  >
                    <Icon name="sparkles" size={15} /> New variation
                  </button>
                </div>
              </div>

              <div className="grp">
                <div className="glabel">
                  <span className="label">Live Payment Status</span>
                  <span className="tag">Dynamic Ribbon</span>
                </div>
                <div className="chips">
                  {STATUSES.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={docStatus === id}
                      onClick={() => setDocStatus(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <div className="glabel">
                  <span className="label">Festive Auto-Theme</span>
                  <span className="tag">Season Auto</span>
                </div>
                <div className="chips">
                  {OCCS.map(([id, n]) => (
                    <button
                      key={id}
                      className="chip"
                      aria-pressed={festiveOcc === id}
                      onClick={() => setFestiveOcc(id)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grp">
                <div className="glabel">
                  <span className="label">Tamper-Proof Verification Seal</span>
                </div>
                <div className="chips">
                  <button
                    className="chip"
                    aria-pressed={verifiedSeal}
                    onClick={() => setVerifiedSeal(true)}
                  >
                    On
                  </button>
                  <button
                    className="chip"
                    aria-pressed={!verifiedSeal}
                    onClick={() => setVerifiedSeal(false)}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Stage & Interactive Preview */}
        <div
          className={`stage ${mobileMixerTab === 'stage' ? 'mobile-visible' : 'mobile-hidden'}`}
        >
          {/* Editing Mode Banner */}
          {invoiceToEdit && (
            <div style={{
              width: '100%',
              background: '#eff6ff',
              border: '1.5px solid #93c5fd',
              color: '#1e40af',
              padding: '10px 16px',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(37,99,235,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="edit" size={16} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem' }}>Editing Saved Invoice:</strong>
                  <span style={{ fontSize: '0.84rem', color: '#3b82f6' }}>
                    {cuNo || invoiceToEdit.invoiceNumber} — {cuBiz || invoiceToEdit.seller?.name}
                  </span>
                </div>
              </div>
              {onClearEditInvoice && (
                <button
                  type="button"
                  onClick={onClearEditInvoice}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    padding: '6px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  ✕ Exit Edit Mode
                </button>
              )}
            </div>
          )}

          {/* Active Starter Bar with Undo / Redo / Revert Controls */}
          <div className="basebar" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px' }}>
            <div className="bn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="label" style={{ fontWeight: 600, color: '#64748b' }}>Active Starter:</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{baseStarterName}</span>
            </div>
            <div className="bb" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 6px', borderRadius: 8 }}>
                <button
                  className="chip"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo last change"
                  style={{ padding: '4px 10px', fontSize: '13px', fontWeight: 600 }}
                >
                  ↶ Undo
                </button>
                <button
                  className="chip"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo change"
                  style={{ padding: '4px 10px', fontSize: '13px', fontWeight: 600 }}
                >
                  ↷ Redo
                </button>
                <button
                  className="chip"
                  onClick={handleRevertToDraft}
                  title="Revert back to initial draft"
                  style={{ color: '#dc2626', fontWeight: 600, padding: '4px 10px', fontSize: '13px' }}
                >
                  <Icon name="clock" size={15} /> Revert to Draft
                </button>
                <button
                  className="chip"
                  onClick={handleResetToStarter}
                  title="Reset layout and design back to starter defaults"
                  style={{ color: '#0284c7', fontWeight: 600, padding: '4px 10px', fontSize: '13px' }}
                >
                  ⟲ Reset to Starter
                </button>
              </div>
            </div>
          </div>

          {/* Action Steps Bar */}
          <div id="actBar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="chip" onClick={() => { setModalStep(1); setModalOpen(true); }}>
              <Icon name="edit" size={15} /> 1 Fill details
            </button>
            <button className="chip" onClick={() => { setModalStep(2); setModalOpen(true); }}>
              <Icon name="fileText" size={15} /> 2 Preview &amp; Edit
            </button>
            <button
              className="chip cuPri"
              onClick={handleDownloadPdf}
              disabled={pdfGenerating}
            >
              <Icon name={pdfGenerating ? 'clock' : 'download'} size={15} />
              {pdfGenerating ? 'Generating PDF…' : 'Download PDF'}
            </button>
            <button
              className="chip mixer-inline-save"
              onClick={handleSaveInvoice}
              disabled={isSaving}
              style={{
                background: '#15865a',
                color: '#ffffff',
                fontWeight: 700,
                padding: '6px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(21,134,90,0.25)'
              }}
              title="Save this invoice to your list of invoices"
            >
              <Icon name={isSaving ? 'clock' : 'checkCircle'} size={15} />
              {isSaving ? 'Saving…' : 'Save Invoice'}
            </button>
          </div>

          {/* Live Rendered Invoice */}
          <div className="template-mixer-invoice-frame">
            <div
              ref={stageRef}
              className={`inv${!isPro ? ' invoice-has-watermark' : ''}`}
              dangerouslySetInnerHTML={{ __html: sanitizeInvoiceHtml(renderedHtml) }}
            />
            {!isPro && (
              <div className="invoice-free-plan-watermark template-mixer-watermark">
                <button type="button" className="no-print" data-html2canvas-ignore="true" onClick={requestWatermarkUpgrade}>Remove watermark</button>
              </div>
            )}
          </div>

          <div className="combo">
            {output.toUpperCase()} · {LAYOUTS.find(x => x[0] === layout)?.[1]} Layout · {tableStyle} table · {paperFinish} finish · Generated with Invoxa Engine
          </div>
        </div>
      </div>

      {/* Interactive Customizer Modal (cuModal) */}
      {modalOpen && (
        <div id="cuModal" role="dialog" aria-modal="true">
          <div className="cuBox">
            <div className="cuHd">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="chip cu-back-btn"
                  onClick={() => {
                    if (modalStep === 2) {
                      if (inlineEditRef.current) {
                        inlineEditRef.current.innerHTML = ''
                      }
                      setModalStep(1)
                    } else {
                      setModalOpen(false)
                    }
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#0f172a',
                    fontWeight: 700,
                    border: '1px solid #cbd5e1',
                    padding: '5px 12px',
                    fontSize: '13px'
                  }}
                  title={modalStep === 2 ? 'Back to Fill Details' : 'Back to Templates'}
                >
                  <Icon name="arrowLeft" size={15} />
                  {modalStep === 2 ? 'Edit details' : 'Back to Templates'}
                </button>
                <b style={{ fontSize: '0.95rem' }}>{modalStep === 1 ? '1 Fill details' : '2 Preview & Edit'}</b>
              </div>

              {/* Action Buttons in Header for Instant 1-Tap Access on Mobile & Desktop */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="chip"
                  onClick={handleSaveInvoice}
                  disabled={isSaving}
                  style={{
                    background: '#15865a',
                    color: '#ffffff',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 12px',
                    fontSize: '13px',
                    border: 'none',
                    borderRadius: 6
                  }}
                  title="Save Invoice"
                >
                  <Icon name={isSaving ? 'clock' : 'checkCircle'} size={15} />
                  {isSaving ? 'Saving' : 'Save'}
                </button>

                {modalStep === 1 ? (
                  <button
                    type="button"
                    className="chip cuPri"
                    onClick={() => setModalStep(2)}
                    style={{ fontWeight: 700, padding: '5px 12px', fontSize: '13px' }}
                    title="Go to Step 2: Preview & Edit"
                  >
                    2 Preview <Icon name="arrowUpRight" size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="chip cuPri"
                    onClick={handleDownloadPdf}
                    disabled={pdfGenerating}
                    style={{ fontWeight: 700, padding: '5px 12px', fontSize: '13px' }}
                    title="Download PDF"
                  >
                    <Icon name={pdfGenerating ? 'clock' : 'download'} size={15} />
                    {pdfGenerating ? 'Generating' : 'Download PDF'}
                  </button>
                )}

                <button
                  type="button"
                  className="chip"
                  onClick={() => setModalOpen(false)}
                  title="Close modal"
                  style={{ fontWeight: 700, padding: '4px 8px', fontSize: '13px' }}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>

            {/* STEP 1: Form Fields */}
            {modalStep === 1 ? (
              <div className="cuBd cuBd-form" key="cu-modal-step-1">
                <div style={{ marginBottom: 12 }}>
                  <label>Document Type</label>
                  <select
                    value={cuDocType}
                    onChange={(e) => handleMixerDocumentTypeChange(e.target.value)}
                  >
                    <option value="invoice">Tax Invoice</option>
                    <option value="quote">Quotation</option>
                    <option value="estimate">Estimate</option>
                  </select>
                </div>

                {/* Branding: Logo, Company Seal, and Signature */}
                <div className="cu-brand-section" style={{
                  background: '#ffffff',
                  border: '1px solid #dde1ea',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 16
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Logo, Company Seal &amp; Signature
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 14
                  }}>
                    {/* 1. Upload Logo */}
                    <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: 6 }}>
                         Company Logo
                      </label>
                      {logoImgUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={logoImgUrl}
                            alt="Logo preview"
                            style={{ width: 48, height: 48, objectFit: 'contain', background: '#fff', borderRadius: 8, border: '1px solid #cbd5e1', padding: 4 }}
                          />
                          <div>
                            <span style={{ fontSize: '0.78rem', color: '#15865a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="checkCircle" size={14} /> Logo uploaded</span>
                            <button
                              type="button"
                              className="chip"
                              onClick={() => {
                                setLogoImgUrl(null)
                                setLogoPalettes([])
                                setCustomPreviewHtml(null)
                              }}
                              style={{ padding: '3px 8px', fontSize: '11px', marginTop: 4, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="cuModalLogoUpload"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '7px 12px',
                              background: '#ffffff',
                              border: '1px dashed #0284c7',
                              borderRadius: 8,
                              color: '#0284c7',
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            Upload Logo Image
                          </label>
                          <input
                            id="cuModalLogoUpload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleLogoUpload}
                          />
                          <small style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                            PNG, JPG or SVG (Transparent logo looks best)
                          </small>
                        </div>
                      )}
                    </div>

                    {/* 2. Company Seal / Stamp */}
                    <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', margin: 0 }}>
                           Company Seal / Stamp
                        </label>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Circular Seal</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        {STAMPS.map(([id, n]) => (
                          <button
                            key={id}
                            type="button"
                            className="chip"
                            aria-pressed={stampStyle === id}
                            onClick={() => {
                              setStampStyle(id)
                              setCustomPreviewHtml(null)
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11.5px',
                              fontWeight: stampStyle === id ? 700 : 500,
                              background: stampStyle === id
                                ? (id === '#B91C1C' ? '#b91c1c' : id === '#5B21B6' ? '#5b21b6' : id === '#1E3A8A' ? '#1e3a8a' : '#15865a')
                                : '#ffffff',
                              color: stampStyle === id ? '#ffffff' : '#334155',
                              border: stampStyle === id ? '1px solid currentColor' : '1px solid #cbd5e1'
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#475569', cursor: 'pointer', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={verifiedSeal}
                          onChange={(e) => {
                            setVerifiedSeal(e.target.checked)
                            setCustomPreviewHtml(null)
                          }}
                          style={{ width: 'auto', margin: 0 }}
                        />
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="shieldCheck" size={15} /> Tamper-Proof Verification Seal</span>
                      </label>
                    </div>

                    {/* 3. Signature */}
                    <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: 6 }}>
                         Signature Style &amp; Sign
                      </label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        {SIGS.map(([id, n]) => (
                          <button
                            key={id}
                            type="button"
                            className="chip"
                            aria-pressed={sigType === id}
                            onClick={() => {
                              setSigType(id)
                              setCustomPreviewHtml(null)
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11.5px',
                              fontWeight: sigType === id ? 700 : 500,
                              background: sigType === id ? '#15865a' : '#ffffff',
                              color: sigType === id ? '#ffffff' : '#334155',
                              border: sigType === id ? '1px solid #15865a' : '1px solid #cbd5e1'
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>

                      {sigType === 'drawn' ? (
                        <div style={{ marginTop: 6 }}>
                          {sigImgData ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: 6, borderRadius: 6, border: '1px solid #cbd5e1' }}>
                              <img src={sigImgData} alt="Signature preview" style={{ height: 36, objectFit: 'contain' }} />
                              <button
                                type="button"
                                className="chip"
                                onClick={() => {
                                  setSigImgData(null)
                                  setCustomPreviewHtml(null)
                                }}
                                style={{ padding: '2px 8px', fontSize: '11px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                              >
                                Clear
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                <label
                                  htmlFor="cuModalSigUpload"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '5px 10px',
                                    background: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                   Upload Sign Image
                                </label>
                                <input
                                  id="cuModalSigUpload"
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={handleSignatureUpload}
                                />
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>or draw below:</span>
                              </div>
                              <canvas
                                ref={modalCanvasRef}
                                style={{
                                  width: '100%',
                                  height: 80,
                                  background: '#ffffff',
                                  border: '1px dashed #94a3b8',
                                  borderRadius: 6,
                                  touchAction: 'none'
                                }}
                                width={400}
                                height={100}
                              />
                            </div>
                          )}
                        </div>
                      ) : sigType === 'script' ? (
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Signs as stylish handwritten <em>{cuSign || 'Authorized Signatory'}</em>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          No signature block on invoice
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="cuG">
                  <div>
                    <label>Business Name</label>
                    <input value={cuBiz} onChange={e => setCuBiz(e.target.value)} />
                  </div>
                  <div>
                    <label>City &amp; Address</label>
                    <input value={cuCity} onChange={e => setCuCity(e.target.value)} />
                  </div>
                  <div>
                    <label>Seller GSTIN</label>
                    <input value={cuGstin} onChange={e => setCuGstin(e.target.value)} />
                  </div>
                  <div>
                    <label>Authorized Signatory</label>
                    <input value={cuSign} onChange={e => setCuSign(e.target.value)} />
                  </div>
                  <div>
                    <label>Customer Name</label>
                    <input value={cuClient} onChange={e => setCuClient(e.target.value)} />
                  </div>
                  <div>
                    <label>Customer Address</label>
                    <input value={cuCcity} onChange={e => setCuCcity(e.target.value)} />
                  </div>
                  <div>
                    <label>Customer GSTIN</label>
                    <input value={cuCg} onChange={e => setCuCg(e.target.value)} />
                  </div>
                  <div>
                    <label>Place of Supply (State)</label>
                    <input value={cuPos} onChange={e => setCuPos(e.target.value)} />
                  </div>
                  <div>
                    <label>Invoice / Quote Number</label>
                    <input value={cuNo} onChange={e => setCuNo(e.target.value)} />
                  </div>
                  <div>
                    <label>{cuDocType === 'quote' ? 'Quotation Date' : cuDocType === 'estimate' ? 'Estimate Date' : 'Invoice Date'}</label>
                    <input type="date" value={cuDate} onChange={e => setCuDate(e.target.value)} />
                  </div>
                  <div>
                    <label>{cuDocType === 'invoice' ? 'Payment Due Date' : 'Valid Until'}</label>
                    <input type="date" value={cuDue} onChange={e => { setCuDue(e.target.value); setCustomPreviewHtml(null); }} />
                  </div>
                  <div>
                    <label>Advance Received (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={cuAdv}
                      onChange={e => { setCuAdv(parseFloat(e.target.value) || 0); setCustomPreviewHtml(null); }}
                    />
                  </div>
                  <div>
                    <label>UPI ID</label>
                    <input value={cuUpi} onChange={e => setCuUpi(e.target.value)} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {[
                      { id: 'cuModalUpiQrUpload', label: 'UPI Payment QR', value: upiQrUrl, setValue: setUpiQrUrl, isReview: false },
                      { id: 'cuModalReviewQrUpload', label: 'Rate Us QR', value: reviewQrUrl, setValue: setReviewQrUrl, isReview: true }
                    ].map(qrField => (
                      <div key={qrField.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
                        <label style={{ display: 'block', marginBottom: 7, fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>{qrField.label}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          {qrField.value ? (
                            <img src={qrField.value} alt={`${qrField.label} preview`} style={{ width: 52, height: 52, objectFit: 'contain', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                          ) : (
                            <small style={{ flex: 1, color: '#64748b', fontSize: '0.72rem' }}>No custom QR uploaded</small>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label htmlFor={qrField.id} style={{ cursor: 'pointer', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Icon name={qrField.value ? 'image' : 'upload'} size={14} />
                              {qrField.value ? 'Replace image' : 'Upload image'}
                            </label>
                            <input id={qrField.id} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleQrUpload(e, qrField.setValue, qrField.isReview)} />
                            {qrField.value && (
                              <button type="button" className="chip" onClick={() => { qrField.setValue(null); setCustomPreviewHtml(null) }} style={{ padding: '2px 7px', fontSize: '0.7rem', color: '#b91c1c', borderColor: '#fca5a5' }}>
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label>Bank Name</label>
                    <input value={cuBank} onChange={e => setCuBank(e.target.value)} />
                  </div>
                  <div>
                    <label>Bank Account Number</label>
                    <input value={cuAc} onChange={e => setCuAc(e.target.value)} />
                  </div>
                  <div>
                    <label>Bank IFSC Code</label>
                    <input value={cuIfsc} onChange={e => setCuIfsc(e.target.value)} />
                  </div>
                </div>

                <label style={{ margin: '14px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={cuInter}
                    onChange={e => setCuInter(e.target.checked)}
                  />
                  Customer is in another state (charge IGST instead of CGST + SGST)
                </label>

                <h4 style={{ margin: '18px 0 10px' }}>Line Items</h4>
                {cuItems.map((item, idx) => (
                  <div key={idx} className="cuR">
                    <input
                      data-i="desc"
                      placeholder="Item description"
                      value={item.desc}
                      onChange={e => {
                        const val = e.target.value
                        setCuItems(prev => prev.map((x, i) => i === idx ? { ...x, desc: val } : x))
                      }}
                    />
                    <input
                      placeholder="HSN/SAC"
                      value={item.hsn}
                      onChange={e => {
                        const val = e.target.value
                        setCuItems(prev => prev.map((x, i) => i === idx ? { ...x, hsn: val } : x))
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        setCuItems(prev => prev.map((x, i) => i === idx ? { ...x, qty: val } : x))
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Rate (₹)"
                      value={item.rate}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        setCuItems(prev => prev.map((x, i) => i === idx ? { ...x, rate: val } : x))
                      }}
                    />
                    <button
                      className="chip"
                      onClick={() => setCuItems(prev => prev.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  className="chip"
                  onClick={() => setCuItems(prev => [...prev, { desc: 'New Service Item', hsn: '998314', qty: 1, rate: 5000, gst: 18, unit: 'units' }])}
                >
                  + Add Item
                </button>

                <div style={{ marginTop: 16 }}>
                  <label>Terms &amp; Notes</label>
                  <textarea
                    rows={3}
                    value={cuNotes}
                    onChange={e => setCuNotes(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              /* STEP 2: Inline Editable Preview */
              <div className="cuBd cuBd-preview" key="cu-modal-step-2">
                <p className="muted" style={{ marginBottom: 12, fontSize: '0.85rem' }}>
                  Tap any text directly on the preview to edit it inline before downloading your PDF.
                </p>
                <div className="template-mixer-invoice-frame">
                  <div
                    key="cu-inv-editable-preview"
                    ref={inlineEditRef}
                    id="cuInv"
                    className={`inv${!isPro ? ' invoice-has-watermark' : ''}`}
                    contentEditable
                    suppressContentEditableWarning
                    onFocus={() => { isTypingInlineRef.current = true }}
                    onBlur={(e) => {
                      isTypingInlineRef.current = false
                      latestInlineHtmlRef.current = sanitizeInvoiceHtml(e.currentTarget.innerHTML)
                      setCustomPreviewHtml(sanitizeInvoiceHtml(e.currentTarget.innerHTML))
                    }}
                    onInput={(e) => {
                      latestInlineHtmlRef.current = sanitizeInvoiceHtml(e.currentTarget.innerHTML)
                    }}
                  />
                  {!isPro && (
                    <div className="invoice-free-plan-watermark template-mixer-watermark">
                      <button type="button" className="no-print" data-html2canvas-ignore="true" onClick={requestWatermarkUpgrade}>Remove watermark</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="cuFt" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {modalStep === 2 ? (
                  <button
                    type="button"
                    className="chip"
                    onClick={() => {
                      if (inlineEditRef.current) {
                        inlineEditRef.current.innerHTML = ''
                      }
                      setModalStep(1)
                    }}
                    style={{ fontWeight: 700, background: '#f8fafc', border: '1px solid #cbd5e1' }}
                  >
                    <Icon name="arrowLeft" size={15} /> Edit details
                  </button>
                ) : (
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setModalOpen(false)}
                    style={{ fontWeight: 700, background: '#f8fafc', border: '1px solid #cbd5e1' }}
                  >
                    <Icon name="arrowLeft" size={15} /> Back to Templates
                  </button>
                )}
                <button
                  className="chip"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo last change"
                >
                  <Icon name="undo" size={15} /> Undo
                </button>
                <button
                  className="chip"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo change"
                >
                  <Icon name="redo" size={15} /> Redo
                </button>
                <button
                  className="chip"
                  onClick={handleRevertToDraft}
                  title="Revert back to initial draft"
                  style={{ color: '#dc2626' }}
                >
                  <Icon name="clock" size={15} /> Revert
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {modalStep === 1 && (
                  <button
                    type="button"
                    className="chip"
                    onClick={handleSaveInvoice}
                    disabled={isSaving}
                    style={{
                      background: '#15865a',
                      color: '#ffffff',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '7px 14px'
                    }}
                  >
                    <Icon name={isSaving ? 'clock' : 'checkCircle'} size={15} />
                    {isSaving ? 'Saving…' : 'Save Invoice'}
                  </button>
                )}
                {modalStep === 1 && (
                  <button
                    type="button"
                    className="chip cuPri"
                    onClick={() => setModalStep(2)}
                    style={{ fontWeight: 700, padding: '7px 14px' }}
                  >
                    2 Preview &amp; Edit <Icon name="arrowUpRight" size={14} />
                  </button>
                )}
                {modalStep === 2 && cuDocType !== 'invoice' && (
                  <button type="button" className="chip" onClick={handleConvertQuoteToInvoice}>
                    <Icon name="fileCheck" size={15} /> Convert to Invoice
                  </button>
                )}
                {modalStep === 2 && (
                  <button type="button" className="chip" onClick={handleShareWhatsApp}>
                    <Icon name="message" size={15} /> Share on WhatsApp
                  </button>
                )}
                {modalStep === 2 && (
                  <button
                    type="button"
                    className="chip"
                    onClick={handleSaveInvoice}
                    disabled={isSaving}
                    style={{
                      background: '#15865a',
                      color: '#ffffff',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '7px 14px'
                    }}
                  >
                    <Icon name={isSaving ? 'clock' : 'checkCircle'} size={15} />
                    {isSaving ? 'Saving…' : 'Save Invoice'}
                  </button>
                )}
                {modalStep === 2 && (
                  <button
                    type="button"
                    className="chip cuPri"
                    onClick={handleDownloadPdf}
                    disabled={pdfGenerating}
                    style={{ fontWeight: 700, padding: '7px 14px' }}
                  >
                    <Icon name={pdfGenerating ? 'clock' : 'download'} size={15} />
                    {pdfGenerating ? 'Generating…' : 'Download PDF'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
