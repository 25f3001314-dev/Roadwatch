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
  return data
}

export async function updateComplaint(
  id: number,
  payload: ComplaintUpdatePayload
): Promise<Complaint> {
  const { data } = await api.patch<Complaint>(`${API_ROUTES.complaints}/${id}`, payload)
  return data
}
