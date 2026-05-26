import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, MapPin, RefreshCw } from 'lucide-react'
import { fetchEmergencyCases } from '@/api/complaints'
import { getApiErrorMessage, imageSrc } from '@/api/client'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/format'
import type { Complaint } from '@/types/complaint'

export default function EmergencyCases() {
  const [cases, setCases] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchEmergencyCases()
      setCases(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load emergency cases'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const totalActive = cases.length
  const withGps = cases.filter((c) => c.location?.latitude != null).length

  return (
    <div>
      <PageHeader
        title="Emergency Cases"
        subtitle="High-severity reports that require immediate attention. Auto-filtered to exclude resolved/rejected items."
      />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-rose-900">{totalActive}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Geo-tagged
          </span>
          <p className="mt-2 text-3xl font-bold text-slate-900">{withGps}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Last refresh
          </span>
          <button
            onClick={load}
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorState message={error} onRetry={load} />
        </div>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingState message="Loading emergency cases…" />
        </div>
      ) : cases.length === 0 ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-800">
          No active high-severity cases. Everything is under control.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {cases.map((c) => (
            <article
              key={c.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {c.imageUrl && (
                <img
                  src={imageSrc(c.imageUrl)}
                  alt={`Complaint ${c.id}`}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Complaint
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">#{c.id}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="severity" value={c.severity} />
                    <Badge variant="status" value={c.status} />
                  </div>
                </div>

                {c.description && (
                  <p className="line-clamp-2 text-sm text-slate-600">{c.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin size={12} />
                  {c.location?.latitude != null
                    ? `${c.location.latitude.toFixed(4)}, ${c.location.longitude?.toFixed(4)}`
                    : 'Location not captured'}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">{formatDate(c.timestamp)}</span>
                  <Link
                    to={`/complaints/${c.id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
