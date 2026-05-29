import { useEffect, useMemo, useState } from 'react'
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
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'

const EMPTY: Partial<Officer> = {
  name: '',
  designation: '',
  zone: '',
  email: '',
  phone: '',
  district: '',
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
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Officer | null>(null)
  const [form, setForm] = useState<Partial<Officer>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [customContractors, setCustomContractors] = useState<ContractorRecord[]>([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setOfficers(await fetchOfficers())
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load officers'))
      setOfficers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

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
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save officer'))
    } finally {
      setSaving(false)
    }
  }

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
