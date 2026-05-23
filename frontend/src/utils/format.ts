export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${(value * 100).toFixed(1)}%`
}

export function parseDetections(json: string | null | undefined) {
  if (!json) return []
  try {
    return JSON.parse(json) as Array<{
      label: string
      confidence: number
      rawLabel?: string
    }>
  } catch {
    return []
  }
}

export function severityClass(severity: string): string {
  switch (severity?.toUpperCase()) {
    case 'HIGH':
      return 'bg-red-100 text-red-800'
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-green-100 text-green-800'
  }
}

export function statusClass(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'ASSIGNED':
      return 'bg-blue-100 text-blue-800'
    case 'IN_PROGRESS':
      return 'bg-purple-100 text-purple-800'
    case 'RESOLVED':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}
