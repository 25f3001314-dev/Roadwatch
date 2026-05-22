import { useEffect, useState } from 'react'
import { fetchRoads, createRoad, updateRoad, deleteRoad } from '@/api/roads'
import type { Road } from '@/types/road'
import { formatDate } from '@/utils/format'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function Roads() {
  const [roads, setRoads] = useState<Road[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Partial<Road>>({ roadType: 'NH' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchRoads()
      setRoads(data)
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Roads & Contractors</h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add Road
        </button>
      </div>

      <div className="mt-6 overflow-auto rounded-xl border border-slate-200 bg-white p-4">
        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="px-2 py-2">Road Name</th>
                <th className="px-2 py-2">Road Type</th>
                <th className="px-2 py-2">Contractor</th>
                <th className="px-2 py-2">Last Relaying</th>
                <th className="px-2 py-2">Budget Sanctioned</th>
                <th className="px-2 py-2">Budget Spent</th>
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Add Road</h3>
            <div className="mt-4 grid gap-3">
              <label className="text-sm text-slate-700">Name</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <label className="text-sm text-slate-700">Road Type</label>
              <select className="rounded-lg border border-slate-300 px-3 py-2" value={form.roadType} onChange={(e) => setForm({ ...form, roadType: e.target.value })}>
                <option value="NH">NH</option>
                <option value="SH">SH</option>
                <option value="MDR">MDR</option>
              </select>

              <label className="text-sm text-slate-700">Contractor</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.contractorName || ''} onChange={(e) => setForm({ ...form, contractorName: e.target.value })} />

              <label className="text-sm text-slate-700">Last Relaying Date</label>
              <input type="date" className="rounded-lg border border-slate-300 px-3 py-2" value={form.lastRelayingDate || ''} onChange={(e) => setForm({ ...form, lastRelayingDate: e.target.value })} />

              <label className="text-sm text-slate-700">Budget Sanctioned</label>
              <input type="number" className="rounded-lg border border-slate-300 px-3 py-2" value={form.budgetSanctioned ?? ''} onChange={(e) => setForm({ ...form, budgetSanctioned: Number(e.target.value) })} />

              <label className="text-sm text-slate-700">Budget Spent</label>
              <input type="number" className="rounded-lg border border-slate-300 px-3 py-2" value={form.budgetSpent ?? ''} onChange={(e) => setForm({ ...form, budgetSpent: Number(e.target.value) })} />

              <label className="text-sm text-slate-700">Status</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                {saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
