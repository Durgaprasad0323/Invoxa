import DOMPurify from 'dompurify'

/**
 * Robust, maintained HTML sanitizer for invoices using DOMPurify (OWASP recommendation).
 * Preserves invoice layout, tables, SVG icons, QR codes, and styling while stripping
 * scripts, iframes, and malicious event handlers.
 */
export const sanitizeInvoiceHtml = (html) => {
  if (!html) return ''
  if (typeof window === 'undefined') return ''
  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
    ADD_ATTR: [
      'target', 'style', 'colspan', 'rowspan', 'xmlns', 'viewBox', 'd',
      'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
      'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'base'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  })
}
