const BASE = '/api'

async function req(path, options = {}) {
  const res = await fetch(BASE + path, options)
  const json = await res.json().catch(() => ({ detail: res.statusText }))
  if (!res.ok) {
    const msg = json?.detail || json?.message || `HTTP ${res.status}`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return json
}

// ── endpoints ───────────────────────────────────────────────────────────────

export async function uploadCSV(file) {
  const fd = new FormData()
  fd.append('file', file)
  return req('/upload-csv', { method: 'POST', body: fd })
}

export async function fetchOanda({ apiKey, instrument, granularity, count, accountType }) {
  return req('/fetch-oanda', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key:      apiKey,
      instrument,
      granularity,
      count,
      account_type: accountType,
    }),
  })
}

export async function fetchOandaAll({ apiKey, instrument, count, accountType }) {
  return req('/fetch-oanda-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key:      apiKey,
      instrument,
      count,
      account_type: accountType,
    }),
  })
}

export async function getInstruments() {
  return req('/instruments')
}

// ── CSV export ───────────────────────────────────────────────────────────────
export function exportCSV(analysis, instrument = 'data') {
  if (!analysis?.signals?.length) return

  const header = ['#', 'Date', 'Pattern', 'Variant', 'Result', 'Cumulative_PL']
  let cum = 0
  const rows = analysis.signals.map((s, i) => {
    cum += s.result === 1 ? 1 : -1
    return [i + 1, s.date, s.pattern, s.variant, s.result, cum].join(',')
  })

  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `tricandle_${instrument}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}
