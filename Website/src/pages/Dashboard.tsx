import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { fetchComplaints } from '@/api/complaints'
import { ComplaintTable } from '@/components/complaints/ComplaintTable'
import { StatCard } from '@/components/complaints/StatCard'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { RECENT_COMPLAINTS_SIZE } from '@/constants/config'
import { useStats } from '@/hooks/useStats'
import { useAsync } from '@/hooks/useAsync'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { API_ROUTES } from '@/constants/config'
import type { Road } from '@/types/road'

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatIndianAbbreviation(value: number, withCurrency = false): string {
  const safeValue = value || 0
  const absValue = Math.abs(safeValue)
  const prefix = withCurrency ? '₹' : ''

  if (absValue >= 10_000_000) {
    return `${prefix}${Math.round(safeValue / 10_000_000)}Cr`
  }

  if (absValue >= 100_000) {
    return `${prefix}${Math.round(safeValue / 100_000)}L`
  }

  if (absValue >= 1_000) {
    return `${prefix}${Math.round(safeValue / 1_000)}K`
  }

  return `${prefix}${Math.round(safeValue)}`
}

interface FinancialRow {
  code: string
  name: string
  sanctioned: number
  spent: number
  remaining: number
}

function normalizeRoadsData(data: unknown) {
  if (Array.isArray(data)) return data
  if (Array.isArray((data as { data?: unknown } | null | undefined)?.data)) {
    return (data as { data: unknown[] }).data
  }
  if (Array.isArray((data as { content?: unknown } | null | undefined)?.content)) {
    return (data as { content: unknown[] }).content
  }
  return []
}

const SAMPLE_ROADS: Road[] = [
  {
    id: 1,
    roadCode: 'NH-01',
    name: 'Delhi-Meerut Expressway',
    roadType: 'NH',
    contractorName: 'L&T Infra',
    budgetSanctioned: 450_000_000,
    budgetSpent: 420_000_000,
    status: 'IN_PROGRESS',
  },
  {
    id: 2,
    roadCode: 'NH-18',
    name: 'Gorakhpur-Basti Highway',
    roadType: 'NH',
    contractorName: 'Tata Projects',
    budgetSanctioned: 620_000_000,
    budgetSpent: 580_000_000,
    status: 'IN_PROGRESS',
  },
  {
    id: 3,
    roadCode: 'SH-21',
    name: 'Lucknow-Barabanki Highway',
    roadType: 'SH',
    contractorName: 'Dilip Buildcon',
    budgetSanctioned: 180_000_000,
    budgetSpent: 195_000_000,
    status: 'IN_PROGRESS',
  },
  {
    id: 4,
    roadCode: 'MDR-04',
    name: 'Agra-Aligarh Link Road',
    roadType: 'MDR',
    contractorName: 'Shapoorji Pallonji',
    budgetSanctioned: 95_000_000,
    budgetSpent: 72_000_000,
    status: 'IN_PROGRESS',
  },
]

