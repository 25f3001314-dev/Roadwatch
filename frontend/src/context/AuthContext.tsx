import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { login as apiLogin } from '@/api/auth'
import { AUTH_STORAGE_KEY } from '@/constants/config'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem(AUTH_STORAGE_KEY)
  )

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password)
    localStorage.setItem(AUTH_STORAGE_KEY, res.token)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
