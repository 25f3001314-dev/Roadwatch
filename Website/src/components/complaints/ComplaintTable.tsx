import { Link, useNavigate } from 'react-router-dom'
import { imageSrc } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/format'
import type { Complaint } from '@/types/complaint'

interface ComplaintTableProps {
  complaints: Complaint[]
  compact?: boolean
}

export function ComplaintTable({ complaints, compact = false }: ComplaintTableProps) {
  const navigate = useNavigate()
  const thumbClass = compact ? 'h-11 w-11' : 'h-12 w-12'

  return (
    <table className="min-w-full border-separate border-spacing-0 text-sm">
      <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
        <tr>
          <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Photo</th>
          <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">ID</th>
          {!compact && <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Road</th>}
          <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">AI label</th>
          <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Confidence</th>
          <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Severity</th>
          {!compact && <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Department</th>}
          <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
          <th className="border-b border-slate-200 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Date</th>
          <th className="border-b border-slate-200 px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {complaints.map((c) => (
          <tr
            key={c.id}
            className="cursor-pointer bg-white/80 transition-colors hover:bg-brand-50/50"
            tabIndex={0}
            onClick={() => navigate(`/complaints/${c.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(`/complaints/${c.id}`)
              }
            }}
          >
            <td className="px-3 py-2.5">
              <img
                src={imageSrc(c.imageUrl)}
                alt={`Complaint ${c.id}`}
                className={`${thumbClass} rounded-xl object-cover ring-1 ring-slate-200`}
                loading="lazy"
              />
            </td>
            <td className="px-3 py-2.5 whitespace-nowrap">
              <Link to={`/complaints/${c.id}`} className="font-semibold text-brand-700 hover:underline">
                #{c.id}
              </Link>
            </td>
            {!compact && <td className="px-3 py-2.5 text-slate-700">{c.roadType || '—'}</td>}
            <td className="px-3 py-2.5 capitalize text-slate-700">{c.aiLabel || '—'}</td>
            <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
              {c.aiConfidence == null ? '—' : `${(c.aiConfidence * 100).toFixed(1)}%`}
            </td>
            <td className="px-3 py-2.5">
              <Badge variant="severity" value={c.severity} />
            </td>
            {!compact && <td className="px-3 py-2.5 text-slate-700">{c.department || '—'}</td>}
            <td className="px-3 py-2.5">
              <Badge variant="status" value={c.status} />
            </td>
            <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">{formatDate(c.timestamp)}</td>
            <td className="px-3 py-2.5 text-right">
              <Link
                to={`/complaints/${c.id}`}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                onClick={(event) => event.stopPropagation()}
              >
                Open
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
