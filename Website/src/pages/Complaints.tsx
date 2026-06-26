import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchComplaints } from '@/api/complaints'
import type { ComplaintFilters } from '@/api/complaints'
import type { Complaint } from '@/types/complaint'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate } from '@/utils/format'
import { useAuth } from '@/context/AuthContext'

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [filters, setFilters] = useState<ComplaintFilters>({})

  const { isOfficer, officerDept } = useAuth()

  const load = async (f: ComplaintFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const officerOverride = isOfficer ? { status: 'FORWARDED' } : {}
      const result = await fetchComplaints({ ...f, ...officerOverride, size: 20 })
      setComplaints(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      setError('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load({ ...filters, page })
  }, [page])

  const applyFilters = () => {
    setPage(0)
    load({ ...filters, page: 0 })
  }

  const resetFilters = () => {
    setFilters({})
    setPage(0)
    load({ page: 0 })
  }

  if (loading) return <LoadingState message="Loading complaints…" />
  if (error) return <ErrorState message={error} onRetry={() => load({ ...filters, page })} />

  return (
    <div className="space-y-3 pb-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Incoming Complaints</h2>
          <p className="text-xs text-slate-400 mt-0.5">{totalElements} total complaints in system</p>
        </div>
      </div>

      {/* Filters - compact row */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mr-1">Filter:</span>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="FORWARDED">Forwarded</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={filters.severity || ''}
          onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value || undefined }))}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
        >
          <option value="">All Severity</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <button
          onClick={applyFilters}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
        >
          Apply
        </button>
        {(filters.status || filters.severity) && (
          <button
            onClick={resetFilters}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">ID</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Description</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Severity</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Location</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 py-2.5 font-semibold text-slate-700 text-xs">#{c.id}</td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[160px] truncate text-xs">
                    {c.description || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="status" value={c.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="severity" value={c.severity} />
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs max-w-[120px] truncate">
                    {c.department || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    {c.location ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        📍 Geo-tagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
                        No GPS
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">
                    {formatDate(c.timestamp)}
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      to={`/complaints/${c.id}`}
                      className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700 transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - compact */}
      <div className="flex items-center justify-between px-1">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-30 hover:bg-slate-50"
        >
          ← Previous
        </button>
        <span className="text-xs text-slate-400">
          Page {page + 1} of {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-30 hover:bg-slate-50"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
