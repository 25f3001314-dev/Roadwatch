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
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {value}
    </span>
  )
}
