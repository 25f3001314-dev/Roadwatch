import type { ReactNode } from 'react'

interface DetailSectionProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function DetailSection({ title, subtitle, action, children, className = '' }: DetailSectionProps) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="min-w-0 break-words">
          <h3 className="min-w-0 break-words text-sm font-semibold tracking-tight text-slate-950 sm:text-base">{title}</h3>
          {subtitle && <p className="min-w-0 break-words mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  )
}
