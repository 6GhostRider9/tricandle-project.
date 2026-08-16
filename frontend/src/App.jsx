import { useStore } from './store/useStore'
import Header  from './components/Header'
import Sidebar from './components/Sidebar'

import SetupTab       from './components/tabs/SetupTab'
import OverviewTab    from './components/tabs/OverviewTab'
import SignalsTab     from './components/tabs/SignalsTab'
import PatternsTab    from './components/tabs/PatternsTab'
import ProbabilityTab from './components/tabs/ProbabilityTab'
import StreaksTab     from './components/tabs/StreaksTab'
import MultiTFTab     from './components/tabs/MultiTFTab'

export default function App() {
  const { activeTab } = useStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: '"Rajdhani", sans-serif' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <main style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#06090f' }}>
          {activeTab === 'setup'       && <SetupTab />}
          {activeTab === 'overview'    && <OverviewTab />}
          {activeTab === 'signals'     && <SignalsTab />}
          {activeTab === 'patterns'    && <PatternsTab />}
          {activeTab === 'probability' && <ProbabilityTab />}
          {activeTab === 'streaks'     && <StreaksTab />}
          {activeTab === 'multi'       && <MultiTFTab />}
        </main>
      </div>
    </div>
  )
}
