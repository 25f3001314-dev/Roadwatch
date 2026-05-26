import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Search } from 'lucide-react'
import { fetchResolvedComplaints } from '@/api/complaints'
import { getApiErrorMessage } from '@/api/client'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/format'
import type { Complaint } from '@/types/complaint'

export default function ResolvedComplaints() {
  const [items, setItems] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchResolvedComplaints()
      setItems(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load resolved complaints'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.trim().toLowerCase()
    return items.filter(
      (c) =>
        String(c.id).includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.adminNotes?.toLowerCase().includes(q),
    )
  }, [items, search])

  const byDepartment = useMemo(() => {
    const map = new Map<string, number>()
    items.forEach((c) => {
      const key = c.department?.trim() || 'Unassigned'
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [items])

  return (
    <div>
      <PageHeader
        title="Resolved Complaints"
        subtitle="Audit trail of complaints that have been closed and resolved by the assigned department."
      />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{items.length}</p>
        </div>
        {byDepartment.slice(0, 3).map(([dept, count]) => (
          <div key={dept} className="rounded-2xl border border-slate-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {dept}
            </span>
            <p className="mt-2 text-3xl font-bold text-slate-900">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search by ID, department, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorState message={error} onRetry={load} />
        </div>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingState message="Loading resolved complaints…" />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No resolved complaints match your search.
            </p>
          ) : (
            <table className="w-full table-auto">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Resolved at</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 text-sm">
                    <td className="px-4 py-3 font-medium text-slate-900">#{c.id}</td>
                    <td className="px-4 py-3">
                      <Badge variant="severity" value={c.severity} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.department || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.timestamp)}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                      {c.adminNotes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/complaints/${c.id}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
