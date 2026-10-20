import type { Change, MemoryEntry, Phase, RecentInvestigation, Trial } from './types'

export const INVESTIGATION_ID = 'INV-DEMO-001'
export const REPO = 'payment-dashboard-demo'
export const BASELINE = 'a1b2c3d'
export const TEST_COMMAND = 'pytest tests/test_profile_api.py'
export const TARGET_SIGNATURE = 'AssertionError: expected userName field'

export const CHANGES: Change[] = [
  {
    id: 'A',
    label: 'Change A',
    title: 'Backend field renamed: userName → username',
    summary: 'Profile API response now returns `username` instead of `userName`.',
    file: 'backend/profile.py',
    author: 'dev-api',
    authorKind: 'Developer',
    diff: [
      { kind: 'context', text: '  return {' },
      { kind: 'remove', text: '-   "userName": user.display_name,' },
      { kind: 'add', text: '+   "username": user.display_name,' },
      { kind: 'context', text: '    "email": user.email,' },
      { kind: 'context', text: '  }' },
    ],
  },
  {
    id: 'B',
    label: 'Change B',
    title: 'Frontend still expects `userName`',
    summary: 'Profile component continues to read the previous `userName` field from the API response.',
    file: 'frontend/Profile.jsx',
    author: 'agent-ui-2',
    authorKind: 'AI agent',
    diff: [
      { kind: 'context', text: '  // profile header (unchanged field read)' },
      { kind: 'context', text: '  const name = profile.userName;' },
      { kind: 'add', text: '+ // TODO: confirm API field naming' },
      { kind: 'context', text: '  return <h1>{name}</h1>;' },
    ],
  },
  {
    id: 'C',
    label: 'Change C',
    title: 'Update button styling',
    summary: 'Cosmetic style update to primary buttons. No API or data-flow changes.',
    file: 'frontend/styles/buttons.css',
    author: 'agent-ui-2',
    authorKind: 'AI agent',
    diff: [
      { kind: 'remove', text: '- .btn-primary { border-radius: 6px; }' },
      { kind: 'add', text: '+ .btn-primary { border-radius: 8px; }' },
      { kind: 'add', text: '+ .btn-primary { letter-spacing: .01em; }' },
    ],
  },
]

export const changeLabel = (ids: string[]) =>
  ids.length === 0 ? 'None (baseline)' : ids.join(' + ')

