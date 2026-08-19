import { prisma } from '../../lib/prisma'
import {
  DeliveryStatus,
  ShipmentStatus,
  EscrowStatus,
  RoomStatus,
  PaymentStatus,
} from '@prisma/client'
import { recordDeliveryEarning } from './earnings.service'
import { publishEvent } from '../../events/event-bus'
import { RIDO_EVENTS } from '../../events/event-types'

export interface CreateDeliveryParams {
  shipment_id: string
  trip_id: string
  traveler_id: string
  agreed_price: number
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createDelivery(params: CreateDeliveryParams) {
  const { shipment_id, trip_id, traveler_id, agreed_price } = params

  const shipment = await prisma.shipment.findUnique({ where: { id: shipment_id } })
  if (!shipment) throw new Error('Shipment not found')
  if (shipment.status !== ShipmentStatus.PENDING) {
    throw new Error('Shipment is not available for matching')
  }

  const trip = await prisma.trip.findUnique({ where: { id: trip_id } })
  if (!trip) throw new Error('Trip not found')
  if (trip.traveler_id !== traveler_id) {
    throw new Error('Traveler ID does not match trip owner')
  }

  const pickup_code = generateOtp()
  const dropoff_code = generateOtp()

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create delivery
    const delivery = await tx.delivery.create({
      data: {
        shipment_id,
        trip_id,
        traveler_id,
        agreed_price,
        pickup_code,
        dropoff_code,
        status: DeliveryStatus.PENDING_PICKUP,
      },
    })

    // 2. Create transaction room with escrow
    const room = await tx.transactionRoom.create({
      data: {
        delivery_id: delivery.id,
        escrow_amount: agreed_price,
        escrow_status: EscrowStatus.HOLDING,
        room_status: RoomStatus.ACTIVE,
      },
    })

    // 3. Update shipment status to MATCHED
    await tx.shipment.update({
      where: { id: shipment_id },
      data: { status: ShipmentStatus.MATCHED },
    })

    // 4. Record initial delivery event
    await tx.deliveryEvent.create({
      data: {
        delivery_id: delivery.id,
        event_type: 'DELIVERY_CREATED',
        metadata: JSON.stringify({ agreed_price, trip_id }),
      },
    })

    return { delivery, room }
  })

  await publishEvent(RIDO_EVENTS.JOB_ASSIGNED, {
    delivery_id: result.delivery.id,
    shipment_id,
    trip_id,
    traveler_id,
  })

  return result
}

export async function confirmPickup(delivery_id: string, pickup_code: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: delivery_id },
    include: { shipment: true },
  })

  if (!delivery) throw new Error('Delivery not found')
  if (delivery.pickup_code !== pickup_code) {
    throw new Error('Invalid pickup verification code')
  }

  if (delivery.status !== DeliveryStatus.PENDING_PICKUP) {
    throw new Error('Delivery is not pending pickup')
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedDelivery = await tx.delivery.update({
      where: { id: delivery_id },
      data: {
        status: DeliveryStatus.PICKED_UP,
        picked_up_at: new Date(),
      },
    })

    await tx.shipment.update({
      where: { id: delivery.shipment_id },
      data: { status: ShipmentStatus.IN_TRANSIT },
    })

    await tx.deliveryEvent.create({
      data: {
        delivery_id,
        event_type: 'PICKED_UP',
      },
    })

    return updatedDelivery
  })

  await publishEvent(RIDO_EVENTS.DELIVERY_PICKED_UP, {
    delivery_id,
    shipment_id: delivery.shipment_id,
    traveler_id: delivery.traveler_id,
  })

  return updated
}

export async function confirmDeliveryCompletion(delivery_id: string, dropoff_code: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: delivery_id },
    include: { shipment: true, transaction_room: true },
  })

  if (!delivery) throw new Error('Delivery not found')
  if (delivery.dropoff_code !== dropoff_code) {
    throw new Error('Invalid dropoff verification code')
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update delivery status
    const updatedDelivery = await tx.delivery.update({
      where: { id: delivery_id },
      data: {
        status: DeliveryStatus.DELIVERED,
        delivered_at: new Date(),
      },
    })

    // 2. Update shipment status
    await tx.shipment.update({
      where: { id: delivery.shipment_id },
      data: { status: ShipmentStatus.DELIVERED },
    })

    // 3. Release Escrow in Transaction Room
    if (delivery.transaction_room) {
      await tx.transactionRoom.update({
        where: { id: delivery.transaction_room.id },
        data: {
          escrow_status: EscrowStatus.RELEASED,
          room_status: RoomStatus.CLOSED,
        },
      })
    }

    // 4. Log delivery completion event
    await tx.deliveryEvent.create({
      data: {
        delivery_id,
        event_type: 'DELIVERED',
      },
    })

    return updatedDelivery
  })

  // 5. Calculate and record earnings for driver/fleet
  await recordDeliveryEarning(delivery_id)

  await publishEvent(RIDO_EVENTS.DELIVERY_CONFIRMED, {
    delivery_id,
    shipment_id: delivery.shipment_id,
    traveler_id: delivery.traveler_id,
  })

  return result
}

export async function getDeliveryDetails(delivery_id: string) {
  return prisma.delivery.findUnique({
    where: { id: delivery_id },
    include: {
      shipment: {
        include: { sender: { select: { id: true, full_name: true, phone: true } } },
      },
      trip: true,
      traveler: { select: { id: true, full_name: true, phone: true, avatar_url: true } },
      transaction_room: {
        include: { messages: { take: 20, orderBy: { created_at: 'desc' } } },
      },
      events: { orderBy: { created_at: 'asc' } },
      dispute: true,
      earning: true,
    },
  })
}
