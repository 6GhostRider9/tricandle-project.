import { useStore } from '../../store/useStore'
import { StatCard, Card, StreakDistChart, C } from '../charts/Charts'

export default function StreaksTab() {
  const { analysis } = useStore()
  if (!analysis) return null
  const A = analysis

  const after3w = A.after_3_wins
  const after3l = A.after_3_losses

  return (
    <div className="fade-up">

      {/* Streak stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        <StatCard label="Max Win Streak"  value={A.max_win_streak}  color={C.win}  sub="Longest consecutive wins" />
        <StatCard label="Avg Win Streak"  value={A.avg_win_streak}  color={C.win}  sub="Average win run length" />
        <StatCard label="Max Loss Streak" value={A.max_loss_streak} color={C.loss} sub="Longest consecutive losses" />
        <StatCard label="Avg Loss Streak" value={A.avg_loss_streak} color={C.loss} sub="Average loss run length" />
      </div>

      {/* Distribution chart */}
      <Card
        title="Streak Length Distribution"
        subtitle="How many times each streak length occurred across all signals"
        style={{ marginBottom: 14 }}
      >
        <StreakDistChart dist={A.streak_dist} />
      </Card>

      {/* Conditional after-streak probability */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card>
          <div style={{ fontSize: 12, color: '#9ab8d0', marginBottom: 8 }}>After 3 consecutive wins</div>
          <div style={{
            fontSize: 44, fontWeight: 700, lineHeight: 1,
            color: C.win, fontFamily: '"Share Tech Mono",monospace',
          }}>
            {after3w !== null ? after3w + '%' : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#5a7a9a', marginTop: 6 }}>P(Next Win | 3-in-a-row win streak)</div>
          <AfterNote val={after3w} base={A.win_rate * 100} type="win" />
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: '#9ab8d0', marginBottom: 8 }}>After 3 consecutive losses</div>
          <div style={{
            fontSize: 44, fontWeight: 700, lineHeight: 1,
            color: C.loss, fontFamily: '"Share Tech Mono",monospace',
          }}>
            {after3l !== null ? after3l + '%' : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#5a7a9a', marginTop: 6 }}>P(Next Win | 3-in-a-row loss streak)</div>
          <AfterNote val={after3l} base={A.win_rate * 100} type="loss" />
        </Card>
      </div>

      {/* Streak insight */}
      <Card title="Streak Insights">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Insight
            label="Longest Win Run"
            value={A.max_win_streak + ' in a row'}
            color={C.win}
            desc={`The best consecutive run of winning signals in the dataset.`}
          />
          <Insight
            label="Longest Loss Run"
            value={A.max_loss_streak + ' in a row'}
            color={C.loss}
            desc={`Maximum drawdown period by signal count. Requires ${A.max_loss_streak + 1} wins to recover at 1:1 RR.`}
          />
          <Insight
            label="Win Clustering"
            value={A.avg_win_streak >= 2 ? 'Yes' : 'No'}
            color={A.avg_win_streak >= 2 ? C.win : C.t2}
            desc={`Average win streak is ${A.avg_win_streak}. ${A.avg_win_streak >= 2 ? 'Wins tend to come in runs — trade with the flow.' : 'Wins are fairly isolated — no strong clustering.'}`}
          />
          <Insight
            label="Loss Clustering"
            value={A.avg_loss_streak >= 2 ? 'Yes' : 'No'}
            color={A.avg_loss_streak >= 2 ? C.loss : C.t2}
            desc={`Average loss streak is ${A.avg_loss_streak}. ${A.avg_loss_streak >= 2 ? 'Losses also cluster — consider pausing after 2+ losses.' : 'Losses are isolated — unlikely to see long losing runs.'}`}
          />
        </div>
      </Card>

    </div>
  )
}

function AfterNote({ val, base, type }) {
  if (val === null) return null
  const diff = (val - base).toFixed(1)
  const better = type === 'win' ? val >= base : val >= base
  const col = better ? C.win : C.loss
  const sign = diff >= 0 ? '+' : ''
  return (
    <div style={{ marginTop: 8, fontSize: 12, color: col }}>
      {sign}{diff}% vs base rate of {base.toFixed(1)}%
    </div>
  )
}

function Insight({ label, value, color, desc }) {
  return (
    <div style={{ padding: '12px 14px', background: '#101a2c', borderRadius: 6, border: '1px solid #1a2d42' }}>
      <div style={{ fontSize: 11, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: '"Share Tech Mono",monospace', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9ab8d0', lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}
