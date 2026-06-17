import axios from 'axios'

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export const adminApi = axios.create({
  baseURL: `${BASE_URL}/api/admin/v1`,
  timeout: 15000,
})

export function setAuthToken(token: string) {
  adminApi.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function clearAuthToken() {
  delete adminApi.defaults.headers.common['Authorization']
}
