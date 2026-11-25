import React, { useEffect, useState } from 'react'
import { api } from '../../utils/apiClient'
import { hasPlanAccess } from '../../utils/plans'

const curlExample = `curl -X POST "https://YOUR_INVOXA_API_HOST/api/v1/invoices" \\
  -H "Authorization: Bearer YOUR_INVOXA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client": {
      "name": "Acme Corp",
      "email": "billing@acme.com",
      "state": "Maharashtra"
    },
    "items": [
      {
        "description": "Website development",
        "quantity": 1,
        "rate": 28000,
        "taxRate": 18
      }
    ],
    "notes": "Thank you for your business"
  }'`

const javascriptExample = `const response = await fetch(
  "https://YOUR_INVOXA_API_HOST/api/v1/invoices",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.INVOXA_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client: { name: "Acme Corp", state: "Maharashtra" },
      items: [{ description: "Website development", quantity: 1, rate: 28000, taxRate: 18 }]
    })
  }
);

const result = await response.json();
console.log(result.invoice.invoiceNumber);`

const responseExample = `{
  "message": "Invoice created successfully.",
  "invoice": {
    "id": "inv_…",
    "invoiceNumber": "INV-2026-003",
    "status": "Unpaid",
    "client": { "name": "Acme Corp" },
    "items": [ ... ]
  }
}`

const statusCurlExample = `curl -X GET "https://YOUR_INVOXA_API_HOST/api/v1/status" \\
  -H "Authorization: Bearer YOUR_INVOXA_API_KEY"`

