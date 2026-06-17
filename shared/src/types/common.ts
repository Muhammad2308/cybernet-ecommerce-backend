export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
}

export interface GeoPoint {
  lat: number
  lng: number
}

export type Currency = 'NGN' | 'GHS' | 'KES' | 'USD'
