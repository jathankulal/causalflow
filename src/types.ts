export type View =
  | 'overview'
  | 'investigations'
  | 'memory'
  | 'reports'
  | 'settings'
  | 'html-report'

export type TrialResult = 'PASS' | 'TARGET_FAILURE' | 'INCONCLUSIVE'

export type Phase =
  | 'idle'
  | 'verifying'
  | 'preconditions_met'
  | 'trialing'
  | 'trials_complete'
  | 'final_verifying'
  | 'complete'

export type ChangeId = 'A' | 'B' | 'C'

export interface Change {
  id: ChangeId
  label: string
  title: string
  summary: string
  file: string
  author: string
  authorKind: 'Developer' | 'AI agent'
  diff: { kind: 'remove' | 'add' | 'context'; text: string }[]
}

export interface Trial {
  id: string
  changes: ChangeId[]
  result: TrialResult
  duration: string
  durationMs: number
  exitCode: number
  signatureDetected: boolean
  signature: string | null
  log: string[]
  explanation: string
}

export type MemoryStatus = 'RECORDED' | 'SUPPORTED' | 'VERIFIED' | 'STALE'
export type MemoryType = 'Decision' | 'Assumption' | 'Verified lesson' | 'Dependency'

export interface MemoryEntry {
  id: string
  type: MemoryType
  summary: string
  status: MemoryStatus
  evidence: string
  affectedFiles: string[]
  source: string
  warning?: string
  createdLabel: string
  addedInSession?: boolean
}

export interface DemoSettings {
  autoAdvance: boolean
  speed: 'normal' | 'fast'
  showTrustPanel: boolean
  compactTrials: boolean
}

export interface RecentInvestigation {
  id: string
  title: string
  repo: string
  changes: number
  trials: string
  result: string
  status: 'ACTIVE' | 'COMPLETE — SIMULATED' | 'INCONCLUSIVE — SIMULATED'
  updated: string
  note: string
}
