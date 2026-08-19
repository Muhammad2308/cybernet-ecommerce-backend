import axios from 'axios'
import { storage } from '../utils/storage'

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/rido/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem('rido_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.deleteItem('rido_token')
      await storage.deleteItem('rido_user')
    }
    return Promise.reject(error)
  },
)
