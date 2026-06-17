import { apiClient } from './client'
import type { ShagoUser } from '../store/auth.store'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  full_name: string
  email: string
  phone: string
  password: string
  role: 'RETAILER' | 'WHOLESALER' | 'SALES_AGENT' | 'LOGISTICS_AGENT' | 'CONSUMER'
  business_name?: string
}

export interface AuthResponse {
  success: boolean
  data: { user: ShagoUser; token: string }
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', payload),

  getProfile: () =>
    apiClient.get<{ success: boolean; data: ShagoUser }>('/auth/me'),

  logout: () =>
    apiClient.post('/auth/logout'),
}
