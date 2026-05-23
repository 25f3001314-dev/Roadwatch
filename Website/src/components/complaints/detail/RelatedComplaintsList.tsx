import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/format'
import type { Complaint } from '@/types/complaint'

interface RelatedComplaintsListProps {
  complaints: Array<{
    complaint: Complaint
    reasons: string[]
  }>
  emptyTitle: string
  emptyDescription: string
}

export function RelatedComplaintsList({ complaints, emptyTitle, emptyDescription }: RelatedComplaintsListProps) {
  if (!complaints.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-5 py-6 text-sm text-slate-500">
        <p className="font-semibold text-slate-900">{emptyTitle}</p>
        <p className="mt-2 leading-6">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {complaints.map(({ complaint, reasons }) => (
        <Link
          key={complaint.id}
          to={`/complaints/${complaint.id}`}
          className="block rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Complaint #{complaint.id}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(complaint.timestamp)}</p>
            </div>
            <Badge variant="severity" value={complaint.severity} />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {complaint.roadType || 'Unspecified'} · {complaint.aiLabel || 'Unclassified'}
          </p>
          {reasons.length > 0 && (
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Related by {reasons.join(' · ')}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}