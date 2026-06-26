import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { login as apiLogin } from '@/api/auth'
import { AUTH_STORAGE_KEY } from '@/constants/config'

function decodeUsername(token: string): string {
  try { return JSON.parse(atob(token.split('.')[1])).sub || '' } catch { return '' }
}

const OFFICER_DEPT: Record<string, string> = {
  'pwd_officer':         'dept_pwd_02',
  'civic_officer':       'dept_ulb_03',
  'traffic_officer':     'dept_tp_05',
  'electricity_officer': 'dept_discom_06',
}

interface AuthContextValue {
  isAuthenticated: boolean
  username: string
  officerDept: string | null
  isOfficer: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY)
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!saved)
  const [username, setUsername] = useState(() => saved ? decodeUsername(saved) : '')

  const officerDept = OFFICER_DEPT[username] ?? null
  const isOfficer   = !!officerDept

  const login = useCallback(async (u: string, password: string) => {
    const res = await apiLogin(u, password)
    localStorage.setItem(AUTH_STORAGE_KEY, res.token)
    setIsAuthenticated(true)
    setUsername(decodeUsername(res.token))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthenticated(false)
    setUsername('')
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, officerDept, isOfficer, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
