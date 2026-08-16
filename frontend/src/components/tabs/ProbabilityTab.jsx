import { useStore } from '../../store/useStore'
import { Card, MiniBar, CondProbChart, C } from '../charts/Charts'

export default function ProbabilityTab() {
  const { analysis } = useStore()
  if (!analysis) return null
  const A = analysis
  const cp = A.conditional

  const momentum = cp.p11 > cp.p10
  const insight = momentum
    ? `After a WIN, the next signal is also a WIN ${(cp.p11 * 100).toFixed(0)}% of the time — signals show momentum clustering.`
    : `After a LOSS, the next signal is a WIN ${(cp.p10 * 100).toFixed(0)}% of the time — signals show mean-reversion behaviour.`

  const p2entries = Object.entries(A.p2).sort((a, b) => b[1].prob - a[1].prob)

  return (
    <div className="fade-up">

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Markov matrix */}
        <Card title="Markov Transition Matrix" subtitle="P(Next outcome | Current outcome)">
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: 6, marginBottom: 14 }}>
            <div />
            <div style={{ textAlign: 'center', fontSize: 11, color: C.win, padding: 7, fontWeight: 600 }}>→ NEXT WIN</div>
            <div style={{ textAlign: 'center', fontSize: 11, color: C.loss, padding: 7, fontWeight: 600 }}>→ NEXT LOSS</div>

            {/* Row: after win */}
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: C.win, fontWeight: 600, padding: '0 6px' }}>
              After WIN ↓
            </div>
            <MatrixCell value={cp.p11} count={cp.c11} color={C.win} />
            <MatrixCell value={cp.p01} count={cp.c10} color={C.loss} />

            {/* Row: after loss */}
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: C.loss, fontWeight: 600, padding: '0 6px' }}>
              After LOSS ↓
            </div>
            <MatrixCell value={cp.p10} count={cp.c01} color={C.win} />
            <MatrixCell value={cp.p00} count={cp.c00} color={C.loss} />
          </div>

          {/* Insight */}
          <div style={{
            padding: '10px 12px', background: '#101a2c',
            borderRadius: 6, border: '1px solid #1a2d42',
            fontSize: 12, color: '#9ab8d0', lineHeight: 1.6,
          }}>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Key insight: </span>{insight}
          </div>
        </Card>

        {/* Conditional bar chart */}
        <Card title="Conditional Win Probability" subtitle="Comparison vs base rate">
          <CondProbChart cp={cp} wr={A.win_rate} />
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'P(Win | Win)',  val: (cp.p11 * 100).toFixed(1) + '%', color: C.win },
              { label: 'P(Win | Loss)', val: (cp.p10 * 100).toFixed(1) + '%', color: C.loss },
              { label: 'Base Rate',     val: (A.win_rate * 100).toFixed(1) + '%', color: C.acc },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center', padding: '8px 4px', background: '#101a2c', borderRadius: 5, border: '1px solid #1a2d42' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: r.color, fontFamily: '"Share Tech Mono",monospace' }}>{r.val}</div>
                <div style={{ fontSize: 10, color: '#5a7a9a', marginTop: 3 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 2-step grid */}
      <Card title="2-Step Lookahead" subtitle="Given the last 2 signal results, win probability of the next signal">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {p2entries.map(([k, v]) => {
            const col = v.prob >= 0.6 ? C.win : v.prob >= 0.5 ? C.warn : C.loss
            const bits = k.split('').map((c, i) => (
              <span key={i} style={{ color: c === '1' ? C.win : C.loss }}>{c}</span>
            ))
            return (
              <div key={k} style={{ padding: '10px 12px', background: '#101a2c', borderRadius: 6, border: '1px solid #1a2d42' }}>
                <div style={{ fontSize: 12, color: '#5a7a9a', marginBottom: 4 }}>
                  Given:{' '}
                  <span style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: 15, letterSpacing: '.12em' }}>{bits}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: col, fontFamily: '"Share Tech Mono",monospace' }}>
                  {(v.prob * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: 10, color: '#5a7a9a' }}>{v.wins}/{v.count} observations</div>
                <MiniBar rate={v.prob * 100} color={col} />
              </div>
            )
          })}
        </div>
      </Card>

    </div>
  )
}

function MatrixCell({ value, count, color }) {
  return (
    <div style={{
      textAlign: 'center', padding: '10px 8px',
      background: color + '14', borderRadius: 6,
      border: `1px solid ${color}33`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: '"Share Tech Mono",monospace' }}>
        {(value * 100).toFixed(1)}%
      </div>
      <div style={{ fontSize: 11, color: '#5a7a9a' }}>{count} cases</div>
    </div>
  )
}
