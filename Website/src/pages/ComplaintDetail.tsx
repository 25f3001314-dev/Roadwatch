import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { imageSrc } from '@/api/client'
import { ComplaintMap } from '@/components/map/ComplaintMap'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useComplaint } from '@/hooks/useComplaint'
import type { Complaint, ComplaintUpdatePayload } from '@/types/complaint'
import { formatDate, formatPercent, parseDetections } from '@/utils/format'
import { fetchAuthorities } from '@/api/authorities'
import type { Authority } from '@/api/authorities'
import { fetchMapComplaints } from '@/api/complaints'
import { useAsync } from '@/hooks/useAsync'
import { DetailSection } from '@/components/complaints/detail/DetailSection'
import { DetailEmptyState } from '@/components/complaints/detail/DetailEmptyState'
import { ComplaintStatusTracker } from '@/components/complaints/detail/ComplaintStatusTracker'
import { ComplaintActivityTimeline, buildLiveComplaintTimeline } from '@/components/complaints/detail/ComplaintActivityTimeline'
import { RelatedComplaintsList } from '@/components/complaints/detail/RelatedComplaintsList'
import { STATUSES } from '@/types/complaint'

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>()
  const complaintId = id ? Number(id) : undefined
  const { data: complaint, loading, error, reload, update } = useComplaint(complaintId)
  const relatedState = useAsync(() => fetchMapComplaints(), [])

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
    }
  }, [complaint])

  useEffect(() => {
    if (!complaint || authorities.length === 0) {
      return
    }

    const matchedAuthority = authorities.find((authority) => authority.name === complaint.department)
    setAssignedAuthority(matchedAuthority?.id ?? '')
  }, [authorities, complaint])

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
      return true
    } catch {
      setMessage('Update failed')
      return false
    } finally {
      setSaving(false)
    }
  }

  const allComplaints = Array.isArray(relatedState.data) ? relatedState.data : []
  const relatedComplaints = useMemo(() => {
    if (!complaint) return [] as Array<{ complaint: Complaint; reasons: string[] }>

    return allComplaints
      .filter((candidate) => candidate.id !== complaint.id)
      .map((candidate) => {
        const reasons: string[] = []
        let score = 0

        if (candidate.department && complaint.department && candidate.department === complaint.department) {
          reasons.push('same department')
          score += 4
        }
        if (candidate.roadType && complaint.roadType && candidate.roadType === complaint.roadType) {
          reasons.push('same road type')
          score += 3
        }
        if (candidate.aiLabel && complaint.aiLabel && candidate.aiLabel === complaint.aiLabel) {
          reasons.push('same AI label')
          score += 2
        }
        if (candidate.severity === complaint.severity) {
          reasons.push('matching severity')
          score += 1
        }
        if (candidate.status === complaint.status) {
          reasons.push('matching status')
          score += 1
        }

        return { complaint: candidate, reasons, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score || new Date(right.complaint.timestamp).getTime() - new Date(left.complaint.timestamp).getTime())
      .slice(0, 4)
      .map(({ complaint: relatedComplaint, reasons }) => ({ complaint: relatedComplaint, reasons }))
  }, [allComplaints, complaint])

  const timelineEntries = useMemo(
    () =>
      complaint
        ? buildLiveComplaintTimeline({
            timestamp: complaint.timestamp,
            status: complaint.status,
            department: complaint.department,
            aiLabel: complaint.aiLabel,
            aiConfidence: complaint.aiConfidence,
            adminNotes: adminNotes,
          })
        : [],
    [adminNotes, complaint]
  )

  const selectedAuthority = authorities.find((authority) => authority.id === assignedAuthority)
  const hasEvidence = Boolean(complaint?.imageUrl || complaint?.aiProcessedImageUrl)
  const detections = complaint ? parseDetections(complaint.aiDetectionsJson) : []

  if (loading) return <LoadingState message="Loading complaint…" />
  if (error || !complaint) {
    return <ErrorState message={error || 'Complaint not found'} onRetry={reload} />
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-slate-200 bg-white/85 px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur sm:px-6">
        <div className="space-y-3">
          <Link to="/complaints" className="text-sm font-medium text-brand-700 hover:underline">
            ← Back to list
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">Complaint #{complaint.id}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Live investigation workspace for field complaint triage, routing, and resolution.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="status" value={complaint.status} />
          <Badge variant="severity" value={complaint.severity} />
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {complaint.roadType || 'Unspecified road type'}
          </span>
        </div>
      </div>

      {message && (
        <p className={`rounded-xl border px-4 py-3 text-sm ${message.includes('failed') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`} role="status">
          {message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Reported</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{formatDate(complaint.timestamp)}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">AI label</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{complaint.aiLabel || 'Unclassified'}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Confidence</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{formatPercent(complaint.aiConfidence ?? undefined)}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Location</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{complaint.location ? 'Geo-tagged' : 'No coordinates captured'}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
        <div className="space-y-6">
          <DetailSection title="Complaint evidence" subtitle="Original media, YOLO output, and summary of the detected issue">
            <div className="space-y-4">
              <div className={`grid gap-4 ${complaint.aiProcessedImageUrl ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
                <figure className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Complaint image</p>
                  </div>
                  <img
                    src={imageSrc(complaint.imageUrl)}
                    alt={`Original complaint ${complaint.id}`}
                    className="h-[340px] w-full object-contain bg-slate-50"
                  />
                </figure>

                {complaint.aiProcessedImageUrl ? (
                  <figure className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">AI processed image</p>
                    </div>
                    <img
                      src={imageSrc(complaint.aiProcessedImageUrl)}
                      alt={`AI processed complaint ${complaint.id}`}
                      className="h-[340px] w-full object-contain bg-slate-50"
                    />
                  </figure>
                ) : (
                  <DetailEmptyState
                    title="No AI processed image"
                    description="This complaint snapshot does not include a processed image from the current API payload."
                  />
                )}
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">YOLO detection result</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-950">{complaint.aiLabel || 'Unclassified'}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                        {formatPercent(complaint.aiConfidence ?? undefined)} confidence
                      </span>
                      <Badge variant="severity" value={complaint.severity} />
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Primary label</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-950 capitalize">{complaint.aiLabel || 'None captured'}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Severity</dt>
                      <dd className="mt-1"><Badge variant="severity" value={complaint.severity} /></dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Detected issue category</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-950">{complaint.roadType || 'Unspecified'}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Confidence</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-950">{formatPercent(complaint.aiConfidence ?? undefined)}</dd>
                    </div>
                  </dl>

                  {detections.length > 0 && (
                    <div className="mt-4 rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Detection breakdown</p>
                      <div className="mt-3 space-y-2">
                        {detections.map((d) => (
                          <div key={`${d.label}-${d.confidence}`} className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-2 text-sm">
                            <span className="capitalize text-slate-700">{d.rawLabel || d.label}</span>
                            <span className="font-semibold text-slate-950">{formatPercent(d.confidence)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Complaint metadata</p>
                  <dl className="mt-4 grid gap-3">
                    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-sm text-slate-500">Status</dt>
                      <dd><Badge variant="status" value={complaint.status} /></dd>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-sm text-slate-500">Department</dt>
                      <dd className="text-sm font-semibold text-slate-950">{complaint.department || 'Unassigned'}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-sm text-slate-500">Uploaded</dt>
                      <dd className="text-sm font-semibold text-slate-950">{formatDate(complaint.timestamp)}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-sm text-slate-500">Road type</dt>
                      <dd className="text-sm font-semibold text-slate-950">{complaint.roadType || '—'}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <dt className="text-sm text-slate-500">Citizen note</dt>
                      <dd className="mt-1 text-sm leading-6 text-slate-700">{complaint.description || 'No description provided in the current complaint snapshot.'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Citizen location" subtitle="Geo-tagged complaint mapped to the current field coordinates">
            {complaint.location ? (
              <div className="space-y-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Coordinates</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
                  </p>
                </div>
                <ComplaintMap complaints={[complaint]} height="320px" zoom={16} />
              </div>
            ) : (
              <DetailEmptyState
                title="No map location captured"
                description="The current complaint payload does not contain coordinates, so the citizen location map cannot be rendered."
              />
            )}
          </DetailSection>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <DetailSection title="Status tracker" subtitle="Live workflow progression derived from the current complaint state">
            <ComplaintStatusTracker status={complaint.status} />
          </DetailSection>

          <DetailSection title="Assignment panel" subtitle="Choose the department and authority responsible for this complaint">
            <div className="space-y-4">
              <div className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Current department</span>
                  <span className="text-sm font-semibold text-slate-950">{complaint.department || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Selected authority</span>
                  <span className="text-sm font-semibold text-slate-950">{selectedAuthority?.name || 'Not selected'}</span>
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-700">Authority</label>
              <select
                value={assignedAuthority}
                onChange={(e) => setAssignedAuthority(Number(e.target.value) || '')}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="">— select authority —</option>
                {authorities.map((authority) => (
                  <option key={authority.id} value={authority.id}>
                    {authority.name}
                  </option>
                ))}
              </select>

              {selectedAuthority ? (
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Authority info</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Designation</span>
                      <span className="font-medium text-slate-950">{selectedAuthority.designation || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Zone</span>
                      <span className="font-medium text-slate-950">{selectedAuthority.zone || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">District</span>
                      <span className="font-medium text-slate-950">{selectedAuthority.district || '—'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <DetailEmptyState
                  title="No authority selected"
                  description="Choose an authority to populate the assignment preview before saving the routing decision."
                />
              )}

              <button
                type="button"
                disabled={saving || !assignedAuthority}
                onClick={async () => {
                  if (!assignedAuthority) return
                  const selected = authorities.find((authority) => authority.id === assignedAuthority)
                  const success = await handlePatch({ department: selected?.name })
                  if (success) {
                    setDepartment(selected?.name || '')
                  }
                }}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save assignment
              </button>
            </div>
          </DetailSection>

          <DetailSection title="Admin notes" subtitle="Workspace notes stored in the current complaint record">
            <div className="space-y-3">
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                rows={6}
                placeholder="Add concise investigation notes, dispatch instructions, or closure context."
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await handlePatch({ adminNotes })
                }}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save notes
              </button>
            </div>
          </DetailSection>

          <DetailSection title="Resolution workflow" subtitle="Quick actions for the current record snapshot">
            <div className="grid gap-2">
              {STATUSES.map((status) => {
                const active = complaint.status === status
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={saving || active}
                    onClick={async () => {
                      const success = await handlePatch({ status, department, adminNotes })
                      if (success) {
                        setMessage(`Status updated to ${status}`)
                      }
                    }}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      active
                        ? 'border-brand-200 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-700'
                    }`}
                  >
                    <span>{status.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {active ? 'Current' : 'Set'}
                    </span>
                  </button>
                )
              })}
            </div>
          </DetailSection>

          <DetailSection title="Complaint history" subtitle="Live snapshot timeline from the current API payload">
            <ComplaintActivityTimeline
              entries={timelineEntries}
              emptyTitle="No activity available"
              emptyDescription="The current complaint record does not expose a historical log, so there is nothing to display here beyond the live snapshot."
            />
          </DetailSection>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DetailSection title="Related complaints" subtitle="Items with matching signals from the same live complaint feed">
          <RelatedComplaintsList
            complaints={relatedComplaints}
            emptyTitle="No related complaints found"
            emptyDescription="No nearby complaint in the current dataset shares the same department, road type, severity, or AI label."
          />
        </DetailSection>

        <DetailSection title="Recent activity" subtitle="Snapshot of the current complaint state and the latest workspace changes">
          <ComplaintActivityTimeline
            entries={timelineEntries.slice(0, 3)}
            emptyTitle="No recent activity"
            emptyDescription="Once the complaint is routed or updated, the workspace snapshot will appear here."
          />
        </DetailSection>

        <DetailSection title="Resolution evidence" subtitle="Uploaded image and AI output used for the current disposition">
          {hasEvidence ? (
            <div className="space-y-4">
              <div className={`grid gap-4 ${complaint.aiProcessedImageUrl ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
                <figure className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
                  <img src={imageSrc(complaint.imageUrl)} alt={`Resolution evidence image ${complaint.id}`} className="h-44 w-full object-cover" />
                  <figcaption className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Citizen upload
                  </figcaption>
                </figure>
                {complaint.aiProcessedImageUrl ? (
                  <figure className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
                    <img src={imageSrc(complaint.aiProcessedImageUrl)} alt={`AI evidence image ${complaint.id}`} className="h-44 w-full object-cover" />
                    <figcaption className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      AI processed evidence
                    </figcaption>
                  </figure>
                ) : null}
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Evidence summary</p>
                <p className="mt-2 leading-6">
                  {complaint.aiLabel || 'Unclassified'} · {formatPercent(complaint.aiConfidence ?? undefined)} confidence · {complaint.severity} severity.
                </p>
              </div>
            </div>
          ) : (
            <DetailEmptyState
              title="No evidence images available"
              description="The current complaint snapshot does not include image evidence that can be presented in this section."
            />
          )}
        </DetailSection>
      </div>
    </div>
  )
}
