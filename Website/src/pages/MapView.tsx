import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { ComplaintMap } from '@/components/map/ComplaintMap'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { API_ROUTES } from '@/constants/config'
import type { Complaint } from '@/types/complaint'

function normalizeComplaints(data: unknown): Complaint[] {
  if (Array.isArray(data)) return data as Complaint[]
  if (Array.isArray((data as { data?: unknown } | null | undefined)?.data)) {
    return (data as { data: unknown[] }).data as Complaint[]
  }
  if (Array.isArray((data as { content?: unknown } | null | undefined)?.content)) {
    return (data as { content: unknown[] }).content as Complaint[]
  }
  return []
}

export default function MapView() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const safeComplaints = Array.isArray(complaints) ? complaints : []
  const withGps = safeComplaints.filter((c) => c.location?.latitude != null && c.location?.longitude != null)

  useEffect(() => {
    let mounted = true

    const loadComplaints = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get<unknown>(API_ROUTES.complaints)
        console.log('Map complaints API response:', data)
        const normalized = normalizeComplaints(data)

        if (mounted) {
          setComplaints(normalized)
        }
      } catch (error) {
        console.error('Failed to load map complaints:', error)
        if (mounted) {
          setComplaints([])
          setError('Unable to load complaints right now.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadComplaints()

    return () => {
      mounted = false
    }
  }, [])

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
        {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}
        {loading && <LoadingState message="Loading map…" />}
        <ComplaintMap
          complaints={safeComplaints}
          height="calc(100vh - 200px)"
          zoom={5}
          isLoading={loading}
        />
      </div>
    </div>
  )
}
