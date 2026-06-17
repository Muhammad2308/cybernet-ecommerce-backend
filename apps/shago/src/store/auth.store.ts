import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'

export interface ShagoUser {
  id: string
  full_name: string
  email: string
  phone: string
  role: 'RETAILER' | 'WHOLESALER' | 'SALES_AGENT' | 'LOGISTICS_AGENT' | 'CONSUMER'
}

interface AuthState {
  user: ShagoUser | null
  token: string | null
  setAuth: (user: ShagoUser, token: string) => Promise<void>
  clearAuth: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('shago_token', token)
    await SecureStore.setItemAsync('shago_user', JSON.stringify(user))
    set({ user, token })
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('shago_token')
    await SecureStore.deleteItemAsync('shago_user')
    set({ user: null, token: null })
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync('shago_token')
    const userRaw = await SecureStore.getItemAsync('shago_user')
    if (token && userRaw) {
      set({ token, user: JSON.parse(userRaw) })
    }
  },
}))
