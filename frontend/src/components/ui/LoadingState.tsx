interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-3 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      <span>{message}</span>
    </div>
  )
}
