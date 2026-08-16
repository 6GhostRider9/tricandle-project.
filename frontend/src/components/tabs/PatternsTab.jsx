import { useStore } from '../../store/useStore'
import { Card, MiniBar, C } from '../charts/Charts'

function colFor(rate) {
  return rate >= 60 ? C.win : rate >= 50 ? C.warn : C.loss
}

function PatCard({ pattern, data }) {
  const { prob, wins, count } = data
  const rate = prob * 100
  const col = colFor(rate)
  const bits = pattern.split('').map((c, i) => (
    <span key={i} style={{ color: c === '1' ? C.win : C.loss }}>{c}</span>
  ))
  return (
    <div style={{
      padding: '10px 12px', background: '#101a2c',
      borderRadius: 6, border: '1px solid #1a2d42',
    }}>
      <div style={{
        fontFamily: '"Share Tech Mono",monospace',
        fontSize: 20, letterSpacing: '.18em', marginBottom: 5,
      }}>{bits}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: col, fontFamily: '"Share Tech Mono",monospace' }}>
          {rate.toFixed(0)}%
        </span>
        <span style={{ fontSize: 10, color: '#5a7a9a' }}>{count} obs</span>
      </div>
      <MiniBar rate={rate} color={col} />
      <div style={{ fontSize: 10, color: '#5a7a9a', marginTop: 4 }}>{wins}/{count} wins</div>
    </div>
  )
}

function StepSection({ title, subtitle, probs }) {
  const entries = Object.entries(probs).sort((a, b) => b[1].prob - a[1].prob)
  if (!entries.length) return null
  return (
    <Card title={title} subtitle={subtitle} style={{ marginBottom: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {entries.map(([k, v]) => <PatCard key={k} pattern={k} data={v} />)}
      </div>
    </Card>
  )
}

export default function PatternsTab() {
  const { analysis } = useStore()
  if (!analysis) return null
  const A = analysis

  const allSorted = Object.entries({ ...A.p2, ...A.p3, ...A.p4 })
    .sort((a, b) => b[1].prob - a[1].prob)
  const best5  = allSorted.slice(0, 5)
  const worst5 = [...allSorted].reverse().slice(0, 5).reverse()

  return (
    <div className="fade-up">

      {/* Best / Worst */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Card title="▲ Top 5 Best Patterns" style={{ borderTop: `2px solid ${C.win}` }}>
          {best5.map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                <span style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: 16, letterSpacing: '.1em' }}>
                  {k.split('').map((c, i) => (
                    <span key={i} style={{ color: c === '1' ? C.win : C.loss }}>{c}</span>
                  ))}
                </span>
                <span style={{ color: C.win, fontFamily: '"Share Tech Mono",monospace', fontWeight: 700 }}>
                  {(v.prob * 100).toFixed(1)}% ({v.wins}/{v.count})
                </span>
              </div>
              <MiniBar rate={v.prob * 100} color={C.win} />
            </div>
          ))}
        </Card>

        <Card title="▼ Top 5 Worst Patterns" style={{ borderTop: `2px solid ${C.loss}` }}>
          {worst5.map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                <span style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: 16, letterSpacing: '.1em' }}>
                  {k.split('').map((c, i) => (
                    <span key={i} style={{ color: c === '1' ? C.win : C.loss }}>{c}</span>
                  ))}
                </span>
                <span style={{ color: C.loss, fontFamily: '"Share Tech Mono",monospace', fontWeight: 700 }}>
                  {(v.prob * 100).toFixed(1)}% ({v.wins}/{v.count})
                </span>
              </div>
              <MiniBar rate={v.prob * 100} color={C.loss} />
            </div>
          ))}
        </Card>
      </div>

      {/* Step sections */}
      <StepSection
        title="2-Step Lookahead"
        subtitle="Given the last 2 signal results, what is the win probability of the next signal?"
        probs={A.p2}
      />
      <StepSection
        title="3-Step Lookahead"
        subtitle="Given the last 3 signal results, what is the win probability of the next signal?"
        probs={A.p3}
      />
      <StepSection
        title="4-Step Lookahead"
        subtitle="Given the last 4 signal results, what is the win probability of the next signal?"
        probs={A.p4}
      />
    </div>
  )
}
