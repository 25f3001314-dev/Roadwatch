import { DEPARTMENTS, STATUSES } from '@/types/complaint'
import type { ComplaintListFilters } from '@/hooks/useComplaints'

interface ComplaintFiltersProps {
  filters: ComplaintListFilters
  onChange: (key: keyof ComplaintListFilters, value: string) => void
  onClear: () => void
}

const selectClass =
  'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200'

export function ComplaintFilters({ filters, onChange, onClear }: ComplaintFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <select
        value={filters.status}
        onChange={(e) => onChange('status', e.target.value)}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={filters.severity}
        onChange={(e) => onChange('severity', e.target.value)}
        className={selectClass}
        aria-label="Filter by severity"
      >
        <option value="">All severities</option>
        <option value="HIGH">HIGH</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="LOW">LOW</option>
      </select>
      <select
        value={filters.department}
        onChange={(e) => onChange('department', e.target.value)}
        className={selectClass}
        aria-label="Filter by department"
      >
        <option value="">All departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <input
        placeholder="Road type (NH, SH…)"
        value={filters.roadType}
        onChange={(e) => onChange('roadType', e.target.value)}
        className={selectClass}
        aria-label="Filter by road type"
      />
      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
      >
        Clear
      </button>
    </div>
  )
}
