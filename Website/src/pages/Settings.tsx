import { useEffect, useState } from 'react'
import { Bell, ExternalLink, Globe, Server, Shield, User2 } from 'lucide-react'
import { fetchProfile, type AdminProfile } from '@/api/auth'
import { fetchStats } from '@/api/complaints'
import { getApiErrorMessage } from '@/api/client'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import type { ComplaintStats } from '@/types/complaint'

const PREF_NOTIFY_KEY = 'roadwatch_pref_notifications'
const PREF_AUTOREFRESH_KEY = 'roadwatch_pref_autorefresh'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || '(same-origin)'
const buildMode = import.meta.env.MODE
const buildTime = new Date().toISOString()

export default function Settings() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notify, setNotify] = useState<boolean>(
    () => localStorage.getItem(PREF_NOTIFY_KEY) !== 'false',
  )
  const [autoRefresh, setAutoRefresh] = useState<boolean>(
    () => localStorage.getItem(PREF_AUTOREFRESH_KEY) === 'true',
  )

  useEffect(() => {
    let mounted = true
    Promise.allSettled([fetchProfile(), fetchStats()])
      .then(([p, s]) => {
        if (!mounted) return
        if (p.status === 'fulfilled') setProfile(p.value)
        else setError(getApiErrorMessage(p.reason, 'Failed to load profile'))
        if (s.status === 'fulfilled') setStats(s.value)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const togglePref = (key: string, value: boolean, setter: (v: boolean) => void) => {
    localStorage.setItem(key, value ? 'true' : 'false')
    setter(value)
  }

  if (loading) return <LoadingState message="Loading settings…" />

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Profile, preferences, and live system information."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <User2 size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Profile</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Username" value={profile?.username ?? '—'} />
            <Row label="Display name" value={profile?.displayName ?? '—'} />
            <Row label="Role" value={profile?.role ?? '—'} />
          </div>
          {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
        </section>

        {/* Preferences */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Bell size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Preferences</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <Toggle
              label="Browser notifications"
              description="Show desktop alerts for new high-severity reports"
              checked={notify}
              onChange={(v) => togglePref(PREF_NOTIFY_KEY, v, setNotify)}
            />
            <Toggle
              label="Auto-refresh dashboard"
              description="Reload stats every 30 seconds"
              checked={autoRefresh}
              onChange={(v) => togglePref(PREF_AUTOREFRESH_KEY, v, setAutoRefresh)}
            />
          </div>
        </section>

        {/* System */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Server size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">System</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="API base" value={apiBaseUrl} mono />
            <Row label="Build mode" value={buildMode} />
            <Row label="Loaded at" value={buildTime} mono />
            {stats && (
              <>
                <Row label="Total complaints" value={String(stats.total)} />
                <Row label="High-severity" value={String(stats.highSeverity)} />
              </>
            )}
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 text-slate-700">
            <Shield size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Security</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Admin credentials are configured at deploy time via the{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">ADMIN_USERNAME</code> and{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">ADMIN_PASSWORD</code>{' '}
            environment variables on the Spring Boot backend. To rotate credentials, update those
            variables on the EC2 instance and restart the API service.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            JWTs are signed with{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">JWT_SECRET</code>. Default
            session lifetime is 24 hours; configurable via{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">JWT_EXPIRATION_MS</code>.
          </p>
        </section>

        {/* Links */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Globe size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Resources</h2>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <ResourceLink href="/" label="Dashboard" />
            <ResourceLink href="/complaints" label="Incoming complaints" />
            <ResourceLink href="/emergency-cases" label="Emergency cases" />
            <ResourceLink href="/resolved-complaints" label="Resolved complaints" />
            <ResourceLink href="/map" label="Reports & analytics" />
          </ul>
        </section>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <span
        className={`max-w-[60%] truncate text-right text-slate-900 ${
          mono ? 'font-mono text-xs' : 'text-sm'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer accent-brand-600"
      />
    </label>
  )
}

function ResourceLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
      >
        {label}
        <ExternalLink size={12} />
      </a>
    </li>
  )
}
