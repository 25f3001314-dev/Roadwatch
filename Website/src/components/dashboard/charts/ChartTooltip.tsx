interface ChartTooltipEntry {
  name?: string
  value?: number | string
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: ChartTooltipEntry[]
}

const NUMBER_FORMATTER = new Intl.NumberFormat('en-IN')

export function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-[220px] rounded-[20px] border border-slate-200 bg-white/98 p-3.5 shadow-2xl shadow-slate-200/80 backdrop-blur">
      {label != null && (
        <div className="border-b border-slate-100 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Live sample</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{label}</p>
        </div>
      )}
      <div className="mt-3 space-y-2">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full ring-2 ring-slate-100" style={{ backgroundColor: entry.color || '#7c3aed' }} />
              <span className="text-slate-600">{entry.name}</span>
            </div>
            <span className="font-semibold text-slate-900">
              {typeof entry.value === 'number' ? NUMBER_FORMATTER.format(entry.value) : entry.value ?? '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}