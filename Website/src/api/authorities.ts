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

export async function fetchAuthorities(): Promise<Authority[]> {
  const { data } = await api.get<Authority[]>(API_ROUTES.authorities)
  return data
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
