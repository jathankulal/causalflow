/** Generates and downloads the simulated evidence JSON entirely in the browser. */
export function downloadEvidence(evidence: unknown, notify: (m: string) => void) {
  const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'causalflow-INV-DEMO-001-demo-evidence.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  notify('Demo JSON downloaded — simulated evidence artifact')
}
