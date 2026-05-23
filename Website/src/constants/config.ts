export const API_ROUTES = {
  login: '/api/auth/login',
  complaints: '/api/complaints',
  stats: '/api/complaints/stats',
  map: '/api/complaints/map',
  roads: '/api/roads',
  authorities: '/api/authorities',
} as const

export const AUTH_STORAGE_KEY = 'roadwatch_token'

export const POLL_INTERVAL_MS = 30_000

export const PAGE_SIZE = 15

export const RECENT_COMPLAINTS_SIZE = 5
