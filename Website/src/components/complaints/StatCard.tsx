import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: number | string | ReactNode
  accent?: 'purple' | 'red' | 'green' | 'blue' | 'yellow'
  description?: string
  loading?: boolean
  trend?: string
  trendTone?: 'up' | 'down' | 'steady' | 'live'
}

const accents: Record<NonNullable<StatCardProps['accent']>, string> = {
  purple: 'border-brand-200 bg-brand-50/60 text-brand-700',
  red: 'border-red-200 bg-red-50/70 text-red-700',
  green: 'border-emerald-200 bg-emerald-50/70 text-emerald-700',
  blue: 'border-sky-200 bg-sky-50/70 text-sky-700',
  yellow: 'border-amber-200 bg-amber-50/70 text-amber-700',
}

const trendStyles: Record<NonNullable<StatCardProps['trendTone']>, string> = {
  up: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  down: 'border-rose-200 bg-rose-50 text-rose-700',
  steady: 'border-slate-200 bg-slate-50 text-slate-600',
  live: 'border-sky-200 bg-sky-50 text-sky-700',
}

export function StatCard({
  label,
  value,
  accent = 'purple',
  description,
  loading = false,
  trend,
  trendTone = 'live',
}: StatCardProps) {
  return (
    <div className="group relative flex min-h-[162px] flex-col rounded-[26px] border border-slate-200 bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${accents[accent]}`}>
          {label}
        </div>
        {trend && (
          <div className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${trendStyles[trendTone]}`}>
            {trend}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-end">
        {loading ? (
          <div className="h-10 w-24 animate-pulse rounded-2xl bg-slate-200/80" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{value}</p>
        )}
        {description && <p className="mt-2 max-w-[18rem] text-xs leading-5 text-slate-500 sm:text-sm">{description}</p>}
      </div>
    </div>
  )
}
