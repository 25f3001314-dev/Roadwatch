import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { api } from '@/api/client'
import { API_ROUTES } from '@/constants/config'
import { createRoad, updateRoad, deleteRoad } from '@/api/roads'
import type { Road } from '@/types/road'
import { formatDate } from '@/utils/format'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'

function normalizeRoadsResponse(data: unknown): Road[] {
  if (Array.isArray(data)) return data as Road[]
  if (Array.isArray((data as { data?: unknown } | null | undefined)?.data)) {
    return ((data as { data: unknown[] }).data ?? []) as Road[]
  }
  if (Array.isArray((data as { content?: unknown } | null | undefined)?.content)) {
    return ((data as { content: unknown[] }).content ?? []) as Road[]
  }
  return []
}

/**
 * Road infrastructure CRUD (legacy). Reachable directly via /road-infrastructure.
 * Manages road segments + contractor + budget tracking.
 */
export default function RoadInfrastructure() {
  const [roads, setRoads] = useState<Road[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Partial<Road>>({ roadType: 'NH' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get<unknown>(API_ROUTES.roads)
      setRoads(normalizeRoadsResponse(data))
    } catch (err) {
      console.error('Failed to load roads:', err)
      setError('Failed to load roads. Please try again.')
      setRoads([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await createRoad(form)
      setShowModal(false)
      setForm({ roadType: 'NH' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: number, payload: Partial<Road>) => {
    setSaving(true)
    try {
      await updateRoad(id, payload)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this road?')) return
    setSaving(true)
    try {
      await deleteRoad(id)
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Road Infrastructure"
        subtitle="Road segments, contractors and budget tracking."
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add road
        </button>
      </div>

      <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white p-4">
        {loading ? (
          <LoadingState message="Loading roads…" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="px-2 py-2">Road name</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Contractor</th>
                <th className="px-2 py-2">Last relaying</th>
                <th className="px-2 py-2">Budget</th>
                <th className="px-2 py-2">Spent</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roads.map((r) => (
                <tr key={r.id} className="border-t text-sm">
                  <td className="px-2 py-3">{r.name}</td>
                  <td className="px-2 py-3">{r.roadType}</td>
                  <td className="px-2 py-3">{r.contractorName}</td>
                  <td className="px-2 py-3">{r.lastRelayingDate ? formatDate(r.lastRelayingDate) : '—'}</td>
                  <td className="px-2 py-3">{r.budgetSanctioned ?? '—'}</td>
                  <td className="px-2 py-3">{r.budgetSpent ?? '—'}</td>
                  <td className="px-2 py-3">{r.status}</td>
                  <td className="px-2 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const name = prompt('New name', r.name)
                          if (name) handleUpdate(r.id, { name })
                        }}
                        className="rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-800 hover:bg-slate-200"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-md bg-red-50 px-2 py-1 text-sm text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold">Add road</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label="Name" value={form.name ?? ''} onChange={(v) => setForm({ ...form, name: v })} />
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Type</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  value={form.roadType}
                  onChange={(e) => setForm({ ...form, roadType: e.target.value })}
                >
                  <option value="NH">NH</option>
                  <option value="SH">SH</option>
                  <option value="MDR">MDR</option>
                </select>
              </div>
              <FormField label="Contractor" value={form.contractorName ?? ''} onChange={(v) => setForm({ ...form, contractorName: v })} />
              <FormField
                label="Last relaying date"
                type="date"
                value={form.lastRelayingDate ?? ''}
                onChange={(v) => setForm({ ...form, lastRelayingDate: v })}
              />
              <FormField
                label="Budget sanctioned"
                type="number"
                value={form.budgetSanctioned != null ? String(form.budgetSanctioned) : ''}
                onChange={(v) => setForm({ ...form, budgetSanctioned: v ? Number(v) : undefined })}
              />
              <FormField
                label="Budget spent"
                type="number"
                value={form.budgetSpent != null ? String(form.budgetSpent) : ''}
                onChange={(v) => setForm({ ...form, budgetSpent: v ? Number(v) : undefined })}
              />
              <div className="md:col-span-2">
                <FormField label="Status" value={form.status ?? ''} onChange={(v) => setForm({ ...form, status: v })} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                {saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </label>
  )
}
