import { useMemo, useState, type FormEvent } from 'react'
import { AlertTriangle, BookOpen, FileCode2, Plus, Search, X } from 'lucide-react'
import type { MemoryEntry, MemoryStatus, MemoryType } from '../types'
import { MemoryStatusBadge } from './ui'

interface Props {
  memories: MemoryEntry[]
  onAdd: (entry: Omit<MemoryEntry, 'id' | 'status' | 'createdLabel'>) => void
}

const STATUS_FILTERS: ('ALL' | MemoryStatus)[] = ['ALL', 'RECORDED', 'SUPPORTED', 'VERIFIED', 'STALE']
const TYPES: MemoryType[] = ['Decision', 'Assumption', 'Verified lesson', 'Dependency']

export default function Memory({ memories, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'ALL' | MemoryStatus>('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')

  const [type, setType] = useState<MemoryType>('Decision')
  const [summary, setSummary] = useState('')
  const [source, setSource] = useState('')
  const [files, setFiles] = useState('')
  const [evidence, setEvidence] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return memories.filter((m) => {
      if (status !== 'ALL' && m.status !== status) return false
      if (!q) return true
      const hay = [m.summary, m.type, m.status, m.evidence, m.source, ...m.affectedFiles].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [memories, query, status])

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: memories.length }
    for (const s of STATUS_FILTERS.slice(1)) c[s] = memories.filter((m) => m.status === s).length
    return c
  }, [memories])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!summary.trim()) { setFormError('A summary is required — describe the decision, assumption, lesson, or dependency in one or two sentences.'); return }
    if (!source.trim()) { setFormError('A source is required so reviewers know where this memory came from.'); return }
    setFormError('')
    onAdd({
      type,
      summary: summary.trim(),
      evidence: evidence.trim() || 'No supporting evidence attached yet',
      affectedFiles: files.split(',').map((f) => f.trim()).filter(Boolean),
      source: source.trim(),
      addedInSession: true,
    })
    setSummary(''); setSource(''); setFiles(''); setEvidence(''); setType('Decision')
    setFormOpen(false)
  }

  return (
    <div>
      <div className="page-head">
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <span className="badge badge-violet">SHARED PROJECT MEMORY</span>
          <span className="badge badge-demo">DEMO DATA</span>
        </div>
        <h2>Project Memory</h2>
        <p>
          Decisions, assumptions, dependencies, and verified lessons — stored with their evidence so developers and AI agents
          retrieve context they can actually rely on. Entries earn SUPPORTED or VERIFIED status from evidence, never from who (or what) wrote them.
        </p>
      </div>

      <div className="grid grid-4 mb">
        {STATUS_FILTERS.slice(1).map((s) => (
          <button key={s} className="card kpi" style={{ textAlign: 'left', borderColor: status === s ? 'var(--blue)' : undefined }}
            onClick={() => setStatus(status === s ? 'ALL' : (s as MemoryStatus))}>
            <div className="k-label"><BookOpen size={13} /> {s}</div>
            <div className="k-value">{counts[s]}</div>
            <div className="k-sub">
              {s === 'RECORDED' && 'Captured, no evidence yet'}
              {s === 'SUPPORTED' && 'Evidence attached'}
              {s === 'VERIFIED' && 'Confirmed by recorded test evidence'}
              {s === 'STALE' && 'Needs revalidation'}
            </div>
          </button>
        ))}
      </div>

      <div className="card mb">
        <div className="searchbar">
          <div className="input-wrap">
            <Search size={16} />
            <input type="search" placeholder="Search by keyword or file path — try “userName” or “Profile.jsx”…"
              value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search project memory" />
          </div>
          {(query || status !== 'ALL') && (
            <button className="btn" onClick={() => { setQuery(''); setStatus('ALL') }}><X size={14} /> Clear filters</button>
          )}
          <button className="btn btn-primary" onClick={() => setFormOpen(!formOpen)}>
            <Plus size={15} /> {formOpen ? 'Close form' : 'Add Memory'}
          </button>
        </div>
        <div className="filters" style={{ marginTop: 12 }} role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => (
            <button key={s} className={`fchip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
              {s === 'ALL' ? `All statuses (${counts.ALL})` : `${s} (${counts[s]})`}
            </button>
          ))}
        </div>

        {formOpen && (
          <form onSubmit={submit} className="fade-up" style={{ marginTop: 16, borderTop: '1px dashed var(--border)', paddingTop: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Add a memory entry <span className="badge badge-demo" style={{ marginLeft: 6 }}>SESSION ONLY</span></h3>
            <p className="small muted" style={{ margin: '0 0 14px' }}>
              New entries start as <b>RECORDED</b>. They can only become SUPPORTED or VERIFIED once evidence is attached and reviewed —
              selecting “Verified lesson” as the type does not verify the entry, and AI-generated text never self-verifies.
            </p>
            <div className="grid grid-2">
              <div>
                <label className="f" htmlFor="mem-type">Type</label>
                <select id="mem-type" value={type} onChange={(e) => setType(e.target.value as MemoryType)}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="f" htmlFor="mem-source">Source *</label>
                <input id="mem-source" type="text" placeholder="e.g. dev-api · PR review, or agent-ui-2 · session note"
                  value={source} onChange={(e) => setSource(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="f" htmlFor="mem-summary">Summary *</label>
              <textarea id="mem-summary" placeholder="State the fact plainly, e.g. “Checkout totals are rounded half-up at the API layer, not in the UI.”"
                value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>
            <div className="grid grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="f" htmlFor="mem-files">Affected files (comma-separated)</label>
                <input id="mem-files" type="text" placeholder="backend/profile.py, frontend/Profile.jsx"
                  value={files} onChange={(e) => setFiles(e.target.value)} />
              </div>
              <div>
                <label className="f" htmlFor="mem-evidence">Evidence references</label>
                <input id="mem-evidence" type="text" placeholder="e.g. demo commit a1b2c3d · trial T-002 · report INV-DEMO-001"
                  value={evidence} onChange={(e) => setEvidence(e.target.value)} />
              </div>
            </div>
            {formError && (
              <div className="warn-box" role="alert"><AlertTriangle size={15} style={{ flex: '0 0 auto', marginTop: 1 }} /> {formError}</div>
            )}
            <div className="row mt">
              <button type="submit" className="btn btn-primary"><Plus size={15} /> Add as RECORDED</button>
              <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
              <span className="sr-note">Stored in browser state for this demo session only; resets on refresh.</span>
            </div>
          </form>
        )}
      </div>

      <p className="small muted" style={{ margin: '0 0 10px' }}>
        Showing <b style={{ color: 'var(--text)' }}>{filtered.length}</b> of {memories.length} entries
        {query && <> matching “<span className="mono">{query}</span>”</>}
        {status !== 'ALL' && <> with status <b style={{ color: 'var(--text)' }}>{status}</b></>}
      </p>

      {filtered.length === 0 ? (
        <div className="empty">
          <b>No memory entries match</b>
          Try a different keyword or file path, or clear the filters to browse everything the team has recorded.
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => { setQuery(''); setStatus('ALL') }}>Clear search &amp; filters</button>
          </div>
        </div>
      ) : (
        <div className="stack">
          {filtered.map((m) => (
            <article key={m.id} className={`mem status-${m.status} fade-up`}>
              <div className="row" style={{ gap: 7 }}>
                <span className="badge badge-violet">{m.type.toUpperCase()}</span>
                <MemoryStatusBadge status={m.status} />
                {m.addedInSession && <span className="badge badge-blue">ADDED THIS SESSION</span>}
                <span className="faint mono" style={{ marginLeft: 'auto', fontSize: 11.5 }}>{m.id} · {m.createdLabel}</span>
              </div>
              <p className="summary">{m.summary}</p>
              <div className="meta">
                <span><b className="faint">Evidence:</b> {m.evidence}</span>
                <span><b className="faint">Source:</b> {m.source}</span>
                {m.affectedFiles.length > 0 && (
                  <span className="row" style={{ gap: 6 }}>
                    <FileCode2 size={13} className="faint" />
                    {m.affectedFiles.map((f) => <span key={f} className="mono">{f}</span>)}
                  </span>
                )}
              </div>
              {m.warning && (
                <div className="warn-box"><AlertTriangle size={15} style={{ flex: '0 0 auto', marginTop: 1 }} /> <span><b>Stale — revalidate before relying on this.</b> {m.warning}</span></div>
              )}
              {m.status === 'RECORDED' && (
                <p className="sr-note" style={{ margin: '9px 0 0' }}>Recorded without supporting evidence. Treat as a lead to check, not as established fact.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
