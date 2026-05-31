import type { ReactNode } from 'react'
import { DashboardEmptyState } from '../DashboardEmptyState'

interface ChartShellProps {
  loading?: boolean
  hasData: boolean
  emptyTitle: string
  emptyDescription: string
  children: ReactNode
  minHeight?: number
}

export function ChartShell({
  loading = false,
  hasData,
  emptyTitle,
  emptyDescription,
  children,
  minHeight = 320,
}: ChartShellProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-3.5 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="ml-auto h-3.5 w-20 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="grid animate-pulse gap-3 rounded-[24px] border border-slate-100 bg-slate-50 p-4" style={{ minHeight }}>
          <div className="h-3.5 w-28 rounded-full bg-slate-200" />
          <div className="grid flex-1 grid-cols-6 gap-3">
            <div className="col-span-5 rounded-[22px] bg-slate-200/70" />
            <div className="col-span-1 rounded-[22px] bg-slate-200/70" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-16 rounded-full bg-slate-200" />
            <div className="h-3 w-16 rounded-full bg-slate-200" />
            <div className="h-3 w-16 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return <DashboardEmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ minHeight }}>
      {children}
    </div>
  )
}