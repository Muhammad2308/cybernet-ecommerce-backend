import { prisma } from '../../lib/prisma'
import { ShagoJobStatus } from '@prisma/client'
import { dispatchToIntegration } from '../../services/webhook.service'
import { publishEvent } from '../../events/event-bus'
import { RIDO_EVENTS } from '../../events/event-types'

export type ShagoDispatchInput = {
  shago_order_id: string
  pickup_address: string
  pickup_lat: number
  pickup_lng: number
  dropoff_address: string
  dropoff_lat: number
  dropoff_lng: number
  parcel_details: Record<string, unknown>
  order_number_tag: string
  requested_delivery_window?: string
  declared_value: number
  payment_held_in_escrow: boolean
  escrow_amount?: number
}

export async function dispatchShagoJob(input: ShagoDispatchInput) {
  const existing = await prisma.shagoJob.findUnique({ where: { shago_order_id: input.shago_order_id } })
  if (existing) return { rido_job_id: existing.id, status: existing.status, duplicate: true }

  const job = await prisma.shagoJob.create({
    data: {
      shago_order_id: input.shago_order_id,
      pickup_address: input.pickup_address, pickup_lat: input.pickup_lat, pickup_lng: input.pickup_lng,
      dropoff_address: input.dropoff_address, dropoff_lat: input.dropoff_lat, dropoff_lng: input.dropoff_lng,
      parcel_details: input.parcel_details,
      order_number_tag: input.order_number_tag,
      declared_value: input.declared_value,
      payment_held_in_escrow: input.payment_held_in_escrow,
      escrow_amount: input.escrow_amount ?? 0,
      requested_delivery_window: input.requested_delivery_window ? new Date(input.requested_delivery_window) : null,
      tracking_url: `${process.env.APP_URL ?? 'https://rido.app'}/track/${input.shago_order_id}`,
    },
  })

  return { rido_job_id: job.id, status: job.status, tracking_url: job.tracking_url, duplicate: false }
}

export async function getShagoJobStatus(ridoJobId: string) {
  const job = await prisma.shagoJob.findUnique({
    where: { id: ridoJobId },
    include: {
      delivery: {
        include: {
          traveler: { select: { full_name: true, phone: true } },
          location_pings: { orderBy: { created_at: 'desc' }, take: 1 },
        },
      },
    },
  })
  if (!job) return null
  return {
    rido_job_id: job.id, shago_order_id: job.shago_order_id, status: job.status,
    assigned_driver: job.delivery?.traveler ? { name: job.delivery.traveler.full_name, phone: job.delivery.traveler.phone } : null,
    last_location: job.delivery?.location_pings[0] ?? null,
    tracking_url: job.tracking_url,
  }
}

export async function confirmShagoDelivery(ridoJobId: string) {
  const job = await prisma.shagoJob.findUnique({ where: { id: ridoJobId } })
  if (!job) throw new Error('Job not found')
  if (!job.rido_delivery_id) throw new Error('No delivery linked to this job')

  await prisma.$transaction([
    prisma.shagoJob.update({ where: { id: ridoJobId }, data: { status: ShagoJobStatus.DELIVERED } }),
    prisma.delivery.update({ where: { id: job.rido_delivery_id }, data: { status: 'DELIVERED', delivered_at: new Date() } }),
    prisma.transactionRoom.updateMany({ where: { delivery_id: job.rido_delivery_id }, data: { escrow_status: 'RELEASED' } }),
  ])

  await publishEvent(RIDO_EVENTS.DELIVERY_CONFIRMED, { delivery_id: job.rido_delivery_id, shago_order_id: job.shago_order_id, rido_job_id: ridoJobId })
  await fireShagoWebhook('job.delivered', job.shago_order_id, ridoJobId, {})
  return { confirmed_at: new Date().toISOString() }
}

export async function fileShagoDispute(ridoJobId: string, data: { reason: string; evidence_urls: string[]; disputed_amount: number }) {
  const job = await prisma.shagoJob.findUnique({ where: { id: ridoJobId } })
  if (!job) throw new Error('Job not found')
  await prisma.shagoJob.update({ where: { id: ridoJobId }, data: { status: ShagoJobStatus.DISPUTED } })
  await fireShagoWebhook('job.disputed', job.shago_order_id, ridoJobId, { reason: data.reason, disputed_amount: data.disputed_amount })
  return { acknowledged: true }
}

export async function updateShagoJobStatus(ridoJobId: string, status: ShagoJobStatus, extra: Record<string, unknown> = {}): Promise<void> {
  const job = await prisma.shagoJob.update({ where: { id: ridoJobId }, data: { status } })
  const eventMap: Partial<Record<ShagoJobStatus, string>> = {
    [ShagoJobStatus.ASSIGNED]: 'job.assigned',
    [ShagoJobStatus.DRIVER_AT_PICKUP]: 'job.driver_at_pickup',
    [ShagoJobStatus.PICKED_UP]: 'job.picked_up',
    [ShagoJobStatus.IN_TRANSIT]: 'job.in_transit',
    [ShagoJobStatus.ARRIVED_AT_DROPOFF]: 'job.arrived_at_dropoff',
    [ShagoJobStatus.DELIVERED]: 'job.delivered',
    [ShagoJobStatus.FAILED]: 'job.failed',
    [ShagoJobStatus.DISPUTED]: 'job.disputed',
  }
  const eventType = eventMap[status]
  if (eventType) await fireShagoWebhook(eventType, job.shago_order_id, ridoJobId, extra)
}

async function fireShagoWebhook(eventType: string, shagoOrderId: string, ridoJobId: string, extra: Record<string, unknown>): Promise<void> {
  await dispatchToIntegration('SHAGO', null, eventType, { shago_order_id: shagoOrderId, rido_job_id: ridoJobId, ...extra })
}
