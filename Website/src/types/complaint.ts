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
  // Civic workflow fields
  departmentResponse?: string | null
  departmentResponseDate?: string | null
  resolutionProofUrl?: string | null
  routedDepartment?: string | null
  assignedAuthorityName?: string | null
  expectedRepairDate?: string | null
  resolvedAt?: string | null
  emergency?: boolean | null
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
  accepted: number
  underReview: number
  rejected: number
  forwarded: number
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
  departmentResponse?: string
  resolutionProofUrl?: string
}

export interface TimelineEvent {
  id: number
  complaintId: number
  action: string
  reason?: string | null
  department?: string | null
  performedBy?: string | null
  occurredAt: string
  emergency?: boolean | null
}

export const DEPARTMENTS = [
  'PWD',
  'NHAI',
  'PWD_STATE',
  'MUNI',
] as const

export const STATUSES = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'FORWARDED',
  'IN_PROGRESS',
  'RESOLVED',
] as const
