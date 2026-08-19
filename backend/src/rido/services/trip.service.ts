import { prisma } from '../../lib/prisma'
import { VehicleType, TripStatus } from '@prisma/client'

export interface CreateTripParams {
  traveler_id: string
  origin_address: string
  origin_lat: number
  origin_lng: number
  destination_address: string
  destination_lat: number
  destination_lng: number
  vehicle_type: VehicleType
  available_capacity: number
  departure_time: Date | string
  notes?: string
}

export interface ListTripsFilter {
  traveler_id?: string
  status?: TripStatus
  vehicle_type?: VehicleType
  page?: number
  limit?: number
}

export async function createTrip(data: CreateTripParams) {
  return prisma.trip.create({
    data: {
      traveler_id: data.traveler_id,
      origin_address: data.origin_address,
      origin_lat: data.origin_lat,
      origin_lng: data.origin_lng,
      destination_address: data.destination_address,
      destination_lat: data.destination_lat,
      destination_lng: data.destination_lng,
      vehicle_type: data.vehicle_type,
      available_capacity: data.available_capacity,
      departure_time: new Date(data.departure_time),
      notes: data.notes,
    },
    include: {
      traveler: {
        select: { id: true, full_name: true, email: true, phone: true, avatar_url: true, tier: true },
      },
    },
  })
}

export async function getTripById(id: string) {
  return prisma.trip.findUnique({
    where: { id },
    include: {
      traveler: {
        select: { id: true, full_name: true, email: true, phone: true, avatar_url: true, tier: true },
      },
      deliveries: {
        include: {
          shipment: { select: { id: true, title: true, pickup_address: true, dropoff_address: true } },
        },
      },
    },
  })
}

export async function listTrips(filter: ListTripsFilter) {
  const page = filter.page && filter.page > 0 ? filter.page : 1
  const limit = filter.limit && filter.limit > 0 ? filter.limit : 20
  const skip = (page - 1) * limit

  const where: any = {}
  if (filter.traveler_id) where.traveler_id = filter.traveler_id
  if (filter.status) where.status = filter.status
  if (filter.vehicle_type) where.vehicle_type = filter.vehicle_type

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip,
      take: limit,
      orderBy: { departure_time: 'asc' },
      include: {
        traveler: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
      },
    }),
    prisma.trip.count({ where }),
  ])

  return {
    trips,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function updateTrip(
  id: string,
  traveler_id: string,
  data: Partial<CreateTripParams> & { status?: TripStatus }
) {
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) throw new Error('Trip not found')
  if (trip.traveler_id !== traveler_id) throw new Error('Unauthorized to update this trip')

  const updateData: any = { ...data }
  if (data.departure_time) {
    updateData.departure_time = new Date(data.departure_time)
  }

  return prisma.trip.update({
    where: { id },
    data: updateData,
  })
}

export async function cancelTrip(id: string, traveler_id: string) {
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) throw new Error('Trip not found')
  if (trip.traveler_id !== traveler_id) throw new Error('Unauthorized to cancel this trip')

  return prisma.trip.update({
    where: { id },
    data: { status: TripStatus.CANCELLED },
  })
}
