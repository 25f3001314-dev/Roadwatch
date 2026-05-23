interface DetailEmptyStateProps {
  title: string
  description: string
}

export function DetailEmptyState({ title, description }: DetailEmptyStateProps) {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-6 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}