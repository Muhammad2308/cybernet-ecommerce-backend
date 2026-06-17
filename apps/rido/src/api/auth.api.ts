import { apiClient } from './client'
import type { RidoUser } from '../store/auth.store'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  full_name: string
  email: string
  phone: string
  password: string
  role: 'SENDER' | 'TRAVELER' | 'LOGISTICS_ADMIN'
  registration_type?: 'independent' | 'company'
  fleet_invite_code?: string
}

export interface AuthResponse {
  success: boolean
  data: { user: RidoUser; token: string }
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', payload),

  getProfile: () =>
    apiClient.get<{ success: boolean; data: RidoUser }>('/auth/me'),

  logout: () =>
    apiClient.post('/auth/logout'),
}
