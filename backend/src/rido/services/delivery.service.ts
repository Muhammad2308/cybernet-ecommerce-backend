import crypto from 'crypto'
import { prisma } from '../../lib/prisma'
import { DeliveryStatus, EscrowStatus, RoomStatus, ShipmentStatus } from '@prisma/client'
import { recordDeliveryEarning } from './earnings.service'
import { publishEvent } from '../../events/event-bus'
import { RIDO_EVENTS } from '../../events/event-types'
import { calculateHaversineDistanceKm } from './pricing.service'
import { generateReceiverQRPayload, generateUniquePickupId, verifyQRPayload } from '../../services/qr.service'

export interface CreateDeliveryParams {
  shipment_id: string
  agreed_price: number
  delivery_mode?: 'DOOR_TO_DOOR' | 'HUB_PICKUP'
  created_by_id: string
  traveler_id?: string
}

function generateOtp(): string { return Math.floor(100000 + Math.random() * 900000).toString() }
function isPlatformAdmin(role: string) { return role === 'ADMIN' || role === 'CYBERNET_ADMIN' }

async function nearestAvailableTraveler(lat: number, lng: number): Promise<string> {
  const pings = await prisma.locationPing.findMany({
    where: { created_at: { gte: new Date(Date.now() - 5 * 60 * 1000) }, user: { role: 'TRAVELER', status: 'ACTIVE' } },
    orderBy: { created_at: 'desc' }, distinct: ['user_id'], select: { user_id: true, latitude: true, longitude: true },
  })
  const closest = pings.map((ping) => ({ id: ping.user_id, distance: calculateHaversineDistanceKm(lat, lng, ping.latitude, ping.longitude) }))
    .filter((candidate) => candidate.distance <= 25).sort((a, b) => a.distance - b.distance)[0]
  if (!closest) throw new Error('No available traveler is currently near the pickup location')
  return closest.id
}

async function validateSenderSelectedTraveler(travelerId: string, lat: number, lng: number): Promise<void> {
  const traveler = await prisma.user.findUnique({ where: { id: travelerId }, select: { role: true, status: true } })
  if (!traveler || traveler.role !== 'TRAVELER' || traveler.status !== 'ACTIVE') {
    throw new Error('Selected traveler is not available for dispatch')
  }
  const latestPing = await prisma.locationPing.findFirst({ where: { user_id: travelerId, created_at: { gte: new Date(Date.now() - 5 * 60 * 1000) } }, orderBy: { created_at: 'desc' } })
  if (!latestPing || calculateHaversineDistanceKm(lat, lng, latestPing.latitude, latestPing.longitude) > 25) {
    throw new Error('Selected traveler is not currently available near the pickup location')
  }
}

async function fleetAdminCompanyId(userId: string) {
  const admin = await prisma.fleetCompanyAdmin.findFirst({ where: { user_id: userId }, include: { fleet_company: { select: { id: true, status: true } } } })
  if (admin && admin.fleet_company.status !== 'ACTIVE') throw new Error('Fleet company is not approved for dispatch')
  return admin?.fleet_company_id
}

