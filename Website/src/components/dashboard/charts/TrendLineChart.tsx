import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartShell } from './ChartShell'
import { ChartTooltip } from './ChartTooltip'
import type { TrendPoint } from '@/utils/dashboard'

interface TrendSeries {
  dataKey: keyof TrendPoint
  name: string
  color: string
}

interface TrendLineChartProps {
  data: TrendPoint[]
  series: TrendSeries[]
  loading?: boolean
  emptyTitle: string
  emptyDescription: string
  height?: number
}

const NUMBER_FORMATTER = new Intl.NumberFormat('en-IN')

export function TrendLineChart({
  data,
  series,
  loading = false,
  emptyTitle,
  emptyDescription,
  height = 320,
}: TrendLineChartProps) {
  const hasData = data.length > 0 && series.length > 0

  return (
    <ChartShell loading={loading} hasData={hasData} emptyTitle={emptyTitle} emptyDescription={emptyDescription} minHeight={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} interval="preserveStartEnd" minTickGap={18} />
          <YAxis tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => NUMBER_FORMATTER.format(Number(value))} width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ paddingBottom: 8, fontSize: 12, color: '#475569' }} />
          {series.map((entry) => (
            <Line
              key={String(entry.dataKey)}
              type="monotone"
              dataKey={entry.dataKey}
              name={entry.name}
              stroke={entry.color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}