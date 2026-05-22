import { api } from './client'

export interface Authority {
  id: number
  name: string
}

export async function fetchAuthorities(): Promise<Authority[]> {
  const { data } = await api.get<Authority[]>('/api/authorities')
  return data
}