export default function Dashboard() {
  const { data: stats, error: statsError, loading: statsLoading, reload } = useStats(true)
  const recent = useAsync(
    () => fetchComplaints({ page: 0, size: RECENT_COMPLAINTS_SIZE }),
    []
  )
  const [roads, setRoads] = useState<Road[]>([])
  const [roadsLoading, setRoadsLoading] = useState(true)
  const recentComplaints = Array.isArray(recent.data?.content) ? recent.data.content : []
  const recentDataInvalid = !!recent.data && !Array.isArray(recent.data.content)
  const roadData = roads
  const financialRows: FinancialRow[] = roadData.map((road) => {
    const sanctioned = road.budgetSanctioned ?? 0
    const spent = road.budgetSpent ?? 0
    const code = road.roadCode?.trim() || road.roadType?.trim() || `Road ${road.id}`

    return {
      code,
      name: road.name,
      sanctioned,
      spent,
      remaining: sanctioned - spent,
    }
  })
  const totalAllocated = financialRows.reduce((sum, road) => sum + road.sanctioned, 0)
  const totalSpent = financialRows.reduce((sum, road) => sum + road.spent, 0)
  const skipEveryOtherXAxisLabel = financialRows.length > 6

  function RoadAxisTick({
    x,
    y,
    payload,
  }: {
    x?: number
    y?: number
    payload?: { index?: number }
  }) {
    const row = financialRows[payload?.index ?? 0]

    if (!row) return null
    if (skipEveryOtherXAxisLabel && (payload?.index ?? 0) % 2 === 1) return null

    return (
      <g transform={`translate(${x ?? 0},${(y ?? 0) + 6}) rotate(-45)`}>
        <text textAnchor="end" fill="#334155">
          <tspan x="0" dy="0" className="fill-slate-900 text-[12px] font-semibold">
            {row.code}
          </tspan>
          <tspan x="0" dy="15" className="fill-brand-700 text-[11px] font-medium">
            {formatIndianAbbreviation(row.spent, true)}
          </tspan>
        </text>
      </g>
    )
  }

  function FinancialTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: FinancialRow }> }) {
    if (!active || !payload?.length) return null

    const row = payload[0]?.payload

    if (!row) return null

    return (
      <div className="min-w-[260px] rounded-2xl border border-brand-100 bg-white p-4 shadow-xl shadow-violet-100/50">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Financial snapshot</p>
        <div className="mt-2 space-y-1">
          <p className="text-base font-semibold text-slate-900">{row.code}</p>
          <p className="text-sm text-slate-600">{row.name}</p>
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-brand-50 px-3 py-2">
            <span className="text-slate-600">Budget Sanctioned</span>
            <span className="font-semibold text-brand-900">{formatMoney(row.sanctioned)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-brand-50 px-3 py-2">
            <span className="text-slate-600">Budget Spent</span>
            <span className="font-semibold text-brand-900">{formatMoney(row.spent)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-brand-50 px-3 py-2">
            <span className="text-slate-600">Remaining budget</span>
            <span className={`font-semibold ${row.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatMoney(row.remaining)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    let mounted = true

    const loadRoads = async () => {
      setRoadsLoading(true)

      try {
        const { data } = await api.get<unknown>(API_ROUTES.roads)
        console.log('Dashboard roads API response:', data)
        const normalized = normalizeRoadsData(data)

        if (
          !Array.isArray(data) &&
          !Array.isArray((data as { data?: unknown } | null | undefined)?.data) &&
          !Array.isArray((data as { content?: unknown } | null | undefined)?.content)
        ) {
          if (mounted) {
            setRoads(SAMPLE_ROADS)
          }
          return
        }

        if (mounted) {
          setRoads(normalized.length ? (normalized as Road[]) : SAMPLE_ROADS)
        }
      } catch {
        if (mounted) {
          setRoads(SAMPLE_ROADS)
        }
      } finally {
        if (mounted) setRoadsLoading(false)
      }
    }

    loadRoads()

    return () => {
      mounted = false
    }
  }, [])

  if (statsLoading) return <LoadingState message="Loading dashboard…" />
  if (statsError || !stats) {
    return <ErrorState message={statsError || 'No data available'} onRetry={reload} />
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview · refreshes every 30 seconds"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total reports" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} accent="yellow" />
        <StatCard label="Assigned" value={stats.assigned} accent="blue" />
        <StatCard label="In progress" value={stats.inProgress} accent="purple" />
        <StatCard label="Resolved" value={stats.resolved} accent="green" />
        <StatCard label="High severity" value={stats.highSeverity} accent="red" />
      </div>

      <section className="mt-10 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Financial Overview</h3>
            <p className="text-sm text-slate-500">Budget sanctioned vs budget spent by road</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Total funds allocated</p>
              <p className="mt-1 text-2xl font-bold text-brand-900">{formatMoney(totalAllocated)}</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Total spent</p>
              <p className="mt-1 text-2xl font-bold text-brand-900">{formatMoney(totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-[360px]">
          {roadsLoading ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 text-slate-500">
              Loading...
            </div>
          ) : roadData.length ? (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialRows} margin={{ top: 24, right: 24, left: 0, bottom: 84 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                  <XAxis
                    dataKey="code"
                    tick={<RoadAxisTick />}
                    interval={skipEveryOtherXAxisLabel ? 1 : 0}
                    height={76}
                    tickLine={false}
                    axisLine={{ stroke: '#ddd6fe' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => formatIndianAbbreviation(Number(value))}
                    axisLine={{ stroke: '#ddd6fe' }}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(124, 58, 237, 0.08)' }}
                    content={<FinancialTooltip />}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Legend />
                  <Bar dataKey="sanctioned" name="Budget Sanctioned" fill="#7c3aed" radius={[8, 8, 0, 0]}>
                    <LabelList
                      position="top"
                      fill="#6d28d9"
                      fontSize={12}
                      fontWeight={700}
                      formatter={(value: number) => formatIndianAbbreviation(Number(value), true)}
                    />
                  </Bar>
                  <Bar dataKey="spent" name="Budget Spent" fill="#a78bfa" radius={[8, 8, 0, 0]}>
                    <LabelList
                      position="top"
                      fill="#7c3aed"
                      fontSize={12}
                      fontWeight={700}
                      formatter={(value: number) => formatIndianAbbreviation(Number(value), true)}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : financialRows.length ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 text-slate-500">
              No roads found yet.
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 text-slate-500">
              No roads found yet.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent complaints</h3>
          <Link to="/complaints" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {recent.loading ? (
            <div className="p-8">
              <LoadingState />
            </div>
          ) : recentDataInvalid ? (
            <ErrorState message="Unexpected complaints response" onRetry={recent.reload} />
          ) : recentComplaints.length ? (
            <ComplaintTable complaints={recentComplaints} compact />
          ) : (
            <p className="px-4 py-8 text-center text-slate-500">
              No complaints yet. Upload from the mobile app.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