export async function createDelivery(params: CreateDeliveryParams) {
  const shipment = await prisma.shipment.findUnique({ where: { id: params.shipment_id } })
  if (!shipment) throw new Error('Shipment not found')
  if (shipment.status !== ShipmentStatus.PENDING) throw new Error('Shipment is not available for dispatch')
  if (shipment.sender_id === shipment.receiver_id) throw new Error('Sender and receiver must be different users')

  const creator = await prisma.user.findUnique({ where: { id: params.created_by_id } })
  if (!creator) throw new Error('Delivery creator not found')
  const creatorIsSender = creator.id === shipment.sender_id
  const creatorIsFleetAdmin = creator.role === 'LOGISTICS_ADMIN' || creator.role === 'FLEET_ADMIN'
  if (!creatorIsSender && !creatorIsFleetAdmin && !isPlatformAdmin(creator.role)) throw new Error('Only the sender or an authorised logistics admin can create a delivery')

  let fleet_company_id: string | undefined
  let traveler_id: string
  if (creatorIsSender) {
    if (params.traveler_id) {
      await validateSenderSelectedTraveler(params.traveler_id, shipment.pickup_lat, shipment.pickup_lng)
      traveler_id = params.traveler_id
    } else {
      traveler_id = await nearestAvailableTraveler(shipment.pickup_lat, shipment.pickup_lng)
    }
  } else {
    if (!params.traveler_id) throw new Error('A logistics admin must assign an active fleet driver')
    fleet_company_id = creatorIsFleetAdmin ? await fleetAdminCompanyId(creator.id) : undefined
    if (creatorIsFleetAdmin && !fleet_company_id) throw new Error('No fleet company is associated with this logistics admin')
    if (fleet_company_id) {
      const membership = await prisma.fleetDriverMembership.findFirst({ where: { driver_id: params.traveler_id, fleet_company_id, status: 'ACTIVE' } })
      if (!membership) throw new Error('Assigned traveler is not an active driver in your fleet')
    }
    traveler_id = params.traveler_id
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const result = await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.create({ data: {
      shipment_id: shipment.id, traveler_id, receiver_id: shipment.receiver_id, created_by_id: creator.id, fleet_company_id,
      agreed_price: params.agreed_price, delivery_mode: params.delivery_mode ?? 'DOOR_TO_DOOR', unique_pickup_id: generateUniquePickupId(),
      pickup_code: generateOtp(), dropoff_code: generateOtp(), qr_expires_at: expiresAt,
    } })
    const qr_payload = generateReceiverQRPayload(delivery.id, shipment.receiver_id, expiresAt)
    await tx.delivery.update({ where: { id: delivery.id }, data: { qr_code_hash: crypto.createHash('sha256').update(qr_payload).digest('hex') } })
    const room = await tx.transactionRoom.create({ data: { delivery_id: delivery.id, escrow_amount: params.agreed_price, escrow_status: EscrowStatus.HOLDING, room_status: RoomStatus.ACTIVE } })
    await tx.shipment.update({ where: { id: shipment.id }, data: { status: ShipmentStatus.MATCHED } })
    await tx.deliveryEvent.create({ data: { delivery_id: delivery.id, event_type: 'DELIVERY_ASSIGNED', metadata: { created_by_id: creator.id, traveler_id, fleet_company_id } } })
    return { delivery, room, qr_payload }
  })
  const admins = fleet_company_id ? await prisma.fleetCompanyAdmin.findMany({ where: { fleet_company_id }, select: { user_id: true } }) : []
  await publishEvent(RIDO_EVENTS.JOB_ASSIGNED, { delivery_id: result.delivery.id, job_id: result.delivery.id, sender_id: shipment.sender_id, driver_id: traveler_id, fleet_admin_ids: admins.map((a) => a.user_id) })
  return result
}

export async function confirmPickup(delivery_id: string, pickup_code: string, actor_id: string) {
  const delivery = await prisma.delivery.findUnique({ where: { id: delivery_id }, include: { shipment: true } })
  if (!delivery) throw new Error('Delivery not found')
  if (delivery.traveler_id !== actor_id) throw new Error('Only the assigned traveler can confirm pickup')
  if (delivery.pickup_code !== pickup_code) throw new Error('Invalid pickup verification code')
  if (delivery.status !== DeliveryStatus.PENDING_PICKUP) throw new Error('Delivery is not pending pickup')
  return prisma.$transaction(async (tx) => {
    const updated = await tx.delivery.update({ where: { id: delivery_id }, data: { status: DeliveryStatus.PICKED_UP, picked_up_at: new Date() } })
    await tx.shipment.update({ where: { id: delivery.shipment_id }, data: { status: ShipmentStatus.IN_TRANSIT } })
    await tx.deliveryEvent.create({ data: { delivery_id, event_type: 'PICKED_UP', metadata: { traveler_id: actor_id } } })
    return updated
  })
}

