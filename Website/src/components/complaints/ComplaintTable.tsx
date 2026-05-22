import { Link } from 'react-router-dom'
import { imageSrc } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/format'
import type { Complaint } from '@/types/complaint'

interface ComplaintTableProps {
  complaints: Complaint[]
  compact?: boolean
}

export function ComplaintTable({ complaints, compact = false }: ComplaintTableProps) {
  const thumbClass = compact ? 'h-12 w-12' : 'h-14 w-14'

  return (
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-4 py-3 text-left font-medium text-slate-600">Photo</th>
          <th className="px-4 py-3 text-left font-medium text-slate-600">ID</th>
          {!compact && <th className="px-4 py-3 text-left font-medium text-slate-600">Road</th>}
          <th className="px-4 py-3 text-left font-medium text-slate-600">AI label</th>
          <th className="px-4 py-3 text-left font-medium text-slate-600">Severity</th>
          {!compact && <th className="px-4 py-3 text-left font-medium text-slate-600">Department</th>}
          <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
          <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {complaints.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50">
            <td className="px-4 py-2">
              <img
                src={imageSrc(c.imageUrl)}
                alt={`Complaint ${c.id}`}
                className={`${thumbClass} rounded object-cover`}
                loading="lazy"
              />
            </td>
            <td className="px-4 py-2">
              <Link to={`/complaints/${c.id}`} className="font-medium text-brand-600 hover:underline">
                #{c.id}
              </Link>
            </td>
            {!compact && <td className="px-4 py-2">{c.roadType || '—'}</td>}
            <td className="px-4 py-2 capitalize">{c.aiLabel || '—'}</td>
            <td className="px-4 py-2">
              <Badge variant="severity" value={c.severity} />
            </td>
            {!compact && <td className="px-4 py-2">{c.department || '—'}</td>}
            <td className="px-4 py-2">
              <Badge variant="status" value={c.status} />
            </td>
            <td className="px-4 py-2 text-slate-600">{formatDate(c.timestamp)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
