import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useStore } from '../store/useStore'
import { uploadCSV, fetchOanda, fetchOandaAll } from '../api'

const PAIRS = {
  Majors:  ['EUR_USD','GBP_USD','USD_JPY','USD_CHF','AUD_USD','USD_CAD','NZD_USD'],
  Crosses: ['EUR_GBP','EUR_JPY','EUR_CHF','GBP_JPY','GBP_AUD','AUD_JPY','CAD_JPY','CHF_JPY'],
  Metals:  ['XAU_USD','XAG_USD','XPT_USD','XPD_USD'],
  Indices: ['US30_USD','SPX500_USD','NAS100_USD','UK100_GBP'],
  Crypto:  ['BTC_USD','ETH_USD','LTC_USD'],
}

const TIMEFRAMES = [
  {id:'M1',label:'M1'},{id:'M5',label:'M5'},{id:'M15',label:'M15'},
  {id:'M30',label:'M30'},{id:'H1',label:'H1'},{id:'H4',label:'H4'},
  {id:'H12',label:'H12'},{id:'D',label:'D'},{id:'W',label:'W'},{id:'M',label:'MN'},
]

const inp = {
  background: '#0d1f35',
  border: '1px solid #2e5070',
  color: '#e8f4ff',
  borderRadius: 6,
  padding: '8px 11px',
  fontSize: 14,
  fontFamily: '"Rajdhani", sans-serif',
  width: '100%',
  outline: 'none',
  letterSpacing: '.01em',
}

function Lbl({ children }) {
  return (
    <div style={{ fontSize:11, color:'#7da0ba', textTransform:'uppercase', letterSpacing:'.09em', marginBottom:7, fontWeight:600 }}>
      {children}
    </div>
  )
}

function ToggleBtn({ active, onClick, children, color }) {
  const ac = color || '#38bdf8'
  return (
    <button onClick={onClick} style={{
      flex:1, padding:'8px 0',
      background: active ? `${ac}18` : '#0d1f35',
      border: `1px solid ${active ? ac : '#2e5070'}`,
      color: active ? ac : '#a0bcd4',
      borderRadius:6, fontSize:13,
      fontFamily:'"Rajdhani",sans-serif',
      fontWeight: active ? 700 : 500,
      cursor:'pointer', transition:'all .15s',
      letterSpacing:'.02em',
    }}>{children}</button>
  )
}

function SmallBtn({ onClick, children, danger }) {
  return (
    <button onClick={onClick} style={{
      padding:'2px 8px', borderRadius:4, cursor:'pointer',
      border:`1px solid ${danger?'#ef444466':'#2e5070'}`,
      background: danger?'rgba(239,68,68,.08)':'transparent',
      color: danger?'#ef4444':'#7da0ba',
      fontSize:11, fontFamily:'"Rajdhani",sans-serif',
    }}>{children}</button>
  )
}

