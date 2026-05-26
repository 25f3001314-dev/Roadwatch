import { useEffect, useMemo, useState } from 'react'
import { BarChart3, MapIcon, RefreshCw } from 'lucide-react'
import { fetchMapComplaints } from '@/api/complaints'
import { getApiErrorMessage } from '@/api/client'
import { ComplaintMap } from '@/components/map/ComplaintMap'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { CategoryPieChart } from '@/components/dashboard/charts/CategoryPieChart'
import { SeverityBarChart } from '@/components/dashboard/charts/SeverityBarChart'
import { StatusDonutChart } from '@/components/dashboard/charts/StatusDonutChart'
import { TrendLineChart } from '@/components/dashboard/charts/TrendLineChart'
import { DepartmentPerformanceChart } from '@/components/dashboard/charts/DepartmentPerformanceChart'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  buildDailyTrend,
  buildDepartmentPerformanceData,
  buildLabelDistribution,
  buildRoadTypeDistribution,
  buildSeverityDistribution,
  buildStatusDistribution,
  countGeoTaggedComplaints,
} from '@/utils/dashboard'
import type { Complaint } from '@/types/complaint'

type Tab = 'analytics' | 'map'

export default function MapView() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('analytics')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setComplaints(await fetchMapComplaints())
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load complaints'))
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const safe = Array.isArray(complaints) ? complaints : []
  const trend = useMemo(() => buildDailyTrend(safe, 14), [safe])
  const status = useMemo(() => buildStatusDistribution(safe), [safe])
  const severity = useMemo(() => buildSeverityDistribution(safe), [safe])
  const labels = useMemo(() => buildLabelDistribution(safe).slice(0, 8), [safe])
  const roadTypes = useMemo(() => buildRoadTypeDistribution(safe), [safe])
  const departments = useMemo(() => buildDepartmentPerformanceData(safe).slice(0, 8), [safe])
  const geoCount = useMemo(() => countGeoTaggedComplaints(safe), [safe])

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle={`Live overview across ${safe.length} complaints — ${geoCount} with GPS coordinates`}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')} icon={BarChart3} label="Analytics" />
          <TabButton active={tab === 'map'} onClick={() => setTab('map')} icon={MapIcon} label="Map" />
        </div>
        <button
          onClick={load}
          type="button"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorState message={error} onRetry={load} />
        </div>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingState message="Loading data…" />
        </div>
      ) : tab === 'analytics' ? (
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-12">
          <DashboardSection
            className="xl:col-span-12"
            title="Daily activity (last 14 days)"
            subtitle="Total / resolved / pending complaints"
          >
            <TrendLineChart
              data={trend}
              series={[
                { dataKey: 'total', name: 'Total', color: '#7c3aed' },
                { dataKey: 'resolved', name: 'Resolved', color: '#16a34a' },
                { dataKey: 'pending', name: 'Pending', color: '#dc2626' },
              ]}
              emptyTitle="No data yet"
              emptyDescription="Trend will appear once complaints are submitted."
            />
          </DashboardSection>

          <DashboardSection className="xl:col-span-4" title="Status distribution">
            <StatusDonutChart
              data={status}
              emptyTitle="No data yet"
              emptyDescription="Status will appear once complaints exist."
            />
          </DashboardSection>

          <DashboardSection className="xl:col-span-4" title="Severity">
            <SeverityBarChart
              data={severity}
              emptyTitle="No data yet"
              emptyDescription="Severity will appear once complaints are scored."
            />
          </DashboardSection>

          <DashboardSection className="xl:col-span-4" title="Top AI labels">
            <CategoryPieChart
              data={labels}
              emptyTitle="No data yet"
              emptyDescription="YOLO labels will appear after AI analysis."
            />
          </DashboardSection>

          <DashboardSection
            className="xl:col-span-8"
            title="Department performance"
            subtitle="Resolved vs open per department"
          >
            <DepartmentPerformanceChart
              data={departments}
              emptyTitle="No data yet"
              emptyDescription="Performance will populate once departments are assigned."
            />
          </DashboardSection>

          <DashboardSection className="xl:col-span-4" title="Road types">
            <CategoryPieChart
              data={roadTypes}
              emptyTitle="No data yet"
              emptyDescription="Road type mix will appear once complaints are tagged."
            />
          </DashboardSection>
        </div>
      ) : (
        <div className="mt-6">
          <ComplaintMap complaints={safe} height="calc(100vh - 260px)" zoom={5} isLoading={false} />
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof BarChart3
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <Icon size={14} aria-hidden /> {label}
    </button>
  )
}
