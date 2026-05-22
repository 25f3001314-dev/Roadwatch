import { useEffect, useState } from 'react'
import {
  createAuthority,
  deleteAuthority,
  fetchAuthorities as apiFetch,
  Authority as ApiAuthority,
  updateAuthority,
} from '@/api/authorities'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function Authorities() {
  const [authorities, setAuthorities] = useState<ApiAuthority[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ApiAuthority | null>(null)
  const [form, setForm] = useState<Partial<ApiAuthority>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const list = await apiFetch()
      setAuthorities(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleOpenCreate = () => {
    setEditing(null)
    setForm({})
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateAuthority(editing.id, form)
      } else {
        await createAuthority(form)
      }
      setShowModal(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (a: ApiAuthority) => {
    setEditing(a)
    setForm(a)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this authority?')) return
    setSaving(true)
    try {
      await deleteAuthority(id)
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Authorities</h2>
        <button onClick={handleOpenCreate} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus size={16} /> Add Authority
        </button>
      </div>

      <div className="mt-6 overflow-auto rounded-xl border border-slate-200 bg-white p-4">
        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Designation</th>
                <th className="px-2 py-2">Zone</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Phone</th>
                <th className="px-2 py-2">District</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {authorities.map((a) => (
                <tr key={a.id} className="border-t text-sm">
                  <td className="px-2 py-3">{a.name}</td>
                  <td className="px-2 py-3">{a.designation}</td>
                  <td className="px-2 py-3">{a.zone}</td>
                  <td className="px-2 py-3">{a.email}</td>
                  <td className="px-2 py-3">{a.phone}</td>
                  <td className="px-2 py-3">{a.district}</td>
                  <td className="px-2 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(a)} className="rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-800 hover:bg-slate-200"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(a.id)} className="rounded-md bg-red-50 px-2 py-1 text-sm text-red-700 hover:bg-red-100"><Trash2 size={14} /></button>
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
            <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Authority</h3>
            <div className="mt-4 grid gap-3">
              <label className="text-sm text-slate-700">Name</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <label className="text-sm text-slate-700">Designation</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.designation || ''} onChange={(e) => setForm({ ...form, designation: e.target.value })} />

              <label className="text-sm text-slate-700">Zone</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.zone || ''} onChange={(e) => setForm({ ...form, zone: e.target.value })} />

              <label className="text-sm text-slate-700">Email</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />

              <label className="text-sm text-slate-700">Phone</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

              <label className="text-sm text-slate-700">District</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={form.district || ''} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
