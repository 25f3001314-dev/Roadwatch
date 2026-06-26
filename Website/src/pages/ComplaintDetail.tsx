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

const OFFICERS_BY_DEPT: Record<string, { id: string; name: string; username: string }[]> = {
  dept_pwd_02:   [{ id: 'pwd_officer',          name: 'Rajesh Kumar Singh', username: 'pwd_officer' }],
  dept_nhai_01:  [{ id: 'pwd_officer',          name: 'Rajesh Kumar Singh', username: 'pwd_officer' }],
  dept_ulb_03:   [{ id: 'civic_officer',        name: 'Sunita Sharma',      username: 'civic_officer' }],
  dept_jal_04:   [{ id: 'civic_officer',        name: 'Sunita Sharma',      username: 'civic_officer' }],
  dept_tp_05:    [{ id: 'traffic_officer',      name: 'Amit Verma',         username: 'traffic_officer' }],
  dept_discom_06:[{ id: 'electricity_officer',  name: 'Priya Gupta',        username: 'electricity_officer' }],
}

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

  const [adminNotes, setAdminNotes]             = useState('')
  const [saving, setSaving]                     = useState(false)
  const [message, setMessage]                   = useState('')
  const [_a, setAuthorities]                    = useState<Authority[]>([])
  const [selectedDept, setSelectedDept]         = useState('')
  const [forwarding, setForwarding]             = useState(false)
  const [selectedOfficer, setSelectedOfficer]   = useState('')
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

  useEffect(() => {
    if (!complaint) return
    setAdminNotes(complaint.adminNotes || '')
    if (!selectedDept) setSelectedDept(suggestDepartment(complaint))
  }, [complaint])

  useEffect(() => {
    if (!selectedDept) return
    const dept = DEPARTMENTS.find(d => d.id === selectedDept)
    fetchAuthorities(dept ? { department: dept.shortName } : undefined)
      .then(setAuthorities)
      .catch(() => setAuthorities([]))
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
      await forwardComplaint(complaint.id, selectedDept, undefined)
      await update({ status: 'FORWARDED', department: selectedDept })
      setMessage('Forwarded to department successfully!')
      reload()
    } catch {
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

  const chosenDept  = DEPARTMENTS.find(d => d.id === selectedDept)
  const canFwd      = canForward(complaint?.status)
  const isForwarded = (complaint?.status || '').toUpperCase() === 'FORWARDED'

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
        <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          message.toLowerCase().includes('fail') || message.toLowerCase().includes('error')
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {message}
        </p>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Reported',   value: formatDate(complaint.timestamp),                                                              color: 'border-l-slate-400'   },
          { label: 'AI Label',   value: complaint.aiLabel || 'Unclassified',                                                          color: 'border-l-blue-500'    },
          { label: 'Confidence', value: formatPercent(complaint.aiConfidence ?? undefined),                                           color: 'border-l-emerald-500' },
          { label: 'Location',   value: (complaint.location?.latitude && complaint.location?.longitude) ? 'Geo-tagged' : 'No coords', color: 'border-l-amber-500'   },
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