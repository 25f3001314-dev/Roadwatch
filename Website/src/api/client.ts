import axios from 'axios'
import { AUTH_STORAGE_KEY } from '@/constants/config'

export const API_BASE = ''

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEY)
  const headers = new Headers(config.headers as HeadersInit)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  config.headers = Object.fromEntries(headers.entries()) as typeof config.headers
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export function imageSrc(url: string | null | undefined): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url

  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  if (API_BASE) {
    const base = String(API_BASE).replace(/\/$/, '')
    return `${base}${normalizedPath}`
  }

  return normalizedPath
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  const ax = error as {
    response?: {
      status?: number
      data?: {
        error?: string
        message?: string
      }
    }
    code?: string
    message?: string
  }

  if (!ax.response && (ax.code === 'ERR_NETWORK' || ax.message?.includes('Network'))) {
    return 'Cannot reach the API. Check that the backend is running and VITE_API_BASE_URL is configured correctly.'
  }

  if (ax.response?.data?.message) return String(ax.response.data.message)
  if (ax.response?.data?.error) return String(ax.response.data.error)
  if (ax.response?.status === 404) return 'Resource not found'
  if (ax.response?.status === 500) return 'Server error'

  return fallback
}

