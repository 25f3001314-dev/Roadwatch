import { useEffect, useMemo, useState } from 'react'
<<<<<<< HEAD
import { Plus, Edit2, Trash2, Search, Mail, Phone, MapPin } from 'lucide-react'
import {
  fetchOfficers,
  createOfficer,
  updateOfficer,
  deleteOfficer,
  type Officer,
} from '@/api/officers'
import { getApiErrorMessage } from '@/api/client'
import { ErrorState } from '@/components/ui/ErrorState'
=======
import { api } from '@/api/client'
import { API_ROUTES } from '@/constants/config'
import { createRoad, updateRoad } from '@/api/roads'
import type { Road } from '@/types/road'
import { Plus, Edit2, Eye, Search, Filter, ChevronRight } from 'lucide-react'
>>>>>>> e43aea6 (update frontend api config)
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'

<<<<<<< HEAD
const EMPTY: Partial<Officer> = {
  name: '',
  designation: '',
  zone: '',
  email: '',
  phone: '',
  district: '',
=======
interface ContractorRecord {
  name: string
  activeRoads: number
  totalBudget: number
  status: string
  contact: string
}

interface ComplaintActivity {
  id: string
  road: string
  complaintType: string
  sentTo: string
  sentOn: string
  responseStatus: string
}

const FALLBACK_ROADS: Road[] = [
  {
    id: 1,
    roadCode: 'ROAD-NH-01',
    name: 'Delhi-Meerut Expressway',
    roadType: 'NH',
    contractorName: 'L&T Infra',
    lastRelayingDate: '2023-12-11',
    budgetSanctioned: 450000000,
    budgetSpent: 420000000,
    status: 'IN_PROGRESS',
    lengthKm: 96,
  },
  {
    id: 2,
    roadCode: 'ROAD-NH-28',
    name: 'Gorakhpur-Basti Highway',
    roadType: 'NH',
    contractorName: 'Tata Projects',
    lastRelayingDate: '2024-01-22',
    budgetSanctioned: 620000000,
    budgetSpent: 580000000,
    status: 'IN_PROGRESS',
    lengthKm: 52,
  },
  {
    id: 3,
    roadCode: 'ROAD-SH-12',
    name: 'Lucknow-Barabanki Highway',
    roadType: 'SH',
    contractorName: 'Dilip Buildcon',
    lastRelayingDate: '2024-03-02',
    budgetSanctioned: 180000000,
    budgetSpent: 155000000,
    status: 'IN_PROGRESS',
    lengthKm: 45,
  },
  {
    id: 4,
    roadCode: 'ROAD-SH-18',
    name: 'Kanpur-Raebareli Road',
    roadType: 'SH',
    contractorName: 'IRB Infra',
    lastRelayingDate: '2023-11-29',
    budgetSanctioned: 120000000,
    budgetSpent: 98000000,
    status: 'COMPLETED',
    lengthKm: 38,
  },
  {
    id: 5,
    roadCode: 'ROAD-NH-60',
    name: 'Varanasi Ring Road',
    roadType: 'NH',
    contractorName: 'AFCONS Infra',
    lastRelayingDate: '2024-02-18',
    budgetSanctioned: 280000000,
    budgetSpent: 220000000,
    status: 'IN_PROGRESS',
    lengthKm: 76,
  },
]

const FALLBACK_COMPLAINTS: ComplaintActivity[] = [
  {
    id: 'RW/2024/156',
    road: 'Delhi-Meerut Expressway',
    complaintType: 'Pothole',
    sentTo: 'L&T Infra',
    sentOn: '20 May 2024',
    responseStatus: 'Replied',
  },
  {
    id: 'RW/2024/155',
    road: 'Gorakhpur-Basti Highway',
    complaintType: 'Water Logging',
    sentTo: 'Tata Projects',
    sentOn: '19 May 2024',
    responseStatus: 'Pending',
  },
  {
    id: 'RW/2024/154',
    road: 'Lucknow-Barabanki Highway',
    complaintType: 'Road Damage',
    sentTo: 'Dilip Buildcon',
    sentOn: '18 May 2024',
    responseStatus: 'Replied',
  },
  {
    id: 'RW/2024/153',
    road: 'Kanpur-Raebareli Road',
    complaintType: 'Street Light',
    sentTo: 'IRB Infra',
    sentOn: '18 May 2024',
    responseStatus: 'Pending',
  },
  {
    id: 'RW/2024/152',
    road: 'Varanasi Ring Road',
    complaintType: 'Drain Blockage',
    sentTo: 'AFCONS Infra',
    sentOn: '17 May 2024',
    responseStatus: 'In Progress',
  },
]

function normalizeRoadsResponse(data: unknown): Road[] {
  if (Array.isArray(data)) return data as Road[]
  if (Array.isArray((data as { data?: unknown } | null | undefined)?.data)) {
    return ((data as { data: unknown[] }).data ?? []) as Road[]
  }
  if (Array.isArray((data as { content?: unknown } | null | undefined)?.content)) {
    return ((data as { content: unknown[] }).content ?? []) as Road[]
  }
  return []
>>>>>>> e43aea6 (update frontend api config)
}

/**
 * Officers / Employees admin page.
 * Mounted at `/roads` (sidebar link "Officers / Employees").
 *
 * Backed by GET/POST/PUT/DELETE /api/officers (alias of authorities).
 */
export default function Roads() {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
<<<<<<< HEAD
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Officer | null>(null)
  const [form, setForm] = useState<Partial<Officer>>(EMPTY)
=======
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'roads' | 'contractors' | 'activity'>('roads')
  const [showRoadModal, setShowRoadModal] = useState(false)
  const [showContractorModal, setShowContractorModal] = useState(false)
  const [form, setForm] = useState<Partial<Road>>({ roadType: 'NH' })
  const [contractorForm, setContractorForm] = useState({ name: '', email: '', status: 'Active' })
>>>>>>> e43aea6 (update frontend api config)
  const [saving, setSaving] = useState(false)
  const [customContractors, setCustomContractors] = useState<ContractorRecord[]>([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
<<<<<<< HEAD
      setOfficers(await fetchOfficers())
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load officers'))
      setOfficers([])
=======
      const { data } = await api.get<unknown>(API_ROUTES.roads)
      console.log('Roads API response:', data)
      const normalized = normalizeRoadsResponse(data)
      if (normalized.length) {
        setRoads(normalized)
      } else {
        setRoads(FALLBACK_ROADS)
        setError('No roads returned from the API. Showing sample data.')
      }
    } catch (error) {
      console.error('Failed to load roads:', error)
      setError('Failed to load roads. Showing sample data.')
      setRoads(FALLBACK_ROADS)
>>>>>>> e43aea6 (update frontend api config)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

<<<<<<< HEAD
  const filtered = useMemo(() => {
    if (!search.trim()) return officers
    const q = search.trim().toLowerCase()
    return officers.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.designation?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.zone?.toLowerCase().includes(q) ||
        o.district?.toLowerCase().includes(q),
    )
  }, [officers, search])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setShowModal(true)
=======
  const filteredRoads = useMemo(
    () =>
      roads.filter((road) => {
        const search = query.toLowerCase()
        return (
          road.name.toLowerCase().includes(search) ||
          (road.contractorName ?? '').toLowerCase().includes(search) ||
          (road.roadType ?? '').toLowerCase().includes(search)
        )
      }),
    [roads, query],
  )

  const contractorSummaries = useMemo(() => {
    const map = new Map<string, ContractorRecord>()
    for (const road of roads) {
      const contractor = road.contractorName ?? 'Unknown Contractor'
      const existing = map.get(contractor)
      const budget = Number(road.budgetSanctioned ?? 0)
      if (existing) {
        existing.activeRoads += 1
        existing.totalBudget += budget
      } else {
        map.set(contractor, {
          name: contractor,
          activeRoads: 1,
          totalBudget: budget,
          status: road.status ?? 'Active',
          contact: `${contractor.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`,
        })
      }
    }
    return [...map.values(), ...customContractors]
  }, [roads, customContractors])

  const totalRoads = roads.length
  const totalContractors = contractorSummaries.length
  const complaintsSent = FALLBACK_COMPLAINTS.length
  const responsesReceived = FALLBACK_COMPLAINTS.filter((item) => item.responseStatus !== 'Pending').length

  const handleCreate = async () => {
    setSaving(true)
    try {
      await createRoad(form)
      setShowRoadModal(false)
      setForm({ roadType: 'NH' })
      await load()
    } catch (e) {
      console.error('Failed to create road:', e)
    } finally {
      setSaving(false)
    }
>>>>>>> e43aea6 (update frontend api config)
  }

  const openEdit = (o: Officer) => {
    setEditing(o)
    setForm(o)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name?.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    try {
      if (editing) await updateOfficer(editing.id, form)
      else await createOfficer(form)
      setShowModal(false)
      await load()
<<<<<<< HEAD
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save officer'))
=======
    } catch (e) {
      console.error('Failed to update road:', e)
>>>>>>> e43aea6 (update frontend api config)
    } finally {
      setSaving(false)
    }
  }

<<<<<<< HEAD
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this officer?')) return
    setSaving(true)
    try {
      await deleteOfficer(id)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete officer'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Officers / Employees"
        subtitle="Field officers and department employees that complaints can be assigned to."
      />

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search by name, role, district…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add officer
        </button>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorState message={error} onRetry={load} />
        </div>
      )}

      {loading ? (
        <div className="mt-8">
          <LoadingState message="Loading officers…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {search ? 'No officers match your search.' : 'No officers yet — add the first one above.'}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => (
            <article
              key={o.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{o.name}</h3>
                  {o.designation && (
                    <p className="mt-0.5 text-sm text-slate-600">{o.designation}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(o)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {o.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    <span className="truncate">{o.email}</span>
                  </p>
                )}
                {o.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400" /> {o.phone}
                  </p>
                )}
                {(o.zone || o.district) && (
                  <p className="flex items-center gap-2">
                    <MapPin size={12} className="text-slate-400" />
                    {[o.zone, o.district].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {editing ? 'Edit officer' : 'Add officer'}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Name"
                value={form.name ?? ''}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />
              <Field
                label="Designation"
                value={form.designation ?? ''}
                onChange={(v) => setForm({ ...form, designation: v })}
              />
              <Field
                label="Zone"
                value={form.zone ?? ''}
                onChange={(v) => setForm({ ...form, zone: v })}
              />
              <Field
                label="District"
                value={form.district ?? ''}
                onChange={(v) => setForm({ ...form, district: v })}
              />
              <Field
                label="Email"
                value={form.email ?? ''}
                onChange={(v) => setForm({ ...form, email: v })}
                type="email"
              />
              <Field
                label="Phone"
                value={form.phone ?? ''}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
=======
  const handleAddContractor = () => {
    setCustomContractors([
      ...customContractors,
      {
        name: contractorForm.name || `Contractor ${customContractors.length + 1}`,
        activeRoads: 0,
        totalBudget: 0,
        status: contractorForm.status,
        contact: contractorForm.email || 'noreply@example.com',
      },
    ])
    setShowContractorModal(false)
    setContractorForm({ name: '', email: '', status: 'Active' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Roads & Contractors</h2>
          <p className="mt-1 text-sm text-slate-500">Manage roads, contractors and complaint activity in one view.</p>
          {error ? <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowContractorModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Plus size={16} /> Add Contractor
          </button>
          <button
            type="button"
            onClick={() => setShowRoadModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Add Road
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Roads', value: totalRoads, accent: 'from-violet-500 to-indigo-500' },
          { label: 'Total Contractors', value: totalContractors, accent: 'from-sky-500 to-cyan-500' },
          { label: 'Complaints Sent', value: complaintsSent, accent: 'from-emerald-500 to-teal-500' },
          { label: 'Responses Received', value: responsesReceived, accent: 'from-orange-500 to-amber-500' },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-3xl bg-gradient-to-br ${item.accent} shadow-lg shadow-slate-200/80`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Roads & contractors overview</h3>
            <p className="mt-1 text-sm text-slate-500">Switch between roads, contractors and recent activity.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roads…"
                className="ml-2 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 border-b border-slate-200 pb-4">
          {[
            { key: 'roads', label: 'Roads' },
            { key: 'contractors', label: 'Contractors' },
            { key: 'activity', label: 'Complaint Activity' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium ${activeTab === tab.key ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <LoadingState message="Loading dashboard…" />
          ) : (
            <>
              {activeTab === 'roads' && (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Showing {filteredRoads.length} of {totalRoads} roads
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                          <th className="px-4 py-3">Road Name</th>
                          <th className="px-4 py-3">Road Type</th>
                          <th className="px-4 py-3">Contractor</th>
                          <th className="px-4 py-3">Length (KM)</th>
                          <th className="px-4 py-3">Budget Sanctioned</th>
                          <th className="px-4 py-3">Budget Spent</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRoads.map((road) => (
                          <tr key={road.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <td className="px-4 py-4 font-medium text-slate-900">{road.name}</td>
                            <td className="px-4 py-4 text-slate-600">{road.roadType}</td>
                            <td className="px-4 py-4 text-slate-600">{road.contractorName}</td>
                            <td className="px-4 py-4 text-slate-600">{road.lengthKm ?? '—'}</td>
                            <td className="px-4 py-4 text-slate-600">{road.budgetSanctioned ? `₹${road.budgetSanctioned.toLocaleString('en-IN')}` : '—'}</td>
                            <td className="px-4 py-4 text-slate-600">{road.budgetSpent ? `₹${road.budgetSpent.toLocaleString('en-IN')}` : '—'}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-900">{road.status}</td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                                  onClick={() => alert(`View details for ${road.name}`)}
                                >
                                  <Eye size={14} /> View
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  onClick={() => {
                                    const name = prompt('Edit road name', road.name)
                                    if (name) handleUpdate(road.id, { name })
                                  }}
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'contractors' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {contractorSummaries.map((contractor) => (
                      <div key={contractor.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-500">{contractor.name}</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{contractor.activeRoads}</p>
                            <p className="mt-1 text-sm text-slate-500">Active roads</p>
                          </div>
                          <div className="rounded-3xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase text-slate-600">{contractor.status}</div>
                        </div>
                        <div className="mt-5 space-y-2 text-sm text-slate-600">
                          <div>Total budget</div>
                          <div className="font-semibold text-slate-900">₹{contractor.totalBudget.toLocaleString('en-IN')}</div>
                          <div className="pt-2">Contact</div>
                          <div className="font-medium text-slate-700">{contractor.contact}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-slate-900">Recent Complaints Sent</h4>
                      <span className="text-sm text-slate-500">Latest 5 items</span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {FALLBACK_COMPLAINTS.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.id}</p>
                              <p className="text-sm text-slate-500">{item.road}</p>
                            </div>
                            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{item.responseStatus}</span>
                          </div>
                          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                            <div>{item.complaintType}</div>
                            <div>Sent to {item.sentTo}</div>
                            <div>Sent on {item.sentOn}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-slate-900">Responses Received</h4>
                      <span className="text-sm text-slate-500">Most recent</span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {FALLBACK_COMPLAINTS.filter((item) => item.responseStatus !== 'Pending').map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.road}</p>
                              <p className="text-sm text-slate-500">{item.complaintType}</p>
                            </div>
                            <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                              View <ChevronRight size={14} />
                            </button>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">Responded on {item.sentOn}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showRoadModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Add New Road</h3>
                <p className="mt-1 text-sm text-slate-500">Create a road entry with contractor and budget details.</p>
              </div>
              <button type="button" onClick={() => setShowRoadModal(false)} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                <span>Name</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                <span>Road Type</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={form.roadType}
                  onChange={(e) => setForm({ ...form, roadType: e.target.value })}
                >
                  <option value="NH">NH</option>
                  <option value="SH">SH</option>
                  <option value="MDR">MDR</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                <span>Contractor</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={form.contractorName || ''}
                  onChange={(e) => setForm({ ...form, contractorName: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                <span>Last relaying date</span>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={form.lastRelayingDate || ''}
                  onChange={(e) => setForm({ ...form, lastRelayingDate: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                <span>Budget sanctioned</span>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={form.budgetSanctioned ?? ''}
                  onChange={(e) => setForm({ ...form, budgetSanctioned: Number(e.target.value) })}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                <span>Budget spent</span>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={form.budgetSpent ?? ''}
                  onChange={(e) => setForm({ ...form, budgetSpent: Number(e.target.value) })}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
                <span>Status</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={form.status || ''}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setShowRoadModal(false)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Create Road'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContractorModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Add Contractor</h3>
                <p className="mt-1 text-sm text-slate-500">Add a new contractor profile for road assignments.</p>
              </div>
              <button type="button" onClick={() => setShowContractorModal(false)} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="space-y-1 text-sm text-slate-600">
                <span>Name</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={contractorForm.name}
                  onChange={(e) => setContractorForm({ ...contractorForm, name: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                <span>Email</span>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={contractorForm.email}
                  onChange={(e) => setContractorForm({ ...contractorForm, email: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                <span>Status</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  value={contractorForm.status}
                  onChange={(e) => setContractorForm({ ...contractorForm, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Paused</option>
                  <option>Archived</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setShowContractorModal(false)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={handleAddContractor} className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700">
                Add Contractor
>>>>>>> e43aea6 (update frontend api config)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </label>
  )
}
