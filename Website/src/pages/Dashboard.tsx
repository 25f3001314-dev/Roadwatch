import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { fetchComplaints, fetchMapComplaints } from '@/api/complaints'
import { ComplaintTable } from '@/components/complaints/ComplaintTable'
import { StatCard } from '@/components/complaints/StatCard'
import { ComplaintMap } from '@/components/map/ComplaintMap'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { RECENT_COMPLAINTS_SIZE } from '@/constants/config'
import { useAsync } from '@/hooks/useAsync'
import { useStats } from '@/hooks/useStats'
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { CategoryPieChart } from '@/components/dashboard/charts/CategoryPieChart'
import { DepartmentPerformanceChart } from '@/components/dashboard/charts/DepartmentPerformanceChart'
import { SeverityBarChart } from '@/components/dashboard/charts/SeverityBarChart'
import { StatusDonutChart } from '@/components/dashboard/charts/StatusDonutChart'
import { TrendLineChart } from '@/components/dashboard/charts/TrendLineChart'
import {
  buildDailyTrend,
  buildDepartmentPerformanceData,
  buildLabelDistribution,
  buildRoadTypeDistribution,
  buildSeverityDistribution,
  buildStatusDistribution,
  countGeoTaggedComplaints,
  countUniqueLabels,
  formatComplaintLocation,
  getLatestHighSeverityComplaints,
} from '@/utils/dashboard'

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

function getComplaintTrendSummary(
  complaints: Array<{ timestamp: string; severity?: string | null; status?: string | null }>,
  predicate: (complaint: { timestamp: string; severity?: string | null; status?: string | null }) => boolean
): { label: string; tone: 'up' | 'down' | 'steady' } {
  if (!complaints.length) {
    return { label: 'Live', tone: 'steady' }
  }

  const now = new Date()
  const recentBoundary = new Date(now)
  recentBoundary.setDate(now.getDate() - 3)
  const windowBoundary = new Date(now)
  windowBoundary.setDate(now.getDate() - 7)

  let recent = 0
  let previous = 0

  complaints.forEach((complaint) => {
    const complaintDate = new Date(complaint.timestamp)

    if (complaintDate < windowBoundary) {
      return
    }

    if (predicate(complaint)) {
      if (complaintDate >= recentBoundary) {
        recent += 1
      } else {
        previous += 1
      }
    }
  })

  if (recent === 0 && previous === 0) {
    return { label: 'Flat', tone: 'steady' }
  }

  if (previous === 0) {
    return { label: 'New activity', tone: 'up' }
  }

  const delta = ((recent - previous) / previous) * 100

  if (Math.abs(delta) < 1) {
    return { label: 'Flat', tone: 'steady' }
  }

  return {
    label: `${delta > 0 ? '+' : ''}${Math.abs(delta).toFixed(0)}% vs prev period`,
    tone: delta > 0 ? 'up' : 'down',
  }
}

