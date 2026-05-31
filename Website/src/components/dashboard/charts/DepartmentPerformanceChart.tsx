import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartShell } from './ChartShell'
import { ChartTooltip } from './ChartTooltip'
import type { DepartmentPerformancePoint } from '@/utils/dashboard'

interface DepartmentPerformanceChartProps {
  data: DepartmentPerformancePoint[]
  loading?: boolean
  emptyTitle: string
  emptyDescription: string
  height?: number
}

export function DepartmentPerformanceChart({
  data,
  loading = false,
  emptyTitle,
  emptyDescription,
  height = 360,
}: DepartmentPerformanceChartProps) {
  const hasData = data.length > 0

  return (
    <ChartShell loading={loading} hasData={hasData} emptyTitle={emptyTitle} emptyDescription={emptyDescription} minHeight={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={108} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#0f172a', fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} />
          <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ paddingBottom: 8, fontSize: 12, color: '#475569' }} />
          <Bar dataKey="resolved" name="Resolved" stackId="department" fill="#16a34a" radius={[0, 0, 0, 0]} barSize={18} />
          <Bar dataKey="open" name="Open" stackId="department" fill="#f59e0b" radius={[0, 12, 12, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}