import { PageHeader } from '@/components/ui/PageHeader'

export default function EmergencyCases() {
  return (
    <div>
      <PageHeader
        title="Emergency Cases"
        subtitle="Track urgent reports that require immediate attention."
      />
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        <p className="text-sm text-slate-500">
          This section is reserved for emergency case handling and should be populated with priority incidents.
        </p>
      </div>
    </div>
  )
}
