import { useStore } from '../../store/useStore'

const CASES = [
  {
    icon: '↑',
    color: '#22c55e',
    title: 'Bull Breakout',
    desc: 'C2 closes above C1 High — target C2 High on C3',
  },
  {
    icon: '↓',
    color: '#ef4444',
    title: 'Bear Breakout',
    desc: 'C2 closes below C1 Low — target C2 Low on C3',
  },
  {
    icon: '↩',
    color: '#f59e0b',
    title: 'Bull Rejection',
    desc: 'Green C1, C2 pierces high but closes inside — target C2 Low',
  },
  {
    icon: '↪',
    color: '#818cf8',
    title: 'Bear Rejection',
    desc: 'Red C1, C2 pierces low but closes inside — target C2 High',
  },
  {
    icon: '⊡',
    color: '#38bdf8',
    title: 'Inside Bar Extension',
    desc: 'C3 is inside C2 — use C4 to confirm. Double inside bar = fail.',
  },
  {
    icon: '⊘',
    color: '#5a7a9a',
    title: 'Inside C1 (Skip)',
    desc: 'C2 is fully inside C1 range — no signal generated, move forward.',
  },
]

export default function SetupTab() {
  const { setActiveTab, setForm, form } = useStore()

  return (
    <div className="fade-up" style={{ maxWidth: 640, margin: '0 auto', paddingTop: 32 }}>

      {/* Hero */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'inline-block',
          padding: '3px 10px', borderRadius: 4,
          background: 'rgba(56,189,248,.1)', border: '1px solid rgba(56,189,248,.25)',
          color: '#38bdf8', fontSize: 11, letterSpacing: '.1em',
          marginBottom: 12,
        }}>PRICE ACTION ALGORITHM</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '.02em', marginBottom: 10 }}>
          3-Candle Setup Analysis
        </h1>
        <p style={{ fontSize: 14, color: '#9ab8d0', lineHeight: 1.75 }}>
          Detect breakouts, rejections and inside-bar extensions across any forex pair or metal.
          Run against live OANDA data or your own CSV — get deep statistical analysis of signal quality,
          pattern performance, Markov chain probabilities and equity curves.
        </p>
      </div>

      {/* Algorithm cases */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
          Algorithm — Pattern Detection Cases
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {CASES.map(c => (
            <div key={c.title} style={{
              background: '#0b1220', border: '1px solid #1a2d42',
              borderRadius: 8, padding: '12px 14px',
              borderLeft: `3px solid ${c.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ color: c.color, fontSize: 16, fontWeight: 700 }}>{c.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</span>
              </div>
              <p style={{ fontSize: 12, color: '#9ab8d0', lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick start cards */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
          Quick Start
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div
            onClick={() => setForm({ source: 'api' })}
            style={{
              background: '#0b1220', border: '1px solid #1a2d42',
              borderRadius: 8, padding: '16px', cursor: 'pointer',
              transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#38bdf8'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2d42'}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>🔌</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>OANDA Live Data</div>
            <div style={{ fontSize: 12, color: '#9ab8d0' }}>
              Connect your OANDA account, choose a pair &amp; timeframe and run instantly.
            </div>
          </div>
          <div
            onClick={() => setForm({ source: 'csv' })}
            style={{
              background: '#0b1220', border: '1px solid #1a2d42',
              borderRadius: 8, padding: '16px', cursor: 'pointer',
              transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#818cf8'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2d42'}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>📂</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Upload CSV</div>
            <div style={{ fontSize: 12, color: '#9ab8d0' }}>
              Upload any OHLC CSV file from MT4, TradingView or any other platform.
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#5a7a9a' }}>
        Configure your data source in the left panel, then press{' '}
        <strong style={{ color: '#38bdf8' }}>▶ RUN ANALYSIS</strong> to begin.
      </p>
    </div>
  )
}
