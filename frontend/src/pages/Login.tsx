import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Route } from 'lucide-react'
import { getApiErrorMessage } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-scene flex min-h-screen items-center justify-center p-4">
      <div className="login-horizon" aria-hidden />
      <div className="login-sun" aria-hidden />
      <div className="login-forest login-forest-left" aria-hidden />
      <div className="login-forest login-forest-right" aria-hidden />

      <div className="login-road" aria-hidden>
        <div className="login-road-lane login-road-lane-left" />
        <div className="login-road-lane login-road-lane-right" />
        <div className="login-road-markings" />
        <div className="login-road-shoulder login-road-shoulder-left" />
        <div className="login-road-shoulder login-road-shoulder-right" />

        <div className="login-car login-car-one" aria-hidden>
          <span className="login-car-shadow" />
          <span className="login-car-headlight login-car-headlight-left" />
          <span className="login-car-headlight login-car-headlight-right" />
          <span className="login-car-body" />
          <span className="login-car-cabin" />
          <span className="login-car-window login-car-window-front" />
          <span className="login-car-window login-car-window-rear" />
          <span className="login-car-hood" />
          <span className="login-car-tail login-car-tail-left" />
          <span className="login-car-tail login-car-tail-right" />
          <span className="login-car-wheel login-car-wheel-left" />
          <span className="login-car-wheel login-car-wheel-right" />
        </div>
        <div className="login-car login-car-two" aria-hidden>
          <span className="login-car-shadow" />
          <span className="login-car-headlight login-car-headlight-left" />
          <span className="login-car-headlight login-car-headlight-right" />
          <span className="login-car-body login-car-body-alt" />
          <span className="login-car-cabin login-car-cabin-alt" />
          <span className="login-car-window login-car-window-front" />
          <span className="login-car-window login-car-window-rear" />
          <span className="login-car-hood login-car-hood-alt" />
          <span className="login-car-tail login-car-tail-left" />
          <span className="login-car-tail login-car-tail-right" />
          <span className="login-car-wheel login-car-wheel-left" />
          <span className="login-car-wheel login-car-wheel-right" />
        </div>
        <div className="login-car login-car-three" aria-hidden>
          <span className="login-car-shadow" />
          <span className="login-car-headlight login-car-headlight-left" />
          <span className="login-car-headlight login-car-headlight-right" />
          <span className="login-car-body login-car-body-gold" />
          <span className="login-car-cabin login-car-cabin-gold" />
          <span className="login-car-window login-car-window-front" />
          <span className="login-car-window login-car-window-rear" />
          <span className="login-car-hood login-car-hood-gold" />
          <span className="login-car-tail login-car-tail-left" />
          <span className="login-car-tail login-car-tail-right" />
          <span className="login-car-wheel login-car-wheel-left" />
          <span className="login-car-wheel login-car-wheel-right" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="login-card w-full max-w-md rounded-3xl p-8 shadow-xl">
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <Route size={22} strokeWidth={2.2} aria-hidden />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-brand-900">RoadWatch Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage road complaints</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="login-input mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="login-input mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="login-button mt-6 w-full rounded-lg py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
