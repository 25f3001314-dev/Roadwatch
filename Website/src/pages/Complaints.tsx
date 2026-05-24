import { ComplaintFilters } from '@/components/complaints/ComplaintFilters'
import { ComplaintTable } from '@/components/complaints/ComplaintTable'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { useComplaints } from '@/hooks/useComplaints'

export default function Complaints() {
  const {
    complaints,
    totalPages,
    page,
    setPage,
    filters,
    updateFilter,
    clearFilters,
    loading,
    error,
    reload,
  } = useComplaints()

  return (
    <div>
      <PageHeader
        title="Incoming Complaints"
        subtitle="Review incoming road issue reports and forward them to the right department."
      />

      <div className="mt-6">
        <ComplaintFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorState message={error} onRetry={reload} />
        </div>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingState />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {complaints.length > 0 ? (
            <ComplaintTable complaints={complaints} />
          ) : (
            <p className="py-12 text-center text-slate-500">No complaints match your filters.</p>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-100"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page + 1} of {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
