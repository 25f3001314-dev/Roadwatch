import { PageHeader } from '@/components/ui/PageHeader'

export default function ResolvedComplaints() {
  return (
    <div>
      <PageHeader
        title="Resolved Complaints"
        subtitle="Review complaints that have been closed and resolved."
      />
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        <p className="text-sm text-slate-500">
          This section provides a historical view of resolved cases for audits and reporting.
        </p>
      </div>
    </div>
  )
}
