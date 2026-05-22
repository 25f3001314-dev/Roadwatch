import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, List, Map, LogOut, Menu, Road } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/complaints', label: 'Complaints', icon: List, end: false },
  { to: '/roads', label: 'Roads & Contractors', icon: Road, end: false },
  { to: '/map', label: 'Map', icon: Map, end: false },
] as const

export function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<boolean>(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sidebarCollapsed')
      setCollapsed(raw === 'true')
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', collapsed ? 'true' : 'false')
    } catch (e) {
      // ignore
    }
  }, [collapsed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`flex flex-col bg-brand-900 text-white transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="border-b border-brand-700 px-4 py-4 flex items-center gap-3">
          <div className={`flex-1 ${collapsed ? 'text-center' : ''}`}>
            <h1 className={`text-xl font-bold ${collapsed ? 'hidden' : ''}`}>RoadWatch</h1>
            <p className={`text-xs text-brand-200 ${collapsed ? 'hidden' : ''}`}>Admin Portal</p>
          </div>
          <button
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((s) => !s)}
            className="rounded-md p-2 text-brand-100 hover:bg-brand-800"
          >
            <Menu size={18} aria-hidden />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-brand-100 hover:bg-brand-800'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon size={18} aria-hidden />
              <span className={collapsed ? 'hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className={`m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-200 hover:bg-brand-800 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={16} aria-hidden />
          <span className={collapsed ? 'hidden' : ''}>Logout</span>
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