export const TRIALS: Trial[] = [
  {
    id: 'T-001',
    changes: ['A', 'B', 'C'],
    result: 'TARGET_FAILURE',
    duration: '4.2s',
    durationMs: 4200,
    exitCode: 1,
    signatureDetected: true,
    signature: TARGET_SIGNATURE,
    log: [
      '$ pytest tests/test_profile_api.py  [simulated]',
      'tests/test_profile_api.py::test_profile_response_shape FAILED',
      'AssertionError: expected userName field',
      '1 failed, 3 passed in 4.18s  [simulated output]',
    ],
    explanation:
      'Exit code was non-zero AND the configured target signature was found in the output, so this trial is classified TARGET_FAILURE — not merely “failed”.',
  },
  {
    id: 'T-002',
    changes: ['A', 'B'],
    result: 'TARGET_FAILURE',
    duration: '3.9s',
    durationMs: 3900,
    exitCode: 1,
    signatureDetected: true,
    signature: TARGET_SIGNATURE,
    log: [
      '$ pytest tests/test_profile_api.py  [simulated]',
      'tests/test_profile_api.py::test_profile_response_shape FAILED',
      'AssertionError: expected userName field',
      '1 failed, 3 passed in 3.87s  [simulated output]',
    ],
    explanation:
      'The renamed backend field (A) together with the frontend still expecting `userName` (B) reproduces the exact configured signature, without the styling change.',
  },
  {
    id: 'T-003',
    changes: ['A', 'C'],
    result: 'PASS',
    duration: '3.6s',
    durationMs: 3600,
    exitCode: 0,
    signatureDetected: false,
    signature: null,
    log: [
      '$ pytest tests/test_profile_api.py  [simulated]',
      'tests/test_profile_api.py ....  [100%]',
      '4 passed in 3.58s  [simulated output]',
    ],
    explanation:
      'Without Change B, nothing in the tested path reads the old field name, so the configured signature does not occur. Classified PASS.',
  },
  {
    id: 'T-004',
    changes: ['B', 'C'],
    result: 'PASS',
    duration: '3.8s',
    durationMs: 3800,
    exitCode: 0,
    signatureDetected: false,
    signature: null,
    log: [
      '$ pytest tests/test_profile_api.py  [simulated]',
      'tests/test_profile_api.py ....  [100%]',
      '4 passed in 3.74s  [simulated output]',
    ],
    explanation:
      'Without the backend rename (A), the API still returns `userName`, which is what Change B expects. No mismatch, classified PASS.',
  },
  {
    id: 'T-005',
    changes: ['A'],
    result: 'PASS',
    duration: '3.4s',
    durationMs: 3400,
    exitCode: 0,
    signatureDetected: false,
    signature: null,
    log: [
      '$ pytest tests/test_profile_api.py  [simulated]',
      'tests/test_profile_api.py ....  [100%]',
      '4 passed in 3.36s  [simulated output]',
    ],
    explanation:
      'Change A alone does not reproduce the target failure under the tested conditions — the mismatch needs a consumer still expecting the old field.',
  },
  {
    id: 'T-006',
    changes: ['B'],
    result: 'PASS',
    duration: '3.5s',
    durationMs: 3500,
    exitCode: 0,
    signatureDetected: false,
    signature: null,
    log: [
      '$ pytest tests/test_profile_api.py  [simulated]',
      'tests/test_profile_api.py ....  [100%]',
      '4 passed in 3.49s  [simulated output]',
    ],
    explanation:
      'Change B alone is consistent with the baseline API, which still returns `userName`. Classified PASS.',
  },
  {
    id: 'T-007',
    changes: ['C'],
    result: 'PASS',
    duration: '3.3s',
    durationMs: 3300,
    exitCode: 0,
    signatureDetected: false,
    signature: null,
    log: [
      '$ pytest tests/test_profile_api.py  [simulated]',
      'tests/test_profile_api.py ....  [100%]',
      '4 passed in 3.28s  [simulated output]',
    ],
    explanation:
      'The styling change does not touch the profile data flow and does not reproduce the configured signature. Classified PASS.',
  },
  {
    id: 'T-008',
    changes: [],
    result: 'PASS',
    duration: '3.2s',
    durationMs: 3200,
    exitCode: 0,
    signatureDetected: false,
    signature: null,
    log: [
      '$ pytest tests/test_profile_api.py  [simulated]',
      'tests/test_profile_api.py ....  [100%]',
      '4 passed in 3.17s  [simulated output]',
    ],
    explanation:
      'Baseline re-check: with no changes applied, the test suite passes. This confirms the precondition that the baseline is green.',
  },
]

export const PRECONDITION_STEPS = [
  { label: 'Resolving commit references', detail: `baseline ${BASELINE} · changes A, B, C (demo refs)` },
  { label: 'Preparing an isolated temporary workspace', detail: 'temp workspace · not a security sandbox' },
  { label: 'Running baseline tests', detail: TEST_COMMAND },
  { label: 'Replaying all three changes', detail: 'A + B + C on top of baseline' },
  { label: 'Checking for the configured target failure', detail: TARGET_SIGNATURE },
]

export const FINAL_CHECKS = [
  { label: 'Baseline verification', result: 'PASS' as const, detail: 'Baseline a1b2c3d re-tested — no target signature.' },
  { label: 'Full-set verification (A + B + C)', result: 'TARGET_FAILURE' as const, detail: 'Configured signature detected again.' },
  { label: 'Reduced-set verification (A + B)', result: 'TARGET_FAILURE' as const, detail: 'Reduced set reproduces the same target failure.' },
  { label: 'Unrelated change excluded', result: 'PASS' as const, detail: 'Change C (button styling) is not in the reproducing set.' },
]

