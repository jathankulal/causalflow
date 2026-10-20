import { useMemo, useState } from 'react'
import {
  ArrowRight, Check, ChevronDown, CircleDashed, FileSearch, FlaskConical, FolderGit2, Loader2,
  Lock, Play, RotateCcw, ShieldCheck, Terminal,
} from 'lucide-react'
import {
  BASELINE, CHANGES, FINAL_CHECKS, INVESTIGATION_ID, PRECONDITION_STEPS, RECENT_INVESTIGATIONS,
  REPO, TARGET_SIGNATURE, TEST_COMMAND, TRIALS, TRUST_RULES, changeLabel, phaseLabel,
} from '../data'
import type { DemoSettings, Phase, Trial, TrialResult, View } from '../types'
import { ChangeChips, ClassificationLegend, ResultBadge } from './ui'

interface Props {
  phase: Phase
  verifyStep: number
  trialCount: number
  finalStep: number
  settings: DemoSettings
  selectedTrialId: string | null
  onStart: () => void
  onStartTrials: () => void
  onRunFinal: () => void
  onReset: () => void
  onNavigate: (v: View) => void
  onSelectTrial: (t: Trial) => void
}

type TrialFilter = 'ALL' | TrialResult

export default function Investigation({
  phase, verifyStep, trialCount, finalStep, settings, selectedTrialId,
  onStart, onStartTrials, onRunFinal, onReset, onNavigate, onSelectTrial,
}: Props) {
  const [filter, setFilter] = useState<TrialFilter>('ALL')
  const revealed = TRIALS.slice(0, trialCount)
  const visibleTrials = useMemo(
    () => (filter === 'ALL' ? revealed : revealed.filter((t) => t.result === filter)),
    [filter, revealed],
  )

  const preconditionsDone = !['idle', 'verifying'].includes(phase)
  const trialsDone = trialCount >= TRIALS.length && ['trials_complete', 'final_verifying', 'complete'].includes(phase)
  const complete = phase === 'complete'

  const stepState = (idx: number): 'done' | 'current' | '' => {
    // steps: 0 configure, 1 preconditions, 2 trials, 3 reduced set, 4 final
    const doneMap = [phase !== 'idle', preconditionsDone, trialsDone, trialsDone, complete]
    const currentMap = [
      phase === 'idle',
      phase === 'verifying' || phase === 'preconditions_met',
      phase === 'trialing',
      phase === 'trials_complete',
      phase === 'final_verifying',
    ]
    if (doneMap[idx] && !currentMap[idx]) return 'done'
    if (currentMap[idx]) return 'current'
    if (doneMap[idx]) return 'done'
    return ''
  }
  const steps = [
    { title: 'Configure', hint: 'Repo, changes, target failure' },
    { title: 'Verify preconditions', hint: 'Baseline PASS · full set fails on target' },
    { title: 'Combination trials', hint: '8 subsets, every outcome recorded' },
    { title: 'Reduced reproducing set', hint: 'Smallest confirmed in this run' },
    { title: 'Final verification', hint: 'Re-check baseline, full & reduced sets' },
  ]

  const primaryCta = () => {
    switch (phase) {
      case 'idle':
        return <button className="btn btn-primary btn-lg" onClick={onStart}><Play size={16} /> Start Investigation</button>
      case 'verifying':
        return <button className="btn btn-primary btn-lg" disabled><Loader2 size={16} className="spin" /> Verifying preconditions…</button>
      case 'preconditions_met':
        return <button className="btn btn-primary btn-lg" onClick={onStartTrials}><FlaskConical size={16} /> Run Combination Trials</button>
      case 'trialing':
        return <button className="btn btn-primary btn-lg" disabled><Loader2 size={16} className="spin" /> Evaluating combinations… {trialCount}/{TRIALS.length}</button>
      case 'trials_complete':
        return <button className="btn btn-violet btn-lg" onClick={onRunFinal}><ShieldCheck size={16} /> Run Final Verification</button>
      case 'final_verifying':
        return <button className="btn btn-violet btn-lg" disabled><Loader2 size={16} className="spin" /> Running final verification…</button>
      case 'complete':
        return (
          <>
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('reports')}><FileSearch size={16} /> Open Evidence Report</button>
            <button className="btn btn-lg" onClick={() => onNavigate('memory')}>View Project Memory <ArrowRight size={15} /></button>
          </>
        )
    }
  }

  return (
    <div>
      <div className="page-head">
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <span className="badge badge-blue mono">{INVESTIGATION_ID}</span>
          <span className="badge badge-demo">SIMULATED INVESTIGATION</span>
          <span className={`badge ${complete ? 'badge-pass' : phase === 'idle' ? '' : 'badge-violet'}`}>{phaseLabel(phase).toUpperCase()}</span>
        </div>
        <h2>Investigate a broken integration</h2>
        <p>
          Three parallel changes landed against <span className="mono">{REPO}</span> and the profile integration test broke.
          CausalFlow tests combinations to find a <b>reduced set that reproduces the specific target failure</b> — with every trial recorded as evidence.
        </p>
      </div>

      <div className="stepper" aria-label="Investigation progress">
        {steps.map((s, i) => (
          <div key={s.title} className={`step ${stepState(i)}`}>
            <span className="n">{stepState(i) === 'done' ? <Check size={13} /> : i + 1}</span>
            <span><b>{s.title}</b><span>{s.hint}</span></span>
          </div>
        ))}
      </div>

      <div className="inv-grid">
        <div className="stack">
          {/* STEP 1 — CONFIGURE */}
          <section className="card" id="step-configure">
            <div className="card-head">
              <div>
                <h3>1 · Configure the investigation</h3>
                <p className="sub">Fixed demo configuration. These values are illustrative — no real repository has been accessed.</p>
              </div>
              <div className="spacer" />
              <span className="badge">STEP 1 OF 5</span>
            </div>

            <dl className="kv" style={{ marginBottom: 14 }}>
              <dt>Repository</dt><dd><span className="mono">{REPO}</span> <span className="badge badge-demo" style={{ marginLeft: 6 }}>DEMO</span></dd>
              <dt>Baseline commit</dt><dd><span className="mono">{BASELINE}</span></dd>
              <dt>Test command</dt><dd><span className="mono">{TEST_COMMAND}</span></dd>
              <dt>Target failure signature</dt><dd><span className="mono" style={{ color: '#ff9db0' }}>{TARGET_SIGNATURE}</span></dd>
            </dl>

            <div className="grid grid-3">
              {CHANGES.map((c, i) => (
                <div key={c.id} className="change-card">
                  <div className="row" style={{ gap: 8 }}>
                    <span className={`change-letter ${i === 1 ? 'v' : i === 2 ? 'g' : ''}`}>{c.id}</span>
                    <div>
                      <b style={{ fontSize: 12.5 }}>{c.label}</b>
                      <div className="faint" style={{ fontSize: 11 }}>{c.author} · {c.authorKind}</div>
                    </div>
                  </div>
                  <h4>{c.title}</h4>
                  <p>{c.summary}</p>
                  <div className="mono faint" style={{ fontSize: 11, marginBottom: 7 }}>{c.file}</div>
                  <div className="diff" aria-label={`Illustrative diff for ${c.label}`}>
                    {c.diff.map((d, j) => (
                      <div key={j} className={d.kind === 'add' ? 'add' : d.kind === 'remove' ? 'remove' : 'ctx'}>{d.text}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <hr className="divider" />
            <div className="row">
              {primaryCta()}
              <button className="btn btn-ghost" onClick={onReset}><RotateCcw size={14} /> Reset Demo</button>
              <span className="sr-note">Simulated results only — clicking Start does not run shell commands or tests.</span>
            </div>
          </section>

          {/* STEP 2 — PRECONDITIONS */}
          <section className="card" id="step-preconditions">
            <div className="card-head">
              <div>
                <h3>2 · Verify preconditions</h3>
                <p className="sub">Minimization may proceed only if the baseline passes <b>and</b> the full change set reproduces the configured target failure.</p>
              </div>
              <div className="spacer" />
              {preconditionsDone
                ? <span className="badge badge-pass">GATE PASSED (DEMO)</span>
                : phase === 'verifying' ? <span className="badge badge-blue">RUNNING…</span> : <span className="badge">NOT RUN</span>}
            </div>

            {phase === 'idle' ? (
              <div className="empty" style={{ padding: '22px 16px' }}>
                <b>Preconditions not checked yet</b>
                Start the investigation above to run the simulated precondition sequence.
              </div>
            ) : (
              <>
                <div className="seq">
                  {PRECONDITION_STEPS.map((s, i) => {
                    const done = verifyStep > i
                    const running = phase === 'verifying' && verifyStep === i
                    return (
                      <div key={s.label} className={`seq-item ${done ? 'done' : running ? 'running' : ''}`}>
                        <span className="ic">
                          {done ? <Check size={14} /> : running ? <Loader2 size={14} className="spin" /> : <CircleDashed size={14} />}
                        </span>
                        <span>
                          <b>{s.label}</b>
                          <p>{s.detail}</p>
                        </span>
                        <span style={{ marginLeft: 'auto' }} className="faint small mono">{done ? 'done' : running ? 'running' : 'queued'}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="gate mt">
                  <div className={`gate-box ${verifyStep >= 3 ? 'pass' : ''}`}>
                    <h4>Baseline · {BASELINE}</h4>
                    <div className="big">{verifyStep >= 3 ? <span style={{ color: 'var(--green)' }}>PASS</span> : <span className="faint">—</span>}</div>
                    <p className="small muted" style={{ margin: '5px 0 0' }}>Required: PASS — the failure is not present before the changes.</p>
                  </div>
                  <div className={`gate-box ${verifyStep >= 5 ? 'fail' : ''}`}>
                    <h4>Full change set · A + B + C</h4>
                    <div className="big">{verifyStep >= 5 ? <span style={{ color: 'var(--red)' }}>TARGET_FAILURE</span> : <span className="faint">—</span>}</div>
                    <p className="small muted" style={{ margin: '5px 0 0' }}>Required: configured signature <span className="mono">{TARGET_SIGNATURE}</span> detected.</p>
                  </div>
                </div>

                {preconditionsDone && (
                  <div className="callout green mt fade-up">
                    <b>Both preconditions satisfied (simulated).</b> The baseline is green and the full set reproduces the exact
                    configured failure, so combination trials can meaningfully reduce the set. If either check were ambiguous, it would be
                    recorded as <span className="mono">INCONCLUSIVE</span> and minimization would stop.
                  </div>
                )}
              </>
            )}
          </section>

          {/* STEP 3 — TRIALS */}
          <section className="card" id="step-trials">
            <div className="card-head">
              <div>
                <h3>3 · Investigate change combinations</h3>
                <p className="sub">Every attempted subset is recorded with a trial ID, outcome, and evidence — including passing subsets.</p>
              </div>
              <div className="spacer" />
              <span className="badge badge-blue">{trialCount} / {TRIALS.length} EVALUATED</span>
            </div>

            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="filters" role="group" aria-label="Filter trials by result">
                {(['ALL', 'PASS', 'TARGET_FAILURE', 'INCONCLUSIVE'] as TrialFilter[]).map((f) => (
                  <button key={f} className={`fchip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'ALL' ? `All (${revealed.length})` : `${f} (${revealed.filter((t) => t.result === f).length})`}
                  </button>
                ))}
              </div>
              {phase === 'preconditions_met' && (
                <button className="btn btn-sm btn-primary" onClick={onStartTrials}><Play size={13} /> Run trials</button>
              )}
            </div>

            {trialCount === 0 ? (
              <div className="empty">
                <b>No trials evaluated yet</b>
                {phase === 'idle' || phase === 'verifying'
                  ? 'Verify preconditions first — trials unlock once the baseline passes and the full set reproduces the target failure.'
                  : 'Preconditions are met. Run the combination trials to evaluate all 8 subsets.'}
              </div>
            ) : (
              <div className="table-wrap">
                <table className={settings.compactTrials ? 'compact' : ''}>
                  <thead>
                    <tr><th>Trial ID</th><th>Changes included</th><th>Result</th><th>Duration</th><th>Signature</th><th>Evidence</th></tr>
                  </thead>
                  <tbody>
                    {visibleTrials.map((t) => (
                      <tr key={t.id} className={`${t.result === 'TARGET_FAILURE' ? 'row-fail' : ''} clickable ${selectedTrialId === t.id ? 'selected' : ''}`}
                        onClick={() => onSelectTrial(t)}>
                        <td className="mono"><b>{t.id}</b></td>
                        <td>
                          <ChangeChips changes={t.changes} dimMissing={t.changes.length > 0} />
                          <span className="faint small" style={{ marginLeft: 8 }}>{changeLabel(t.changes)}</span>
                        </td>
                        <td><ResultBadge result={t.result} /></td>
                        <td className="mono muted">{t.duration}</td>
                        <td className="small">{t.signatureDetected ? <span className="mono" style={{ color: '#ff9db0' }}>matched</span> : <span className="faint">not detected</span>}</td>
                        <td>
                          <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); onSelectTrial(t) }}>
                            <Terminal size={13} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                    {phase === 'trialing' && (
                      <tr>
                        <td className="mono faint">{TRIALS[trialCount]?.id ?? '…'}</td>
                        <td className="faint small"><Loader2 size={13} className="spin" style={{ verticalAlign: -2 }} /> Evaluating subset (simulated)…</td>
                        <td><span className="badge badge-blue">RUNNING</span></td>
                        <td className="faint mono">…</td><td /><td />
                      </tr>
                    )}
                    {visibleTrials.length === 0 && phase !== 'trialing' && (
                      <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 18 }}>No trials match this filter yet. <button className="btn btn-sm btn-ghost" onClick={() => setFilter('ALL')}>Show all trials</button></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <p className="sr-note" style={{ marginTop: 10 }}>
              Durations are illustrative. Select any trial to inspect its selected changes, simulated log excerpt, and classification rationale.
              No INCONCLUSIVE outcomes occurred in this simulated run — had a trial timed out or conflicted, it would appear here as INCONCLUSIVE.
            </p>
          </section>

          {/* STEP 4 — REDUCED SET */}
          <section id="step-result">
            {!trialsDone ? (
              <div className="locked">
                <Lock size={20} style={{ marginBottom: 6 }} />
                <div><b>4 · Reduced reproducing set — pending</b></div>
                <p className="small" style={{ margin: '5px auto 0', maxWidth: 460 }}>
                  The reduced set is revealed only after all 8 combination trials are recorded, so the conclusion is backed by the complete trial table above.
                </p>
              </div>
            ) : (
              <div className="result-hero fade-up">
                <span className="badge badge-violet">REPRODUCED IN DEMO</span>
                <h3>Reduced reproducing set: Change A + Change B</h3>
                <p className="muted" style={{ margin: 0, maxWidth: 680 }}>
                  A + B reproduces <span className="mono">{TARGET_SIGNATURE}</span> under the simulated test conditions.
                  Change C is <b>not required</b> to reproduce this particular failure.
                </p>

                <div className="flow" aria-label="Backend field rename leads to frontend field mismatch leads to test failure">
                  <div className="flow-node">Backend field rename<small>Change A · userName → username</small></div>
                  <span className="flow-arrow"><ArrowRight size={17} /></span>
                  <div className="flow-node">Frontend field mismatch<small>Change B · still reads userName</small></div>
                  <span className="flow-arrow"><ArrowRight size={17} /></span>
                  <div className="flow-node bad">Test failure<small>expected userName field</small></div>
                </div>

                <div className="row" style={{ gap: 8, marginBottom: 12 }}>
                  <span className="chip on">A — included</span>
                  <span className="chip on">B — included</span>
                  <span className="chip excluded">C — excluded (styling)</span>
                </div>

                <ul className="list-clean">
                  <li><b>Change A</b> renamed a backend response field (<span className="mono">userName → username</span>).</li>
                  <li><b>Change B</b> left the frontend expecting the previous field name.</li>
                  <li>Together they reproduce the configured integration failure (T-002: A + B → TARGET_FAILURE).</li>
                  <li>Neither A nor B alone reproduces it (T-005, T-006 → PASS); <b>Change C</b> is not required (T-001 vs T-002).</li>
                </ul>

                <div className="callout amber mt">
                  <b>Interpretation boundary:</b> this is a <b>reduced reproducing set under the simulated test conditions</b> — a starting point for a fix.
                  CausalFlow does not claim to have proven the true semantic root cause, or that A + B is the globally smallest possible set under all conditions.
                </div>

                {phase === 'trials_complete' && (
                  <div className="row mt">
                    <button className="btn btn-violet" onClick={onRunFinal}><ShieldCheck size={15} /> Run Final Verification</button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* STEP 5 — FINAL VERIFICATION */}
          <section className="card" id="step-final">
            <div className="card-head">
              <div>
                <h3>5 · Final verification</h3>
                <p className="sub">Re-check that the reduced set still reproduces the same target failure before the investigation is closed.</p>
              </div>
              <div className="spacer" />
              {complete ? <span className="badge badge-pass">COMPLETE — SIMULATED</span>
                : phase === 'final_verifying' ? <span className="badge badge-blue">VERIFYING…</span>
                : <span className="badge">PENDING</span>}
            </div>

            {phase === 'idle' || phase === 'verifying' || phase === 'preconditions_met' || phase === 'trialing' ? (
              <div className="empty" style={{ padding: '22px 16px' }}>
                <b>Final verification not reached</b>
                It runs after the reduced reproducing set is identified.
              </div>
            ) : (
              <>
                <div className="seq">
                  {FINAL_CHECKS.map((c, i) => {
                    const done = complete || finalStep > i
                    const running = phase === 'final_verifying' && finalStep === i
                    return (
                      <div key={c.label} className={`seq-item ${done ? 'done' : running ? 'running' : ''}`}>
                        <span className="ic">{done ? <Check size={14} /> : running ? <Loader2 size={14} className="spin" /> : <CircleDashed size={14} />}</span>
                        <span>
                          <b>{c.label}</b>
                          <p style={{ fontFamily: 'var(--sans)' }}>{c.detail}</p>
                        </span>
                        <span style={{ marginLeft: 'auto' }}>{done ? <ResultBadge result={c.result} /> : <span className="badge">{running ? 'RUNNING' : 'QUEUED'}</span>}</span>
                      </div>
                    )
                  })}
                </div>

                {complete && (
                  <div className="callout green mt fade-up">
                    <b>Investigation status: COMPLETE — SIMULATED.</b> Baseline PASS · full set TARGET_FAILURE · reduced set (A + B)
                    TARGET_FAILURE · styling change C excluded from the reproducing set. The full evidence trail is available in{' '}
                    <button className="btn btn-sm" onClick={() => onNavigate('reports')}>Evidence Reports</button>
                  </div>
                )}

                <details className="expandable mt">
                  <summary>
                    Expand trial history ({revealed.length} trials recorded)
                    <ChevronDown size={16} className="faint" />
                  </summary>
                  <div className="inner">
                    <div className="table-wrap">
                      <table className="compact">
                        <thead><tr><th>Trial</th><th>Changes</th><th>Result</th><th>Duration</th></tr></thead>
                        <tbody>
                          {revealed.map((t) => (
                            <tr key={t.id} className={`clickable ${t.result === 'TARGET_FAILURE' ? 'row-fail' : ''}`} onClick={() => onSelectTrial(t)}>
                              <td className="mono">{t.id}</td>
                              <td>{changeLabel(t.changes)}</td>
                              <td><ResultBadge result={t.result} /></td>
                              <td className="mono muted">{t.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="sr-note" style={{ marginTop: 8 }}>Select a row to inspect its simulated evidence. Every attempted subset has a recorded outcome.</p>
                  </div>
                </details>
              </>
            )}
          </section>

          <details className="expandable">
            <summary>Other demo investigations (illustrative history) <ChevronDown size={16} className="faint" /></summary>
            <div className="inner stack" style={{ gap: 10 }}>
              {RECENT_INVESTIGATIONS.filter((i) => i.id !== INVESTIGATION_ID).map((inv) => (
                <div key={inv.id} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px dashed var(--border-soft)', paddingBottom: 10 }}>
                  <div>
                    <b className="mono" style={{ fontSize: 12.5 }}>{inv.id}</b>{' '}
                    <b style={{ fontSize: 13 }}>{inv.title}</b>
                    <div className="muted small">{inv.note}</div>
                    <div className="faint small">Result: {inv.result} · {inv.trials} · {inv.updated}</div>
                  </div>
                  <span className={`badge ${inv.status.startsWith('COMPLETE') ? 'badge-pass' : 'badge-inconclusive'}`}>{inv.status}</span>
                </div>
              ))}
              <p className="sr-note">These historical entries are illustrative only. {INVESTIGATION_ID} above is the interactive investigation in this demo.</p>
            </div>
          </details>
        </div>

        {/* RIGHT RAIL */}
        <aside className="rail">
          <div className="card">
            <div className="card-head" style={{ marginBottom: 10 }}>
              <h3><FolderGit2 size={15} style={{ verticalAlign: -2 }} /> Repository</h3>
              <div className="spacer" /><span className="badge badge-demo">DEMO DATA</span>
            </div>
            <dl className="kv" style={{ gridTemplateColumns: '104px 1fr' }}>
              <dt>Name</dt><dd className="mono">{REPO}</dd>
              <dt>Baseline</dt><dd className="mono">{BASELINE}</dd>
              <dt>Branch model</dt><dd>Parallel dev + AI agent branches</dd>
              <dt>Test command</dt><dd className="mono">{TEST_COMMAND}</dd>
              <dt>Connection</dt><dd><span style={{ color: 'var(--amber)' }}>Not connected — simulation only</span></dd>
            </dl>
            <hr className="divider" />
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small muted">Combinations evaluated</span>
              <b className="mono">{trialCount}/{TRIALS.length}</b>
            </div>
            <div className="progress" style={{ marginTop: 7 }}><div style={{ width: `${(trialCount / TRIALS.length) * 100}%` }} /></div>
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
              <span className="small muted">Investigation status</span>
              <span className={`badge ${complete ? 'badge-pass' : 'badge-blue'}`}>{phaseLabel(phase).toUpperCase()}</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 8 }}>How results are classified</h3>
            <ClassificationLegend />
            <p className="sr-note" style={{ marginTop: 9 }}>A non-zero exit code without the configured signature is <b>not</b> a TARGET_FAILURE.</p>
          </div>

          {settings.showTrustPanel && (
            <div className="card trust">
              <div className="card-head" style={{ marginBottom: 4 }}>
                <h3><ShieldCheck size={15} style={{ verticalAlign: -2 }} /> Trust &amp; Evidence</h3>
              </div>
              <p className="sub" style={{ marginBottom: 6 }}>Rules this investigation is held to. Expand any rule.</p>
              {TRUST_RULES.map((r, i) => (
                <details key={r.title} open={i < 2}>
                  <summary>{r.title}<ChevronDown size={14} className="faint" /></summary>
                  <p>{r.body}</p>
                </details>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
