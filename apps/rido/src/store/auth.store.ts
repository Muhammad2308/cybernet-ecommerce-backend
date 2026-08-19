import { create } from 'zustand'
import { storage } from '../utils/storage'

export interface RidoUser {
  id: string
  full_name: string
  email: string
  phone: string
  role: 'SENDER' | 'TRAVELER' | 'LOGISTICS_ADMIN' | 'FLEET_ADMIN'
  fleet_company_id?: string
}

interface AuthState {
  user: RidoUser | null
  token: string | null
  setAuth: (user: RidoUser, token: string) => Promise<void>
  clearAuth: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: async (user, token) => {
    await storage.setItem('rido_token', token)
    await storage.setItem('rido_user', JSON.stringify(user))
    set({ user, token })
  },

  clearAuth: async () => {
    await storage.deleteItem('rido_token')
    await storage.deleteItem('rido_user')
    set({ user: null, token: null })
  },

  hydrate: async () => {
    const token = await storage.getItem('rido_token')
    const userRaw = await storage.getItem('rido_user')
    if (token && userRaw) {
      set({ token, user: JSON.parse(userRaw) })
    }
  },
}))
