import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Briefcase,
  FileText,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Route,
  Settings2,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/complaints', label: 'Incoming Complaints', icon: List, end: false },
<<<<<<< HEAD
  { to: '/complaint-pipeline', label: 'Assigned / Forwarded', icon: Route, end: false },
=======
  { to: '/complaint-pipeline', label: 'Assigned / Forwarded Complaints', icon: Route, end: false },
  { to: '/departments', label: 'Departments', icon: Briefcase, end: false },
  { to: '/roads', label: 'Roads & Contractors', icon: Users, end: false },
  { to: '/map', label: 'Reports & Analytics', icon: BarChart3, end: false },
>>>>>>> e43aea6 (update frontend api config)
  { to: '/emergency-cases', label: 'Emergency Cases', icon: ShieldAlert, end: false },
  { to: '/resolved-complaints', label: 'Resolved Complaints', icon: FileText, end: false },
  { to: '/map', label: 'Reports & Analytics', icon: BarChart3, end: false },
  { to: '/authorities', label: 'Departments', icon: Briefcase, end: false },
  { to: '/roads', label: 'Officers / Employees', icon: Users, end: false },
  { to: '/settings', label: 'Settings', icon: Settings2, end: false },
] as const

export function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<boolean>(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sidebarCollapsed')
      setCollapsed(raw === 'true')
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', collapsed ? 'true' : 'false')
    } catch {
      // ignore
    }
  }, [collapsed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside
        className={`flex flex-col border-r border-slate-800/70 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.25)] transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-sm font-semibold text-white shadow-lg shadow-brand-900/40">
              RW
            </div>
            <div className={`flex-1 ${collapsed ? 'hidden' : ''}`}>
              <h1 className="text-[15px] font-semibold tracking-[0.18em] text-white uppercase">
                RoadWatch
              </h1>
              <p className="mt-0.5 text-xs text-slate-300">Admin monitoring console</p>
            </div>
            <button
              type="button"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((s) => !s)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <Menu size={18} aria-hidden />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1.5 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white shadow-inner ring-1 ring-white/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition group-hover:bg-white/10">
                <Icon size={18} aria-hidden />
              </span>
              <span className={collapsed ? 'hidden' : ''}>{label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className={`mt-2 w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition group-hover:bg-white/10">
              <LogOut size={18} aria-hidden />
            </span>
            <span className={collapsed ? 'hidden' : ''}>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 px-4 py-4 sm:px-6 sm:py-6 xl:px-8 xl:py-8">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
