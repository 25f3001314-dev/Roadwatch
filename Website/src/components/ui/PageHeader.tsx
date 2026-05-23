import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-slate-200 bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur sm:px-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
