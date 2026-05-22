import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, List, Map, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/complaints', label: 'Complaints', icon: List, end: false },
  { to: '/map', label: 'Map', icon: Map, end: false },
] as const

export function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-brand-900 text-white">
        <div className="border-b border-brand-700 px-6 py-5">
          <h1 className="text-xl font-bold">RoadWatch</h1>
          <p className="text-xs text-brand-200">Admin Portal</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-brand-100 hover:bg-brand-800'
                }`
              }
            >
              <Icon size={18} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="m-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-brand-200 hover:bg-brand-800"
        >
          <LogOut size={16} aria-hidden />
          Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