export default function Dashboard() {
  const { data: stats, error: statsError, loading: statsLoading, reload: reloadStats } = useStats(true)
  const recent = useAsync(() => fetchComplaints({ page: 0, size: RECENT_COMPLAINTS_SIZE }), [])
  const allComplaints = useAsync(() => fetchMapComplaints(), [])

  const complaints = Array.isArray(allComplaints.data) ? allComplaints.data : []
  const recentComplaints = Array.isArray(recent.data?.content) ? recent.data.content : []
  const recentInvalid = !!recent.data && !Array.isArray(recent.data.content)

  const trendData = useMemo(() => buildDailyTrend(complaints, 7), [complaints])
  const statusData = useMemo(() => buildStatusDistribution(complaints), [complaints])
  const severityData = useMemo(() => buildSeverityDistribution(complaints), [complaints])
  const labelData = useMemo(() => buildLabelDistribution(complaints), [complaints])
  const categoryData = useMemo(() => buildRoadTypeDistribution(complaints), [complaints])
  const departmentData = useMemo(() => buildDepartmentPerformanceData(complaints), [complaints])
  const highSeverityComplaints = useMemo(() => getLatestHighSeverityComplaints(complaints, 5), [complaints])
  const geoTaggedCount = countGeoTaggedComplaints(complaints)
  const departmentCount = countUniqueLabels(complaints, (complaint) => complaint.department, 'Unassigned')
  const openCount = (stats?.pending || 0) + (stats?.assigned || 0) + (stats?.inProgress || 0)
  const geotaggedRate = stats?.total ? Math.round((geoTaggedCount / stats.total) * 100) : 0
  const totalTrend = getComplaintTrendSummary(complaints, () => true)
  const openTrend = getComplaintTrendSummary(complaints, (complaint) => {
    const status = complaint.status?.trim().toUpperCase()
    return status === 'PENDING' || status === 'ASSIGNED' || status === 'IN_PROGRESS'
  })
  const resolvedTrend = getComplaintTrendSummary(complaints, (complaint) => complaint.status?.trim().toUpperCase() === 'RESOLVED')
  const highSeverityTrend = getComplaintTrendSummary(complaints, (complaint) => complaint.severity?.trim().toUpperCase() === 'HIGH')

  const metrics = [
    {
      label: 'Total complaints',
      value: stats ? formatCount(stats.total) : '—',
      description: 'All complaints captured in the system',
      loading: statsLoading,
      accent: 'purple' as const,
      trend: totalTrend.label,
      trendTone: totalTrend.tone,
    },
    {
      label: 'Open workflow',
      value: stats ? formatCount(openCount) : '—',
      description: 'Pending + assigned + in progress',
      loading: statsLoading,
      accent: 'blue' as const,
      trend: openTrend.label,
      trendTone: openTrend.tone,
    },
    {
      label: 'High severity',
      value: stats ? formatCount(stats.highSeverity) : '—',
      description: 'Escalations requiring immediate review',
      loading: statsLoading,
      accent: 'red' as const,
      trend: highSeverityTrend.label,
      trendTone: highSeverityTrend.tone,
    },
    {
      label: 'Resolved cases',
      value: stats ? formatCount(stats.resolved) : '—',
      description: 'Complaints closed through the workflow',
      loading: statsLoading,
      accent: 'green' as const,
      trend: resolvedTrend.label,
      trendTone: resolvedTrend.tone,
    },
    {
      label: 'Geo-tagged',
      value: stats ? formatCount(geoTaggedCount) : '—',
      description: stats ? `${formatPercent(geotaggedRate)} of total complaints have locations` : 'Awaiting live location data',
      loading: allComplaints.loading,
      accent: 'yellow' as const,
      trend: stats ? `${formatPercent(geotaggedRate)} coverage` : 'Live',
      trendTone: 'live' as const,
    },
    {
      label: 'Departments engaged',
      value: stats ? formatCount(departmentCount) : '—',
      description: 'Unique departments touched by reported complaints',
      loading: allComplaints.loading,
      accent: 'purple' as const,
      trend: 'Live breadth',
      trendTone: 'live' as const,
    },
  ]

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Dashboard"
        subtitle="Government analytics overview with live complaint, AI, and department signals"
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/complaints"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
            >
              Open complaints
            </Link>
            <Link
              to="/complaint-pipeline"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              Review pipeline
            </Link>
          </div>
        }
      />

      <div className="space-y-3">
        {statsError && <ErrorState message={statsError} onRetry={reloadStats} />}
        {recent.error && <ErrorState message={recent.error} onRetry={recent.reload} />}
        {allComplaints.error && <ErrorState message={allComplaints.error} onRetry={allComplaints.reload} />}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.description}
            loading={metric.loading}
            accent={metric.accent}
            trend={metric.trend}
            trendTone={metric.trendTone}
          />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-12 2xl:gap-5 items-start">
        <DashboardSection
          className="xl:col-span-8"
          title="Complaint trend"
          subtitle="Live arrivals over the last 7 days"
        >
          <TrendLineChart
            data={trendData}
            series={[{ dataKey: 'total', name: 'Complaints received', color: '#7c3aed' }]}
            loading={allComplaints.loading}
            emptyTitle="No data available"
            emptyDescription="Complaint history will appear here once reports are available."
          />
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-4"
          title="Resolved vs pending trend"
          subtitle="Workflow balance from the same live complaint stream"
        >
          <TrendLineChart
            data={trendData}
            series={[
              { dataKey: 'resolved', name: 'Resolved', color: '#16a34a' },
              { dataKey: 'pending', name: 'Pending', color: '#dc2626' },
            ]}
            loading={allComplaints.loading}
            emptyTitle="No data available"
            emptyDescription="Resolved and pending movement will appear once complaints exist."
          />
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-4"
          title="YOLO detection distribution"
          subtitle="Detected AI labels from complaint images"
        >
          <CategoryPieChart
            data={labelData}
            loading={allComplaints.loading}
            emptyTitle="No data available"
            emptyDescription="YOLO label distribution will appear after complaint analysis."
          />
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-4"
          title="Complaint category"
          subtitle="Reported road type mix for routing and planning"
        >
          <CategoryPieChart
            data={categoryData}
            loading={allComplaints.loading}
            emptyTitle="No data available"
            emptyDescription="Road type distribution will appear as complaints are reported."
          />
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-4"
          title="Complaint status"
          subtitle="Current workflow state distribution"
        >
          <StatusDonutChart
            data={statusData}
            loading={allComplaints.loading}
            emptyTitle="No data available"
            emptyDescription="Status distribution will appear once complaints are present."
          />
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-6"
          title="Complaint severity"
          subtitle="Escalation mix by severity level"
        >
          <SeverityBarChart
            data={severityData}
            loading={allComplaints.loading}
            emptyTitle="No data available"
            emptyDescription="Severity distribution will appear after complaints are submitted."
          />
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-6"
          title="Department workload"
          subtitle="Live distribution of complaints across departments"
        >
          <DepartmentPerformanceChart
            data={departmentData}
            loading={allComplaints.loading}
            emptyTitle="No data available"
            emptyDescription="Department workload will populate as complaints are assigned."
          />
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-8"
          title="Recent complaints"
          subtitle="Latest complaints entering the workflow"
        >
          {recent.loading ? (
            <LoadingState message="Loading recent complaints…" />
          ) : recentInvalid ? (
            <ErrorState message="Unexpected complaints response" onRetry={recent.reload} />
          ) : recentComplaints.length ? (
            <div className="overflow-hidden rounded-[22px] border border-slate-100">
              <ComplaintTable complaints={recentComplaints} compact />
            </div>
          ) : (
            <DashboardEmptyState
              title="No data available"
              description="Complaints submitted from the field will appear here once they reach the API."
            />
          )}
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-4"
          title="Emergency alerts"
          subtitle="High-severity complaints that need attention"
        >
          {allComplaints.loading ? (
            <LoadingState message="Scanning high-severity alerts…" />
          ) : highSeverityComplaints.length ? (
            <div className="space-y-2.5">
              {highSeverityComplaints.map((complaint) => (
                <article key={complaint.id} className="rounded-[22px] border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Complaint #{complaint.id}</p>
                      <p className="mt-1 text-xs text-slate-600">{complaint.roadType || 'Road type not captured'}</p>
                    </div>
                    <Badge variant="severity" value={complaint.severity} />
                  </div>

                  <dl className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Status</dt>
                      <dd className="font-medium">{complaint.status}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Department</dt>
                      <dd className="font-medium">{complaint.department || 'Unassigned'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Location</dt>
                      <dd className="font-medium text-right">{formatComplaintLocation(complaint)}</dd>
                    </div>
                  </dl>

                  <Link
                    to={`/complaints/${complaint.id}`}
                    className="mt-3 inline-flex text-sm font-medium text-brand-700 hover:underline"
                  >
                    Review complaint
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              title="No data available"
              description="High-severity complaints will surface here automatically when they are reported."
            />
          )}
        </DashboardSection>

        <DashboardSection
          className="xl:col-span-12"
          title="Complaint heatmap & map"
          subtitle="Geo-tagged complaints ready for spatial review"
        >
          {allComplaints.loading ? (
            <LoadingState message="Loading complaint map…" />
          ) : (
            <ComplaintMap complaints={complaints} height="460px" zoom={11} isLoading={allComplaints.loading} />
          )}
        </DashboardSection>
      </div>
    </div>
  )
}