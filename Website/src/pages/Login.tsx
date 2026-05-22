import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

        <div className="login-car login-car-one" aria-hidden>
          <span className="login-car-body" />
          <span className="login-car-roof" />
          <span className="login-car-wheel login-car-wheel-left" />
          <span className="login-car-wheel login-car-wheel-right" />
        </div>
        <div className="login-car login-car-two" aria-hidden>
          <span className="login-car-body login-car-body-alt" />
          <span className="login-car-roof login-car-roof-alt" />
          <span className="login-car-wheel login-car-wheel-left" />
          <span className="login-car-wheel login-car-wheel-right" />
        </div>
        <div className="login-car login-car-three" aria-hidden>
          <span className="login-car-body" />
          <span className="login-car-roof" />
          <span className="login-car-wheel login-car-wheel-left" />
          <span className="login-car-wheel login-car-wheel-right" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="login-card w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
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
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
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
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
