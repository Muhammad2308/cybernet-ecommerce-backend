import { prisma } from '../../lib/prisma'
import { PackageCategory, SizeBracket, WeightBracket, UrgencyLevel, ShipmentStatus } from '@prisma/client'

export interface CreateShipmentParams {
  sender_id: string
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

export interface ListShipmentsFilter {
  sender_id?: string
  status?: ShipmentStatus
  category?: PackageCategory
  page?: number
  limit?: number
}

export async function createShipment(data: CreateShipmentParams) {
  return prisma.shipment.create({
    data: {
      sender_id: data.sender_id,
      title: data.title,
      description: data.description,
      category: data.category,
      size: data.size,
      weight_bracket: data.weight_bracket,
      weight_kg: data.weight_kg,
      urgency: data.urgency ?? UrgencyLevel.STANDARD,
      pickup_address: data.pickup_address,
      pickup_lat: data.pickup_lat,
      pickup_lng: data.pickup_lng,
      dropoff_address: data.dropoff_address,
      dropoff_lat: data.dropoff_lat,
      dropoff_lng: data.dropoff_lng,
      receiver_name: data.receiver_name,
      receiver_phone: data.receiver_phone,
      estimated_price: data.estimated_price,
    },
    include: {
      sender: {
        select: { id: true, full_name: true, email: true, phone: true, avatar_url: true },
      },
    },
  })
}

export async function getShipmentById(id: string) {
  return prisma.shipment.findUnique({
    where: { id },
    include: {
      sender: {
        select: { id: true, full_name: true, email: true, phone: true, avatar_url: true },
      },
      delivery: {
        include: {
          traveler: { select: { id: true, full_name: true, phone: true } },
        },
      },
    },
  })
}

export async function listShipments(filter: ListShipmentsFilter) {
  const page = filter.page && filter.page > 0 ? filter.page : 1
  const limit = filter.limit && filter.limit > 0 ? filter.limit : 20
  const skip = (page - 1) * limit

  const where: any = {}
  if (filter.sender_id) where.sender_id = filter.sender_id
  if (filter.status) where.status = filter.status
  if (filter.category) where.category = filter.category

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        sender: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
      },
    }),
    prisma.shipment.count({ where }),
  ])

  return {
    shipments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function updateShipment(
  id: string,
  sender_id: string,
  data: Partial<CreateShipmentParams> & { status?: ShipmentStatus }
) {
  const shipment = await prisma.shipment.findUnique({ where: { id } })
  if (!shipment) throw new Error('Shipment not found')
  if (shipment.sender_id !== sender_id) throw new Error('Unauthorized to update this shipment')

  return prisma.shipment.update({
    where: { id },
    data,
  })
}

export async function cancelShipment(id: string, sender_id: string) {
  const shipment = await prisma.shipment.findUnique({ where: { id } })
  if (!shipment) throw new Error('Shipment not found')
  if (shipment.sender_id !== sender_id) throw new Error('Unauthorized to cancel this shipment')
  if (shipment.status !== ShipmentStatus.PENDING) {
    throw new Error('Only PENDING shipments can be cancelled')
  }

  return prisma.shipment.update({
    where: { id },
    data: { status: ShipmentStatus.CANCELLED },
  })
}
