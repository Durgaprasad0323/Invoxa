export const addFreeInvoiceWatermark = element => {
  if (!element) return
  element.style.position = 'relative'
  element.classList.add('invoice-has-watermark')
}
