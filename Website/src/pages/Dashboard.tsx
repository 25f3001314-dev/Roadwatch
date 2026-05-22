import { Link } from 'react-router-dom'
import { fetchComplaints } from '@/api/complaints'
import { fetchRoads } from '@/api/roads'
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export default function Dashboard() {
  const { data: stats, error: statsError, loading: statsLoading, reload } = useStats(true)
  const recent = useAsync(
    () => fetchComplaints({ page: 0, size: RECENT_COMPLAINTS_SIZE }),
    []
  )
  const roads = useAsync(() => fetchRoads(), [])
  const recentComplaints = Array.isArray(recent.data?.content) ? recent.data.content : []
  const recentDataInvalid = !!recent.data && !Array.isArray(recent.data.content)
  const roadData = Array.isArray(roads.data) ? roads.data : []
  const financialRows = roadData.map((road) => ({
    name: road.name,
    sanctioned: road.budgetSanctioned ?? 0,
    spent: road.budgetSpent ?? 0,
  }))
  const totalAllocated = financialRows.reduce((sum, road) => sum + road.sanctioned, 0)
  const totalSpent = financialRows.reduce((sum, road) => sum + road.spent, 0)

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
          {roads.loading ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 text-slate-500">
              Loading financial data…
            </div>
          ) : roads.error ? (
            <ErrorState message={roads.error} onRetry={roads.reload} />
          ) : financialRows.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialRows} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} interval={0} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(124, 58, 237, 0.08)' }}
                  contentStyle={{ borderRadius: 12, borderColor: '#ddd6fe' }}
                  formatter={(value) => formatMoney(Number(value))}
                />
                <Legend />
                <Bar dataKey="sanctioned" name="Budget Sanctioned" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                <Bar dataKey="spent" name="Budget Spent" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
