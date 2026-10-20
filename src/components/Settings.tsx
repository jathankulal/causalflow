import { RotateCcw, ShieldCheck } from 'lucide-react'
import { BASELINE, REPO, TARGET_SIGNATURE, TEST_COMMAND } from '../data'
import type { DemoSettings } from '../types'
import { ClassificationLegend } from './ui'

interface Props {
  settings: DemoSettings
  onChange: (s: DemoSettings) => void
  onReset: () => void
  notify: (msg: string) => void
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={onClick} role="switch" aria-checked={on} aria-label={label} />
}

export default function Settings({ settings, onChange, onReset, notify }: Props) {
  const set = (patch: Partial<DemoSettings>, msg?: string) => {
    onChange({ ...settings, ...patch })
    if (msg) notify(msg)
  }
  return (
    <div>
      <div className="page-head">
        <h2>Settings</h2>
        <p>Demo-session preferences. Changes apply immediately, are stored only in browser state, and reset when the page is refreshed.</p>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="stack">
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Demo playback</h3>
            <p className="sub">Control how the simulated investigation advances during a presentation.</p>
            <div style={{ marginTop: 8 }}>
              <div className="setting-row">
                <div style={{ flex: 1 }}>
                  <b>Auto-advance to combination trials</b>
                  <p>When on, trials start automatically as soon as preconditions pass. When off (default), the presenter triggers each stage — better for narrating live.</p>
                </div>
                <Toggle on={settings.autoAdvance} label="Auto-advance to combination trials"
                  onClick={() => set({ autoAdvance: !settings.autoAdvance }, `Auto-advance ${settings.autoAdvance ? 'off' : 'on'}`)} />
              </div>
              <div className="setting-row">
                <div style={{ flex: 1 }}>
                  <b>Animation speed</b>
                  <p>How quickly precondition steps, trials, and verification checks advance.</p>
                </div>
                <span className="segmented" role="group" aria-label="Animation speed">
                  <button className={settings.speed === 'normal' ? 'active' : ''} onClick={() => set({ speed: 'normal' }, 'Animation speed: normal')}>Normal</button>
                  <button className={settings.speed === 'fast' ? 'active' : ''} onClick={() => set({ speed: 'fast' }, 'Animation speed: fast')}>Fast</button>
                </span>
              </div>
              <div className="setting-row">
                <div style={{ flex: 1 }}>
                  <b>Compact trial table</b>
                  <p>Denser rows in the combination-trials table — useful for screenshots.</p>
                </div>
                <Toggle on={settings.compactTrials} label="Compact trial table"
                  onClick={() => set({ compactTrials: !settings.compactTrials }, `Compact trial table ${settings.compactTrials ? 'off' : 'on'}`)} />
              </div>
              <div className="setting-row">
                <div style={{ flex: 1 }}>
                  <b>Show “Trust &amp; Evidence” panel</b>
                  <p>Displays the reliability rules panel beside the investigation workflow.</p>
                </div>
                <Toggle on={settings.showTrustPanel} label="Show Trust and Evidence panel"
                  onClick={() => set({ showTrustPanel: !settings.showTrustPanel }, `Trust panel ${settings.showTrustPanel ? 'hidden' : 'shown'}`)} />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Demo environment</h3>
            <p className="sub">What this simulation is — and is not — connected to.</p>
            <dl className="kv" style={{ marginTop: 12, gridTemplateColumns: '150px 1fr' }}>
              <dt>Repository</dt><dd><span className="mono">{REPO}</span> <span className="badge badge-demo" style={{ marginLeft: 5 }}>DEMO ONLY</span></dd>
              <dt>Baseline</dt><dd className="mono">{BASELINE}</dd>
              <dt>Test execution</dt><dd style={{ color: 'var(--amber)' }}>None — <span className="mono">{TEST_COMMAND}</span> is displayed, never run</dd>
              <dt>Target signature</dt><dd className="mono">{TARGET_SIGNATURE}</dd>
              <dt>Backend / APIs</dt><dd>None. Local demo data + browser state only.</dd>
              <dt>Persistence</dt><dd>Session only — page refresh restores the initial demo state.</dd>
            </dl>
          </div>

          <div className="card" style={{ borderColor: '#4a2430' }}>
            <h3 style={{ marginBottom: 4 }}>Reset demo</h3>
            <p className="sub">Clears investigation progress, trials, trial selection, and any memory entries added this session. Settings return to defaults.</p>
            <button className="btn btn-danger" style={{ marginTop: 12 }} onClick={onReset}>
              <RotateCcw size={15} /> Reset Demo
            </button>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <h3 style={{ marginBottom: 8 }}><ShieldCheck size={15} style={{ verticalAlign: -2 }} /> Classification policy (read-only in demo)</h3>
            <ClassificationLegend />
            <hr className="divider" />
            <ul className="list-clean">
              <li>A non-zero test exit code alone never counts as the target failure — the configured signature must match.</li>
              <li>Timeouts, replay conflicts, and setup errors are INCONCLUSIVE, and inconclusive is never evidence that a change is unnecessary.</li>
              <li>Every attempted subset gets a recorded trial outcome.</li>
              <li>Memory entries require attached evidence before they are SUPPORTED or VERIFIED.</li>
              <li>A reduced reproducing set is not, by itself, proof of the true root cause.</li>
              <li>Git worktrees and temporary directories are not security sandboxes.</li>
            </ul>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 6 }}>About this build</h3>
            <p className="small muted" style={{ margin: 0 }}>
              CausalFlow interactive product simulation · React + TypeScript frontend · No backend or external API ·
              All repositories, commits, logs, durations, and people are fictional demo data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
