import { useStore } from '../store/useStore'
import { exportCSV } from '../api'

const TABS = [
  { id:'setup',       label:'Setup' },
  { id:'overview',    label:'Overview' },
  { id:'signals',     label:'Signals' },
  { id:'patterns',    label:'Patterns' },
  { id:'probability', label:'Probability' },
  { id:'streaks',     label:'Streaks' },
  { id:'multi',       label:'Multi-TF' },
]

export default function Header() {
  const { activeTab, setActiveTab, analysis, form } = useStore()
  const wr    = analysis ? (analysis.win_rate * 100).toFixed(1) + '%' : null
  const wrCol = analysis ? (analysis.win_rate >= 0.5 ? '#22c55e' : '#ef4444') : '#e8f4ff'

  return (
    <header style={{
      background:'#080f1c', borderBottom:'1px solid #1a2d42',
      height:52, flexShrink:0,
      display:'flex', alignItems:'center',
      paddingLeft:20, paddingRight:20, gap:12,
    }}>
      {/* Logo */}
      <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <div style={{
          width:30,height:30,borderRadius:6,
          background:'rgba(56,189,248,.12)',border:'1px solid rgba(56,189,248,.4)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:15,color:'#38bdf8',fontWeight:700,
        }}>▲</div>
        <div>
          <div style={{fontSize:16,fontWeight:700,letterSpacing:'.08em',lineHeight:1,color:'#e8f4ff'}}>TRICANDLE</div>
          <div style={{fontSize:9,color:'#4a7090',letterSpacing:'.1em'}}>3-CANDLE PRICE ACTION INTELLIGENCE</div>
        </div>
      </div>

      {/* Tabs */}
      <nav style={{display:'flex',gap:1,marginLeft:12}}>
        {TABS.map(t=>{
          const isActive = activeTab===t.id
          const canClick = analysis||t.id==='setup'
          return (
            <button key={t.id} onClick={()=>canClick&&setActiveTab(t.id)} style={{
              padding:'7px 15px',
              background:'transparent', border:'none',
              borderBottom:`2px solid ${isActive?'#38bdf8':'transparent'}`,
              color: isActive?'#e8f4ff':canClick?'#8ab4cc':'#2e5070',
              fontSize:13,
              fontFamily:'"Rajdhani",sans-serif',
              fontWeight: isActive?700:500,
              cursor: canClick?'pointer':'not-allowed',
              letterSpacing:'.03em',
              transition:'color .15s,border-color .15s',
            }}>{t.label}</button>
          )
        })}
      </nav>

      <div style={{flex:1}}/>

      {analysis && (
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Pill label="WIN RATE"   value={wr}                  valueColor={wrCol}  />
          <Pill label="SIGNALS"    value={analysis.total}       valueColor="#38bdf8"/>
          <Pill label="INSTRUMENT" value={form.instrument}      valueColor="#818cf8"/>
          <button onClick={()=>exportCSV(analysis,form.instrument)} style={{
            padding:'5px 13px',
            background:'rgba(56,189,248,.1)',
            border:'1px solid rgba(56,189,248,.35)',
            color:'#38bdf8', borderRadius:5,
            fontSize:13, fontFamily:'"Rajdhani",sans-serif',
            fontWeight:600, cursor:'pointer',
          }}>↓ Export CSV</button>
        </div>
      )}
    </header>
  )
}

function Pill({ label, value, valueColor }) {
  return (
    <div style={{
      display:'flex',gap:7,padding:'4px 11px',
      background:'#0d1f35',border:'1px solid #2e5070',
      borderRadius:5,fontSize:11,
    }}>
      <span style={{color:'#4a7090',fontWeight:600,letterSpacing:'.06em'}}>{label}</span>
      <span style={{fontFamily:'"Share Tech Mono",monospace',fontWeight:700,color:valueColor}}>{value}</span>
    </div>
  )
}
