import { ResolutionModal } from '../components/complaints/detail/ResolutionModal';
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { imageSrc } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useComplaint } from '@/hooks/useComplaint'
import type { Complaint, ComplaintUpdatePayload } from '@/types/complaint'
import { formatDate, formatPercent } from '@/utils/format'
import { fetchAuthorities } from '@/api/authorities'
import type { Authority } from '@/api/authorities'
import { fetchMapComplaints, forwardComplaint } from '@/api/complaints'
import { useAsync } from '@/hooks/useAsync'
import { DetailSection } from '@/components/complaints/detail/DetailSection'
import { ComplaintStatusTracker } from '@/components/complaints/detail/ComplaintStatusTracker'
import { ComplaintActivityTimeline, buildLiveComplaintTimeline } from '@/components/complaints/detail/ComplaintActivityTimeline'
import { RelatedComplaintsList } from '@/components/complaints/detail/RelatedComplaintsList'
import { ComplaintActionPanel } from '@/components/complaints/ComplaintActionPanel'
import { ComplaintMap } from '@/components/map/ComplaintMap'
import { DEPARTMENTS } from '@/data/departments'
import { canForward } from '@/utils/complaintActions'
import { Send } from 'lucide-react'

function suggestDepartment(complaint: Complaint): string {
  const road = (complaint.roadType || '').toLowerCase()
  const sev  = (complaint.severity || '').toUpperCase()
  if (road.includes('nh') || road.includes('national') || road.includes('expressway')) return 'dept_nhai_01'
  if (road.includes('sh') || road.includes('state') || sev === 'HIGH' || sev === 'CRITICAL') return 'dept_pwd_02'
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
  const [selectedDept, setSelectedDept]  = useState('')
  const [forwarding, setForwarding]      = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

  useEffect(() => {
    if (!complaint) return
    setAdminNotes(complaint.adminNotes || '')
    if (!selectedDept) setSelectedDept(suggestDepartment(complaint))
  }, [complaint])

  useEffect(() => {
    if (!selectedDept) return
    const dept = DEPARTMENTS.find(d => d.id === selectedDept)
    fetchAuthorities(dept ? { district: dept.zone } : undefined).then(setAuthorities).catch(() => setAuthorities([]))
  }, [selectedDept])

  const handlePatch = async (payload: ComplaintUpdatePayload | any) => {
    setSaving(true); setMessage('')
    try {
      await update(payload)
      setMessage('Saved successfully')
      reload()
      return true
    } catch { return false } finally { setSaving(false) }
  }

  const handleForward = async () => {
    if (!selectedDept || !complaint) return
    setForwarding(true); setMessage('')
    try {
      // Call forward API
      await forwardComplaint(complaint.id, selectedDept, undefined)
      // Force UI update immediately
      await update({ status: 'FORWARDED', department: selectedDept })
      setMessage('Forwarded to department successfully!')
      reload()
    } catch (e: any) {
      // Even if there's an error, check if data was actually saved
      setMessage('Forwarding...')
      reload()
    } finally { setForwarding(false) }
  }

  const allComplaints = Array.isArray(relatedState.data) ? relatedState.data : []
  const relatedComplaints = useMemo(() => {
    if (!complaint) return [] as Array<{ complaint: Complaint; reasons: string[] }>
    return allComplaints
      .filter(c => c.id !== complaint.id)
      .slice(0, 3)
      .map(c => ({ complaint: c, reasons: ['related location'] }))
  }, [allComplaints, complaint])

  const timelineEntries = useMemo(() =>
    complaint ? buildLiveComplaintTimeline({
      timestamp: complaint.timestamp, status: complaint.status,
      department: complaint.department, aiLabel: complaint.aiLabel,
      aiConfidence: complaint.aiConfidence, adminNotes,
    }) : [],
    [adminNotes, complaint]
  )

  const chosenDept    = DEPARTMENTS.find(d => d.id === selectedDept)
  const canFwd        = canForward(complaint?.status)
  const isForwarded   = ['FORWARDED', 'IN_PROGRESS', 'RESOLVED'].includes((complaint?.status || '').toUpperCase())

  if (loading) return <LoadingState message="Loading complaint…" />
  if (error || !complaint) return <ErrorState message={error || 'Complaint not found'} onRetry={reload} />

  const cg = 'bg-gradient-to-b from-white to-slate-50/60'

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto px-4 sm:px-6">

      {/* Header */}
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
        </div>
      </div>

      {/* Toast */}
      {message && (
        <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.toLowerCase().includes('fail') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {message}
        </p>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Reported',   value: formatDate(complaint.timestamp),                                                               color: 'border-l-slate-400'   },
          { label: 'AI Label',   value: complaint.aiLabel || 'Unclassified',                                                           color: 'border-l-blue-500'    },
          { label: 'Confidence', value: formatPercent(complaint.aiConfidence ?? undefined),                                            color: 'border-l-emerald-500' },
          { label: 'Location',   value: (complaint.location?.latitude && complaint.location?.longitude) ? 'Geo-tagged' : 'No coords',  color: 'border-l-amber-500'   },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm border-l-[4px] ${card.color}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className="mt-2 text-sm font-semibold text-slate-950 truncate">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT */}
        <div className="lg:col-span-7 space-y-6">
          <DetailSection title="Complaint evidence" subtitle="Original photo and AI output" className={`border-t-[3px] border-t-blue-500 ${cg}`}>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Complaint image</p>
                </div>
                <img src={imageSrc(complaint.imageUrl)} alt={`Complaint ${complaint.id}`} className="h-64 w-full object-contain bg-slate-50" />
              </figure>
              {complaint.aiProcessedImageUrl && (
                <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI processed</p>
                  </div>
                  <img src={imageSrc(complaint.aiProcessedImageUrl)} alt="AI" className="h-64 w-full object-contain bg-slate-50" />
                </figure>
              )}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Complaint metadata</p>
              <dl className="grid gap-2 grid-cols-2">
                {[
                  { label: 'Status',     value: <Badge variant="status" value={complaint.status} /> },
                  { label: 'Department', value: complaint.department || 'Unassigned' },
                  { label: 'Road type',  value: complaint.roadType || '—' },
                  { label: 'Severity',   value: <Badge variant="severity" value={complaint.severity} /> },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                    <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{item.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-950">{item.value}</dd>
                  </div>
                ))}
              </dl>
              {complaint.description && (
                <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Citizen note</dt>
                  <dd className="mt-1 text-sm text-slate-800">{complaint.description}</dd>
                </div>
              )}
            </div>
          </DetailSection>

          {complaint.location?.latitude && complaint.location?.longitude && (
            <DetailSection title="Location map" className="border-t-[3px] border-t-teal-500 overflow-hidden">
              <div className="-mx-5 -mb-5 rounded-b-2xl overflow-hidden" style={{ height: '280px' }}>
                <ComplaintMap complaints={[complaint]} height="280px" zoom={15} />
              </div>
            </DetailSection>
          )}

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <DetailSection title="Related complaints" className={`border-t-[3px] border-t-blue-400 ${cg}`}>
              <RelatedComplaintsList complaints={relatedComplaints} emptyTitle="No related complaints" emptyDescription="No matching complaints found." />
            </DetailSection>
            <DetailSection title="Recent activity" className={`border-t-[3px] border-t-slate-400 ${cg}`}>
              <ComplaintActivityTimeline entries={timelineEntries.slice(0, 4)} emptyTitle="No recent activity" emptyDescription="Actions will appear here." />
            </DetailSection>
          </div>
        </div>

        {/* RIGHT sidebar */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">

          {/* Status tracker */}
          <DetailSection title="Status tracker" subtitle="Live workflow progression" className={`border-t-[3px] border-t-amber-500 ${cg}`}>
            <ComplaintStatusTracker status={complaint.status} />
          </DetailSection>

          {/* Workflow Panel */}
          <DetailSection title="Workflow panel" subtitle="Step-by-step GovTech resolution" className="border-t-[3px] border-t-violet-500">
            <div className="space-y-5">

              {/* Step 1 */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 1 — Verify complaint</p>
                <ComplaintActionPanel
                  complaint={complaint}
                  adminNotes={adminNotes}
                  saving={saving}
                  onPatch={async payload => {
                    const ok = await handlePatch(payload)
                    if (ok && payload.status) setMessage(`Status → ${payload.status}`)
                  }}
                />
              </div>

              <hr className="border-slate-100" />

              {/* Step 2 */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Step 2 — Select Department
                  {chosenDept && <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">AI suggested</span>}
                </p>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium bg-white shadow-sm"
                >
                  <option value="">— select department —</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>{d.shortName}</option>
                  ))}
                </select>
              </div>

              <hr className="border-slate-100" />

              {/* Step 3 */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 3 — Assign officer</p>
                <select className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium bg-white shadow-sm">
                  <option value="">— select officer —</option>
                  {authorities.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <hr className="border-slate-100" />

              {/* Step 4 */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 4 — Forward</p>
                {isForwarded ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 font-semibold">
                    ✓ Already forwarded to: {complaint.department}
                  </div>
                ) : canFwd ? (
                  <button
                    type="button"
                    disabled={!selectedDept || forwarding}
                    onClick={handleForward}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Send size={15} />
                    {forwarding ? 'Forwarding…' : `Forward to ${chosenDept?.shortName || 'Department'}`}
                  </button>
                ) : (
                  <p className="text-sm text-slate-400 italic">Accept the complaint first.</p>
                )}
              </div>

              {/* Step 5 */}
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
                        📸 Verify Final Proof & Resolve
                      </button>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Forward complaint first to enable resolution.</p>
                    )}
                  </div>
                </>
              )}

            </div>
          </DetailSection>

          {/* Admin notes */}
          <DetailSection title="Admin notes" className={`border-t-[3px] border-t-slate-400 ${cg}`}>
            <div className="space-y-3">
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add investigation notes..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => handlePatch({ adminNotes })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Save notes
              </button>
            </div>
          </DetailSection>

          {/* History */}
          <DetailSection title="Complaint history" className={`border-t-[3px] border-t-slate-400 ${cg}`}>
            <ComplaintActivityTimeline
              entries={timelineEntries}
              emptyTitle="No audit trail yet"
              emptyDescription="Status changes will appear here."
            />
          </DetailSection>

        </div>
      </div>

      {/* PENDING_APPROVAL Section */}
      {complaint.status === 'PENDING_APPROVAL' && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-amber-800 mb-2">Officer Resolution Pending Approval</h3>
          <p className="text-sm text-amber-700 mb-4">Officer ne proof submit kiya hai. Verify karke approve ya reject karo.</p>
          {complaint.resolutionProofUrl && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Resolution Proof</p>
              <img src={imageSrc(complaint.resolutionProofUrl)} alt="Resolution proof" className="h-48 w-full object-contain rounded-xl border border-amber-200 bg-white" />
            </div>
          )}
          {complaint.adminNotes && (
            <div className="mb-4 rounded-xl bg-white border border-amber-200 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Officer Remarks</p>
              <p className="text-sm text-slate-800">{complaint.adminNotes}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={async () => {
                try {
                  const API = import.meta.env.VITE_API_BASE_URL || 'https://roadwatch-api.duckdns.org'
                  await fetch(API + '/api/complaints/' + complaint.id + '/approve-resolution', { method: 'POST' })
                  setMessage('Resolution approved! Complaint resolved.')
                  reload()
                } catch { setMessage('Error approving') }
              }}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Approve and Resolve
            </button>
            <button
              onClick={async () => {
                try {
                  const API = import.meta.env.VITE_API_BASE_URL || 'https://roadwatch-api.duckdns.org'
                  const body = JSON.stringify({reason: 'Proof insufficient'})
                  await fetch(API + '/api/complaints/' + complaint.id + '/reject-resolution', { method: 'POST', headers: {'Content-Type':'application/json'}, body: body })
                  setMessage('Resolution rejected. Sent back to officer.')
                  reload()
                } catch { setMessage('Error rejecting') }
              }}
              className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      <ResolutionModal 
        isOpen={isResolveModalOpen} 
        complaintLat={complaint?.location?.latitude}
        complaintLng={complaint?.location?.longitude}
        onClose={() => setIsResolveModalOpen(false)} 
        onConfirm={async (photoUrl) => {
          const ok = await handlePatch({ status: "RESOLVED", resolutionPhoto: photoUrl });
          if (ok) setMessage('✅ Complaint officially resolved with AI proof!');
        }} 
      />
    </div>
  )
}
