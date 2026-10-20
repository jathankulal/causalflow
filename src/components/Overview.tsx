import { Fragment, useState } from 'react'
import {
  Activity, ArrowRight, BookOpen, FileSearch, FlaskConical, GitBranch, Layers, Play, ShieldCheck,
} from 'lucide-react'
import { INVESTIGATION_ID, RECENT_INVESTIGATIONS, REPO, TRIALS, phaseLabel } from '../data'
import type { MemoryEntry, Phase, View } from '../types'
import { MemoryStatusBadge } from './ui'

interface Props {
  phase: Phase
  trialCount: number
  memories: MemoryEntry[]
  onRun: () => void
  onNavigate: (v: View) => void
}

function Donut({ pass, fail, total }: { pass: number; fail: number; total: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const done = pass + fail
  const passLen = total ? (pass / total) * c : 0
  const failLen = total ? (fail / total) * c : 0
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label={`${done} of ${total} combinations evaluated`}>
      <circle cx="46" cy="46" r={r} fill="none" stroke="#232d3f" strokeWidth="10" />
      <circle cx="46" cy="46" r={r} fill="none" stroke="#3ecf8e" strokeWidth="10" strokeLinecap="butt"
        strokeDasharray={`${passLen} ${c - passLen}`} transform="rotate(-90 46 46)" />
      <circle cx="46" cy="46" r={r} fill="none" stroke="#fb7185" strokeWidth="10" strokeLinecap="butt"
        strokeDasharray={`${failLen} ${c - failLen}`} strokeDashoffset={-passLen} transform="rotate(-90 46 46)" />
      <text x="46" y="44" textAnchor="middle" fill="#e9eef7" fontSize="17" fontWeight="720">{done}/{total}</text>
      <text x="46" y="59" textAnchor="middle" fill="#6b7a90" fontSize="9.5">evaluated</text>
    </svg>
  )
}

