// Converts numbers to Indian Currency Words (e.g., 53100 -> "Fifty Three Thousand One Hundred Rupees Only")
export function numberToIndianWords(num) {
  if (!num || isNaN(num)) return 'Zero Rupees Only'
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (n) => {
    let str = ''
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred '
      n %= 100
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10]
    } else if (n > 0) {
      str += a[n]
    }
    return str
  }

  const [rupeesPart, paisePart] = num.toFixed(2).split('.')
  let n = parseInt(rupeesPart, 10)
  
  if (n === 0) return 'Zero Rupees Only'

  let words = ''
  
  // Crores
  if (Math.floor(n / 10000000) > 0) {
    words += inWords(Math.floor(n / 10000000)) + 'Crore '
    n %= 10000000
  }
  // Lakhs
  if (Math.floor(n / 100000) > 0) {
    words += inWords(Math.floor(n / 100000)) + 'Lakh '
    n %= 100000
  }
  // Thousands
  if (Math.floor(n / 1000) > 0) {
    words += inWords(Math.floor(n / 1000)) + 'Thousand '
    n %= 1000
  }
  // Hundreds and remainder
  if (n > 0) {
    words += inWords(n)
  }

  let result = words.trim() + ' Rupees'
  
  const paise = parseInt(paisePart, 10)
  if (paise > 0) {
    result += ' and ' + inWords(paise).trim() + ' Paise'
  }
  
  return result + ' Only'
}
