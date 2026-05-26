import { api } from './client'
import { API_ROUTES } from '@/constants/config'

export interface Officer {
  id: number
  name: string
  designation?: string | null
  zone?: string | null
  email?: string | null
  phone?: string | null
  district?: string | null
}

function normalize(data: unknown): Officer[] {
  if (Array.isArray(data)) return data as Officer[]
  if (Array.isArray((data as { content?: unknown } | null)?.content)) {
    return ((data as { content: unknown[] }).content ?? []) as Officer[]
  }
  return []
}

export async function fetchOfficers(params?: { department?: string; district?: string }) {
  const { data } = await api.get<unknown>(API_ROUTES.officers, { params })
  return normalize(data)
}

export async function createOfficer(payload: Partial<Officer>): Promise<Officer> {
  const { data } = await api.post<Officer>(API_ROUTES.officers, payload)
  return data
}

export async function updateOfficer(id: number, payload: Partial<Officer>): Promise<Officer> {
  const { data } = await api.put<Officer>(`${API_ROUTES.officers}/${id}`, payload)
  return data
}

export async function deleteOfficer(id: number): Promise<void> {
  await api.delete(`${API_ROUTES.officers}/${id}`)
}
