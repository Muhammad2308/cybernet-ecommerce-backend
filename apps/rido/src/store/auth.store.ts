import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'

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
    await SecureStore.setItemAsync('rido_token', token)
    await SecureStore.setItemAsync('rido_user', JSON.stringify(user))
    set({ user, token })
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('rido_token')
    await SecureStore.deleteItemAsync('rido_user')
    set({ user: null, token: null })
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync('rido_token')
    const userRaw = await SecureStore.getItemAsync('rido_user')
    if (token && userRaw) {
      set({ token, user: JSON.parse(userRaw) })
    }
  },
}))
