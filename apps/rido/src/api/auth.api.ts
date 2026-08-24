import { apiClient } from './client'
import type { RidoUser } from '../store/auth.store'
import { Platform } from 'react-native'

const deviceId = `rido-${Date.now()}-${Math.random().toString(36).slice(2)}`
const device = {
  device_id: deviceId,
  device_name: Platform.OS === 'web' ? 'RIDO Web' : 'RIDO Mobile',
  ...(Platform.OS === 'ios' || Platform.OS === 'android' ? { platform: Platform.OS } : {}),
}

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
  data: { user: RidoUser; access_token: string; refresh_token: string; session_expires_at: string }
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', { ...payload, device }),

  register: (payload: RegisterPayload) => {
    const roles = payload.role === 'TRAVELER' ? ['TRAVELER'] : ['CUSTOMER']
    return apiClient.post<AuthResponse>('/auth/register', { ...payload, roles, device })
  },

  getProfile: () =>
    apiClient.get<{ success: boolean; data: RidoUser }>('/auth/me'),

  logout: () =>
    apiClient.post('/auth/logout'),
}
