import { AlertTriangle, CheckCircle2, CircleHelp, XCircle } from 'lucide-react'
import type { MemoryStatus, TrialResult } from '../types'

export function ResultBadge({ result }: { result: TrialResult }) {
  if (result === 'PASS')
    return <span className="badge badge-pass"><CheckCircle2 size={12} /> PASS</span>
  if (result === 'TARGET_FAILURE')
    return <span className="badge badge-fail"><XCircle size={12} /> TARGET_FAILURE</span>
  return <span className="badge badge-inconclusive"><CircleHelp size={12} /> INCONCLUSIVE</span>
}

export function MemoryStatusBadge({ status }: { status: MemoryStatus }) {
  const cls =
    status === 'VERIFIED' ? 'badge-pass'
    : status === 'SUPPORTED' ? 'badge-blue'
    : status === 'STALE' ? 'badge-inconclusive'
    : ''
  const Icon = status === 'STALE' ? AlertTriangle : status === 'VERIFIED' ? CheckCircle2 : CircleHelp
  return <span className={`badge ${cls}`}><Icon size={12} /> {status}</span>
}

export function ChangeChips({ changes, dimMissing = false }: { changes: string[]; dimMissing?: boolean }) {
  if (!dimMissing) {
    if (changes.length === 0) return <span className="muted small">None (baseline)</span>
    return (
      <span className="chips">
        {changes.map((c) => <span key={c} className="chip on">{c}</span>)}
      </span>
    )
  }
  return (
    <span className="chips">
      {['A', 'B', 'C'].map((c) => (
        <span key={c} className={`chip ${changes.includes(c) ? 'on' : 'off'}`}>{c}</span>
      ))}
    </span>
  )
}

export function ClassificationLegend() {
  return (
    <div>
      <div className="legend-row">
        <ResultBadge result="PASS" />
        <span>Tests passed; target signature not detected.</span>
      </div>
      <div className="legend-row">
        <ResultBadge result="TARGET_FAILURE" />
        <span>Tests failed <b>and</b> the configured signature matched. Exit code alone is not enough.</span>
      </div>
      <div className="legend-row">
        <ResultBadge result="INCONCLUSIVE" />
        <span>Timeout, conflict, or setup error. Never proof a change is unnecessary.</span>
      </div>
    </div>
  )
}
