import { ResolutionModal } from '../components/complaints/detail/ResolutionModal';
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { imageSrc } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useComplaint } from '@/hooks/useComplaint'
import type { ComplaintUpdatePayload } from '@/types/complaint'
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
import { Send } from 'lucide-react'

function suggestDepartment(roadType: string, aiLabel: string, severity: string): string {
  const r = roadType.toLowerCase(); const l = aiLabel.toLowerCase(); const s = severity.toUpperCase()
  if (r.includes('nh') || r.includes('national') || r.includes('expressway')) return 'dept_nhai_01'
  if (l.includes('water') || l.includes('drain')) return 'dept_jal_04'
  if (l.includes('light') || l.includes('electric')) return 'dept_electric_06'
  if (r.includes('sh') || r.includes('state') || s === 'HIGH') return 'dept_pwd_02'
  return 'dept_ulb_03'
}

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>()
  const complaintId = id ? Number(id) : undefined
  const { data: complaint, loading, error, reload, update } = useComplaint(complaintId)
  const relatedState = useAsync(() => fetchMapComplaints(), [])

  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving]         = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedAuthority, setSelectedAuthority] = useState<number | ''>('')
  const [forwarding, setForwarding] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

  useEffect(() => {
    if (!complaint) return
    setAdminNotes(complaint.adminNotes || '')
    if (!selectedDept) {
      setSelectedDept(suggestDepartment(complaint.roadType || '', complaint.aiLabel || '', complaint.severity || ''))
    }
  }, [complaint])

  useEffect(() => {
    if (!selectedDept) return
    const dept = DEPARTMENTS.find(d => d.id === selectedDept)
    fetchAuthorities(dept ? { district: dept.zone } : undefined).then(setAuthorities).catch(() => setAuthorities([]))
  }, [selectedDept])

  const handlePatch = async (payload: ComplaintUpdatePayload | any) => {
    setSaving(true); setSaveMsg('')
    try { await update(payload); setSaveMsg('Saved successfully'); reload(); return true }
    catch { return false } finally { setSaving(false) }
  }

  const handleForward = async () => {
    if (!selectedDept || !complaint) return
    setForwarding(true); setSaveMsg('')
    try {
      await forwardComplaint(complaint.id, selectedDept, undefined)
      await update({ status: 'FORWARDED', department: selectedDept })
      setSaveMsg('Forwarded successfully'); reload()
    } catch { setSaveMsg('Forward failed') } finally { setForwarding(false) }
  }

  const allComplaints = Array.isArray(relatedState.data) ? relatedState.data : []
  const relatedComplaints = useMemo(() => {
    if (!complaint) return []
    return allComplaints
      .filter(c => c.id !== complaint.id)
      .map(c => ({ complaint: c, reasons: ['related'] }))
      .slice(0, 4)
  }, [allComplaints, complaint])

  const timelineEntries = useMemo(() =>
    complaint ? buildLiveComplaintTimeline({
      timestamp: complaint.timestamp, status: complaint.status,
      department: complaint.department, aiLabel: complaint.aiLabel,
      aiConfidence: complaint.aiConfidence, adminNotes,
    }) : [], [adminNotes, complaint])

  const chosenDept      = DEPARTMENTS.find(d => d.id === selectedDept)
  const chosenAuthority = authorities.find(a => a.id === selectedAuthority)
  const isForwarded     = ['FORWARDED', 'IN_PROGRESS', 'RESOLVED'].includes((complaint?.status || '').toUpperCase())
  const canFwd          = !isForwarded && ['ACCEPTED', 'IN_REVIEW'].includes((complaint?.status || '').toUpperCase())
  const cg = 'bg-gradient-to-b from-white to-slate-50/60'

  if (loading) return <LoadingState message="Loading complaint…" />
  if (error || !complaint) return <ErrorState message={error || 'Complaint not found'} onRetry={reload} />

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto px-4 sm:px-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Complaint #{complaint.id}</h2>
          <p className="text-sm text-slate-500">Triage, assign, and resolve field complaints.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="status" value={complaint.status} />
          <Badge variant="severity" value={complaint.severity} />
        </div>
      </div>

      {saveMsg && (
        <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${saveMsg.includes('fail') ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {saveMsg}
        </p>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Reported',   value: formatDate(complaint.timestamp),   color: 'border-l-slate-400'   },
          { label: 'AI Label',   value: complaint.aiLabel || 'Unclassified', color: 'border-l-blue-500'  },
          { label: 'Confidence', value: formatPercent(complaint.aiConfidence ?? undefined), color: 'border-l-emerald-500' },
          { label: 'Location',   value: complaint.location?.latitude ? 'Geo-tagged' : 'No coordinates', color: 'border-l-amber-500' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm border-l-[4px] ${card.color}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className="mt-2 text-sm font-semibold text-slate-950 truncate">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">

        {/* LEFT */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {/* Evidence */}
          <DetailSection title="Complaint evidence" subtitle="Original photo and AI metadata" className={`border-t-[3px] border-t-blue-500 ${cg}`}>
            <div className="space-y-4">
              <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Complaint image</p>
                </div>
                <img src={imageSrc(complaint.imageUrl)} alt={`Complaint ${complaint.id}`} className="h-64 w-full object-contain bg-slate-50" />
              </figure>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">AI Detection</p>
                  <dl className="grid gap-2 grid-cols-2">
                    {[
                      { label: 'Label',      value: complaint.aiLabel || 'None' },
                      { label: 'Severity',   value: complaint.severity || '—'  },
                      { label: 'Road type',  value: complaint.roadType || '—'  },
                      { label: 'Confidence', value: formatPercent(complaint.aiConfidence ?? undefined) },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                        <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-950 capitalize">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Metadata</p>
                  <dl className="space-y-2">
                    {[
                      { label: 'Status',     value: <Badge variant="status" value={complaint.status} /> },
                      { label: 'Department', value: complaint.department || 'Unassigned' },
                      { label: 'Uploaded',   value: formatDate(complaint.timestamp) },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                        <dt className="text-sm font-medium text-slate-600">{item.label}</dt>
                        <dd className="text-sm font-bold text-slate-950">{item.value}</dd>
                      </div>
                    ))}
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                      <dt className="text-sm font-medium text-slate-600 mb-1">Description</dt>
                      <dd className="text-sm text-slate-800">{complaint.description || 'No description.'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </DetailSection>

          {/* Map */}
          {complaint.location?.latitude && complaint.location?.longitude && (
            <DetailSection title="Location map" className="border-t-[3px] border-t-teal-500 overflow-hidden">
              <div className="-mx-5 -mb-5 rounded-b-2xl overflow-hidden" style={{ height: '280px' }}>
                <ComplaintMap complaints={[complaint]} height="280px" zoom={15} />
              </div>
            </DetailSection>
          )}

          {/* Related + Activity */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <DetailSection title="Related complaints" className={`border-t-[3px] border-t-blue-400 ${cg}`}>
              <RelatedComplaintsList
                complaints={relatedComplaints}
                emptyTitle="No related complaints"
                emptyDescription="No matching complaints found."
              />
            </DetailSection>
            <DetailSection title="Activity timeline" className={`border-t-[3px] border-t-slate-400 ${cg}`}>
              <ComplaintActivityTimeline
                entries={timelineEntries.slice(0, 4)}
                emptyTitle="No activity yet"
                emptyDescription="Actions will appear here once complaint is routed."
              />
            </DetailSection>
          </div>
        </div>

        {/* RIGHT sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-6">

          {/* Status tracker */}
          <DetailSection title="Status tracker" className={`border-t-[3px] border-t-amber-500 ${cg}`}>
            <ComplaintStatusTracker status={complaint.status} />
          </DetailSection>

          {/* Workflow panel */}
          <DetailSection title="Workflow panel" subtitle="Verify → route → assign → forward → resolve" className="border-t-[3px] border-t-violet-500">
            <div className="space-y-5">

              {/* Step 1 */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 1 — Verify</p>
                <ComplaintActionPanel
                  complaint={complaint}
                  department={chosenDept?.shortName || selectedDept}
                  adminNotes={adminNotes}
                  saving={saving}
                  onPatch={async payload => { await handlePatch(payload) }}
                />
              </div>

              <hr className="border-slate-100" />

              {/* Step 2 — Department */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 2 — Department</p>
                <select
                  value={selectedDept}
                  onChange={e => { setSelectedDept(e.target.value); setSelectedAuthority('') }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium bg-white shadow-sm"
                >
                  <option value="">— select department —</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>{d.shortName} — {d.departmentName.slice(0, 30)}</option>
                  ))}
                </select>
              </div>

              <hr className="border-slate-100" />

              {/* Step 3 — Officer */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 3 — Assign officer</p>
                {authorities.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Select a department first.</p>
                ) : (
                  <select
                    value={selectedAuthority}
                    onChange={e => setSelectedAuthority(Number(e.target.value) || '')}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium bg-white shadow-sm"
                  >
                    <option value="">— select officer —</option>
                    {authorities.map(a => (
                      <option key={a.id} value={a.id}>{a.name}{a.designation ? ` (${a.designation})` : ''}</option>
                    ))}
                  </select>
                )}
                {chosenAuthority && (
                  <p className="mt-2 text-xs text-slate-500">{chosenAuthority.designation} · {chosenAuthority.district}</p>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* Step 4 — Forward */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 4 — Forward</p>
                {isForwarded ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 font-semibold">
                    ✓ Forwarded to: {complaint.department}
                  </div>
                ) : canFwd ? (
                  <button
                    disabled={!selectedDept || forwarding}
                    onClick={handleForward}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Send size={15} /> {forwarding ? 'Forwarding…' : `Forward to ${chosenDept?.shortName || 'Department'}`}
                  </button>
                ) : (
                  <p className="text-sm text-slate-400 italic">Accept the complaint first.</p>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* Step 5 — Resolve */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Step 5 — Mark Resolved</p>
                {complaint.status === 'RESOLVED' ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
                    ✅ Complaint Resolved
                  </div>
                ) : isForwarded ? (
                  <button
                    onClick={() => setIsResolveModalOpen(true)}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    📸 Verify Final Proof & Resolve
                  </button>
                ) : (
                  <p className="text-sm text-slate-400 italic">Forward complaint first.</p>
                )}
              </div>

              {/* Admin notes */}
              <hr className="border-slate-100" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Admin notes</p>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add investigation notes..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  disabled={saving}
                  onClick={() => handlePatch({ adminNotes })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Save notes
                </button>
              </div>

            </div>
          </DetailSection>
        </div>
      </div>

      {/* Resolution Modal */}
      <ResolutionModal
        isOpen={isResolveModalOpen}
        complaintLat={complaint?.location?.latitude}
        complaintLng={complaint?.location?.longitude}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={async (photoUrl) => {
          await handlePatch({ status: 'RESOLVED', resolutionPhoto: photoUrl })
          setIsResolveModalOpen(false)
          reload()
        }}
      />
    </div>
  )
}
