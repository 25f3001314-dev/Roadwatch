import type { ReactNode } from 'react'

interface DashboardEmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function DashboardEmptyState({ title, description, action }: DashboardEmptyStateProps) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">{title}</p>
      <p className="mt-2 max-w-xl text-sm text-slate-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}