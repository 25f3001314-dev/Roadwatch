import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, List, Map, LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/complaints', label: 'Complaints', icon: List, end: false },
  { to: '/map', label: 'Map', icon: Map, end: false },
] as const

const SIDEBAR_COLLAPSED_KEY = 'roadwatch_sidebar_collapsed'

export function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed))
  }, [isCollapsed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`flex flex-col bg-brand-900 text-white transition-all duration-200 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div
          className={`border-b border-brand-700 py-5 ${isCollapsed ? 'px-4' : 'px-6'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className={isCollapsed ? 'sr-only' : undefined}>
              <h1 className="text-xl font-bold">RoadWatch</h1>
              <p className="text-xs text-brand-200">Admin Portal</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="rounded-lg p-2 text-brand-100 transition hover:bg-brand-800"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center rounded-lg py-2.5 text-sm font-medium transition ${
                  isCollapsed ? 'justify-center px-3' : 'gap-3 px-4'
                } ${
                  isActive ? 'bg-brand-600 text-white' : 'text-brand-100 hover:bg-brand-800'
                }`
              }
              aria-label={label}
              title={isCollapsed ? label : undefined}
            >
              <Icon size={18} aria-hidden={true} />
              {isCollapsed ? <span className="sr-only">{label}</span> : <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className={`m-4 flex items-center rounded-lg py-2 text-sm text-brand-200 transition hover:bg-brand-800 ${
            isCollapsed ? 'justify-center px-3' : 'gap-2 px-4'
          }`}
          aria-label="Logout"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} aria-hidden={true} />
          {isCollapsed ? <span className="sr-only">Logout</span> : <span>Logout</span>}
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
