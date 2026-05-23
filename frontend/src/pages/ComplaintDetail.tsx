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
import { fetchAuthorities } from '@/api/authorities'
import type { Authority } from '@/api/authorities'
import { STATUSES } from '@/types/complaint'

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>()
  const complaintId = id ? Number(id) : undefined
  const { data: complaint, loading, error, reload, update } = useComplaint(complaintId)

  const [department, setDepartment] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [assignedAuthority, setAssignedAuthority] = useState<number | ''>('')

  useEffect(() => {
    if (complaint) {
      setDepartment(complaint.department || '')
      setAdminNotes(complaint.adminNotes || '')
      setAssignedAuthority('')
    }
  }, [complaint])

  useEffect(() => {
    let mounted = true
    fetchAuthorities()
      .then((list) => {
        if (mounted) setAuthorities(list)
      })
      .catch(() => {
        if (mounted) setAuthorities([])
      })
    return () => {
      mounted = false
    }
  }, [])

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
          <div className="grid grid-cols-2 gap-4">
            <img
              src={imageSrc(complaint.imageUrl)}
              alt={`Original photo ${complaint.id}`}
              className="max-h-[420px] w-full rounded-xl border border-slate-200 bg-slate-100 object-contain"
            />
            <img
              src={imageSrc((complaint as any).aiProcessedImageUrl)}
              alt={`AI processed photo ${complaint.id}`}
              className="max-h-[420px] w-full rounded-xl border border-slate-200 bg-slate-100 object-contain"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-brand-900">AI analysis</h3>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900">
                  {formatPercent(complaint.aiConfidence ?? undefined)}
                </span>
                <Badge variant="severity" value={complaint.severity} />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-slate-500">Primary label</dt>
              <dd className="font-medium capitalize">{complaint.aiLabel || 'none'}</dd>
              <dt className="text-slate-500">Confidence</dt>
              <dd className="font-medium">{formatPercent(complaint.aiConfidence ?? undefined)}</dd>
              <dt className="text-slate-500">Severity</dt>
              <dd>
                {/* severity badge shown in header as well */}
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
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <select
                    value={complaint.status}
                    onChange={async (e) => {
                      const status = e.target.value
                      setSaving(true)
                      setMessage('')
                      try {
                        await update({ status })
                        setMessage('Saved successfully')
                      } catch {
                        setMessage('Update failed')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
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

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900">Assign</h3>
            <p className="mt-2 text-sm text-slate-500">Assign this complaint to an authority</p>
            <select
              value={assignedAuthority}
              onChange={(e) => setAssignedAuthority(Number(e.target.value) || '')}
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="">— select authority —</option>
              {authorities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={saving || !assignedAuthority}
                onClick={async () => {
                  if (!assignedAuthority) return
                  setSaving(true)
                  setMessage('')
                  try {
                    // assigning maps to department on the backend for now
                    const selected = authorities.find((a) => a.id === assignedAuthority)
                    await update({ department: selected?.name })
                    setMessage('Assigned successfully')
                  } catch {
                    setMessage('Assign failed')
                  } finally {
                    setSaving(false)
                  }
                }}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
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
