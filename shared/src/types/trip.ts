import { VehicleType, TripStatus } from './enums'

export interface CreateTripInput {
  origin_address: string
  origin_lat: number
  origin_lng: number
  destination_address: string
  destination_lat: number
  destination_lng: number
  vehicle_type: VehicleType
  available_capacity: number
  departure_time: string
  notes?: string
}

export interface UpdateTripInput {
  origin_address?: string
  origin_lat?: number
  origin_lng?: number
  destination_address?: string
  destination_lat?: number
  destination_lng?: number
  vehicle_type?: VehicleType
  available_capacity?: number
  departure_time?: string
  status?: TripStatus
  notes?: string
}

export interface TripResponse {
  id: string
  traveler_id: string
  origin_address: string
  origin_lat: number
  origin_lng: number
  destination_address: string
  destination_lat: number
  destination_lng: number
  vehicle_type: VehicleType
  available_capacity: number
  departure_time: string
  status: TripStatus
  notes?: string | null
  created_at: string
  updated_at: string
}
