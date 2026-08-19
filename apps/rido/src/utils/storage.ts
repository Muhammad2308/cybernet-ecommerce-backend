import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(key, value)
      return
    }
    return SecureStore.setItemAsync(key, value)
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(key)
      return
    }
    return SecureStore.deleteItemAsync(key)
  },
}
