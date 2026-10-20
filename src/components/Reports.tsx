import { useMemo, useState } from 'react'
import {
  ArrowLeft, Braces, Check, Copy, Download, FileText, Play, Printer,
} from 'lucide-react'
import {
  BASELINE, CHANGES, FINAL_CHECKS, INVESTIGATION_ID, KNOWN_LIMITATIONS, REPO,
  TARGET_SIGNATURE, TEST_COMMAND, TRIALS, buildEvidence, changeLabel, phaseLabel,
} from '../data'
import { downloadEvidence } from '../download'
import type { Phase, Trial, View } from '../types'
import { ChangeChips, ClassificationLegend, ResultBadge } from './ui'

interface Props {
  phase: Phase
  trialCount: number
  finalStep: number
  onNavigate: (v: View) => void
  onSelectTrial: (t: Trial) => void
  onRun: () => void
  notify: (msg: string) => void
}

export default function Reports({ phase, trialCount, finalStep, onNavigate, onSelectTrial, onRun, notify }: Props) {
  const [showJson, setShowJson] = useState(false)
  const [copied, setCopied] = useState(false)
  const revealed = TRIALS.slice(0, trialCount)
  const evidence = useMemo(() => buildEvidence(phase, revealed, finalStep), [phase, revealed, finalStep])
  const jsonText = useMemo(() => JSON.stringify(evidence, null, 2), [evidence])
  const complete = phase === 'complete'
  const trialsDone = trialCount >= TRIALS.length
  const preDone = !['idle', 'verifying'].includes(phase)

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
      setCopied(true)
      notify('Demo JSON copied to clipboard')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      notify('Copy failed in this browser — use Download Demo JSON instead')
    }
  }

  return (
    <div>
      <div className="page-head">
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <span className="badge badge-blue mono">{INVESTIGATION_ID}</span>
          <span className="badge badge-demo">SIMULATED DEMO ARTIFACT</span>
        </div>
        <h2>Evidence Reports</h2>
        <p>
          The auditable record behind the investigation result: configuration, precondition outcomes, every trial, the reduced
          reproducing set, final verification, and known limitations. This is a simulated report — not real test evidence.
        </p>
      </div>

      {!complete && (
        <div className="callout amber mb" role="status">
          <b>Live demo report — {phaseLabel(phase).toLowerCase()}.</b>{' '}
          {trialCount === 0
            ? 'No trials have been evaluated in this session yet, so trial sections below are empty. Run the investigation to generate the complete trail.'
            : `${trialCount} of ${TRIALS.length} trials recorded so far. Finish the investigation to complete this report.`}{' '}
          <button className="btn btn-sm btn-primary" style={{ marginLeft: 6 }} onClick={onRun}><Play size={13} /> {phase === 'idle' ? 'Run Demo Investigation' : 'Continue investigation'}</button>
        </div>
      )}

      <div className="card mb">
        <div className="card-head">
          <div>
            <h3>Report {INVESTIGATION_ID} — Profile API field mismatch</h3>
            <p className="sub">Generated client-side from this demo session · resets on page refresh</p>
          </div>
          <div className="spacer" />
          <span className={`badge ${complete ? 'badge-pass' : 'badge-blue'}`}>{phaseLabel(phase).toUpperCase()}</span>
        </div>
        <div className="row">
          <button className={`btn ${showJson ? 'btn-primary' : ''}`} onClick={() => setShowJson(!showJson)}>
            <Braces size={15} /> {showJson ? 'Hide JSON Evidence' : 'View JSON Evidence'}
          </button>
          <button className="btn" onClick={() => onNavigate('html-report')}>
            <FileText size={15} /> View HTML Report
          </button>
          <button className="btn btn-violet" onClick={() => downloadEvidence(evidence, notify)}>
            <Download size={15} /> Download Demo JSON
          </button>
        </div>

        {showJson && (
          <div className="fade-up" style={{ marginTop: 14 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <b className="small">Structured evidence <span className="badge badge-demo" style={{ marginLeft: 6 }}>SIMULATED</span></b>
              <button className="btn btn-sm" onClick={copyJson}>{copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy JSON</>}</button>
            </div>
            <pre className="codeblock" style={{ maxHeight: 460, overflow: 'auto', whiteSpace: 'pre', margin: 0 }}>{jsonText}</pre>
            <p className="sr-note" style={{ marginTop: 8 }}>Trial IDs, selected changes, statuses, durations, and explanations are predefined demo data. No test was executed to produce them.</p>
          </div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Investigation configuration</h3>
          <dl className="kv" style={{ gridTemplateColumns: '150px 1fr' }}>
            <dt>Investigation ID</dt><dd className="mono">{INVESTIGATION_ID}</dd>
            <dt>Repository</dt><dd><span className="mono">{REPO}</span> <span className="faint">(demo name only)</span></dd>
            <dt>Baseline commit</dt><dd className="mono">{BASELINE}</dd>
            <dt>Test command</dt><dd className="mono">{TEST_COMMAND}</dd>
            <dt>Target signature</dt><dd className="mono" style={{ color: '#ff9db0' }}>{TARGET_SIGNATURE}</dd>
            <dt>Status</dt><dd>{phaseLabel(phase)}</dd>
          </dl>
          <hr className="divider" />
          <b className="small">Changes under investigation</b>
          <div className="stack" style={{ gap: 7, marginTop: 8 }}>
            {CHANGES.map((c) => (
              <div key={c.id} className="small">
                <span className="chip on" style={{ marginRight: 7 }}>{c.id}</span>
                <b>{c.title}</b>
                <div className="mono faint" style={{ fontSize: 11.5 }}>{c.file} · {c.author} ({c.authorKind})</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Preconditions</h3>
          <div className="stack" style={{ gap: 9 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small">Baseline must PASS</span>
              {preDone ? <ResultBadge result="PASS" /> : <span className="badge">PENDING</span>}
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small">Full set (A+B+C) must reproduce target failure</span>
              {preDone ? <ResultBadge result="TARGET_FAILURE" /> : <span className="badge">PENDING</span>}
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small">Minimization gate</span>
              {preDone ? <span className="badge badge-pass">PASSED (DEMO)</span> : <span className="badge">NOT EVALUATED</span>}
            </div>
          </div>
          <hr className="divider" />
          <h3 style={{ marginBottom: 8 }}>Classification rules applied</h3>
          <ClassificationLegend />
        </div>
      </div>

      <div className="card mt">
        <div className="card-head">
          <div>
            <h3>Complete trial history</h3>
            <p className="sub">{revealed.length} of {TRIALS.length} trials recorded in this session. Select a trial to inspect its evidence.</p>
          </div>
          <div className="spacer" />
          <button className="btn btn-sm" onClick={() => onNavigate('investigations')}>Open investigation</button>
        </div>
        {revealed.length === 0 ? (
          <div className="empty">
            <b>No trials recorded yet</b>
            Run the demo investigation — the complete trial history, including passing subsets, will appear here.
            <div style={{ marginTop: 12 }}><button className="btn btn-primary" onClick={onRun}><Play size={14} /> Run Demo Investigation</button></div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Trial ID</th><th>Changes included</th><th>Result</th><th>Duration</th><th>Signature</th><th>Evidence</th></tr></thead>
              <tbody>
                {revealed.map((t) => (
                  <tr key={t.id} className={`clickable ${t.result === 'TARGET_FAILURE' ? 'row-fail' : ''}`} onClick={() => onSelectTrial(t)}>
                    <td className="mono"><b>{t.id}</b></td>
                    <td><ChangeChips changes={t.changes} dimMissing={t.changes.length > 0} /><span className="faint small" style={{ marginLeft: 8 }}>{changeLabel(t.changes)}</span></td>
                    <td><ResultBadge result={t.result} /></td>
                    <td className="mono muted">{t.duration}</td>
                    <td className="small">{t.signatureDetected ? <span className="mono" style={{ color: '#ff9db0' }}>matched</span> : <span className="faint">not detected</span>}</td>
                    <td><button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); onSelectTrial(t) }}>Inspect</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-2 mt">
        <div className="card">
          <h3 style={{ marginBottom: 8 }}>Reduced reproducing set</h3>
          {trialsDone ? (
            <>
              <div className="row" style={{ gap: 8 }}>
                <span className="badge badge-violet">REPRODUCED IN DEMO</span>
                <b style={{ fontSize: 16 }}>Change A + Change B</b>
              </div>
              <p className="muted small">
                Backend field rename → Frontend field mismatch → Test failure. Change C (button styling) is excluded —
                it is not required to reproduce this failure under the tested (simulated) conditions.
              </p>
              <p className="muted small">This is a reduced reproducing set, not proof of the true semantic root cause and not a claim of global minimality.</p>
            </>
          ) : (
            <p className="muted small">Not yet determined in this session. It is reported only after all 8 trials are recorded, so the conclusion can be checked against the full table above.</p>
          )}
          <hr className="divider" />
          <h3 style={{ marginBottom: 8 }}>Final verification</h3>
          {complete ? (
            <div className="stack" style={{ gap: 8 }}>
              {FINAL_CHECKS.map((c) => (
                <div key={c.label} className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="small">{c.label}</span><ResultBadge result={c.result} />
                </div>
              ))}
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="small"><b>Investigation status</b></span><span className="badge badge-pass">COMPLETE — SIMULATED</span>
              </div>
            </div>
          ) : (
            <p className="muted small">Pending — final verification re-checks the baseline, full set, and reduced set before the investigation is marked complete.</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 8 }}>Known limitations</h3>
          <ul className="list-clean">
            {KNOWN_LIMITATIONS.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Clean HTML report view ---------------- */

export function HtmlReport({ phase, trialCount, finalStep, onNavigate, notify }: Omit<Props, 'onSelectTrial' | 'onRun'>) {
  const revealed = TRIALS.slice(0, trialCount)
  const evidence = buildEvidence(phase, revealed, finalStep)
  const complete = phase === 'complete'
  const trialsDone = trialCount >= TRIALS.length
  const preDone = !['idle', 'verifying'].includes(phase)

  return (
    <div>
      <div className="row no-print" style={{ marginBottom: 16 }}>
        <button className="btn" onClick={() => onNavigate('reports')}><ArrowLeft size={15} /> Back to Evidence Reports</button>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={() => window.print()}><Printer size={15} /> Print / Save as PDF</button>
        <button className="btn btn-violet" onClick={() => downloadEvidence(evidence, notify)}><Download size={15} /> Download Demo JSON</button>
      </div>

      <div className="report-doc">
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '.08em', fontWeight: 700, color: '#31579e' }}>CAUSALFLOW · EVIDENCE REPORT</p>
        <h2>{INVESTIGATION_ID} — Profile API field mismatch</h2>
        <p style={{ marginTop: 0 }}>Repository <code>{REPO}</code> (demo name only) · Baseline <code>{BASELINE}</code> · Status: <b>{phaseLabel(phase)}</b></p>
        <div className="banner">⚠ Simulated demo artifact. Interactive product simulation using predefined demo data. No real repository was accessed, and no code or tests were executed. Do not cite this as real test evidence.</div>

        <h3>1 · Configuration</h3>
        <p>Test command: <code>{TEST_COMMAND}</code><br />Target failure signature: <code>{TARGET_SIGNATURE}</code></p>
        <table>
          <thead><tr><th>Change</th><th>Title</th><th>File</th><th>Author</th></tr></thead>
          <tbody>
            {CHANGES.map((c) => <tr key={c.id}><td><b>{c.id}</b></td><td>{c.title}</td><td>{c.file}</td><td>{c.author} ({c.authorKind})</td></tr>)}
          </tbody>
        </table>

        <h3>2 · Preconditions</h3>
        {preDone ? (
          <p>Baseline: <span className="rpass">PASS</span>. Full change set (A + B + C): <span className="rfail">TARGET_FAILURE</span> — the configured signature was detected. Both preconditions were satisfied, so minimization could proceed. A non-zero exit code alone would not have been sufficient; the signature match is required.</p>
        ) : (
          <p>Preconditions have not been evaluated in this demo session yet. Run the investigation to populate this section.</p>
        )}

        <h3>3 · Trial history ({revealed.length} of {TRIALS.length} recorded)</h3>
        {revealed.length === 0 ? (
          <p>No trials recorded in this session yet.</p>
        ) : (
          <table>
            <thead><tr><th>Trial</th><th>Changes</th><th>Result</th><th>Duration</th><th>Signature</th></tr></thead>
            <tbody>
              {revealed.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td><td>{changeLabel(t.changes)}</td>
                  <td>{t.result === 'PASS' ? <span className="rpass">PASS</span> : <span className="rfail">{t.result}</span>}</td>
                  <td>{t.duration}</td><td>{t.signatureDetected ? 'matched' : 'not detected'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p>Classification: PASS = target signature not reproduced · TARGET_FAILURE = configured signature detected · INCONCLUSIVE = timeout/conflict/setup error (none occurred in this simulated run; INCONCLUSIVE is never treated as proof a change is unnecessary).</p>

        <h3>4 · Reduced reproducing set</h3>
        {trialsDone ? (
          <p><b>Change A + Change B</b> — status: REPRODUCED IN DEMO. Change A renamed the backend field <code>userName → username</code>; Change B left the frontend expecting <code>userName</code>. Flow: Backend field rename → Frontend field mismatch → Test failure. Change C (button styling) is not required to reproduce this failure under the tested (simulated) conditions. This is a reduced reproducing set — not proof of the true semantic root cause, and not a claim of global minimality.</p>
        ) : (
          <p>Not yet determined in this session.</p>
        )}

        <h3>5 · Final verification</h3>
        {complete ? (
          <p>Baseline verification: <span className="rpass">PASS</span> · Full-set verification: <span className="rfail">TARGET_FAILURE</span> · Reduced-set (A + B) verification: <span className="rfail">TARGET_FAILURE</span> · Unrelated styling change C excluded. Investigation status: <b>COMPLETE — SIMULATED</b>.</p>
        ) : (
          <p>Pending completion of the investigation in this session.</p>
        )}

        <h3>6 · Known limitations</h3>
        <ul>
          {KNOWN_LIMITATIONS.map((l) => <li key={l}>{l}</li>)}
        </ul>
        <p style={{ fontSize: 12, color: '#7286a3', borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 24 }}>
          CausalFlow demo report {INVESTIGATION_ID} · Generated client-side in the browser from predefined demo data · Resets on page refresh.
        </p>
      </div>
    </div>
  )
}
