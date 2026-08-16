import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { C } from '../charts/Charts'

export default function SignalsTab() {
  const { analysis } = useStore()
  const [filter, setFilter] = useState('all') // all | win | loss
  const [patFilter, setPatFilter] = useState('all')
  if (!analysis) return null

  const sigs = analysis.signals || []
  const patterns = [...new Set(sigs.map(s => s.pattern))]

  const filtered = sigs.filter(s => {
    const rf = filter === 'all' || (filter === 'win' ? s.result === 1 : s.result === 0)
    const pf = patFilter === 'all' || s.pattern === patFilter
    return rf && pf
  })

  const last50 = [...sigs].slice(-50)

  return (
    <div className="fade-up">

      {/* Signal badge strip */}
      <div style={{
        background: '#0b1220', border: '1px solid #1a2d42',
        borderRadius: 8, padding: 14, marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
          Last 50 Signals
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {last50.map((s, i) => {
            const col = s.result === 1 ? C.win : C.loss
            return (
              <div key={i} style={{
                width: 18, height: 18, borderRadius: 3,
                background: col + '22', border: `1px solid ${col}`,
                color: col, fontSize: 11, fontWeight: 700,
                fontFamily: '"Share Tech Mono",monospace',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.result}</div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: '#5a7a9a', marginRight: 4 }}>Filter:</div>
        {['all', 'win', 'loss'].map(f => (
          <FBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'win' ? '▲ Wins' : '▼ Losses'}
          </FBtn>
        ))}
        <div style={{ width: 1, height: 20, background: '#1a2d42', margin: '0 4px' }} />
        <FBtn active={patFilter === 'all'} onClick={() => setPatFilter('all')}>All Patterns</FBtn>
        {patterns.map(p => (
          <FBtn key={p} active={patFilter === p} onClick={() => setPatFilter(p)}>{p}</FBtn>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#5a7a9a' }}>{filtered.length} signals shown</span>
      </div>

      {/* Table */}
      <div style={{ background: '#0b1220', border: '1px solid #1a2d42', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '52px 130px 1fr 110px 90px',
          gap: 8, padding: '8px 16px',
          borderBottom: '1px solid #1a2d42',
          fontSize: 10, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.07em',
        }}>
          <span>#</span><span>Date</span><span>Pattern</span><span>Variant</span><span>Result</span>
        </div>
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {[...filtered].reverse().map((s, i) => {
            const col = s.result === 1 ? C.win : C.loss
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '52px 130px 1fr 110px 90px',
                gap: 8, padding: '8px 16px',
                borderBottom: '1px solid rgba(26,45,66,.4)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(16,26,44,.3)',
                fontSize: 12,
              }}>
                <span style={{ color: '#5a7a9a', fontFamily: '"Share Tech Mono",monospace' }}>
                  {filtered.length - i}
                </span>
                <span style={{ color: '#9ab8d0', fontFamily: '"Share Tech Mono",monospace', fontSize: 11 }}>
                  {s.date || '—'}
                </span>
                <span style={{ color: '#e2edf8' }}>{s.pattern}</span>
                <span style={{ color: '#5a7a9a', fontSize: 11 }}>{s.variant}</span>
                <span style={{ color: col, fontFamily: '"Share Tech Mono",monospace', fontWeight: 700 }}>
                  {s.result === 1 ? '▲ WIN' : '▼ LOSS'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 10px', borderRadius: 5,
      border: `1px solid ${active ? '#38bdf8' : '#1a2d42'}`,
      background: active ? 'rgba(56,189,248,.1)' : 'transparent',
      color: active ? '#38bdf8' : '#9ab8d0',
      fontSize: 12, fontFamily: '"Rajdhani",sans-serif',
      cursor: 'pointer',
    }}>{children}</button>
  )
}
