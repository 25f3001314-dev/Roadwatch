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
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'MEDIUM':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
}

export function statusClass(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'ASSIGNED':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'IN_PROGRESS':
      return 'border-violet-200 bg-violet-50 text-violet-700'
    case 'RESOLVED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}
