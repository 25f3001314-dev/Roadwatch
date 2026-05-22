import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { imageSrc } from '@/api/client'
import { AdminActions } from '@/components/complaints/AdminActions'
import { ComplaintMap } from '@/components/map/ComplaintMap'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useComplaint } from '@/hooks/useComplaint'
import type { ComplaintUpdatePayload } from '@/types/complaint'
import { formatDate, formatPercent, parseDetections } from '@/utils/format'

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>()
  const complaintId = id ? Number(id) : undefined
  const { data: complaint, loading, error, reload, update } = useComplaint(complaintId)

  const [department, setDepartment] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (complaint) {
      setDepartment(complaint.department || '')
      setAdminNotes(complaint.adminNotes || '')
    }
  }, [complaint])

  const handlePatch = async (payload: ComplaintUpdatePayload) => {
    setSaving(true)
    setMessage('')
    try {
      await update(payload)
      setMessage('Saved successfully')
    } catch {
      setMessage('Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Loading complaint…" />
  if (error || !complaint) {
    return <ErrorState message={error || 'Complaint not found'} onRetry={reload} />
  }

  const detections = parseDetections(complaint.aiDetectionsJson)

  return (
    <div>
      <Link to="/complaints" className="text-sm text-brand-600 hover:underline">
        ← Back to list
      </Link>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">Complaint #{complaint.id}</h2>

      {message && (
        <p
          className={`mt-2 text-sm ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <img
            src={imageSrc(complaint.imageUrl)}
            alt={`Road damage report ${complaint.id}`}
            className="max-h-[480px] w-full rounded-xl border border-slate-200 bg-slate-100 object-contain"
          />
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-brand-900">AI analysis</h3>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-slate-500">Primary label</dt>
              <dd className="font-medium capitalize">{complaint.aiLabel || 'none'}</dd>
              <dt className="text-slate-500">Confidence</dt>
              <dd className="font-medium">{formatPercent(complaint.aiConfidence ?? undefined)}</dd>
              <dt className="text-slate-500">Severity</dt>
              <dd>
                <Badge variant="severity" value={complaint.severity} />
              </dd>
              <dt className="text-slate-500">Department</dt>
              <dd>{complaint.department}</dd>
            </dl>
            {detections.length > 0 && (
              <ul className="mt-4 space-y-2 border-t pt-3 text-sm">
                {detections.map((d, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="capitalize">{d.rawLabel || d.label}</span>
                    <span>{formatPercent(d.confidence)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900">Details</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <Badge variant="status" value={complaint.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Road type</dt>
                <dd>{complaint.roadType || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Reported</dt>
                <dd>{formatDate(complaint.timestamp)}</dd>
              </div>
            </dl>
          </div>

          {complaint.location && (
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">Location</h3>
              <ComplaintMap complaints={[complaint]} height="280px" zoom={16} />
            </div>
          )}

          <AdminActions
            complaint={complaint}
            department={department}
            adminNotes={adminNotes}
            saving={saving}
            onDepartmentChange={setDepartment}
            onNotesChange={setAdminNotes}
            onPatch={handlePatch}
          />
        </div>
      </div>
    </div>
  )
}