export default function Sidebar() {
  const fileRef = useRef()
  const [running, setRunning]   = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showKey, setShowKey]   = useState(false)

  const { form, setForm, setAnalysis, setActiveTab, pipeline, setPipeline, resetPipeline } = useStore()

  async function run() {
    if (running) return
    setRunning(true)
    resetPipeline()
    setAnalysis(null)
    try {
      let result
      if (form.source === 'csv') {
        if (!form.csvFile) throw new Error('Please upload a CSV file first.')
        setPipeline('fetch','loading')
        result = await uploadCSV(form.csvFile)
        setPipeline('fetch','success')
      } else {
        if (!form.apiKey.trim()) throw new Error('OANDA API key is required.')
        setPipeline('fetch','loading')
        if (form.allTf) {
          result = await fetchOandaAll({ apiKey:form.apiKey, instrument:form.instrument, count:form.count, accountType:form.accountType })
          setPipeline('fetch','success'); setPipeline('clean','success')
          setPipeline('predict','success'); setPipeline('analyze','success')
          setAnalysis({ _multiTf:true, ...result })
          setActiveTab('multi')
          toast.success(`All-TF analysis complete for ${form.instrument}`)
          return
        }
        result = await fetchOanda({ apiKey:form.apiKey, instrument:form.instrument, granularity:form.granularity, count:form.count, accountType:form.accountType })
        setPipeline('fetch','success')
      }
      setPipeline('clean','success'); setPipeline('predict','success'); setPipeline('analyze','success')
      setAnalysis(result)
      setActiveTab('overview')
      toast.success(`Analysis complete — ${result.total} signals on ${form.instrument}`)
    } catch (e) {
      ['fetch','clean','predict','analyze'].forEach(k => { if (pipeline[k]==='loading') setPipeline(k,'error') })
      toast.error(e.message || 'Unknown error')
    } finally {
      setRunning(false)
    }
  }

  function handleFile(file) {
    if (!file) return
    if (!file.name.match(/\.(csv|txt)$/i)) { toast.error('Only .csv / .txt files'); return }
    setForm({ csvFile:file, csvName:file.name })
    toast.success(`Loaded: ${file.name}`)
  }

  return (
    <aside style={{
      width:280, flexShrink:0,
      background:'#080f1c', borderRight:'1px solid #1a2d42',
      display:'flex', flexDirection:'column', gap:16,
      padding:'16px 14px', overflowY:'auto',
    }}>

      {/* Source */}
      <div>
        <Lbl>Data Source</Lbl>
        <div style={{display:'flex',gap:5}}>
          <ToggleBtn active={form.source==='api'} onClick={()=>setForm({source:'api'})}>OANDA API</ToggleBtn>
          <ToggleBtn active={form.source==='csv'} onClick={()=>setForm({source:'csv'})}>CSV Upload</ToggleBtn>
        </div>
      </div>

      {/* ── OANDA ── */}
      {form.source==='api' && <>
        <div>
          <Lbl>Account Type</Lbl>
          <div style={{display:'flex',gap:5}}>
            <ToggleBtn active={form.accountType==='live'}     onClick={()=>setForm({accountType:'live'})}>Live</ToggleBtn>
            <ToggleBtn active={form.accountType==='practice'} onClick={()=>setForm({accountType:'practice'})} color="#818cf8">Practice</ToggleBtn>
          </div>
        </div>

        {/* API Key – persistent */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
            <Lbl>OANDA API Token</Lbl>
            <div style={{display:'flex',gap:5}}>
              <SmallBtn onClick={()=>setShowKey(v=>!v)}>{showKey?'Hide':'Show'}</SmallBtn>
              {form.apiKey && <SmallBtn onClick={()=>{setForm({apiKey:''});toast('API key cleared',{icon:'🗑️'})}} danger>Clear</SmallBtn>}
            </div>
          </div>
          <input
            type={showKey?'text':'password'}
            placeholder="Paste your OANDA API token..."
            value={form.apiKey}
            onChange={e=>setForm({apiKey:e.target.value})}
            style={{...inp, fontFamily:'"Share Tech Mono",monospace', fontSize:12}}
          />
          <div style={{display:'flex',alignItems:'center',gap:5,marginTop:5}}>
            {form.apiKey
              ? <><span style={{fontSize:11,color:'#22c55e',fontWeight:600}}>● Saved</span>
                  <span style={{fontSize:11,color:'#3a5470'}}>— persists after restart</span></>
              : <span style={{fontSize:11,color:'#3a5470'}}>OANDA → My Account → Manage API Access</span>
            }
          </div>
        </div>

        {/* Instrument */}
        <div>
          <Lbl>Instrument</Lbl>
          <select value={form.instrument} onChange={e=>setForm({instrument:e.target.value})} style={inp}>
            {Object.entries(PAIRS).map(([grp,items])=>(
              <optgroup key={grp} label={grp} style={{background:'#0d1f35',color:'#7da0ba'}}>
                {items.map(p=><option key={p} value={p} style={{background:'#0d1f35',color:'#e8f4ff'}}>{p.replace('_','/')}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Timeframe */}
        <div>
          <Lbl>Timeframe</Lbl>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {TIMEFRAMES.map(tf=>{
              const active = form.granularity===tf.id && !form.allTf
              return (
                <button key={tf.id} onClick={()=>setForm({granularity:tf.id,allTf:false})} style={{
                  padding:'5px 9px', borderRadius:5,
                  border:`1px solid ${active?'#38bdf8':'#2e5070'}`,
                  background: active?'rgba(56,189,248,.15)':'#0d1f35',
                  color: active?'#38bdf8':'#a0bcd4',
                  fontSize:13, fontFamily:'"Share Tech Mono",monospace',
                  fontWeight: active?700:400, cursor:'pointer',
                }}>{tf.label}</button>
              )
            })}
          </div>
          <label style={{display:'flex',alignItems:'center',gap:8,marginTop:9,cursor:'pointer',fontSize:13,color:form.allTf?'#38bdf8':'#a0bcd4',fontWeight:form.allTf?600:400}}>
            <input type="checkbox" checked={form.allTf} onChange={e=>setForm({allTf:e.target.checked})}
              style={{accentColor:'#38bdf8',width:14,height:14}} />
            Analyze all timeframes
          </label>
        </div>

        {/* Count */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
            <Lbl>Candle Count</Lbl>
            <span style={{fontSize:14,color:'#38bdf8',fontFamily:'"Share Tech Mono",monospace',fontWeight:700}}>{form.count}</span>
          </div>
          <input type="range" min="50" max="5000" step="50" value={form.count}
            onChange={e=>setForm({count:+e.target.value})}
            style={{width:'100%',accentColor:'#38bdf8',background:'transparent',border:'none',padding:0,cursor:'pointer'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#3a5470',marginTop:2}}>
            <span>50</span><span>5000</span>
          </div>
        </div>
      </>}

      {/* ── CSV ── */}
      {form.source==='csv' && (
        <div>
          <Lbl>Upload OHLC CSV File</Lbl>
          <input type="file" ref={fileRef} accept=".csv,.txt" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
          <div
            onClick={()=>fileRef.current.click()}
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}}
            style={{
              border:`2px dashed ${dragOver?'#38bdf8':form.csvName?'#22c55e':'#2e5070'}`,
              borderRadius:8, padding:'20px 12px', textAlign:'center', cursor:'pointer',
              background: dragOver?'rgba(56,189,248,.06)':form.csvName?'rgba(34,197,94,.05)':'transparent',
            }}
          >
            <div style={{fontSize:26,marginBottom:7}}>{form.csvName?'✓':'📂'}</div>
            <div style={{fontSize:13,color:form.csvName?'#22c55e':'#a0bcd4',fontWeight:500}}>
              {form.csvName||'Drop CSV here or click to browse'}
            </div>
            <div style={{fontSize:11,color:'#3a5470',marginTop:5}}>Required: Date, Open, High, Low, Close</div>
          </div>
        </div>
      )}

      {/* Run button */}
      <button onClick={run} disabled={running} style={{
        width:'100%', padding:'12px 0', borderRadius:7, border:'none',
        background: running?'#162038':'linear-gradient(135deg,#38bdf8,#818cf8)',
        color: running?'#3a5470':'#000',
        fontSize:15, fontWeight:700, fontFamily:'"Rajdhani",sans-serif',
        letterSpacing:'.07em', cursor:running?'not-allowed':'pointer',
        boxShadow: running?'none':'0 0 22px rgba(56,189,248,.35)',
      }}>
        {running?'⟳  PROCESSING...':form.allTf?'▶ RUN ALL TIMEFRAMES':'▶ RUN ANALYSIS'}
      </button>

      <PipelinePanel pipeline={pipeline}/>
      <QuickStats/>
    </aside>
  )
}

function PipelinePanel({ pipeline }) {
  const steps = ['fetch','clean','predict','analyze']
  if (steps.every(k=>pipeline[k]==='idle')) return null
  const icons  = {idle:'○',loading:'◌',success:'●',error:'✕'}
  const colors = {idle:'#3a5470',loading:'#38bdf8',success:'#22c55e',error:'#ef4444'}
  const labels = {fetch:'Data Fetch',clean:'Cleaning',predict:'Prediction',analyze:'Analysis'}
  return (
    <div style={{padding:13,background:'#0d1f35',borderRadius:7,border:'1px solid #2e5070'}}>
      <div style={{fontSize:11,color:'#7da0ba',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10,fontWeight:600}}>Pipeline</div>
      {steps.map(k=>(
        <div key={k} style={{display:'flex',alignItems:'center',gap:9,fontSize:14,marginBottom:7}}>
          <span className={pipeline[k]==='loading'?'pulse-dot':''} style={{color:colors[pipeline[k]],fontSize:15,lineHeight:1}}>{icons[pipeline[k]]}</span>
          <span style={{color:colors[pipeline[k]],fontWeight:pipeline[k]==='success'?600:400}}>{labels[k]}</span>
          {pipeline[k]==='loading'&&<span style={{fontSize:12,color:'#3a5470'}}>processing...</span>}
        </div>
      ))}
    </div>
  )
}

function QuickStats() {
  const { analysis } = useStore()
  if (!analysis||analysis._multiTf) return null
  const wr = (analysis.win_rate*100).toFixed(1)
  const rows = [
    {label:'Signals',     val:analysis.total},
    {label:'Win Rate',    val:wr+'%',  color:analysis.win_rate>=0.5?'#22c55e':'#ef4444'},
    {label:'Prof. Factor',val:analysis.profit_factor===Infinity?'∞':analysis.profit_factor,
     color:analysis.profit_factor>=1.5?'#22c55e':analysis.profit_factor>=1?'#f59e0b':'#ef4444'},
    {label:'Max DD',      val:'-'+analysis.max_drawdown, color:'#ef4444'},
    {label:'Exp. Value',  val:analysis.expected_value, color:analysis.expected_value>=0?'#22c55e':'#ef4444'},
  ]
  return (
    <div style={{padding:13,background:'rgba(56,189,248,.05)',borderRadius:7,border:'1px solid rgba(56,189,248,.2)'}}>
      <div style={{fontSize:11,color:'#38bdf8',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10,fontWeight:600}}>Quick Summary</div>
      {rows.map(r=>(
        <div key={r.label} style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:6}}>
          <span style={{color:'#a0bcd4'}}>{r.label}</span>
          <span style={{fontFamily:'"Share Tech Mono",monospace',fontWeight:700,color:r.color||'#e8f4ff'}}>{r.val}</span>
        </div>
      ))}
    </div>
  )
}
