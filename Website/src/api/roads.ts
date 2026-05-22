import { api } from './client'
import { API_ROUTES } from '@/constants/config'
import type { Road } from '@/types/road'

export async function fetchRoads(): Promise<Road[]> {
  const { data } = await api.get<Road[]>(`${API_ROUTES.roads}`)
  return data
}

export async function createRoad(payload: Partial<Road>): Promise<Road> {
  const { data } = await api.post<Road>(`${API_ROUTES.roads}`, payload)
  return data
}

export async function updateRoad(id: number, payload: Partial<Road>): Promise<Road> {
  const { data } = await api.put<Road>(`${API_ROUTES.roads}/${id}`, payload)
  return data
}

export async function deleteRoad(id: number): Promise<void> {
  await api.delete(`${API_ROUTES.roads}/${id}`)
}
