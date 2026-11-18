import React, { useEffect, useState } from 'react'
import { api } from '../../utils/apiClient'

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

const prettyDate = (value) => {
  if (!value) return 'Never used'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export default function DeveloperApiWorkspaceView({ onInvoiceCreated }) {
  const [keys, setKeys] = useState([])
  const [keyName, setKeyName] = useState('Website integration')
  const [newKey, setNewKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [testingKeyId, setTestingKeyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    let isCurrent = true
    api.getDeveloperKeys()
      .then(({ keys: savedKeys = [] }) => {
        if (isCurrent) setKeys(savedKeys)
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
      const result = await api.createDeveloperKey(keyName)
      setKeys((previous) => [result.key, ...previous.filter(key => key.id !== result.key.id)])
      setNewKey(result)
      setCopied(false)
      setNotice(result.message)
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

  const handleRevoke = async (key) => {
    if (!window.confirm(`Revoke "${key.name}"? Software using this key will stop working.`)) return
    setError('')
    setNotice('')
    try {
      const result = await api.revokeDeveloperKey(key.id)
      setKeys((previous) => previous.map(item => item.id === key.id ? result.key : item))
      if (newKey?.key?.id === key.id) setNewKey(null)
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
      onInvoiceCreated?.(result.invoice)
      setNotice('Sample request succeeded and created a real invoice in your account.')
      try {
        const refreshed = await api.getDeveloperKeys()
        setKeys(refreshed.keys || [])
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

      {error && <div className="developer-api-alert error" role="alert">{error}</div>}
      {notice && <div className="developer-api-alert success" role="status">{notice}</div>}

      <div className="api-view-grid">
        <section className="api-card">
          <h4>1. Create an API key</h4>
          <p className="card-subtext">Create a separate key for each app or integration so you can revoke it later if needed.</p>
          <form className="developer-key-form" onSubmit={handleCreateKey}>
            <label htmlFor="developer-key-name">Key name</label>
            <div className="developer-key-create-row">
              <input
                id="developer-key-name"
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
                maxLength={60}
                placeholder="e.g. Store website"
                required
              />
              <button className="run-test-btn" type="submit" disabled={isCreating || !keyName.trim()}>
                {isCreating ? 'Creating…' : 'Generate key'}
              </button>
            </div>
          </form>

          {newKey?.secret && !newKey.key.revokedAt && (
            <div className="new-api-key-panel">
              <strong>Your new key — copy it now</strong>
              <p>This full key is shown once. Keep it in your software’s server environment; do not add it to public browser code.</p>
              <div className="key-input-row">
                <input aria-label="New API key" readOnly value={newKey.secret} className="api-key-field" />
                <button type="button" className="copy-key-btn" onClick={handleCopyKey}>{copied ? 'Copied' : 'Copy key'}</button>
              </div>
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
                  <span>{key.revokedAt ? 'Revoked' : 'Active'} · Created {prettyDate(key.createdAt)} · Last used {prettyDate(key.lastUsedAt)}</span>
                </div>
                {!key.revokedAt && (
                  <button type="button" className="revoke-key-btn" onClick={() => handleRevoke(key)}>Revoke</button>
                )}
              </div>
            ))}
          </div>

          {newKey?.secret && !newKey.key.revokedAt && (
            <div className="test-api-box">
              <h5>Try a real API request</h5>
              <p>This creates a sample invoice in your Invoxa account using the new key.</p>
              <button className="run-test-btn" type="button" onClick={handleSampleRequest} disabled={Boolean(testingKeyId)}>
                {testingKeyId ? 'Sending request…' : 'Create sample invoice'}
              </button>
              {testResult && (
                <div className="api-result-success">
                  <strong>Invoice created</strong>
                  <span>Invoice number: <code>{testResult.invoiceNumber}</code></span>
                </div>
              )}
            </div>
          )}
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
          <p className="developer-api-label">Successful response: HTTP 201</p>
          <pre className="code-block"><code>{responseExample}</code></pre>
          <div className="developer-api-note">The invoice is saved under the business linked to this API key. Authentication errors return <code>401</code>; invalid invoice details return <code>400</code>; the request limit returns <code>429</code>.</div>
        </section>

        <section className="api-card full-span">
          <h4>4. Manage your keys</h4>
          <p className="card-subtext">Each key belongs to your signed-in account. Revoke a key here to immediately stop requests made with it. You can create up to 10 active keys per account.</p>
          <div className="api-endpoint-line"><span>Authorization</span><code>Bearer YOUR_INVOXA_API_KEY</code></div>
        </section>
      </div>
    </div>
  )
}
