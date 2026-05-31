import { useState } from 'react'
import { Send } from 'lucide-react'
import { DEPARTMENTS } from '@/data/departments'
import { canForward } from '@/utils/complaintActions'
import { forwardComplaint } from '@/api/complaints'
import type { Complaint } from '@/types/complaint'

interface ComplaintForwardPanelProps {
  complaint: Complaint
  onForwarded: (updated: Complaint) => void
}

export function ComplaintForwardPanel({ complaint, onForwarded }: ComplaintForwardPanelProps) {
  const [selectedDept, setSelectedDept] = useState('')
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const allowed = canForward(complaint.status)

  const handleForward = async () => {
    if (!selectedDept) return
    setSending(true)
    setError('')
    try {
      const updated = await forwardComplaint(complaint.id, selectedDept, reason || undefined)
      onForwarded(updated)
    } catch {
      setError('Failed to forward complaint')
    } finally {
      setSending(false)
    }
  }

  if (!allowed) {
    const s = (complaint.status ?? '').toUpperCase()
    if (s === 'FORWARDED' || s === 'IN_PROGRESS') {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <p className="font-semibold">Forwarded to: {complaint.routedDepartment || complaint.department}</p>
          {complaint.departmentResponse && (
            <p className="mt-2 text-amber-600">Response: {complaint.departmentResponse}</p>
          )}
        </div>
      )
    }
    return (
      <p className="text-sm text-slate-500">
        Accept the complaint first before forwarding to a department.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <select
        value={selectedDept}
        onChange={(e) => setSelectedDept(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        <option value="">— Select department —</option>
        {DEPARTMENTS.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>

      {selectedDept && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Department info</p>
          {(() => {
            const dept = DEPARTMENTS.find((d) => d.id === selectedDept)
            if (!dept) return null
            return (
              <div className="mt-2 space-y-1 text-slate-600">
                <p>Officer: <span className="font-medium text-slate-900">{dept.officer}</span></p>
                <p>Email: <span className="font-medium text-slate-900">{dept.email}</span></p>
                <p>Road types: <span className="font-medium text-slate-900">{dept.roadTypes.join(', ')}</span></p>
              </div>
            )
          })()}
        </div>
      )}

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="Reason for forwarding (optional)"
        className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm leading-6 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="button"
        disabled={!selectedDept || sending}
        onClick={handleForward}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={16} />
        {sending ? 'Forwarding…' : 'Forward to Department'}
      </button>
    </div>
  )
}