export const INITIAL_MEMORIES: MemoryEntry[] = [
  {
    id: 'MEM-001',
    type: 'Decision',
    summary: 'Profile API uses the `username` field in the current backend response.',
    status: 'SUPPORTED',
    evidence: 'Demo commit a1b2c3d',
    affectedFiles: ['backend/profile.py'],
    source: 'dev-api · code review (simulated)',
    createdLabel: 'Demo · 2 days ago',
  },
  {
    id: 'MEM-002',
    type: 'Assumption',
    summary: 'Frontend profile components may still reference the previous `userName` field.',
    status: 'RECORDED',
    evidence: 'No supporting evidence attached yet',
    affectedFiles: ['frontend/Profile.jsx'],
    source: 'agent-ui-2 · session note (simulated)',
    createdLabel: 'Demo · 1 day ago',
  },
  {
    id: 'MEM-003',
    type: 'Verified lesson',
    summary: 'The profile integration fixture detects a mismatch between backend and frontend field names.',
    status: 'VERIFIED',
    evidence: 'Simulated test report INV-DEMO-001',
    affectedFiles: ['tests/test_profile_api.py', 'backend/profile.py', 'frontend/Profile.jsx'],
    source: 'CausalFlow investigation (simulated)',
    createdLabel: 'Demo · 5 hours ago',
  },
  {
    id: 'MEM-004',
    type: 'Dependency',
    summary: 'Profile page rendering depends on the backend response schema.',
    status: 'STALE',
    evidence: 'Previously: demo commit 9f8e7d6',
    affectedFiles: ['frontend/Profile.jsx', 'backend/profile.py'],
    source: 'Architecture note (simulated)',
    warning: 'Revalidation required after related code changes.',
    createdLabel: 'Demo · 3 weeks ago',
  },
]

export const RECENT_INVESTIGATIONS: RecentInvestigation[] = [
  {
    id: INVESTIGATION_ID,
    title: 'Profile API field mismatch',
    repo: REPO,
    changes: 3,
    trials: '8 planned',
    result: 'A + B (after trials)',
    status: 'ACTIVE',
    updated: 'Live in this demo',
    note: 'The interactive investigation on the Investigations screen. Run it to evaluate all 8 combinations.',
  },
  {
    id: 'INV-DEMO-000',
    title: 'Checkout total rounding mismatch',
    repo: REPO,
    changes: 4,
    trials: '11 / 16 evaluated',
    result: 'Reduced set: change 2 + 4',
    status: 'COMPLETE — SIMULATED',
    updated: 'Demo history · yesterday',
    note: 'Illustrative historical entry. Two currency-formatting changes only failed in combination under the simulated fixture.',
  },
  {
    id: 'INV-DEMO-00X',
    title: 'Flaky session-timeout fixture',
    repo: REPO,
    changes: 2,
    trials: '3 / 4 evaluated',
    result: 'No conclusion — timeouts',
    status: 'INCONCLUSIVE — SIMULATED',
    updated: 'Demo history · 3 days ago',
    note: 'Illustrative entry showing correct handling: repeated timeouts were classified INCONCLUSIVE and were never treated as proof a change was unnecessary.',
  },
]

export const TRUST_RULES: { title: string; body: string }[] = [
  {
    title: 'Exit code ≠ target failure',
    body: 'A non-zero exit code alone does not prove the configured target failure occurred. The signature must also match.',
  },
  {
    title: 'Three distinct outcomes',
    body: 'PASS, TARGET_FAILURE, and INCONCLUSIVE are different states and are never collapsed into pass/fail.',
  },
  {
    title: 'Ambiguity is INCONCLUSIVE',
    body: 'Timeouts, replay conflicts, setup errors, and ambiguous results are classified INCONCLUSIVE — never as proof a change is unnecessary.',
  },
  {
    title: 'Every subset is recorded',
    body: 'Every attempted combination gets a trial ID, an outcome, a duration, and evidence.',
  },
  {
    title: 'Memory needs evidence',
    body: 'Entries are only SUPPORTED or VERIFIED with attached evidence. AI-generated text alone never verifies a memory.',
  },
  {
    title: 'Reduced set ≠ proven root cause',
    body: 'A reduced reproducing set reproduces the failure under the tested conditions. It is not automatic proof of the true semantic root cause, nor a guarantee of global minimality.',
  },
  {
    title: 'Worktrees are not sandboxes',
    body: 'Git worktrees and temporary directories isolate files, not execution. They are not security sandboxes.',
  },
]

