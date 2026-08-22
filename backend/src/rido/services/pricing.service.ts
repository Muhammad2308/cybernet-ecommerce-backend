import { prisma } from '../../lib/prisma'
import { PackageCategory, SizeBracket, WeightBracket, UrgencyLevel, VehicleType } from '@prisma/client'

export interface CalculatePriceInput {
  pickup_lat: number
  pickup_lng: number
  dropoff_lat: number
  dropoff_lng: number
  weight_bracket: WeightBracket
  size: SizeBracket
  urgency?: UrgencyLevel
  vehicle_type?: VehicleType
  delivery_mode?: 'DOOR_TO_DOOR' | 'HUB_PICKUP'
  currency?: string
}

export interface PriceBreakdown {
  distance_km: number
  base_fee: number
  distance_fee: number
  door_to_door_surcharge: number
  weight_multiplier: number
  size_multiplier: number
  urgency_multiplier: number
  vehicle_modifier: number
  subtotal: number
  platform_fee: number
  escrow_fee: number
  total_price: number
  currency: string
}

// Haversine formula to compute distance in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 100) / 100
}

export async function getPricingConfigsMap(): Promise<Record<string, number>> {
  const configs = await prisma.pricingConfig.findMany()
  const map: Record<string, number> = {
    BASE_FEE: 500,
    DISTANCE_RATE_PER_KM: 15,
    WEIGHT_LIGHT_MULTIPLIER: 1.0,
    WEIGHT_MEDIUM_MULTIPLIER: 1.25,
    WEIGHT_HEAVY_MULTIPLIER: 1.6,
    WEIGHT_EXTRA_HEAVY_MULTIPLIER: 2.0,
    SIZE_SMALL_MULTIPLIER: 1.0,
    SIZE_MEDIUM_MULTIPLIER: 1.2,
    SIZE_LARGE_MULTIPLIER: 1.5,
    SIZE_EXTRA_LARGE_MULTIPLIER: 1.8,
    URGENCY_STANDARD_MULTIPLIER: 1.0,
    URGENCY_EXPRESS_MULTIPLIER: 1.3,
    URGENCY_SAME_DAY_MULTIPLIER: 1.6,
    VEHICLE_MOTORCYCLE_RATE: 0.8,
    VEHICLE_CAR_RATE: 1.0,
    VEHICLE_VAN_RATE: 1.3,
    VEHICLE_TRUCK_RATE: 1.6,
    PLATFORM_FEE_PERCENTAGE: 10,
    ESCROW_FEE_PERCENTAGE: 2.5,
    MINIMUM_DELIVERY_FEE: 300,
  }

  for (const cfg of configs) {
    if (cfg.value !== null && !isNaN(Number(cfg.value))) {
      map[cfg.key] = Number(cfg.value)
    }
  }

  return map
}

export async function calculateShipmentPrice(input: CalculatePriceInput): Promise<PriceBreakdown> {
  const config = await getPricingConfigsMap()

  const distance_km = calculateHaversineDistanceKm(
    input.pickup_lat,
    input.pickup_lng,
    input.dropoff_lat,
    input.dropoff_lng
  )

  const base_fee = config.BASE_FEE ?? 500
  const rate_per_km = config.DISTANCE_RATE_PER_KM ?? 15
  const distance_fee = distance_km * rate_per_km

  // Weight Multiplier
  let weight_multiplier = 1.0
  switch (input.weight_bracket) {
    case WeightBracket.LIGHT:
      weight_multiplier = config.WEIGHT_LIGHT_MULTIPLIER ?? 1.0
      break
    case WeightBracket.MEDIUM:
      weight_multiplier = config.WEIGHT_MEDIUM_MULTIPLIER ?? 1.25
      break
    case WeightBracket.HEAVY:
      weight_multiplier = config.WEIGHT_HEAVY_MULTIPLIER ?? 1.6
      break
    case WeightBracket.EXTRA_HEAVY:
      weight_multiplier = config.WEIGHT_EXTRA_HEAVY_MULTIPLIER ?? 2.0
      break
  }

  // Size Multiplier
  let size_multiplier = 1.0
  switch (input.size) {
    case SizeBracket.SMALL:
      size_multiplier = config.SIZE_SMALL_MULTIPLIER ?? 1.0
      break
    case SizeBracket.MEDIUM:
      size_multiplier = config.SIZE_MEDIUM_MULTIPLIER ?? 1.2
      break
    case SizeBracket.LARGE:
      size_multiplier = config.SIZE_LARGE_MULTIPLIER ?? 1.5
      break
    case SizeBracket.EXTRA_LARGE:
      size_multiplier = config.SIZE_EXTRA_LARGE_MULTIPLIER ?? 1.8
      break
  }

  // Urgency Multiplier
  let urgency_multiplier = 1.0
  if (input.urgency) {
    switch (input.urgency) {
      case UrgencyLevel.STANDARD:
        urgency_multiplier = config.URGENCY_STANDARD_MULTIPLIER ?? 1.0
        break
      case UrgencyLevel.EXPRESS:
        urgency_multiplier = config.URGENCY_EXPRESS_MULTIPLIER ?? 1.3
        break
      case UrgencyLevel.SAME_DAY:
        urgency_multiplier = config.URGENCY_SAME_DAY_MULTIPLIER ?? 1.6
        break
    }
  }

  // Vehicle Rate Modifier
  let vehicle_modifier = 1.0
  if (input.vehicle_type) {
    switch (input.vehicle_type) {
      case VehicleType.MOTORCYCLE:
        vehicle_modifier = config.VEHICLE_MOTORCYCLE_RATE ?? 0.8
        break
      case VehicleType.CAR:
        vehicle_modifier = config.VEHICLE_CAR_RATE ?? 1.0
        break
      case VehicleType.VAN:
        vehicle_modifier = config.VEHICLE_VAN_RATE ?? 1.3
        break
      case VehicleType.TRUCK:
        vehicle_modifier = config.VEHICLE_TRUCK_RATE ?? 1.6
        break
    }
  }

  const door_to_door_surcharge =
    input.delivery_mode === 'DOOR_TO_DOOR' ? (config.DOOR_TO_DOOR_SURCHARGE ?? 500) : 0

  const rawSubtotal =
    (base_fee + distance_fee + door_to_door_surcharge) *
    weight_multiplier *
    size_multiplier *
    urgency_multiplier *
    vehicle_modifier

  const min_fee = config.MINIMUM_DELIVERY_FEE ?? 300
  const subtotal = Math.max(rawSubtotal, min_fee)

  const platform_fee_pct = config.PLATFORM_FEE_PERCENTAGE ?? 10
  const escrow_fee_pct = config.ESCROW_FEE_PERCENTAGE ?? 2.5

  const platform_fee = Math.round((subtotal * platform_fee_pct) / 100)
  const escrow_fee = Math.round((subtotal * escrow_fee_pct) / 100)
  const total_price = Math.round(subtotal + platform_fee + escrow_fee)

  return {
    distance_km,
    base_fee,
    distance_fee: Math.round(distance_fee),
    door_to_door_surcharge: Math.round(door_to_door_surcharge),
    weight_multiplier,
    size_multiplier,
    urgency_multiplier,
    vehicle_modifier,
    subtotal: Math.round(subtotal),
    platform_fee,
    escrow_fee,
    total_price,
    currency: input.currency ?? 'NGN',
  }
}
