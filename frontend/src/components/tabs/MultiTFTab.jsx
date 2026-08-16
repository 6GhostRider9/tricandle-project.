import { useStore } from '../../store/useStore'
import { C, MiniBar } from '../charts/Charts'

const TF_ORDER = ['M1','M5','M15','M30','H1','H4','H12','D','W','M']

export default function MultiTFTab() {
  const { analysis } = useStore()
  if (!analysis?._multiTf) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#5a7a9a' }}>
      Run analysis with "Analyze all timeframes" checked to see this view.
    </div>
  )

  const tfs = analysis.timeframes || {}

  // Sort by TF order
  const entries = TF_ORDER
    .filter(tf => tfs[tf])
    .map(tf => ({ tf, data: tfs[tf] }))

  const valid = entries.filter(e => !e.data.error && e.data.total)

  return (
    <div className="fade-up">

      <div style={{ fontSize: 13, color: '#9ab8d0', marginBottom: 16 }}>
        Instrument: <strong style={{ color: '#e2edf8' }}>{analysis.instrument}</strong> — All timeframes analysed simultaneously
      </div>

      {/* Summary table */}
      <div style={{ background: '#0b1220', border: '1px solid #1a2d42', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '70px 90px 70px 70px 80px 100px 1fr 80px',
          gap: 8, padding: '9px 16px',
          borderBottom: '1px solid #1a2d42',
          fontSize: 10, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.07em',
        }}>
          <span>TF</span><span>Signals</span><span>Wins</span><span>Losses</span>
          <span>Win Rate</span><span>Prof. Factor</span><span>Win Rate Bar</span><span>Exp. Val</span>
        </div>

        {entries.map(({ tf, data }) => {
          if (data.error) {
            return (
              <div key={tf} style={{
                display: 'grid', gridTemplateColumns: '70px 1fr',
                gap: 8, padding: '8px 16px',
                borderBottom: '1px solid rgba(26,45,66,.4)',
                fontSize: 12, color: '#ef4444',
              }}>
                <span style={{ fontFamily: '"Share Tech Mono",monospace', color: '#38bdf8' }}>{tf}</span>
                <span style={{ fontSize: 11 }}>Error: {data.error}</span>
              </div>
            )
          }
          const wr = (data.win_rate * 100).toFixed(1)
          const wrColor = data.win_rate >= 0.5 ? C.win : C.loss
          const pf = data.profit_factor === Infinity ? '∞' : data.profit_factor
          const ev = data.expected_value
          return (
            <div key={tf} style={{
              display: 'grid', gridTemplateColumns: '70px 90px 70px 70px 80px 100px 1fr 80px',
              gap: 8, padding: '8px 16px',
              borderBottom: '1px solid rgba(26,45,66,.4)',
              fontSize: 12,
            }}>
              <span style={{
                fontFamily: '"Share Tech Mono",monospace',
                color: '#38bdf8', fontWeight: 700,
              }}>{tf}</span>
              <span style={{ fontFamily: '"Share Tech Mono",monospace' }}>{data.total}</span>
              <span style={{ color: C.win }}>{data.wins}</span>
              <span style={{ color: C.loss }}>{data.losses}</span>
              <span style={{ color: wrColor, fontFamily: '"Share Tech Mono",monospace', fontWeight: 700 }}>{wr}%</span>
              <span style={{ color: data.profit_factor >= 1.5 ? C.win : data.profit_factor >= 1 ? C.warn : C.loss, fontFamily: '"Share Tech Mono",monospace' }}>{pf}</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}><MiniBar rate={+wr} color={wrColor} height={6} /></div>
              </div>
              <span style={{ color: ev >= 0 ? C.win : C.loss, fontFamily: '"Share Tech Mono",monospace' }}>{ev}</span>
            </div>
          )
        })}
      </div>

      {/* Best TF highlight */}
      {valid.length > 0 && (() => {
        const best = [...valid].sort((a, b) => b.data.win_rate - a.data.win_rate)[0]
        const worst = [...valid].sort((a, b) => a.data.win_rate - b.data.win_rate)[0]
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <TFHighlight
              title="Best Timeframe"
              tf={best.tf}
              wr={(best.data.win_rate * 100).toFixed(1)}
              total={best.data.total}
              color={C.win}
            />
            <TFHighlight
              title="Worst Timeframe"
              tf={worst.tf}
              wr={(worst.data.win_rate * 100).toFixed(1)}
              total={worst.data.total}
              color={C.loss}
            />
            <div style={{ padding: '14px 16px', background: '#0b1220', border: '1px solid #1a2d42', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
                Timeframes Analysed
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: '"Share Tech Mono",monospace', color: C.acc }}>{valid.length}</div>
              <div style={{ fontSize: 11, color: '#9ab8d0', marginTop: 4 }}>out of {entries.length} attempted</div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}

function TFHighlight({ title, tf, wr, total, color }) {
  return (
    <div style={{ padding: '14px 16px', background: '#0b1220', border: `1px solid ${color}44`, borderRadius: 8, borderTop: `2px solid ${color}` }}>
      <div style={{ fontSize: 11, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: '"Share Tech Mono",monospace', color: C.acc }}>{tf}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: '"Share Tech Mono",monospace', color, marginTop: 4 }}>{wr}%</div>
      <div style={{ fontSize: 11, color: '#9ab8d0', marginTop: 4 }}>{total} signals</div>
    </div>
  )
}
