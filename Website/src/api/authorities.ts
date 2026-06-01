import { api } from './client'
import { API_ROUTES } from '@/constants/config'

export interface Authority {
  id: number
  name: string
  designation?: string | null
  zone?: string | null
  email?: string | null
  phone?: string | null
  district?: string | null
}

function normalize(data: unknown): Authority[] {
  if (Array.isArray(data)) return data as Authority[]
  if (Array.isArray((data as { content?: unknown } | null)?.content)) {
    return ((data as { content: unknown[] }).content ?? []) as Authority[]
  }
  return []
}

export async function fetchAuthorities(params?: { department?: string; district?: string }): Promise<Authority[]> {
  const { data } = await api.get<unknown>(API_ROUTES.authorities, { params })
  return normalize(data)
}

export async function createAuthority(payload: Partial<Authority>): Promise<Authority> {
  const { data } = await api.post<Authority>(API_ROUTES.authorities, payload)
  return data
}

export async function updateAuthority(id: number, payload: Partial<Authority>): Promise<Authority> {
  const { data } = await api.put<Authority>(`${API_ROUTES.authorities}/${id}`, payload)
  return data
}

export async function deleteAuthority(id: number): Promise<void> {
  await api.delete(`${API_ROUTES.authorities}/${id}`)
}
