import { fetchMapComplaints } from '@/api/complaints'
import { ComplaintMap } from '@/components/map/ComplaintMap'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAsync } from '@/hooks/useAsync'

export default function MapView() {
  const { data: complaints, loading, error, reload } = useAsync(() => fetchMapComplaints(), [])

  const withGps = complaints?.filter((c) => c.location) ?? []

  return (
    <div>
      <PageHeader
        title="Map view"
        subtitle={
          complaints
            ? `${withGps.length} of ${complaints.length} complaints have GPS coordinates`
            : undefined
        }
      />
      <div className="mt-6">
        {loading && <LoadingState message="Loading map…" />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {complaints && !loading && !error && (
          <ComplaintMap complaints={complaints} height="calc(100vh - 200px)" zoom={6} />
        )}
      </div>
    </div>
  )
}
