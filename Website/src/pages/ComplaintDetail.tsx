import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { imageSrc } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useComplaint } from '@/hooks/useComplaint'
import type { Complaint, ComplaintUpdatePayload } from '@/types/complaint'
import { formatDate, formatPercent, parseDetections } from '@/utils/format'
import { fetchAuthorities } from '@/api/authorities'
import type { Authority } from '@/api/authorities'
import { fetchMapComplaints, fetchTimeline } from '@/api/complaints'
import { useAsync } from '@/hooks/useAsync'
import { DetailSection } from '@/components/complaints/detail/DetailSection'
import { DetailEmptyState } from '@/components/complaints/detail/DetailEmptyState'
import { ComplaintStatusTracker } from '@/components/complaints/detail/ComplaintStatusTracker'
import { ComplaintActivityTimeline, buildLiveComplaintTimeline, buildTimelineFromEvents } from '@/components/complaints/detail/ComplaintActivityTimeline'
import { RelatedComplaintsList } from '@/components/complaints/detail/RelatedComplaintsList'
import { ComplaintActionPanel } from '@/components/complaints/ComplaintActionPanel'
import { ComplaintForwardPanel } from '@/components/complaints/ComplaintForwardPanel'
import { ComplaintMap } from '@/components/map/ComplaintMap'

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
    if (!complaint || authorities.length === 0) return
    const matchedAuthority = authorities.find((a) => a.name === complaint.assignedAuthorityName)
    setAssignedAuthority(matchedAuthority?.id ?? '')
  }, [authorities, complaint])

  useEffect(() => {
    let mounted = true
    fetchAuthorities()
      .then((list) => { if (mounted) setAuthorities(list) })
      .catch(() => { if (mounted) setAuthorities([]) })
    return () => { mounted = false }
  }, [])

  const [apiTimelineEntries, setApiTimelineEntries] = useState<ReturnType<typeof buildTimelineFromEvents>>([])

  useEffect(() => {
    if (!complaintId) return
    let mounted = true
    fetchTimeline(complaintId)
      .then((data) => {
        if (mounted && data.events?.length) setApiTimelineEntries(buildTimelineFromEvents(data.events))
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [complaintId, complaint?.status])

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
      .filter((c) => c.id !== complaint.id)
      .map((candidate) => {
        const reasons: string[] = []
        let score = 0
        if (candidate.department && complaint.department && candidate.department === complaint.department) { reasons.push('same department'); score += 4 }
        if (candidate.roadType && complaint.roadType && candidate.roadType === complaint.roadType) { reasons.push('same road type'); score += 3 }
        if (candidate.aiLabel && complaint.aiLabel && candidate.aiLabel === complaint.aiLabel) { reasons.push('same AI label'); score += 2 }
        if (candidate.severity === complaint.severity) { reasons.push('matching severity'); score += 1 }
        if (candidate.status === complaint.status) { reasons.push('matching status'); score += 1 }
        return { complaint: candidate, reasons, score }
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score || new Date(b.complaint.timestamp).getTime() - new Date(a.complaint.timestamp).getTime())
      .slice(0, 4)
      .map(({ complaint: rc, reasons }) => ({ complaint: rc, reasons }))
  }, [allComplaints, complaint])

  const timelineEntries = useMemo(
    () => complaint ? buildLiveComplaintTimeline({
      timestamp: complaint.timestamp,
      status: complaint.status,
      department: complaint.department,
      aiLabel: complaint.aiLabel,
      aiConfidence: complaint.aiConfidence,
      adminNotes,
    }) : [],
    [adminNotes, complaint]
  )

  const selectedAuthority = authorities.find((a) => a.id === assignedAuthority)
  const detections = complaint ? parseDetections(complaint.aiDetectionsJson) : []
  
  if (loading) return <LoadingState message="Loading complaint…" />
  if (error || !complaint) return <ErrorState message={error || 'Complaint not found'} onRetry={reload} />

  const cardGradient = "bg-gradient-to-b from-white to-slate-50/60"

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto px-4 sm:px-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="space-y-1.5">
          <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to list
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Complaint #{complaint.id}</h2>
          <p className="text-sm text-slate-500">Live investigation workspace for field complaint triage, routing, and resolution.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="status" value={complaint.status} />
          <Badge variant="severity" value={complaint.severity} />
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {complaint.roadType || 'Unspecified road type'}
          </span>
        </div>
      </div>

      {/* ── Save message ── */}
      {message && (
        <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.includes('failed') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`} role="status">
          {message}
        </p>
      )}

      {/* ── Stat cards ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Reported', value: formatDate(complaint.timestamp), color: 'border-l-slate-400' },
          { label: 'AI Label', value: complaint.aiLabel || 'Unclassified', color: 'border-l-blue-500' },
          { label: 'Confidence', value: formatPercent(complaint.aiConfidence ?? undefined), color: 'border-l-emerald-500' },
          { label: 'Location', value: Boolean(complaint?.location?.latitude && complaint?.location?.longitude) ? 'Geo-tagged' : 'No coordinates', color: 'border-l-amber-500' },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md border-l-[4px] ${card.color}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className="mt-2 text-sm sm:text-base font-semibold text-slate-950 truncate">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main Layout: 12-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">

        {/* LEFT column: takes 7/12 on large, 8/12 on extra-large screens */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {/* Evidence */}
          <DetailSection title="Complaint evidence" subtitle="Original media, YOLO output, and detected issue summary" className={`border-t-[3px] border-t-blue-500 ${cardGradient}`}>
            <div className="space-y-5">
              {/* Images row */}
              <div className={`grid gap-4 ${complaint.aiProcessedImageUrl ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Complaint image</p>
                  </div>
                  <img
                    src={imageSrc(complaint.imageUrl)}
                    alt={`Original complaint ${complaint.id}`}
                    className="h-72 w-full object-contain bg-slate-50"
                  />
                </figure>

                {complaint.aiProcessedImageUrl ? (
                  <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI processed image</p>
                    </div>
                    <img
                      src={imageSrc(complaint.aiProcessedImageUrl)}
                      alt={`AI processed ${complaint.id}`}
                      className="h-72 w-full object-contain bg-slate-50"
                    />
                  </figure>
                ) : (
                  <DetailEmptyState title="No AI processed image" description="No processed image from the AI pipeline for this complaint." />
                )}
              </div>

              {/* YOLO + Metadata row */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* YOLO box */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">YOLO detection</p>
                      <h3 className="mt-1.5 text-lg font-bold text-slate-950">{complaint.aiLabel || 'Unclassified'}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 border border-brand-100">
                        {formatPercent(complaint.aiConfidence ?? undefined)} confidence
                      </span>
                      <Badge variant="severity" value={complaint.severity} />
                    </div>
                  </div>

                  <dl className="grid gap-3 grid-cols-2">
                    {[
                      { label: 'Primary label', value: complaint.aiLabel || 'None' },
                      { label: 'Severity', value: <Badge variant="severity" value={complaint.severity} /> },
                      { label: 'Issue category', value: complaint.roadType || 'Unspecified' },
                      { label: 'Confidence', value: formatPercent(complaint.aiConfidence ?? undefined) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                        <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{item.label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-950 capitalize">{item.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {detections.length > 0 && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">Detection breakdown</p>
                      <div className="space-y-2">
                        {detections.map((d) => (
                          <div key={`${d.label}-${d.confidence}`} className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm shadow-sm">
                            <span className="capitalize font-medium text-slate-700">{d.rawLabel || d.label}</span>
                            <span className="font-bold text-slate-950">{formatPercent(d.confidence)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata box */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Complaint metadata</p>
                  <dl className="space-y-2.5">
                    {[
                      { label: 'Status', value: <Badge variant="status" value={complaint.status} /> },
                      { label: 'Department', value: complaint.department || 'Unassigned' },
                      { label: 'Uploaded', value: formatDate(complaint.timestamp) },
                      { label: 'Road type', value: complaint.roadType || '—' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                        <dt className="text-sm font-medium text-slate-600">{item.label}</dt>
                        <dd className="text-sm font-bold text-slate-950">{item.value}</dd>
                      </div>
                    ))}
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <dt className="text-sm font-medium text-slate-600 mb-1.5">Citizen note</dt>
                      <dd className="text-sm leading-relaxed text-slate-800">{complaint.description || 'No description provided.'}</dd>
                    </div>
                    {complaint.expectedRepairDate && (
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                        <dt className="text-sm font-medium text-slate-600">Expected repair</dt>
                        <dd className="text-sm font-bold text-slate-950">{complaint.expectedRepairDate}</dd>
                      </div>
                    )}
                    {complaint.resolvedAt && (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                        <dt className="text-sm font-semibold text-emerald-700">Resolved at</dt>
                        <dd className="text-sm font-bold text-emerald-800">{formatDate(complaint.resolvedAt)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </DetailSection>
        {/* Map */}
          {complaint.location?.latitude && complaint.location?.longitude ? (
            <DetailSection title="Location map" subtitle="Geotagged complaint location" className="border-t-[3px] border-t-teal-500">
              <div className="rounded-xl overflow-hidden" style={{ height: '320px' }}>
                <ComplaintMap
                  complaints={[complaint]}
                  height="320px"
                  zoom={15}
                />
              </div>
            </DetailSection>
          ) : (
            <DetailSection title="Location map" subtitle="No coordinates available" className="border-t-[3px] border-t-slate-300">
              <div className="flex items-center justify-center h-32 text-slate-400 text-sm font-medium">
                📍 No GPS coordinates for this complaint
              </div>
            </DetailSection>
          )}
        </div>

        {/* RIGHT sidebar: takes 5/12 on large, 4/12 on extra-large screens */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-6">

          {/* Status tracker */}
          <DetailSection title="Status tracker" subtitle="Live workflow progression" className={`border-t-[3px] border-t-amber-500 ${cardGradient}`}>
            <ComplaintStatusTracker status={complaint.status} />
          </DetailSection>

          {/* Assignment */}
          <DetailSection title="Assignment panel" subtitle="Assign department and authority" className={`border-t-[3px] border-t-slate-500 ${cardGradient}`}>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Department</span>
                  <span className="text-sm font-bold text-slate-950">{complaint.department || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Authority</span>
                  <span className="text-sm font-bold text-slate-950">{selectedAuthority?.name || 'Not selected'}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Select Authority</label>
                <select
                  value={assignedAuthority}
                  onChange={(e) => setAssignedAuthority(Number(e.target.value) || '')}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 shadow-sm"
                >
                  <option value="">— select authority —</option>
                  {authorities.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {selectedAuthority ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Authority info</p>
                  {[
                    { label: 'Designation', value: selectedAuthority.designation || '—' },
                    { label: 'Zone', value: selectedAuthority.zone || '—' },
                    { label: 'District', value: selectedAuthority.district || '—' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600">{item.label}</span>
                      <span className="font-bold text-slate-950">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <DetailEmptyState title="No authority selected" description="Choose an authority to populate the assignment preview." />
              )}

              <button
                type="button"
                disabled={saving || !assignedAuthority}
                onClick={async () => {
                  if (!assignedAuthority) return
                  const selected = authorities.find((a) => a.id === assignedAuthority)
                  const success = await handlePatch({ department: selected?.name })
                  if (success) setDepartment(selected?.name || '')
                }}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save assignment
              </button>
            </div>
          </DetailSection>

          {/* Admin notes */}
          <DetailSection title="Admin notes" subtitle="Workspace notes for this complaint" className={`border-t-[3px] border-t-slate-500 ${cardGradient}`}>
            <div className="space-y-3">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="Add investigation notes..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium leading-relaxed text-slate-900 bg-white placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 shadow-sm"
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => handlePatch({ adminNotes })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                Save notes
              </button>
            </div>
          </DetailSection>

          {/* Action panel */}
          <DetailSection title="Action panel" subtitle="Approve, reject, or resolve this complaint" className={`border-t-[3px] border-t-rose-500 ${cardGradient}`}>
            <ComplaintActionPanel
              complaint={complaint}
              department={department}
              adminNotes={adminNotes}
              saving={saving}
              onPatch={async (payload) => {
                const success = await handlePatch(payload)
                if (success && payload.status) {
                  setMessage(`Status updated to ${payload.status.replace(/_/g, ' ').toLowerCase()}`)
                }
              }}
            />
          </DetailSection>

          {/* Forward */}
          <DetailSection title="Forward to department" subtitle="Route accepted complaints" className={`border-t-[3px] border-t-indigo-500 ${cardGradient}`}>
            <ComplaintForwardPanel
              complaint={complaint}
              onForwarded={(updated) => {
                reload()
                setMessage(`Forwarded to ${updated.department}`)
              }}
            />
          </DetailSection>

          {/* History */}
          <DetailSection title="Complaint history" subtitle="Audit trail of all status changes" className={`border-t-[3px] border-t-slate-400 ${cardGradient}`}>
            <ComplaintActivityTimeline
              entries={apiTimelineEntries.length ? apiTimelineEntries : timelineEntries}
              emptyTitle="No audit trail yet"
              emptyDescription="Status changes and actions will appear here."
            />
          </DetailSection>
        </div>
      </div>

      {/* ── Bottom Grid (Now 2 columns perfectly balanced) ── */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <DetailSection title="Related complaints" subtitle="Complaints with matching signals" className={`border-t-[3px] border-t-blue-400 ${cardGradient}`}>
          <RelatedComplaintsList
            complaints={relatedComplaints}
            emptyTitle="No related complaints found"
            emptyDescription="No complaints share the same department, road type, severity, or AI label."
          />
        </DetailSection>

        <DetailSection title="Recent activity" subtitle="Latest workspace changes" className={`border-t-[3px] border-t-slate-400 ${cardGradient}`}>
          <ComplaintActivityTimeline
            entries={timelineEntries.slice(0, 3)}
            emptyTitle="No recent activity"
            emptyDescription="Once the complaint is routed, activity will appear here."
          />
        </DetailSection>
      </div>
    </div>
  )
}
