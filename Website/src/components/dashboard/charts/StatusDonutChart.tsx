import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartShell } from './ChartShell'
import { ChartTooltip } from './ChartTooltip'
import type { DistributionPoint } from '@/utils/dashboard'

interface StatusDonutChartProps {
  data: DistributionPoint[]
  loading?: boolean
  emptyTitle: string
  emptyDescription: string
  height?: number
}

export function StatusDonutChart({
  data,
  loading = false,
  emptyTitle,
  emptyDescription,
  height = 320,
}: StatusDonutChartProps) {
  const hasData = data.length > 0

  return (
    <ChartShell loading={loading} hasData={hasData} emptyTitle={emptyTitle} emptyDescription={emptyDescription} minHeight={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#475569' }} />
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="44%" innerRadius={68} outerRadius={104} paddingAngle={3} stroke="none">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}