const prettyDate = (value) => {
  if (!value) return 'Never used'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export default function DeveloperApiWorkspaceView({ currentUser = {}, onInvoiceCreated, onSubscribe }) {
  const [keys, setKeys] = useState([])
  const [maxActiveKeys, setMaxActiveKeys] = useState(1)
  const [keyName, setKeyName] = useState('Website integration')
  const [keyEnvironment, setKeyEnvironment] = useState('live')
  const [developerInfo, setDeveloperInfo] = useState({
    developerName: currentUser.name || '',
    contactEmail: currentUser.email || '',
    websiteUrl: '',
    purpose: ''
  })
  const [newKey, setNewKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isVerifyingKey, setIsVerifyingKey] = useState(false)
  const [keyVerification, setKeyVerification] = useState(null)
  const [testingKeyId, setTestingKeyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [testResult, setTestResult] = useState(null)
  const activeKeyCount = keys.filter(key => !key.revokedAt).length
  const hasActiveEnterprise = hasPlanAccess(currentUser, 'enterprise')
  const hasExpiredEnterprise = currentUser.plan === 'enterprise' && !hasActiveEnterprise
  const enterpriseBillingCycle = currentUser.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'
  const expiryDate = currentUser.subscriptionExpiry ? new Date(currentUser.subscriptionExpiry) : null
  const expiryLabel = expiryDate && !Number.isNaN(expiryDate.getTime())
    ? expiryDate.toLocaleDateString('en-IN', { dateStyle: 'medium' })
    : currentUser.role === 'super_admin' ? 'No expiry' : 'Not available'

  useEffect(() => {
    setDeveloperInfo(previous => ({
      ...previous,
      developerName: previous.developerName || currentUser.name || '',
      contactEmail: previous.contactEmail || currentUser.email || ''
    }))
  }, [currentUser.name, currentUser.email])

  useEffect(() => {
    setKeyEnvironment(hasActiveEnterprise ? 'test' : 'live')
  }, [hasActiveEnterprise])

  useEffect(() => {
    let isCurrent = true
    api.getDeveloperKeys()
      .then(({ keys: savedKeys = [], maxActiveKeys: activeLimit = 10 }) => {
        if (isCurrent) setKeys(savedKeys)
        if (isCurrent) setMaxActiveKeys(activeLimit)
      })
      .catch((err) => {
        if (isCurrent) setError(err.message || 'Could not load API keys.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })
    return () => { isCurrent = false }
  }, [])

  const handleCreateKey = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setTestResult(null)
    setIsCreating(true)
    try {
      const result = await api.createDeveloperKey(keyName, keyEnvironment, developerInfo)
      setKeys((previous) => [result.key, ...previous.filter(key => key.id !== result.key.id)])
      setKeyName('')
      setNewKey(result)
      setCopied(false)
      setKeyVerification(null)
      try {
        const verification = await api.verifyDeveloperKey(result.secret)
        setKeyVerification(verification)
        setNotice(`API key created, saved, and verified as active (${verification.environment}).`)
      } catch (verifyError) {
        setKeyVerification({ status: 'unverified', message: verifyError.message || 'The connection check did not complete.' })
        setError(`The key was created, but Invoxa could not verify it yet. Retry the connection check before using it. ${verifyError.message || ''}`.trim())
      }
    } catch (err) {
      setError(err.message || 'Could not create the API key.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyKey = async () => {
    if (!newKey?.secret) return
    try {
      await navigator.clipboard.writeText(newKey.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Clipboard access was blocked. Select and copy the key manually.')
    }
  }

  const handleVerifyKey = async () => {
    if (!newKey?.secret || newKey.key.revokedAt) return
    setIsVerifyingKey(true)
    setKeyVerification(null)
    setError('')
    try {
      const verification = await api.verifyDeveloperKey(newKey.secret)
      setKeyVerification(verification)
      setNotice(`API key is active (${verification.environment}).`)
    } catch (err) {
      setKeyVerification({ status: 'unverified', message: err.message || 'The connection check failed.' })
      setError(err.message || 'Invoxa could not verify this API key.')
    } finally {
      setIsVerifyingKey(false)
    }
  }

  const handleRevoke = async (key) => {
    if (!window.confirm(`Revoke "${key.name}"? Software using this key will stop working.`)) return
    setError('')
    setNotice('')
    try {
      const result = await api.revokeDeveloperKey(key.id)
      setKeys((previous) => previous.map(item => item.id === key.id ? result.key : item))
      if (newKey?.key?.id === key.id) setNewKey(null)
      if (newKey?.key?.id === key.id) setKeyVerification(null)
      if (testingKeyId === key.id) setTestResult(null)
      setNotice('API key revoked.')
    } catch (err) {
      setError(err.message || 'Could not revoke the API key.')
    }
  }

  const handleSampleRequest = async () => {
    if (!newKey?.secret || newKey.key.revokedAt) return
    setError('')
    setNotice('')
    setTestResult(null)
    setTestingKeyId(newKey.key.id)
    try {
      const result = await api.createApiSampleInvoice(newKey.secret)
      setTestResult(result.invoice)
      if (result.simulated) {
        setNotice('Sandbox request succeeded. No invoice was saved to your account.')
      } else {
        onInvoiceCreated?.(result.invoice)
        setNotice('Live API request succeeded and created an invoice in your account.')
      }
      try {
        const refreshed = await api.getDeveloperKeys()
        setKeys(refreshed.keys || [])
        setMaxActiveKeys(refreshed.maxActiveKeys || 10)
      } catch {
        // Invoice creation succeeded; leaving the current key list in view is still accurate enough.
      }
    } catch (err) {
      setError(err.message || 'The sample invoice request failed.')
    } finally {
      setTestingKeyId('')
    }
  }

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setNotice('Copied to clipboard.')
    } catch {
      setError('Clipboard access was blocked. Select and copy the text manually.')
    }
  }

  return (
    <div className="workspace-view-container developer-api-page">
      <div className="table-controls-bar">
        <div>
          <h3>Developer API</h3>
          <p className="section-subtext">Connect your software to Invoxa and create invoices from your own app.</p>
        </div>
      </div>

      <div className={`developer-enterprise-access ${hasActiveEnterprise ? '' : hasExpiredEnterprise ? 'expired' : 'free'}`}>
        <strong>{hasActiveEnterprise ? 'Enterprise API access' : 'Free Web API access'} · {activeKeyCount}/{maxActiveKeys} active keys</strong>
        <span>{hasActiveEnterprise ? `${enterpriseBillingCycle} access through ${expiryLabel} (no automatic renewal). Sandbox and Live keys are available with the active Enterprise plan.` : 'Free includes one active Live Web integration key for invoice creation. Enterprise adds Sandbox access and up to 10 active keys.'}</span>
        {!hasActiveEnterprise && <button type="button" className="plan-preview-compare-button" onClick={() => onSubscribe?.('enterprise')}>Upgrade to Enterprise</button>}
      </div>

      {error && <div className="developer-api-alert error" role="alert">{error}</div>}
      {notice && <div className="developer-api-alert success" role="status">{notice}</div>}

      <div className="api-view-grid">
        <section className="api-card">
          <h4>1. Create an API key</h4>
          <p className="card-subtext">{hasActiveEnterprise ? 'Enterprise supports up to 10 active keys across integrations.' : 'Free includes one active Live Web integration key.'}</p>
          <form className="developer-key-form" onSubmit={handleCreateKey}>
            <div className="developer-integration-details">
              <div className="developer-info-field">
                <label htmlFor="developer-contact-name">Developer contact name</label>
                <input
                  id="developer-contact-name"
                  value={developerInfo.developerName}
                  onChange={(event) => setDeveloperInfo(previous => ({ ...previous, developerName: event.target.value }))}
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="developer-info-field">
                <label htmlFor="developer-contact-email">Contact email</label>
                <input
                  id="developer-contact-email"
                  type="email"
                  value={developerInfo.contactEmail}
                  onChange={(event) => setDeveloperInfo(previous => ({ ...previous, contactEmail: event.target.value }))}
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="developer-info-field">
                <label htmlFor="developer-website-url">Website or app URL</label>
                <input
                  id="developer-website-url"
                  type="url"
                  value={developerInfo.websiteUrl}
                  onChange={(event) => setDeveloperInfo(previous => ({ ...previous, websiteUrl: event.target.value }))}
                  placeholder="https://example.com"
                  maxLength={500}
                  required
                />
              </div>
              <div className="developer-info-field full-width">
                <label htmlFor="developer-integration-purpose">What will this integration do?</label>
                <textarea
                  id="developer-integration-purpose"
                  value={developerInfo.purpose}
                  onChange={(event) => setDeveloperInfo(previous => ({ ...previous, purpose: event.target.value }))}
                  placeholder="For example, create invoices when orders are completed in our online store."
                  minLength={10}
                  maxLength={500}
                  rows={3}
                  required
                />
              </div>
            </div>
            <label htmlFor="developer-key-name">{hasActiveEnterprise ? 'Integration / key name' : 'Web integration name'}</label>
            <div className="developer-key-create-row">
              <input
                id="developer-key-name"
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
                maxLength={60}
                placeholder={hasActiveEnterprise ? 'e.g. Store website' : 'e.g. My website'}
                required
              />
              <select
                aria-label="API key environment"
                value={keyEnvironment}
                onChange={(event) => setKeyEnvironment(event.target.value)}
              >
                {hasActiveEnterprise ? <>
                  <option value="test">Sandbox / test</option>
                  <option value="live">Live</option>
                </> : <option value="live">Live Web key (Free)</option>}
              </select>
              <button className="run-test-btn" type="submit" disabled={isCreating || !keyName.trim() || activeKeyCount >= maxActiveKeys}>
                {isCreating ? 'Creating…' : activeKeyCount >= maxActiveKeys ? 'Key limit reached' : hasActiveEnterprise ? 'Generate key' : 'Generate free Web key'}
              </button>
            </div>
          </form>
          <div className="developer-api-note"><strong>Keys stay saved after refresh.</strong> The full secret is shown once and cannot be recovered. Store it in your app server’s environment. If you lose it, revoke that key and generate a replacement.</div>

          {newKey?.secret && !hasActiveEnterprise && newKey.key.environment === 'live' && (
            <div className="developer-api-note"><strong>This is a Live key.</strong> API requests save real invoices to your account. Use your own integration for live requests; upgrade to Enterprise to test safely with a Sandbox key.</div>
          )}

          {newKey?.secret && !newKey.key.revokedAt && (
            <div className="new-api-key-panel">
              <strong>Your new key — copy it now</strong>
              <p>This full key is shown once. It stays active after refresh, but the dashboard will only show its name and masked prefix. Keep it in your software’s server environment; do not add it to public browser code.</p>
              <div className="key-input-row">
                <input aria-label="New API key" readOnly value={newKey.secret} className="api-key-field" />
                <button type="button" className="copy-key-btn" onClick={handleCopyKey}>{copied ? 'Copied' : 'Copy key'}</button>
              </div>
              <button type="button" className="copy-doc-btn" onClick={handleVerifyKey} disabled={isVerifyingKey}>
                {isVerifyingKey ? 'Checking connection…' : 'Verify API key'}
              </button>
              {keyVerification && <div className={`developer-api-alert ${keyVerification.status === 'active' ? 'success' : 'error'}`} role="status">
                {keyVerification.status === 'active'
                  ? `Verified: this ${keyVerification.environment} key is active. The check did not create an invoice.`
                  : `Not verified: ${keyVerification.message}`}
              </div>}
            </div>
          )}

          <div className="developer-key-list">
            <h5>Your keys</h5>
            {isLoading ? <p className="card-subtext">Loading keys…</p> : keys.length === 0 ? (
              <p className="card-subtext">No API keys yet. Generate one to connect your software.</p>
            ) : keys.map((key) => (
              <div className="developer-key-row" key={key.id}>
                <div className="developer-key-meta">
                  <strong>{key.name}</strong>
                  <code>{key.keyPrefix}</code>
                  <span className={`api-key-environment ${key.environment === 'test' ? 'sandbox' : 'live'}`}>{key.environment === 'test' ? 'Sandbox' : 'Live'}</span>
                  {key.developerInfo && <span>Website: <a href={key.developerInfo.websiteUrl} target="_blank" rel="noreferrer">{key.developerInfo.websiteUrl}</a></span>}
                  {key.developerInfo && <span>Contact: {key.developerInfo.developerName} · {key.developerInfo.contactEmail}</span>}
                  {key.developerInfo?.purpose && <span>Use: {key.developerInfo.purpose}</span>}
                  <span>{key.revokedAt ? 'Revoked' : 'Active'} · Created {prettyDate(key.createdAt)} · Last used {prettyDate(key.lastUsedAt)}</span>
                </div>
                {!key.revokedAt && (
                  <button type="button" className="revoke-key-btn" onClick={() => handleRevoke(key)}>Revoke</button>
                )}
              </div>
            ))}
          </div>

          {newKey?.secret && !newKey.key.revokedAt && (newKey.key.environment === 'test' || hasActiveEnterprise) && (
            <div className="test-api-box">
              <h5>Try an API request</h5>
              <p>{newKey.key.environment === 'test' ? 'This validates the request and returns a preview. Sandbox requests never save invoices.' : 'This creates a sample invoice in your Invoxa account using the live key.'}</p>
              <button className="run-test-btn" type="button" onClick={handleSampleRequest} disabled={Boolean(testingKeyId)}>
                {testingKeyId ? 'Sending request…' : newKey.key.environment === 'test' ? 'Run sandbox request' : 'Create sample invoice'}
              </button>
              {testResult && (
                <div className="api-result-success">
                  <strong>{newKey.key.environment === 'test' ? 'Sandbox preview' : 'Invoice created'}</strong>
                  <span>Invoice number: <code>{testResult.invoiceNumber}</code></span>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="api-card">
          <h4>Verify that your key is active</h4>
          <p className="card-subtext">This read-only request confirms the key is recognized. It does not create an invoice.</p>
          <div className="api-endpoint-line"><span>GET</span><code>/api/v1/status</code></div>
          <pre className="code-block"><code>{statusCurlExample}</code></pre>
          <button type="button" className="copy-doc-btn" onClick={() => copyText(statusCurlExample)}>Copy verification request</button>
          <p className="card-subtext">A successful response reports <code>status: active</code> and whether the key is Live or Sandbox.</p>
        </section>

        <section className="api-card">
          <h4>2. Send an invoice request</h4>
          <p className="card-subtext">Use this endpoint from your backend server. Replace the host and key placeholders with your deployment URL and key.</p>
          <div className="api-endpoint-line"><span>POST</span><code>/api/v1/invoices</code></div>
          <p className="developer-api-label">cURL example</p>
          <pre className="code-block"><code>{curlExample}</code></pre>
          <button type="button" className="copy-doc-btn" onClick={() => copyText(curlExample)}>Copy cURL example</button>
          <div className="developer-api-note"><strong>Keep the key on your server.</strong> Do not ship it in website JavaScript, mobile app code, or public repositories.</div>
        </section>

        <section className="api-card">
          <h4>JavaScript example</h4>
          <p className="card-subtext">Call Invoxa from your server with Node.js or another backend runtime.</p>
          <pre className="code-block"><code>{javascriptExample}</code></pre>
          <button type="button" className="copy-doc-btn" onClick={() => copyText(javascriptExample)}>Copy JavaScript example</button>
        </section>

        <section className="api-card">
          <h4>3. Request fields and response</h4>
          <p className="developer-api-label">Required fields</p>
          <ul className="developer-api-fields">
            <li><code>client.name</code> — customer name</li>
            <li><code>items</code> — one or more line items</li>
            <li><code>items[].description</code>, <code>quantity</code>, <code>rate</code></li>
          </ul>
          <p className="card-subtext">Optional fields include client email, phone, address, state, GSTIN; item HSN/SAC and taxRate; invoiceDate, dueDate, invoiceNumber, discountRate, notes, and terms.</p>
          <p className="developer-api-label">Live success: HTTP 201. Sandbox success: HTTP 200 and no invoice is saved.</p>
          <p className="developer-api-label">Example live response</p>
          <pre className="code-block"><code>{responseExample}</code></pre>
          <div className="developer-api-note">Live requests save invoices under the business linked to the key. Sandbox requests return a preview with <code>simulated: true</code> and do not save. Authentication errors return <code>401</code>, invalid invoice details return <code>400</code>, plan restrictions return <code>403</code>, and the request limit returns <code>429</code>.</div>
        </section>

        <section className="api-card full-span">
          <h4>4. Manage your keys</h4>
          <p className="card-subtext">Each named key belongs to your business account. Revoke one to stop its requests immediately. Free includes one active Live Web key; Enterprise allows up to 10 active keys with Sandbox access.</p>
          <div className="api-endpoint-line"><span>Authorization</span><code>Bearer YOUR_INVOXA_API_KEY</code></div>
        </section>
      </div>
    </div>
  )
}
