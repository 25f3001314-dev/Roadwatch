import { PageHeader } from '@/components/ui/PageHeader'

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure the admin console and notification preferences." />
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        <p className="text-sm text-slate-500">
          Use this page to manage application preferences, user settings, and system configuration.
        </p>
      </div>
    </div>
  )
}
