export interface LocationPoint {
  latitude: number
  longitude: number
}

export interface Complaint {
  id: number
  description?: string | null
  imageUrl: string
  location?: LocationPoint | null
  timestamp: string
  severity: string
  status: string
  roadType?: string | null
  department?: string | null
  aiLabel?: string | null
  aiConfidence?: number | null
  aiDetectionsJson?: string | null
  aiProcessedImageUrl?: string | null
  adminNotes?: string | null
}

export interface Detection {
  label: string
  confidence: number
  rawLabel?: string
  bbox?: {
    xMin: number
    yMin: number
    xMax: number
    yMax: number
  }
}

export interface ComplaintStats {
  total: number
  pending: number
  underReview: number
  rejected: number
  assigned: number
  inProgress: number
  resolved: number
  highSeverity: number
}

export interface ComplaintPage {
  content: Complaint[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ComplaintUpdatePayload {
  status?: string
  department?: string
  severity?: string
  adminNotes?: string
}

export const DEPARTMENTS = [
  'Roads Authority',
  'Civic Maintenance',
  'Street Lighting',
] as const

export const STATUSES = [
  'PENDING',
  'UNDER_REVIEW',
  'REJECTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
] as const
