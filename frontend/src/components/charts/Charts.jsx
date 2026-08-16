import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  Cell, Legend,
} from 'recharts'

// ─── colours ─────────────────────────────────────────────────────────────────
export const C = {
  win:  '#22c55e', loss: '#ef4444', acc: '#38bdf8',
  acc2: '#818cf8', warn: '#f59e0b', t2: '#9ab8d0',
  t3: '#5a7a9a', grid: 'rgba(26,45,66,.6)',
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color, sub, mini = false }) {
  return (
    <div style={{
      background: '#0d1625', border: '1px solid #1a2d42',
      borderRadius: 7, padding: mini ? '10px 12px' : '12px 14px',
    }}>
      <div style={{ fontSize: 10, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{
        fontSize: mini ? 18 : 22, fontWeight: 700,
        fontFamily: '"Share Tech Mono", monospace',
        color: color || '#e2edf8', lineHeight: 1.1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ab8d0', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
export function Card({ children, title, subtitle, style = {} }) {
  return (
    <div style={{
      background: '#0d1625', border: '1px solid #1a2d42',
      borderRadius: 8, padding: 16, ...style,
    }}>
      {title && (
        <div style={{ marginBottom: subtitle ? 3 : 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9ab8d0' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: '#5a7a9a', marginTop: 2, marginBottom: 10 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── MiniBar ─────────────────────────────────────────────────────────────────
export function MiniBar({ rate, color, height = 5 }) {
  return (
    <div style={{ height, background: '#162038', borderRadius: 3, overflow: 'hidden', marginTop: 5 }}>
      <div style={{ height: '100%', width: `${Math.min(rate, 100)}%`, background: color, borderRadius: 3, transition: 'width .4s' }} />
    </div>
  )
}

// ─── PatternBar ──────────────────────────────────────────────────────────────
export function PatternBar({ label, wins, total, rate }) {
  const col = rate >= 60 ? C.win : rate >= 50 ? C.warn : C.loss
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
        <span style={{ color: '#9ab8d0', fontFamily: '"Share Tech Mono",monospace', fontSize: 12 }}>{label}</span>
        <span style={{ color: col, fontFamily: '"Share Tech Mono",monospace', fontWeight: 700 }}>
          {rate.toFixed(1)}% ({wins}/{total})
        </span>
      </div>
      <MiniBar rate={rate} color={col} />
    </div>
  )
}

// ─── shared tooltip ───────────────────────────────────────────────────────────
const TT = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#101a2c', border: '1px solid #243d56',
      borderRadius: 6, padding: '8px 12px', fontSize: 12,
    }}>
      {label !== undefined && <div style={{ color: '#5a7a9a', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#e2edf8', marginBottom: 2 }}>
          {p.name}: <strong>{fmt ? fmt(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// ─── WinLoss bar chart ────────────────────────────────────────────────────────
export function WinLossChart({ wins, losses }) {
  const data = [
    { name: 'Wins',   value: wins,   fill: C.win },
    { name: 'Losses', value: losses, fill: C.loss },
  ]
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={44}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
        <XAxis dataKey="name" tick={{ fill: '#a0bcd4', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6a90a8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<TT fmt={v => `${v} signals`} />} />
        <Bar dataKey="value" radius={[4,4,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.fill + 'cc'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Equity curve ─────────────────────────────────────────────────────────────
export function EquityChart({ equity }) {
  const step = Math.max(1, Math.floor(equity.length / 250))
  const data = equity
    .filter((_, i) => i % step === 0 || i === equity.length - 1)
    .map((y, x) => ({ x, y }))

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
        <XAxis dataKey="x" hide />
        <YAxis tick={{ fill: '#6a90a8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <ReferenceLine y={0} stroke={C.t3} strokeDasharray="4 4" />
        <Tooltip content={<TT fmt={v => `P&L: ${v}`} />} />
        <Line type="monotone" dataKey="y" stroke={C.acc} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Rolling win rate ─────────────────────────────────────────────────────────
export function RollingWRChart({ rolling }) {
  const step = Math.max(1, Math.floor(rolling.length / 150))
  const data = rolling
    .filter((_, i) => i % step === 0 || i === rolling.length - 1)
    .map((y, x) => ({ x, y }))

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
        <XAxis dataKey="x" hide />
        <YAxis domain={[0, 100]} tick={{ fill: '#6a90a8', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => v + '%'} />
        <ReferenceLine y={50} stroke={C.warn} strokeDasharray="4 4" />
        <Tooltip content={<TT fmt={v => v + '%'} />} />
        <Line type="monotone" dataKey="y" stroke={C.acc2} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Conditional probability bar ──────────────────────────────────────────────
export function CondProbChart({ cp, wr }) {
  const data = [
    { name: 'After WIN',  value: +(cp.p11 * 100).toFixed(1), fill: C.win },
    { name: 'After LOSS', value: +(cp.p10 * 100).toFixed(1), fill: C.loss },
    { name: 'Base Rate',  value: +(wr * 100).toFixed(1),      fill: C.acc },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={50}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
        <XAxis dataKey="name" tick={{ fill: '#a0bcd4', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#6a90a8', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => v + '%'} />
        <Tooltip content={<TT fmt={v => v + '%'} />} />
        <Bar dataKey="value" radius={[4,4,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.fill + 'cc'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Streak distribution ──────────────────────────────────────────────────────
export function StreakDistChart({ dist }) {
  const data = dist.labels.map((k, i) => ({
    streak: k,
    Wins:   dist.win_counts[i],
    Losses: dist.loss_counts[i],
  }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
        <XAxis dataKey="streak" tick={{ fill: '#6a90a8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6a90a8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<TT />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9ab8d0' }} />
        <Bar dataKey="Wins"   fill={C.win + 'aa'} radius={[2,2,0,0]} />
        <Bar dataKey="Losses" fill={C.loss + 'aa'} radius={[2,2,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
