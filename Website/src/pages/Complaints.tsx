import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchComplaints } from '@/api/complaints'
import type { ComplaintFilters } from '@/api/complaints'
import type { Complaint } from '@/types/complaint'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate } from '@/utils/format'

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<ComplaintFilters>({ size: 20 })

  const load = async (f: ComplaintFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchComplaints({ ...f, size: 20 })
      setComplaints(result.content)
      setTotalPages(result.totalPages)
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

  if (loading) return <LoadingState message="Loading complaints…" />
  if (error) return <ErrorState message={error} onRetry={() => load({ ...filters, page })} />

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Incoming Complaints</h2>
          <p className="text-sm text-slate-500 mt-1">All citizen-reported road complaints</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
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
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Severity</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <button
          onClick={applyFilters}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Severity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Department</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-950">#{c.id}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                    {c.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="status" value={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="severity" value={c.severity} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.department || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.timestamp)}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/complaints/${c.id}`}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-slate-500">
          Page {page + 1} of {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
