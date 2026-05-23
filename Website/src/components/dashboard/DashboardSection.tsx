import type { ReactNode } from 'react'

interface DashboardSectionProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardSection({
  title,
  subtitle,
  action,
  children,
  className = '',
}: DashboardSectionProps) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-950 sm:text-base">{title}</h3>
          {subtitle && <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  )
}