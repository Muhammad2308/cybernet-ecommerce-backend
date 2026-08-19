import { prisma } from '../../lib/prisma'
import { calculateHaversineDistanceKm } from './pricing.service'
import { TripStatus, ShipmentStatus } from '@prisma/client'

export interface MatchFilter {
  max_pickup_distance_km?: number
  max_dropoff_distance_km?: number
  max_departure_delay_hours?: number
}

export interface MatchedTripResult {
  trip: any
  pickup_distance_km: number
  dropoff_distance_km: number
  total_detour_km: number
  match_score: number // 0 - 100 score
}

export async function findMatchingTripsForShipment(
  shipmentId: string,
  filter?: MatchFilter
): Promise<MatchedTripResult[]> {
  const maxPickupDist = filter?.max_pickup_distance_km ?? 25 // default 25km radius
  const maxDropoffDist = filter?.max_dropoff_distance_km ?? 25

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  })

  if (!shipment) throw new Error('Shipment not found')

  // Find all active or scheduled trips with sufficient capacity
  const candidateTrips = await prisma.trip.findMany({
    where: {
      status: { in: [TripStatus.SCHEDULED, TripStatus.ACTIVE] },
      available_capacity: { gte: shipment.weight_kg },
    },
    include: {
      traveler: {
        select: { id: true, full_name: true, phone: true, avatar_url: true, tier: true },
      },
    },
  })

  const results: MatchedTripResult[] = []

  for (const trip of candidateTrips) {
    const pickupDist = calculateHaversineDistanceKm(
      shipment.pickup_lat,
      shipment.pickup_lng,
      trip.origin_lat,
      trip.origin_lng
    )

    const dropoffDist = calculateHaversineDistanceKm(
      shipment.dropoff_lat,
      shipment.dropoff_lng,
      trip.destination_lat,
      trip.destination_lng
    )

    if (pickupDist <= maxPickupDist && dropoffDist <= maxDropoffDist) {
      const totalDetour = pickupDist + dropoffDist
      // Simple match score formula (closer detour = higher score)
      const maxAllowedDetour = maxPickupDist + maxDropoffDist
      const match_score = Math.max(0, Math.round(100 * (1 - totalDetour / maxAllowedDetour)))

      results.push({
        trip,
        pickup_distance_km: pickupDist,
        dropoff_distance_km: dropoffDist,
        total_detour_km: totalDetour,
        match_score,
      })
    }
  }

  // Sort by highest match score
  return results.sort((a, b) => b.match_score - a.match_score)
}

export async function findMatchingShipmentsForTrip(
  tripId: string,
  filter?: MatchFilter
): Promise<any[]> {
  const maxPickupDist = filter?.max_pickup_distance_km ?? 25
  const maxDropoffDist = filter?.max_dropoff_distance_km ?? 25

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  })

  if (!trip) throw new Error('Trip not found')

  const candidateShipments = await prisma.shipment.findMany({
    where: {
      status: ShipmentStatus.PENDING,
      weight_kg: { lte: trip.available_capacity },
    },
    include: {
      sender: {
        select: { id: true, full_name: true, phone: true, avatar_url: true },
      },
    },
  })

  const results: any[] = []

  for (const shipment of candidateShipments) {
    const pickupDist = calculateHaversineDistanceKm(
      shipment.pickup_lat,
      shipment.pickup_lng,
      trip.origin_lat,
      trip.origin_lng
    )

    const dropoffDist = calculateHaversineDistanceKm(
      shipment.dropoff_lat,
      shipment.dropoff_lng,
      trip.destination_lat,
      trip.destination_lng
    )

    if (pickupDist <= maxPickupDist && dropoffDist <= maxDropoffDist) {
      const totalDetour = pickupDist + dropoffDist
      const match_score = Math.max(0, Math.round(100 * (1 - (totalDetour / (maxPickupDist + maxDropoffDist)))))

      results.push({
        shipment,
        pickup_distance_km: pickupDist,
        dropoff_distance_km: dropoffDist,
        total_detour_km: totalDetour,
        match_score,
      })
    }
  }

  return results.sort((a, b) => b.match_score - a.match_score)
}
