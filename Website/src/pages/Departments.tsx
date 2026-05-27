import { useMemo, useState } from 'react'
import { ExternalLink, Eye, Filter, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingState } from '@/components/ui/LoadingState'
import { DEPARTMENTS, type DepartmentRecord } from '@/data/departments'

function formatCount(value: number): string {
  return value.toLocaleString('en-IN')
}

function statCard(title: string, value: number, accent: string) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{formatCount(value)}</p>
        </div>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${accent}`}>
          <span className="text-white text-lg font-bold">{title.charAt(0)}</span>
        </div>
      </div>
    </div>
  )
}

export default function Departments() {
  const [query, setQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState<DepartmentRecord | null>(null)
  const [loading] = useState(false)

  const filteredDepartments = useMemo(() => {
    const lower = query.trim().toLowerCase()
    if (!lower) return DEPARTMENTS
    return DEPARTMENTS.filter((department) =>
      department.departmentName.toLowerCase().includes(lower) ||
      department.shortName.toLowerCase().includes(lower) ||
      department.zone.toLowerCase().includes(lower) ||
      department.keywords.some((keyword) => keyword.toLowerCase().includes(lower))
    )
  }, [query])

  const totals = useMemo(() => {
    return {
      departments: DEPARTMENTS.length,
      forwarded: DEPARTMENTS.reduce((sum, dept) => sum + dept.totalForwarded, 0),
      responded: DEPARTMENTS.reduce((sum, dept) => sum + dept.responded, 0),
      pending: DEPARTMENTS.reduce((sum, dept) => sum + dept.pending, 0),
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Manage the departments receiving forwarded complaints and monitor their response status."
        action={
          <button className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
            <ExternalLink size={16} /> Add Department
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        {statCard('Total Departments', totals.departments, 'bg-violet-600')}
        {statCard('Forwarded', totals.forwarded, 'bg-sky-600')}
        {statCard('Responded', totals.responded, 'bg-emerald-600')}
        {statCard('Pending / In Progress', totals.pending, 'bg-amber-500')}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Departments & Complaint Status Overview</h3>
            <p className="mt-1 text-sm text-slate-500">Search departments, review routing status, and open portals from a single view.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search department..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:w-80"
              />
            </label>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                <th className="px-4 py-3">Department Name</th>
                <th className="px-4 py-3">Designation / Short Name</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Total Forwarded</th>
                <th className="px-4 py-3">Responded</th>
                <th className="px-4 py-3">Pending / In Progress</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10">
                    <LoadingState message="Loading departments…" />
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    No departments match your search.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((department) => (
                  <tr key={department.id} className="border-t border-slate-200">
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold text-slate-900">{department.departmentName}</div>
                      <div className="mt-1 text-xs text-slate-500">{department.id}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-slate-900">{department.shortName}</div>
                      <div className="mt-1 text-xs text-slate-500">{department.helplineEmail}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">{department.zone}</td>
                    <td className="px-4 py-4 align-top text-slate-700">{department.helplineEmail}</td>
                    <td className="px-4 py-4 align-top text-slate-900">{department.totalForwarded}</td>
                    <td className="px-4 py-4 align-top text-emerald-700">{department.responded}</td>
                    <td className="px-4 py-4 align-top text-amber-700">{department.pending}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDept(department)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                        >
                          <Eye size={14} /> View
                        </button>
                        <a
                          href={department.truePortalLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                        >
                          <ExternalLink size={14} /> Portal
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedDept.departmentName}</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedDept.shortName} · {selectedDept.zone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Applicability rationale</h4>
                <p className="mt-2 text-sm leading-7 text-slate-700">{selectedDept.applicabilityRationale}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Keywords</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedDept.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total forwarded</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedDept.totalForwarded}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Responded</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">{selectedDept.responded}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
