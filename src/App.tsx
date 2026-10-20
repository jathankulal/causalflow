import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BookOpen, CheckCircle2, FileSearch, FlaskConical, LayoutDashboard, RotateCcw, Settings as SettingsIcon, Waypoints,
} from 'lucide-react'
import { FINAL_CHECKS, INITIAL_MEMORIES, PRECONDITION_STEPS, REPO, TRIALS } from './data'
import type { DemoSettings, MemoryEntry, Phase, Trial, View } from './types'
import Overview from './components/Overview'
import Investigation from './components/Investigation'
import Memory from './components/Memory'
import Reports, { HtmlReport } from './components/Reports'
import Settings from './components/Settings'
import TrialDrawer from './components/TrialDrawer'

const DEFAULT_SETTINGS: DemoSettings = {
  autoAdvance: false,
  speed: 'normal',
  showTrustPanel: true,
  compactTrials: false,
}

const VIEW_TITLES: Record<View, string> = {
  overview: 'Overview',
  investigations: 'Investigations',
  memory: 'Project Memory',
  reports: 'Evidence Reports',
  settings: 'Settings',
  'html-report': 'HTML Report',
}

export default function App() {
  const [view, setView] = useState<View>('overview')
  const [phase, setPhase] = useState<Phase>('idle')
  const [verifyStep, setVerifyStep] = useState(0)
  const [trialCount, setTrialCount] = useState(0)
  const [finalStep, setFinalStep] = useState(0)
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES)
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null)
  const [settings, setSettings] = useState<DemoSettings>(DEFAULT_SETTINGS)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3200)
  }, [])

  const navigate = useCallback((v: View) => setView(v), [])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [view])

  const stepMs = settings.speed === 'fast' ? 280 : 680
  const trialMs = settings.speed === 'fast' ? 220 : 540
  const finalMs = settings.speed === 'fast' ? 240 : 600

  /* ---- simulated progress state machines (no commands are executed) ---- */
  useEffect(() => {
    if (phase !== 'verifying') return
    const t = window.setTimeout(() => {
      const next = verifyStep + 1
      setVerifyStep(next)
      if (next >= PRECONDITION_STEPS.length) {
        setPhase('preconditions_met')
        notify('Preconditions satisfied (simulated): baseline PASS, full set TARGET_FAILURE')
      }
    }, stepMs)
    return () => window.clearTimeout(t)
  }, [phase, verifyStep, stepMs, notify])

  useEffect(() => {
    if (phase !== 'trialing') return
    const t = window.setTimeout(() => {
      const next = trialCount + 1
      setTrialCount(next)
      if (next >= TRIALS.length) {
        setPhase('trials_complete')
        notify('All 8 combinations evaluated — reduced reproducing set: A + B')
      }
    }, trialMs)
    return () => window.clearTimeout(t)
  }, [phase, trialCount, trialMs, notify])

  useEffect(() => {
    if (phase !== 'final_verifying') return
    const t = window.setTimeout(() => {
      const next = finalStep + 1
      setFinalStep(next)
      if (next >= FINAL_CHECKS.length) {
        setPhase('complete')
        notify('Investigation COMPLETE — SIMULATED. Evidence report is ready.')
      }
    }, finalMs)
    return () => window.clearTimeout(t)
  }, [phase, finalStep, finalMs, notify])

  const startTrials = useCallback(() => {
    setPhase((p) => (p === 'preconditions_met' ? 'trialing' : p))
  }, [])

  useEffect(() => {
    if (phase !== 'preconditions_met' || !settings.autoAdvance) return
    const t = window.setTimeout(startTrials, 650)
    return () => window.clearTimeout(t)
  }, [phase, settings.autoAdvance, startTrials])

  /* ---- actions ---- */
  const startInvestigation = useCallback(() => {
    setVerifyStep(0)
    setTrialCount(0)
    setFinalStep(0)
    setSelectedTrial(null)
    setPhase('verifying')
  }, [])

  const runDemoInvestigation = useCallback(() => {
    setView('investigations')
    if (phase === 'idle') startInvestigation()
  }, [phase, startInvestigation])

  const runFinal = useCallback(() => {
    setFinalStep(0)
    setPhase((p) => (p === 'trials_complete' ? 'final_verifying' : p))
  }, [])

  const resetDemo = useCallback(() => {
    setPhase('idle')
    setVerifyStep(0)
    setTrialCount(0)
    setFinalStep(0)
    setMemories(INITIAL_MEMORIES)
    setSelectedTrial(null)
    setSettings(DEFAULT_SETTINGS)
    setView('overview')
    notify('Demo reset — back to the initial simulated state')
  }, [notify])

  const addMemory = useCallback((entry: Omit<MemoryEntry, 'id' | 'status' | 'createdLabel'>) => {
    setMemories((prev) => [
      {
        ...entry,
        id: `MEM-${String(prev.length + 1).padStart(3, '0')}`,
        status: 'RECORDED',
        createdLabel: 'Just now · this session',
      },
      ...prev,
    ])
    notify('Memory added as RECORDED — evidence review is required before it can be SUPPORTED or VERIFIED')
  }, [notify])

  const navItems: { view: View; label: string; icon: typeof LayoutDashboard; count?: string }[] = [
    { view: 'overview', label: 'Overview', icon: LayoutDashboard },
    { view: 'investigations', label: 'Investigations', icon: FlaskConical, count: phase === 'idle' ? undefined : `${trialCount}/${TRIALS.length}` },
    { view: 'memory', label: 'Project Memory', icon: BookOpen, count: String(memories.length) },
    { view: 'reports', label: 'Evidence Reports', icon: FileSearch, count: '1' },
    { view: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Waypoints size={20} /></span>
          <div>
            <h1>CausalFlow</h1>
            <p>Integration debugging · Demo</p>
          </div>
        </div>

        <div className="env-pill">
          <span className="badge badge-demo"><span className="dot pulse" /> DEMO ENVIRONMENT</span>
          <span className="repo">{REPO}</span>
          <span className="faint" style={{ fontSize: 11 }}>Simulated repository · not connected</span>
        </div>

        <nav className="nav" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = view === item.view || (view === 'html-report' && item.view === 'reports')
            return (
              <button key={item.view} className={active ? 'active' : ''} onClick={() => navigate(item.view)} aria-current={active ? 'page' : undefined}>
                <Icon size={17} /> {item.label}
                {item.count && <span className="count">{item.count}</span>}
              </button>
            )
          })}
        </nav>

        <div className="side-spacer" />
        <div className="side-bottom">
          <button className="btn btn-danger" onClick={resetDemo}><RotateCcw size={14} /> Reset Demo</button>
          <div className="user-card">
            <span className="avatar">DP</span>
            <span>Demo Presenter<small>Simulated workspace · session only</small></span>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <span className="crumb">CausalFlow / <b>{VIEW_TITLES[view]}</b></span>
          <div className="topbar-right">
            <span className="sim-pill"><span className="dot pulse" /> Simulated · no repo or code execution connected</span>
            <button className="btn btn-sm" onClick={resetDemo}><RotateCcw size={13} /> Reset Demo</button>
          </div>
        </header>

        <main className="content">
          {view === 'overview' && (
            <Overview phase={phase} trialCount={trialCount} memories={memories} onRun={runDemoInvestigation} onNavigate={navigate} />
          )}
          {view === 'investigations' && (
            <Investigation
              phase={phase} verifyStep={verifyStep} trialCount={trialCount} finalStep={finalStep}
              settings={settings} selectedTrialId={selectedTrial?.id ?? null}
              onStart={startInvestigation} onStartTrials={startTrials} onRunFinal={runFinal}
              onReset={resetDemo} onNavigate={navigate} onSelectTrial={setSelectedTrial}
            />
          )}
          {view === 'memory' && <Memory memories={memories} onAdd={addMemory} />}
          {view === 'reports' && (
            <Reports phase={phase} trialCount={trialCount} finalStep={finalStep} onNavigate={navigate}
              onSelectTrial={setSelectedTrial} onRun={runDemoInvestigation} notify={notify} />
          )}
          {view === 'html-report' && (
            <HtmlReport phase={phase} trialCount={trialCount} finalStep={finalStep} onNavigate={navigate} notify={notify} />
          )}
          {view === 'settings' && (
            <Settings settings={settings} onChange={setSettings} onReset={resetDemo} notify={notify} />
          )}
        </main>

        <footer className="footer">
          <span>Interactive product simulation using predefined demo data. No real repository or code execution is connected.</span>
          <span>CausalFlow demo · INV-DEMO-001 · State resets on refresh</span>
        </footer>
      </div>

      <TrialDrawer trial={selectedTrial} onClose={() => setSelectedTrial(null)} />
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        {toast && <><CheckCircle2 size={16} /> {toast}</>}
      </div>
    </div>
  )
}