export default function Overview({ phase, trialCount, memories, onRun, onNavigate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(INVESTIGATION_ID)
  const revealed = TRIALS.slice(0, trialCount)
  const pass = revealed.filter((t) => t.result === 'PASS').length
  const fail = revealed.filter((t) => t.result === 'TARGET_FAILURE').length
  const complete = phase === 'complete'
  const trialsDone = trialCount >= TRIALS.length
  const progressPct =
    phase === 'idle' ? 4
    : phase === 'verifying' ? 22
    : phase === 'preconditions_met' ? 36
    : phase === 'trialing' ? 36 + Math.round((trialCount / TRIALS.length) * 40)
    : phase === 'trials_complete' ? 80
    : phase === 'final_verifying' ? 92
    : 100

  const currentResult = complete
    ? 'A + B reproduces failure'
    : trialsDone
      ? 'Reduced set: A + B'
      : phase === 'idle'
        ? 'Not yet determined'
        : 'Investigating…'

  return (
    <div>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <span className="badge badge-demo"><span className="dot" /> DEMO ENVIRONMENT · SIMULATED DATA</span>
            <h2>Find the change combination that breaks your build.</h2>
            <p className="support">Evidence-backed project memory. Reproducible integration debugging.</p>
            <div className="row">
              <button className="btn btn-primary btn-lg" onClick={onRun}>
                <Play size={17} /> {phase === 'idle' ? 'Run Demo Investigation' : 'Open Active Investigation'}
              </button>
              <button className="btn btn-lg" onClick={() => onNavigate('reports')}>
                <FileSearch size={16} /> View Evidence Report
              </button>
              <button className="btn btn-ghost" onClick={() => onNavigate('memory')}>
                <BookOpen size={16} /> Project Memory <ArrowRight size={14} />
              </button>
            </div>
            <p className="sr-note" style={{ marginTop: 12 }}>
              Simulated run against predefined demo data for <span className="mono">{REPO}</span>. No real repository is accessed and no tests are executed.
            </p>
          </div>
          <div className="demo-flow">
            <h4>90-second demo path</h4>
            <ol>
              <li><b>Run</b> the demo investigation</li>
              <li>Baseline <b>PASS</b> · full set <b>TARGET_FAILURE</b></li>
              <li>Evaluate <b>8 combinations</b>, inspect trial evidence</li>
              <li>Reveal reduced set <b>A + B</b></li>
              <li>Open the <b>evidence report</b>, then <b>Project Memory</b></li>
            </ol>
          </div>
        </div>
      </section>

      <div className="grid grid-4 mb">
        <div className="card kpi">
          <div className="k-label"><Activity size={13} /> Active investigation</div>
          <div className="k-value" style={{ fontSize: 19, paddingTop: 4 }}><span className="mono">{INVESTIGATION_ID}</span></div>
          <div className="k-sub">{phaseLabel(phase)}</div>
        </div>
        <div className="card kpi">
          <div className="k-label"><GitBranch size={13} /> Changes investigated</div>
          <div className="k-value">3</div>
          <div className="k-sub">A · backend rename&nbsp;&nbsp;B · frontend expectation&nbsp;&nbsp;C · styling</div>
        </div>
        <div className="card kpi">
          <div className="k-label"><FlaskConical size={13} /> Combinations evaluated</div>
          <div className="k-value">{trialCount}<span className="faint" style={{ fontSize: 16 }}> / {TRIALS.length}</span></div>
          <div className="k-sub">{pass} PASS · {fail} TARGET_FAILURE · 0 INCONCLUSIVE</div>
        </div>
        <div className="card kpi">
          <div className="k-label"><ShieldCheck size={13} /> Current result</div>
          <div className="k-value" style={{ fontSize: 18, paddingTop: 5 }}>{currentResult}</div>
          <div className="k-sub">{complete ? 'Verified in demo · REPRODUCED IN DEMO' : trialsDone ? 'Awaiting final verification' : 'Run the investigation to determine'}</div>
        </div>
      </div>

      <div className="grid overview-grid">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Active investigation — Profile API field mismatch</h3>
                <p className="sub">Baseline <span className="mono">a1b2c3d</span> · <span className="mono">pytest tests/test_profile_api.py</span> · simulated</p>
              </div>
              <div className="spacer" />
              <span className={`badge ${complete ? 'badge-pass' : phase === 'idle' ? '' : 'badge-blue'}`}>{phaseLabel(phase).toUpperCase()}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small muted">Investigation progress</span>
              <span className="small mono muted">{progressPct}%</span>
            </div>
            <div className={`progress mt ${complete ? 'green' : ''}`} style={{ marginTop: 8 }}>
              <div style={{ width: `${progressPct}%` }} />
            </div>
            <div className="row mt" style={{ gap: 16 }}>
              <span className="small"><span className="faint">Baseline</span>&nbsp; {phase === 'idle' || phase === 'verifying' ? <span className="badge">PENDING</span> : <span className="badge badge-pass">PASS</span>}</span>
              <span className="small"><span className="faint">Full set A+B+C</span>&nbsp; {phase === 'idle' || phase === 'verifying' ? <span className="badge">PENDING</span> : <span className="badge badge-fail">TARGET_FAILURE</span>}</span>
              <span className="small"><span className="faint">Reduced set</span>&nbsp; {trialsDone ? <span className="badge badge-violet">A + B</span> : <span className="badge">—</span>}</span>
              <div style={{ flex: 1 }} />
              <button className="btn btn-sm btn-primary" onClick={onRun}>
                {phase === 'idle' ? 'Start' : 'Open investigation'} <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <h3>Recent investigations</h3>
                <p className="sub">Simulated history. Select a row for detail; only {INVESTIGATION_ID} is interactive.</p>
              </div>
              <div className="spacer" />
              <button className="btn btn-sm" onClick={() => onNavigate('investigations')}>All investigations</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Changes</th><th>Trials</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {RECENT_INVESTIGATIONS.map((inv) => (
                    <Fragment key={inv.id}>
                      <tr className={`clickable ${expandedId === inv.id ? 'selected' : ''}`}
                        onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}>
                        <td className="mono">{inv.id}</td>
                        <td>{inv.title}</td>
                        <td>{inv.changes}</td>
                        <td>{inv.id === INVESTIGATION_ID ? `${trialCount} / ${TRIALS.length} evaluated` : inv.trials}</td>
                        <td>
                          <span className={`badge ${inv.status.startsWith('COMPLETE') ? 'badge-pass' : inv.status.startsWith('INCONCLUSIVE') ? 'badge-inconclusive' : 'badge-blue'}`}>
                            {inv.id === INVESTIGATION_ID ? phaseLabel(phase).toUpperCase() : inv.status}
                          </span>
                        </td>
                      </tr>
                      {expandedId === inv.id && (
                        <tr>
                          <td colSpan={5}>
                            <span className="muted small">{inv.note}</span>{' '}
                            <span className="faint small">Result: {inv.id === INVESTIGATION_ID ? currentResult : inv.result} · {inv.updated}</span>
                            {inv.id === INVESTIGATION_ID && (
                              <> <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={onRun}>Open <ArrowRight size={12} /></button></>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Trial outcomes</h3>
                <p className="sub">Live from this demo session</p>
              </div>
            </div>
            <div className="donut-wrap">
              <Donut pass={pass} fail={fail} total={TRIALS.length} />
              <div style={{ flex: 1 }}>
                <div className="bar-row"><span>PASS</span><div className="progress green"><div style={{ width: `${(pass / TRIALS.length) * 100}%` }} /></div><span className="mono">{pass}</span></div>
                <div className="bar-row"><span>TARGET_FAILURE</span><div className="progress"><div style={{ width: `${(fail / TRIALS.length) * 100}%`, background: '#e0526e' }} /></div><span className="mono">{fail}</span></div>
                <div className="bar-row"><span>Not yet run</span><div className="progress violet"><div style={{ width: `${((TRIALS.length - trialCount) / TRIALS.length) * 100}%`, background: '#42506a' }} /></div><span className="mono">{TRIALS.length - trialCount}</span></div>
              </div>
            </div>
            {trialCount === 0 && <p className="small muted" style={{ margin: '10px 0 0' }}>No combinations evaluated yet. Run the demo investigation to populate trial evidence.</p>}
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <h3><Layers size={15} style={{ verticalAlign: -2 }} /> Recent project memory</h3>
                <p className="sub">Shared context for developers and AI agents</p>
              </div>
              <div className="spacer" />
              <button className="btn btn-sm" onClick={() => onNavigate('memory')}>Open memory</button>
            </div>
            <div className="stack" style={{ gap: 10 }}>
              {memories.slice(0, 3).map((m) => (
                <div key={m.id} style={{ borderBottom: '1px dashed var(--border-soft)', paddingBottom: 10 }}>
                  <div className="row" style={{ gap: 7 }}>
                    <span className="badge badge-violet">{m.type.toUpperCase()}</span>
                    <MemoryStatusBadge status={m.status} />
                  </div>
                  <p style={{ margin: '6px 0 3px', fontSize: 13 }}>{m.summary}</p>
                  <span className="mono faint" style={{ fontSize: 11.5 }}>{m.affectedFiles[0]}</span>
                </div>
              ))}
            </div>
            <p className="sr-note" style={{ margin: '10px 0 0' }}>Memory is only SUPPORTED or VERIFIED when evidence is attached — never because an AI wrote it.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