export const KNOWN_LIMITATIONS = [
  'This report is a simulated demo artifact. No real repository was accessed and no code or tests were executed.',
  'The reduced reproducing set (A + B) reproduces the configured failure under the simulated test conditions only. It does not prove the true semantic root cause.',
  'No claim is made that A + B is the globally smallest possible reproducing set across all possible conditions.',
  'Results depend on the single configured test command and target failure signature. Other tests could classify subsets differently.',
  'INCONCLUSIVE outcomes (timeouts, replay conflicts, setup errors) must never be read as evidence that a change is unnecessary. None occurred in this simulated run.',
  'Temporary workspaces used for replay are not security sandboxes.',
]

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'idle': return 'Not started'
    case 'verifying': return 'Verifying preconditions…'
    case 'preconditions_met': return 'Preconditions met'
    case 'trialing': return 'Evaluating combinations…'
    case 'trials_complete': return 'Reduced set identified'
    case 'final_verifying': return 'Final verification…'
    case 'complete': return 'COMPLETE — SIMULATED'
  }
}

export function buildEvidence(phase: Phase, revealedTrials: Trial[], finalStep: number) {
  const complete = phase === 'complete'
  const trialsDone = revealedTrials.length >= TRIALS.length
  return {
    artifact: 'CausalFlow evidence report',
    simulated: true,
    disclaimer:
      'Interactive product simulation using predefined demo data. No real repository or code execution is connected.',
    investigation: {
      id: INVESTIGATION_ID,
      title: 'Profile API field mismatch',
      repository: REPO,
      repositoryNote: 'Demo repository name only — no real repository was accessed.',
      baselineCommit: BASELINE,
      testCommand: TEST_COMMAND,
      targetFailureSignature: TARGET_SIGNATURE,
      status: complete ? 'COMPLETE — SIMULATED' : phaseLabel(phase),
      changes: CHANGES.map((c) => ({
        id: c.id,
        title: c.title,
        file: c.file,
        author: `${c.author} (${c.authorKind})`,
      })),
    },
    classificationRules: {
      PASS: 'Tests passed and the target signature was not detected.',
      TARGET_FAILURE:
        'Tests failed AND the configured target signature was detected. A non-zero exit code alone is insufficient.',
      INCONCLUSIVE:
        'Timeout, replay conflict, setup error, or ambiguous output. Never interpreted as proof a change is unnecessary.',
    },
    preconditions: {
      baseline: { expected: 'PASS', observed: phase === 'idle' || phase === 'verifying' ? 'PENDING (demo)' : 'PASS' },
      fullChangeSet: {
        changes: ['A', 'B', 'C'],
        expected: 'TARGET_FAILURE',
        observed: phase === 'idle' || phase === 'verifying' ? 'PENDING (demo)' : 'TARGET_FAILURE',
      },
      gate: 'Minimization proceeds only when baseline = PASS and full set = TARGET_FAILURE.',
    },
    trials: revealedTrials.map((t) => ({
      trialId: t.id,
      changesIncluded: t.changes,
      changesLabel: changeLabel(t.changes),
      result: t.result,
      durationMs: t.durationMs,
      simulatedExitCode: t.exitCode,
      signatureDetected: t.signatureDetected,
      signature: t.signature,
      explanation: t.explanation,
      logExcerpt: t.log,
      logNote: 'Simulated log excerpt — no test was actually executed.',
    })),
    trialsEvaluated: revealedTrials.length,
    trialsPlanned: TRIALS.length,
    reducedReproducingSet: trialsDone
      ? {
          changes: ['A', 'B'],
          label: 'Change A + Change B',
          status: 'REPRODUCED IN DEMO',
          excluded: [{ change: 'C', reason: 'Not required to reproduce this failure under the tested (simulated) conditions.' }],
          interpretation:
            'A reduced reproducing set under the simulated test conditions. Not proof of the true semantic root cause, and not a claim of global minimality.',
          flow: 'Backend field rename → Frontend field mismatch → Test failure',
        }
      : null,
    finalVerification: complete
      ? FINAL_CHECKS.slice(0, Math.max(finalStep, FINAL_CHECKS.length)).map((c) => ({
          check: c.label,
          result: c.result,
          detail: c.detail,
        }))
      : [],
    knownLimitations: KNOWN_LIMITATIONS,
    generatedAtLabel: 'Demo session (client-side, resets on refresh)',
  }
}
