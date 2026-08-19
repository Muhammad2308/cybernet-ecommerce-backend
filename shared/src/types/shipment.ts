import { PackageCategory, SizeBracket, WeightBracket, UrgencyLevel, ShipmentStatus } from './enums'

export interface LocationCoordinates {
  address: string
  latitude: number
  longitude: number
}

export interface CreateShipmentInput {
  title: string
  description?: string
  category: PackageCategory
  size: SizeBracket
  weight_bracket: WeightBracket
  weight_kg: number
  urgency?: UrgencyLevel
  pickup_address: string
  pickup_lat: number
  pickup_lng: number
  dropoff_address: string
  dropoff_lat: number
  dropoff_lng: number
  receiver_name: string
  receiver_phone: string
  estimated_price?: number
}

export interface UpdateShipmentInput {
  title?: string
  description?: string
  category?: PackageCategory
  size?: SizeBracket
  weight_bracket?: WeightBracket
  weight_kg?: number
  urgency?: UrgencyLevel
  pickup_address?: string
  pickup_lat?: number
  pickup_lng?: number
  dropoff_address?: string
  dropoff_lat?: number
  dropoff_lng?: number
  receiver_name?: string
  receiver_phone?: string
  status?: ShipmentStatus
}

export interface ShipmentResponse {
  id: string
  sender_id: string
  title: string
  description?: string | null
  category: PackageCategory
  size: SizeBracket
  weight_bracket: WeightBracket
  weight_kg: number
  urgency: UrgencyLevel
  pickup_address: string
  pickup_lat: number
  pickup_lng: number
  dropoff_address: string
  dropoff_lat: number
  dropoff_lng: number
  receiver_name: string
  receiver_phone: string
  status: ShipmentStatus
  estimated_price?: number | null
  created_at: string
  updated_at: string
}
