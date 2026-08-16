import { useStore } from '../../store/useStore'
import {
  StatCard, Card, PatternBar,
  WinLossChart, EquityChart, RollingWRChart, C,
} from '../charts/Charts'

export default function OverviewTab() {
  const { analysis, form } = useStore()
  if (!analysis) return null

  const A = analysis
  const wr = (A.win_rate * 100).toFixed(1)
  const wrColor = A.win_rate >= 0.5 ? C.win : C.loss
  const pf = A.profit_factor === Infinity ? '∞' : A.profit_factor

  return (
    <div className="fade-up">

      {/* Top stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        <StatCard label="Total Signals" value={A.total}      sub={`${A.candle_count || '—'} candles processed`} />
        <StatCard label="Win Rate"      value={wr + '%'}     color={wrColor}  sub={`${A.wins}W  /  ${A.losses}L`} />
        <StatCard label="Profit Factor" value={pf}           color={A.profit_factor >= 1.5 ? C.win : A.profit_factor >= 1 ? C.warn : C.loss} sub="Gross wins ÷ gross losses" />
        <StatCard label="Max Drawdown"  value={'-' + A.max_drawdown} color={C.loss} sub="Peak to trough loss" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        <StatCard label="Expected Value" value={A.expected_value} color={A.expected_value >= 0 ? C.win : C.loss} sub="Per signal (1:1 RR)" />
        <StatCard label="Last 10"  value={A.recent_10 + '%'} color={A.recent_10 >= 50 ? C.win : C.loss} sub="Recent 10 signals" />
        <StatCard label="Last 20"  value={A.recent_20 + '%'} color={A.recent_20 >= 50 ? C.win : C.loss} sub="Recent 20 signals" />
        <StatCard label="Last 50"  value={A.recent_50 + '%'} color={A.recent_50 >= 50 ? C.win : C.loss} sub="Recent 50 signals" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 14 }}>
        <Card title="Win / Loss Split">
          <WinLossChart wins={A.wins} losses={A.losses} />
        </Card>
        <Card title="Equity Curve (Cumulative P&L)" subtitle="Running total of wins minus losses">
          <EquityChart equity={A.equity_curve} />
        </Card>
      </div>

      {/* Rolling win rate */}
      <Card title="Rolling 20-Period Win Rate" subtitle="Smoothed performance trend — dashed line = 50% baseline" style={{ marginBottom: 14 }}>
        <RollingWRChart rolling={A.rolling_wr} />
      </Card>

      {/* Pattern performance */}
      <Card title="Performance by Pattern Type">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {A.pattern_perf.map(p => (
            <PatternBar key={p.label} label={p.label} wins={p.wins} total={p.total} rate={p.rate} />
          ))}
        </div>
      </Card>

    </div>
  )
}
