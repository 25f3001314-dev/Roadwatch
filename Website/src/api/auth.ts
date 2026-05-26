import { api } from './client'
import { API_ROUTES } from '@/constants/config'

export interface LoginResponse {
  token: string
  tokenType: string
  expiresIn: number
}

export interface AdminProfile {
  username: string
  role: string
  displayName: string
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(API_ROUTES.login, { username, password })
  return data
}

export async function fetchProfile(): Promise<AdminProfile> {
  const { data } = await api.get<AdminProfile>(API_ROUTES.me)
  return data
}
