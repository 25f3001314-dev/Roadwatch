import axios from 'axios'
import { AUTH_STORAGE_KEY } from '@/constants/config'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://roadwatch-mb82.onrender.com'

console.log('[RoadWatch] API base URL:', API_BASE)

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEY)
  const headers = config.headers ? { ...(config.headers as Record<string, string>) } : {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
    console.debug('[RoadWatch] Attached Authorization header to request')
  } else {
    console.debug('[RoadWatch] No token found in localStorage for Authorization header')
  }

  config.headers = headers as unknown as typeof config.headers
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function imageSrc(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = API_BASE.replace(/\/$/, '')
  return `${base}${url.startsWith('/') ? url : `/${url}`}`
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  const ax = error as {
    response?: { data?: { error?: string } }
    code?: string
    message?: string
  }
  if (!ax.response && (ax.code === 'ERR_NETWORK' || ax.message?.includes('Network'))) {
    return 'Cannot reach the API. Ensure the backend is running and VITE_API_BASE_URL is correct.'
  }
  return ax.response?.data?.error || fallback
}
