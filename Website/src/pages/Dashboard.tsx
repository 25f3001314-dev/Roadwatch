import { Link } from 'react-router-dom'
import { fetchComplaints } from '@/api/complaints'
import { ComplaintTable } from '@/components/complaints/ComplaintTable'
import { StatCard } from '@/components/complaints/StatCard'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { RECENT_COMPLAINTS_SIZE } from '@/constants/config'
import { useStats } from '@/hooks/useStats'
import { useAsync } from '@/hooks/useAsync'

export default function Dashboard() {
  const { data: stats, error: statsError, loading: statsLoading, reload } = useStats(true)
  const recent = useAsync(
    () => fetchComplaints({ page: 0, size: RECENT_COMPLAINTS_SIZE }),
    []
  )

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
          ) : recent.data?.content.length ? (
            <ComplaintTable complaints={recent.data.content} compact />
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
