import { ResolutionModal } from '../components/complaints/detail/ResolutionModal';
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
import { fetchMapComplaints, fetchTimeline, forwardComplaint } from '@/api/complaints'
import { useAsync } from '@/hooks/useAsync'
import { DetailSection } from '@/components/complaints/detail/DetailSection'
import { DetailEmptyState } from '@/components/complaints/detail/DetailEmptyState'
import { ComplaintStatusTracker } from '@/components/complaints/detail/ComplaintStatusTracker'
import { ComplaintActivityTimeline, buildLiveComplaintTimeline, buildTimelineFromEvents } from '@/components/complaints/detail/ComplaintActivityTimeline'
import { RelatedComplaintsList } from '@/components/complaints/detail/RelatedComplaintsList'
import { ComplaintActionPanel } from '@/components/complaints/ComplaintActionPanel'
import { ComplaintMap } from '@/components/map/ComplaintMap'
import { DEPARTMENTS } from '@/data/departments'
import { canForward } from '@/utils/complaintActions'
import { Send } from 'lucide-react'

function suggestDepartment(complaint: Complaint): string {
  const label = (complaint.aiLabel || '').toLowerCase()
  const road  = (complaint.roadType || '').toLowerCase()
  const sev   = (complaint.severity || '').toUpperCase()
  if (road.includes('nh') || road.includes('national') || road.includes('expressway') || road.includes('toll'))
    return 'dept_nhai_01'
  if (label.includes('water') || label.includes('flood') || label.includes('drain') || road.includes('drain'))
    return 'dept_jal_04'
  if (label.includes('light') || label.includes('electric') || label.includes('wire') || label.includes('pole'))
    return 'dept_electric_06'
  if (label.includes('traffic') || label.includes('signal') || label.includes('jam'))
    return 'dept_traffic_05'
  if (road.includes('sh') || road.includes('state') || road.includes('flyover') || road.includes('bridge') ||
      road.includes('major') || sev === 'HIGH' || sev === 'CRITICAL')
    return 'dept_pwd_02'
  return 'dept_ulb_03'
}

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>()
  const complaintId = id ? Number(id) : undefined
  const { data: complaint, loading, error, reload, update } = useComplaint(complaintId)
  const relatedState = useAsync(() => fetchMapComplaints(), [])

  const [adminNotes, setAdminNotes]   = useState('')
  const [saving, setSaving]           = useState(false)
  const [message, setMessage]         = useState('')
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [selectedDept, setSelectedDept]             = useState('')
  const [selectedAuthority, setSelectedAuthority]   = useState<number | ''>('')
  const [forwardReason, setForwardReason]           = useState('')
  const [forwarding, setForwarding]                 = useState(false)
  
  // POPUP MODAL STATE
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

  useEffect(() => {
    if (!complaint) return
    setAdminNotes(complaint.adminNotes || '')
    if (!selectedDept) {
      const suggested = suggestDepartment(complaint)
      setSelectedDept(
        complaint.department
          ? (DEPARTMENTS.find(d => d.shortName === complaint.department || d.id === complaint.department || d.name === complaint.department)?.id || suggested)
          : suggested
      )
    }
  }, [complaint])

  useEffect(() => {
    if (!selectedDept) return
    let mounted = true
    const dept = DEPARTMENTS.find(d => d.id === selectedDept)
    fetchAuthorities(dept ? { district: dept.zone } : undefined)
      .then(list => { if (mounted) setAuthorities(list) })
      .catch(() => { if (mounted) setAuthorities([]) })
    return () => { mounted = false }
  }, [selectedDept])

  useEffect(() => {
    if (!complaint || authorities.length === 0) return
    const match = authorities.find(a => a.name === complaint.assignedAuthorityName)
    if (match) setSelectedAuthority(match.id)
  }, [authorities, complaint])

  const [apiTimelineEntries, setApiTimelineEntries] = useState<ReturnType<typeof buildTimelineFromEvents>>([])
  useEffect(() => {
    if (!complaintId) return
    let mounted = true
    fetchTimeline(complaintId)
      .then(data => { if (mounted && data.events?.length) setApiTimelineEntries(buildTimelineFromEvents(data.events)) })
      .catch(() => {})
    return () => { mounted = false }
  }, [complaintId, complaint?.status])

  const handlePatch = async (payload: ComplaintUpdatePayload | any) => {
    setSaving(true); setMessage('')
    try {
      await update(payload)
      setMessage('Saved successfully')
      reload()
      return true
    } catch {
      return false
    } finally { setSaving(false) }
  }

  const handleForward = async () => {
    if (!selectedDept || !complaint) return
    setForwarding(true); setMessage('')
    try {
      const updated = await forwardComplaint(complaint.id, selectedDept, forwardReason || undefined)
      
      // FORCE UI TO UPDATE TO FORWARDED IMMEDIATELY
      await update({ status: 'FORWARDED', department: selectedDept })
      
      setMessage(`Forwarded to ${updated.department || selectedDept}`)
      reload()
    } catch {
      setMessage('Forward failed — try again')
    } finally { setForwarding(false) }
  }

  const allComplaints = Array.isArray(relatedState.data) ? relatedState.data : []
  const relatedComplaints = useMemo(() => {
    if (!complaint) return [] as Array<{ complaint: Complaint; reasons: string[] }>
    return allComplaints
      .filter(c => c.id !== complaint.id)
      .map(candidate => {
        const reasons: string[] = []; let score = 0
        if (candidate.department && complaint.department && candidate.department === complaint.department) { reasons.push('same department'); score += 4 }
        if (candidate.roadType && complaint.roadType && candidate.roadType === complaint.roadType) { reasons.push('same road type'); score += 3 }
        if (candidate.aiLabel && complaint.aiLabel && candidate.aiLabel === complaint.aiLabel) { reasons.push('same AI label'); score += 2 }
        if (candidate.severity === complaint.severity) { reasons.push('matching severity'); score += 1 }
        if (candidate.status === complaint.status) { reasons.push('matching status'); score += 1 }
        return { complaint: candidate, reasons, score }
      })
      .filter(e => e.score > 0)
      .sort((a, b) => b.score - a.score || new Date(b.complaint.timestamp).getTime() - new Date(a.complaint.timestamp).getTime())
      .slice(0, 4)
      .map(({ complaint: rc, reasons }) => ({ complaint: rc, reasons }))
  }, [allComplaints, complaint])

  const timelineEntries = useMemo(() =>
    complaint ? buildLiveComplaintTimeline({
      timestamp: complaint.timestamp, status: complaint.status,
      department: complaint.department, aiLabel: complaint.aiLabel,
      aiConfidence: complaint.aiConfidence, adminNotes,
    }) : [],
    [adminNotes, complaint]
  )

  const chosenAuthority = authorities.find(a => a.id === selectedAuthority)
  const chosenDept      = DEPARTMENTS.find(d => d.id === selectedDept)
  const suggestedDeptId = complaint ? suggestDepartment(complaint) : ''
  const detections      = complaint ? parseDetections(complaint.aiDetectionsJson) : []
  const canFwd          = canForward(complaint?.status)
  
  // Checking if status is past ACCEPTED
  const isForwarded     = ['FORWARDED', 'IN_PROGRESS', 'RESOLVED'].includes((complaint?.status || '').toUpperCase())

  if (loading) return <LoadingState message="Loading complaint…" />
  if (error || !complaint) return <ErrorState message={error || 'Complaint not found'} onRetry={reload} />

  const cg = 'bg-gradient-to-b from-white to-slate-50/60'

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="space-y-1.5">
          <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to list
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Complaint #{complaint.id}</h2>
          <p className="text-sm text-slate-500">Triage, assign, and resolve field complaints.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="status" value={complaint.status} />
          <Badge variant="severity" value={complaint.severity} />
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {complaint.roadType || 'Unspecified road type'}
          </span>
        </div>
      </div>

      {message && (
        <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.toLowerCase().includes('fail') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`} role="status">
          {message}
        </p>
      )}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Reported',   value: formatDate(complaint.timestamp), color: 'border-l-slate-400'  },
          { label: 'AI Label',   value: complaint.aiLabel || 'Unclassified', color: 'border-l-blue-500'   },
          { label: 'Confidence', value: formatPercent(complaint.aiConfidence ?? undefined), color: 'border-l-emerald-500'},
          { label: 'Location',   value: (complaint.location?.latitude && complaint.location?.longitude) ? 'Geo-tagged' : 'No coordinates', color: 'border-l-amber-500'  },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all border-l-[4px] ${card.color}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className="mt-2 text-sm sm:text-base font-semibold text-slate-950 truncate">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <DetailSection title="Complaint evidence" subtitle="Original photo, AI output, and metadata" className={`border-t-[3px] border-t-blue-500 ${cg}`}>
            <div className="space-y-5">
              <div className={`grid gap-4 ${complaint.aiProcessedImageUrl ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Complaint image</p>
                  </div>
                  <img src={imageSrc(complaint.imageUrl)} alt={`Complaint ${complaint.id}`} className="h-64 w-full object-contain bg-slate-50" />
                </figure>
                {complaint.aiProcessedImageUrl ? (
                  <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI processed</p>
                    </div>
                    <img src={imageSrc(complaint.aiProcessedImageUrl)} alt={`AI ${complaint.id}`} className="h-64 w-full object-contain bg-slate-50" />
                  </figure>
                ) : (
                  <DetailEmptyState title="No AI processed image" description="AI pipeline did not produce output for this complaint." />
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">YOLO detection</p>
                      <h3 className="mt-1.5 text-lg font-bold text-slate-950">{complaint.aiLabel || 'Unclassified'}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 border border-violet-100">
                        {formatPercent(complaint.aiConfidence ?? undefined)} confidence
                      </span>
                      <Badge variant="severity" value={complaint.severity} />
                    </div>
                  </div>
                  <dl className="grid gap-3 grid-cols-2">
                    {[
                      { label: 'Primary label', value: complaint.aiLabel || 'None' },
                      { label: 'Severity',      value: <Badge variant="severity" value={complaint.severity} /> },
                      { label: 'Road type',     value: complaint.roadType || 'Unspecified' },
                      { label: 'Confidence',    value: formatPercent(complaint.aiConfidence ?? undefined) },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                        <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{item.label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-950 capitalize">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Complaint metadata</p>
                  <dl className="space-y-2.5">
                    {[
                      { label: 'Status',     value: <Badge variant="status" value={complaint.status} /> },
                      { label: 'Department', value: complaint.department || 'Unassigned' },
                      { label: 'Uploaded',   value: formatDate(complaint.timestamp) },
                      { label: 'Road type',  value: complaint.roadType || '—' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                        <dt className="text-sm font-medium text-slate-600">{item.label}</dt>
                        <dd className="text-sm font-bold text-slate-950">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </DetailSection>

          {complaint.location?.latitude && complaint.location?.longitude && (
            <DetailSection title="Location map" subtitle="Geotagged complaint location" className="border-t-[3px] border-t-teal-500 overflow-hidden">
              <div className="-mx-5 -mb-5 rounded-b-2xl overflow-hidden" style={{ height: '280px' }}>
                <ComplaintMap complaints={[complaint]} height="280px" zoom={15} />
              </div>
            </DetailSection>
          )}

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <DetailSection title="Related complaints" subtitle="Matching signals" className={`border-t-[3px] border-t-blue-400 ${cg}`}>
              <RelatedComplaintsList
                complaints={relatedComplaints}
                emptyTitle="No related complaints"
                emptyDescription="No complaints share same department, road type, or AI label."
              />
            </DetailSection>
            <DetailSection title="Recent activity" subtitle="Latest workspace changes" className={`border-t-[3px] border-t-slate-400 ${cg}`}>
              <ComplaintActivityTimeline
                entries={timelineEntries.slice(0, 4)}
                emptyTitle="No recent activity"
                emptyDescription="Actions will appear here once complaint is routed."
              />
            </DetailSection>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-6">
          <DetailSection title="Status tracker" subtitle="Live workflow progression" className={`border-t-[3px] border-t-amber-500 ${cg}`}>
            <ComplaintStatusTracker status={complaint.status} />
          </DetailSection>

          <DetailSection title="Workflow panel" subtitle="Verify → route → assign → forward → resolve" className="border-t-[3px] border-t-violet-500">
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 1 — Verify complaint</p>
                <ComplaintActionPanel
                  complaint={complaint}
                  department={chosenDept?.shortName || selectedDept}
                  adminNotes={adminNotes}
                  saving={saving}
                  onPatch={async payload => {
                    const ok = await handlePatch(payload)
                    if (ok && payload.status) setMessage(`Status → ${payload.status.replace(/_/g, ' ').toLowerCase()}`)
                  }}
                />
              </div>

              <hr className="border-slate-100" />

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 2 & 3 — Department & Officer</p>
                <select
                  value={selectedDept}
                  onChange={e => { setSelectedDept(e.target.value); setSelectedAuthority('') }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium bg-white shadow-sm mb-3"
                >
                  <option value="">— select department —</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>{d.shortName}</option>
                  ))}
                </select>
                <select
                  value={selectedAuthority}
                  onChange={e => setSelectedAuthority(Number(e.target.value) || '')}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium bg-white shadow-sm"
                >
                  <option value="">— select officer —</option>
                  {authorities.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <hr className="border-slate-100" />

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 4 — Forward</p>
                {isForwarded ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 font-semibold">
                    ✓ Forwarded successfully.
                  </div>
                ) : canFwd ? (
                  <button
                    type="button"
                    disabled={!selectedDept || forwarding}
                    onClick={handleForward}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Send size={15} /> {forwarding ? 'Forwarding…' : 'Forward to Department'}
                  </button>
                ) : (
                  <p className="text-sm text-slate-400 italic">Accept the complaint first.</p>
                )}
              </div>

              {/* Step 5 - RESOLUTION MODAL TRIGGER */}
              {complaint.status !== 'RESOLVED' && (
                <>
                  <hr className="border-slate-100" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 5 — Mark Resolved</p>
                    {isForwarded ? (
                      <button
                        onClick={() => setIsResolveModalOpen(true)}
                        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Verify Final Proof & Resolve
                      </button>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Complaint must be forwarded before it can be resolved.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </DetailSection>
        </div>
      </div>

      <ResolutionModal 
        isOpen={isResolveModalOpen} 
        complaintLat={complaint?.location?.latitude}
        complaintLng={complaint?.location?.longitude}
        onClose={() => setIsResolveModalOpen(false)} 
        onConfirm={async (photoUrl) => {
          const ok = await handlePatch({ status: "RESOLVED", resolutionPhoto: photoUrl });
          if (ok) {
              setMessage('Complaint officially resolved with AI proof!');
              reload();
          }
        }} 
      />
    </div>
  )
}
