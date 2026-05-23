import { severityClass, statusClass } from '@/utils/format'

type BadgeVariant = 'severity' | 'status'

interface BadgeProps {
  variant: BadgeVariant
  value: string
}

export function Badge({ variant, value }: BadgeProps) {
  const className =
    variant === 'severity' ? severityClass(value) : statusClass(value)
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap shadow-sm ${className}`}>
      {value}
    </span>
  )
}
