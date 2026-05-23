import { DEPARTMENTS } from '@/types/complaint'
import type { Complaint, ComplaintUpdatePayload } from '@/types/complaint'

interface AdminActionsProps {
  complaint: Complaint
  department: string
  adminNotes: string
  saving: boolean
  onDepartmentChange: (value: string) => void
  onNotesChange: (value: string) => void
  onPatch: (payload: ComplaintUpdatePayload) => void
}

export function AdminActions({
  complaint,
  department,
  adminNotes,
  saving,
  onDepartmentChange,
  onNotesChange,
  onPatch,
}: AdminActionsProps) {
  const base = { department, adminNotes }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-slate-900">Admin actions</h3>

      <label className="mt-4 block text-sm font-medium text-slate-700">Department</label>
      <select
        value={department}
        onChange={(e) => onDepartmentChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <label className="mt-4 block text-sm font-medium text-slate-700">Admin notes</label>
      <textarea
        value={adminNotes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => onPatch(base)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Save department & notes
        </button>
        {complaint.status === 'PENDING' && (
          <button
            type="button"
            disabled={saving}
            onClick={() => onPatch({ ...base, status: 'ASSIGNED' })}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Assign
          </button>
        )}
        {(complaint.status === 'ASSIGNED' || complaint.status === 'PENDING') && (
          <button
            type="button"
            disabled={saving}
            onClick={() => onPatch({ ...base, status: 'IN_PROGRESS' })}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Mark in progress
          </button>
        )}
        {complaint.status !== 'RESOLVED' && (
          <button
            type="button"
            disabled={saving}
            onClick={() => onPatch({ ...base, status: 'RESOLVED' })}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Mark resolved
          </button>
        )}
      </div>
    </div>
  )
}
