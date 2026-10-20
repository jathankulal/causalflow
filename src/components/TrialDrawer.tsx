import { useEffect } from 'react'
import { X } from 'lucide-react'
import { CHANGES, TARGET_SIGNATURE, TEST_COMMAND, changeLabel } from '../data'
import type { Trial } from '../types'
import { ChangeChips, ResultBadge } from './ui'

interface Props {
  trial: Trial | null
  onClose: () => void
}

export default function TrialDrawer({ trial, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const open = trial !== null
  const included = trial ? CHANGES.filter((c) => trial.changes.includes(c.id)) : []

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden={!open} />
      <aside className={`drawer ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Trial evidence" aria-hidden={!open}>
        {trial && (
          <>
            <div className="drawer-head">
              <div>
                <div className="row" style={{ gap: 7 }}>
                  <b className="mono" style={{ fontSize: 16 }}>{trial.id}</b>
                  <ResultBadge result={trial.result} />
                  <span className="badge badge-demo">SIMULATED</span>
                </div>
                <p className="muted small" style={{ margin: '5px 0 0' }}>
                  Trial evidence · {changeLabel(trial.changes)} · simulated run, no test was executed
                </p>
              </div>
              <div style={{ flex: 1 }} />
              <button className="icon-btn" onClick={onClose} aria-label="Close trial evidence"><X size={16} /></button>
            </div>

            <div className="drawer-body">
              <section>
                <h5>Selected changes</h5>
                <ChangeChips changes={trial.changes} dimMissing={trial.changes.length > 0} />
                {included.length === 0 ? (
                  <p className="small muted" style={{ marginTop: 8 }}>No changes applied — this trial re-checks the baseline state.</p>
                ) : (
                  <div className="stack" style={{ gap: 7, marginTop: 9 }}>
                    {included.map((c) => (
                      <div key={c.id} className="small">
                        <b>{c.label} — {c.title}</b>
                        <div className="mono faint" style={{ fontSize: 11.5 }}>{c.file}</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h5>Result &amp; classification inputs</h5>
                <dl className="kv" style={{ gridTemplateColumns: '150px 1fr' }}>
                  <dt>Test command</dt><dd className="mono">{TEST_COMMAND}</dd>
                  <dt>Result</dt><dd><ResultBadge result={trial.result} /></dd>
                  <dt>Simulated exit code</dt><dd className="mono">{trial.exitCode}</dd>
                  <dt>Duration (illustrative)</dt><dd className="mono">{trial.duration}</dd>
                  <dt>Target signature</dt>
                  <dd>
                    {trial.signatureDetected
                      ? <span className="mono" style={{ color: '#ff9db0' }}>Detected — {trial.signature}</span>
                      : <span className="muted">Not detected (configured: <span className="mono">{TARGET_SIGNATURE}</span>)</span>}
                  </dd>
                </dl>
              </section>

              <section>
                <h5>Simulated log excerpt</h5>
                <div className="codeblock">{trial.log.join('\n')}</div>
                <p className="sr-note" style={{ marginTop: 7 }}>Predefined demo output. No shell command ran and no log was captured from a real test run.</p>
              </section>

              <section>
                <h5>Why this classification?</h5>
                <div className="callout" style={{ fontSize: 13 }}>{trial.explanation}</div>
                <p className="sr-note" style={{ marginTop: 9 }}>
                  Reminder: PASS here means “the configured target failure was not reproduced by this subset under the simulated
                  conditions” — it is not a general claim that the changes are bug-free.
                </p>
              </section>

              <button className="btn" onClick={onClose}>Close evidence</button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
