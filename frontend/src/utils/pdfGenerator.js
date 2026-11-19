let html2pdfPromise

export const loadHtml2Pdf = async () => {
  if (typeof window !== 'undefined' && typeof window.html2pdf === 'function') {
    return window.html2pdf
  }

  if (!html2pdfPromise) {
    html2pdfPromise = import('html2pdf.js')
      .then(module => {
        const generatePdf = module.default || module
        if (typeof generatePdf !== 'function') {
          throw new Error('The PDF generator did not load correctly.')
        }
        if (typeof window !== 'undefined') window.html2pdf = generatePdf
        return generatePdf
      })
      .catch(error => {
        html2pdfPromise = null
        throw error
      })
  }

  return html2pdfPromise
}
