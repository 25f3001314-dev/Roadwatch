import { api } from './client'
import { API_ROUTES } from '@/constants/config'
import type {
  Complaint,
  ComplaintPage,
  ComplaintStats,
  ComplaintUpdatePayload,
} from '@/types/complaint'

export interface ComplaintFilters {
  status?: string
  severity?: string
  department?: string
  roadType?: string
  page?: number
  size?: number
}

export async function fetchStats(): Promise<ComplaintStats> {
  const { data } = await api.get<ComplaintStats>(API_ROUTES.stats)
  return data
}

export async function fetchComplaints(filters: ComplaintFilters = {}): Promise<ComplaintPage> {
  const { data } = await api.get<ComplaintPage>(API_ROUTES.complaints, { params: filters })
  return data
}

export async function fetchComplaint(id: number): Promise<Complaint> {
  const { data } = await api.get<Complaint>(`${API_ROUTES.complaints}/${id}`)
  return data
}

export async function fetchMapComplaints(): Promise<Complaint[]> {
  const { data } = await api.get<Complaint[]>(API_ROUTES.map)
  return Array.isArray(data) ? data : []
}

export async function fetchEmergencyCases(): Promise<Complaint[]> {
  const { data } = await api.get<Complaint[]>(API_ROUTES.emergency)
  return Array.isArray(data) ? data : []
}

export async function fetchResolvedComplaints(): Promise<Complaint[]> {
  const { data } = await api.get<Complaint[]>(API_ROUTES.resolved)
  return Array.isArray(data) ? data : []
}

export async function updateComplaint(
  id: number,
  payload: ComplaintUpdatePayload
): Promise<Complaint> {
  const { data } = await api.patch<Complaint>(`${API_ROUTES.complaints}/${id}`, payload)
  return data
}

export async function forwardComplaint(
  id: number,
  department: string,
  reason?: string
): Promise<Complaint> {
  const { data } = await api.post<Complaint>(`${API_ROUTES.complaints}/${id}/forward`, {
    department,
    reason,
  })
  return data
}

export async function fetchTimeline(id: number): Promise<{
  complaint: Complaint
  events: import('@/types/complaint').TimelineEvent[]
}> {
  const { data } = await api.get(`${API_ROUTES.complaints}/${id}/timeline`)
  return data
}
