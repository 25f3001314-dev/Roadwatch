interface StatCardProps {
  label: string
  value: number | string
  accent?: 'purple' | 'red' | 'green' | 'blue' | 'yellow'
}

const accents: Record<NonNullable<StatCardProps['accent']>, string> = {
  purple: 'border-brand-500 bg-brand-50',
  red: 'border-red-500 bg-red-50',
  green: 'border-green-500 bg-green-50',
  blue: 'border-blue-500 bg-blue-50',
  yellow: 'border-yellow-500 bg-yellow-50',
}

export function StatCard({ label, value, accent = 'purple' }: StatCardProps) {
  return (
    <div className={`rounded-xl border-l-4 p-5 shadow-sm ${accents[accent]}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