async function completeDelivery(delivery_id: string, receiver_id: string, verification: 'QR' | 'OTP') {
  const delivery = await prisma.delivery.findUnique({ where: { id: delivery_id }, include: { shipment: true, transaction_room: true } })
  if (!delivery) throw new Error('Delivery not found')
  if (delivery.receiver_id !== receiver_id) throw new Error('Only the registered receiver can confirm delivery')
  const receiverConfirmableStates: DeliveryStatus[] = [DeliveryStatus.PICKED_UP, DeliveryStatus.ARRIVED, DeliveryStatus.IN_TRANSIT]
  if (!receiverConfirmableStates.includes(delivery.status)) throw new Error('Delivery is not ready for receiver confirmation')
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.delivery.update({ where: { id: delivery_id }, data: { status: DeliveryStatus.DELIVERED, delivered_at: new Date() } })
    await tx.shipment.update({ where: { id: delivery.shipment_id }, data: { status: ShipmentStatus.DELIVERED } })
    if (delivery.transaction_room) await tx.transactionRoom.update({ where: { id: delivery.transaction_room.id }, data: { escrow_status: EscrowStatus.RELEASED, room_status: RoomStatus.CLOSED } })
    await tx.deliveryEvent.create({ data: { delivery_id, event_type: `RECEIVER_CONFIRMED_${verification}`, metadata: { receiver_id } } })
    return updated
  })
  await recordDeliveryEarning(delivery_id)
  const admins = delivery.fleet_company_id ? await prisma.fleetCompanyAdmin.findMany({ where: { fleet_company_id: delivery.fleet_company_id }, select: { user_id: true } }) : []
  await publishEvent(RIDO_EVENTS.DELIVERY_CONFIRMED, { delivery_id, sender_id: delivery.shipment.sender_id, receiver_id, driver_id: delivery.traveler_id, fleet_admin_ids: admins.map((a) => a.user_id) })
  return result
}

export async function confirmDeliveryCompletion(delivery_id: string, dropoff_code: string, receiver_id: string) {
  const delivery = await prisma.delivery.findUnique({ where: { id: delivery_id } })
  if (!delivery || delivery.dropoff_code !== dropoff_code) throw new Error('Invalid dropoff verification code')
  return completeDelivery(delivery_id, receiver_id, 'OTP')
}

export async function verifyDeliveryQRCode(delivery_id: string, qr_payload: string, receiver_id: string) {
  const verification = verifyQRPayload(qr_payload)
  if (!verification.valid || !verification.data) throw new Error(verification.error ?? 'Invalid QR code')
  if (verification.data.delivery_id !== delivery_id || verification.data.receiver_id !== receiver_id) throw new Error('QR code does not belong to this receiver and delivery')
  const delivery = await prisma.delivery.findUnique({ where: { id: delivery_id }, select: { qr_code_hash: true, qr_expires_at: true } })
  if (!delivery || !delivery.qr_code_hash || !delivery.qr_expires_at || delivery.qr_expires_at <= new Date()) throw new Error('QR code is unavailable or expired')
  const providedHash = crypto.createHash('sha256').update(qr_payload).digest('hex')
  if (!crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(delivery.qr_code_hash))) throw new Error('QR code is not valid for this delivery')
  return completeDelivery(delivery_id, receiver_id, 'QR')
}

export async function getDeliveryDetails(delivery_id: string) {
  return prisma.delivery.findUnique({ where: { id: delivery_id }, include: {
    shipment: { include: { sender: { select: { id: true, full_name: true, phone: true } }, receiver: { select: { id: true, full_name: true, phone: true } } } },
    traveler: { select: { id: true, full_name: true, phone: true, avatar_url: true } }, receiver: { select: { id: true, full_name: true, phone: true } },
    transaction_room: { include: { messages: { take: 20, orderBy: { created_at: 'desc' } } } }, events: { orderBy: { created_at: 'asc' } }, dispute: true, earning: true,
  } })
}
