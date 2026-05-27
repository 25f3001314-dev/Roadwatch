export const API_ROUTES = {
<<<<<<< HEAD
  login: '/api/auth/login',
  me: '/api/auth/me',
  complaints: '/api/complaints',
  stats: '/api/complaints/stats',
  map: '/api/complaints/map',
  emergency: '/api/complaints/emergency',
  resolved: '/api/complaints/resolved',
  reanalyze: '/api/complaints/reanalyze',
  roads: '/api/roads',
  authorities: '/api/authorities',
  officers: '/api/officers',
  health: '/actuator/health',
=======
  login: '/auth/login',
  complaints: '/complaints',
  stats: '/complaints/stats',
  map: '/complaints/map',
  roads: '/roads',
  authorities: '/authorities',
>>>>>>> e43aea6 (update frontend api config)
} as const

export const AUTH_STORAGE_KEY = 'roadwatch_token'

export const POLL_INTERVAL_MS = 30_000

export const PAGE_SIZE = 15

export const RECENT_COMPLAINTS_SIZE = 5

export const COMPLAINT_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'UNDER_REVIEW',
  'REJECTED',
  'FORWARDED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
] as const

export const COMPLAINT_SEVERITIES = ['HIGH', 'MEDIUM', 'LOW'] as const

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number]
export type ComplaintSeverity = (typeof COMPLAINT_SEVERITIES)[number]
