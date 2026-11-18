/**
 * Real SMS Gateway Service — Indian OTP Delivery
 * Priority order:
 *   1. MSG91       (free trial, Indian OTP SMS — most reliable)
 *   2. Fast2SMS    (needs ₹100 recharge at fast2sms.com)
 *   3. Twilio      (free $15 trial at twilio.com)
 *   4. Simulator   (shows OTP in response as fallback)
 */

export const sendRealSMS = async (phone, otp) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10)

  const msg91Key       = process.env.MSG91_AUTH_KEY
  const msg91Template  = process.env.MSG91_TEMPLATE_ID
  const fast2smsKey    = process.env.FAST2SMS_API_KEY
  const twilioSid      = process.env.TWILIO_ACCOUNT_SID
  const twilioToken    = process.env.TWILIO_AUTH_TOKEN
  const twilioPhone    = process.env.TWILIO_PHONE_NUMBER

  let lastSmsError = null

  // ─────────────────────────────────────────────────────────────
  // 1. MSG91 — Most reliable Indian OTP SMS (free trial credits)
  //    Sign up: https://msg91.com → Dashboard → Copy Auth Key
  //    Create OTP template → Copy Template ID
  // ─────────────────────────────────────────────────────────────
  if (msg91Key && msg91Key !== 'your_msg91_auth_key_here') {
    try {
      console.log(`📡 [MSG91] Sending OTP ${otp} to +91 ${cleanPhone}...`)

      const payload = {
        template_id: msg91Template || '5fd29b4a4a110a0d7474f08c',
        mobile: `91${cleanPhone}`,
        authkey: msg91Key,
        otp: otp,
        otp_expiry: 5
      }

      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log('📡 [MSG91 Response]:', data)

      if (data.type === 'success') {
        console.log(`✅ [MSG91] OTP delivered to +91 ${cleanPhone}!`)
        return { success: true, provider: 'MSG91', message: 'OTP delivered via MSG91!' }
      } else {
        lastSmsError = data.message || JSON.stringify(data)
        console.warn('⚠️ [MSG91] Failed:', lastSmsError)
      }
    } catch (err) {
      lastSmsError = err.message
      console.error('❌ [MSG91] Request error:', err.message)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. FAST2SMS — Works immediately after ₹100 recharge
  //    Recharge: https://fast2sms.com → Wallet → Add Money
  // ─────────────────────────────────────────────────────────────
  if (fast2smsKey && fast2smsKey !== 'your_fast2sms_api_key_here') {
    try {
      console.log(`📡 [Fast2SMS] Sending OTP ${otp} to +91 ${cleanPhone}...`)

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: `Your Invoxa OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
          numbers: cleanPhone,
          flash: 0
        })
      })

      const data = await response.json()
      console.log('📡 [Fast2SMS Response]:', data)

      if (data.return === true) {
        return { success: true, provider: 'Fast2SMS', message: 'OTP delivered via Fast2SMS!' }
      } else {
        lastSmsError = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Fast2SMS delivery blocked')
        console.warn('⚠️ [Fast2SMS]:', lastSmsError)
      }
    } catch (err) {
      lastSmsError = err.message
      console.error('❌ [Fast2SMS] Request error:', err.message)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. TWILIO — $15 free trial (global)
  //    Sign up: https://twilio.com/try-twilio → verify your phone
  //    Copy Account SID, Auth Token, Phone Number from Console
  // ─────────────────────────────────────────────────────────────
  if (twilioSid && twilioToken && twilioPhone) {
    try {
      console.log(`📡 [Twilio] Sending OTP ${otp} to +91 ${cleanPhone}...`)
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')

      const params = new URLSearchParams()
      params.append('To', `+91${cleanPhone}`)
      params.append('From', twilioPhone)
      params.append('Body', `Your Invoxa OTP is: ${otp}. Valid for 5 minutes.`)

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        }
      )

      const data = await response.json()
      if (response.ok) {
        console.log('✅ [Twilio] SMS sent! SID:', data.sid)
        return { success: true, provider: 'Twilio', message: 'OTP delivered via Twilio!' }
      } else {
        lastSmsError = data.message || 'Twilio delivery error'
        console.warn('⚠️ [Twilio]:', lastSmsError)
      }
    } catch (err) {
      lastSmsError = err.message
      console.error('❌ [Twilio] Request error:', err.message)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. FALLBACK — No working SMS gateway configured
  // ─────────────────────────────────────────────────────────────
  console.log(`\n⚠️  [SMS GATEWAY] No working gateway for +91 ${cleanPhone}. Reason: ${lastSmsError || 'No gateway keys configured'}`)
  return {
    success: false,
    provider: 'Fast2SMS',
    error: lastSmsError || 'SMS gateway not active (requires active credits or key)'
  }
}
