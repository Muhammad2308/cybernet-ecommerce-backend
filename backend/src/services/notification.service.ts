import { prisma } from '../lib/prisma'
import { NotificationChannel, NotificationStatus, RecipientType } from '@prisma/client'
import { onEvent } from '../events/event-bus'
import { RIDO_EVENTS, RidoEvent } from '../events/event-types'

type NotificationPayload = {
  recipient_id: string
  recipient_type: RecipientType
  event_type: string
  title: string
  body: string
  data?: Record<string, unknown>
  channels: NotificationChannel[]
}

function isQuietHours(): boolean {
  const hour = new Date().getHours()
  return hour >= 22 || hour < 6
}

function isCriticalEvent(eventType: string): boolean {
  return [RIDO_EVENTS.DELIVERY_FAILED, RIDO_EVENTS.DISPUTE_FILED, RIDO_EVENTS.PAYOUT_PROCESSED].includes(eventType as never)
}

async function getPreferredChannels(userId: string | null, fleetCompanyId: string | null, eventType: string, defaultChannels: NotificationChannel[]): Promise<NotificationChannel[]> {
  if (!userId && !fleetCompanyId) return defaultChannels
  const prefs = await prisma.notificationPreference.findMany({
    where: { event_type: eventType, ...(userId ? { user_id: userId } : { fleet_company_id: fleetCompanyId }) },
  })
  if (!prefs.length) return defaultChannels
  return prefs.filter((p) => p.enabled).map((p) => p.channel)
}

export async function sendNotification(n: NotificationPayload): Promise<void> {
  let channels = await getPreferredChannels(n.recipient_id, null, n.event_type, n.channels)
  if (isQuietHours() && !isCriticalEvent(n.event_type)) {
    channels = channels.filter((c) => c !== NotificationChannel.SMS)
  }

  await Promise.all(
    channels.map(async (channel) => {
      await prisma.notification.create({
        data: { recipient_id: n.recipient_id, recipient_type: n.recipient_type, event_type: n.event_type, title: n.title, body: n.body, data: (n.data ? (n.data as any) : undefined), channel, status: NotificationStatus.PENDING },
      })
      await dispatchChannel(channel, n).catch((err) => console.error(`[Notification] ${channel} dispatch failed:`, err.message))
    }),
  )
}

async function dispatchChannel(channel: NotificationChannel, n: NotificationPayload): Promise<void> {
  switch (channel) {
    case NotificationChannel.IN_APP: break
    case NotificationChannel.PUSH: console.log(`[Push] → ${n.recipient_id}: ${n.title}`); break
    case NotificationChannel.SMS: console.log(`[SMS] → ${n.recipient_id}: ${n.body}`); break
    case NotificationChannel.EMAIL: console.log(`[Email] → ${n.recipient_id}: ${n.title}`); break
    case NotificationChannel.WEBHOOK: break
  }
}

export function registerNotificationHandlers(): void {
  onEvent(RIDO_EVENTS.JOB_ASSIGNED, async (event: RidoEvent) => {
    const { sender_id, driver_id, fleet_admin_ids, job_id } = event.payload as { sender_id: string; driver_id: string; fleet_admin_ids?: string[]; job_id: string }
    await sendNotification({ recipient_id: sender_id, recipient_type: RecipientType.SENDER, event_type: event.type, title: 'Driver assigned', body: 'A driver has been assigned to your delivery.', data: { job_id }, channels: [NotificationChannel.PUSH] })
    await sendNotification({ recipient_id: driver_id, recipient_type: RecipientType.DRIVER, event_type: event.type, title: 'New job assigned', body: 'You have been assigned a new delivery job.', data: { job_id }, channels: [NotificationChannel.PUSH] })
    if (fleet_admin_ids?.length) {
      for (const adminId of fleet_admin_ids) {
        await sendNotification({ recipient_id: adminId, recipient_type: RecipientType.FLEET_ADMIN, event_type: event.type, title: 'Driver assigned to job', body: 'One of your drivers has been assigned a new delivery.', data: { job_id }, channels: [NotificationChannel.IN_APP] })
      }
    }
  })

  onEvent(RIDO_EVENTS.DELIVERY_CONFIRMED, async (event: RidoEvent) => {
    const { sender_id, receiver_id, driver_id, fleet_admin_ids, delivery_id } = event.payload as { sender_id: string; receiver_id?: string; driver_id: string; fleet_admin_ids?: string[]; delivery_id: string }
    await sendNotification({ recipient_id: sender_id, recipient_type: RecipientType.SENDER, event_type: event.type, title: 'Delivery confirmed', body: 'Your package has been delivered successfully.', data: { delivery_id }, channels: [NotificationChannel.PUSH, NotificationChannel.SMS] })
    await sendNotification({ recipient_id: driver_id, recipient_type: RecipientType.DRIVER, event_type: event.type, title: 'Delivery complete', body: 'Delivery confirmed. Your earnings have been credited.', data: { delivery_id }, channels: [NotificationChannel.PUSH] })
    if (receiver_id) await sendNotification({ recipient_id: receiver_id, recipient_type: RecipientType.RECEIVER, event_type: event.type, title: 'Delivery confirmed', body: 'You confirmed receipt of this package.', data: { delivery_id }, channels: [NotificationChannel.PUSH] })
    if (fleet_admin_ids?.length) {
      for (const adminId of fleet_admin_ids) {
        await sendNotification({ recipient_id: adminId, recipient_type: RecipientType.FLEET_ADMIN, event_type: event.type, title: 'Delivery completed', body: 'A delivery by one of your drivers has been confirmed.', data: { delivery_id }, channels: [NotificationChannel.IN_APP] })
      }
    }
  })

  onEvent(RIDO_EVENTS.DELIVERY_FAILED, async (event: RidoEvent) => {
    const { sender_id, driver_id, fleet_admin_ids, delivery_id, reason } = event.payload as { sender_id: string; driver_id: string; fleet_admin_ids?: string[]; delivery_id: string; reason?: string }
    await sendNotification({ recipient_id: sender_id, recipient_type: RecipientType.SENDER, event_type: event.type, title: 'Delivery failed', body: reason ?? 'Your delivery could not be completed.', data: { delivery_id }, channels: [NotificationChannel.PUSH, NotificationChannel.SMS] })
    await sendNotification({ recipient_id: driver_id, recipient_type: RecipientType.DRIVER, event_type: event.type, title: 'Delivery marked failed', body: 'The delivery has been marked as failed.', data: { delivery_id }, channels: [NotificationChannel.PUSH] })
    if (fleet_admin_ids?.length) {
      for (const adminId of fleet_admin_ids) {
        await sendNotification({ recipient_id: adminId, recipient_type: RecipientType.FLEET_ADMIN, event_type: event.type, title: 'Delivery failed', body: 'A delivery by one of your drivers has failed.', data: { delivery_id }, channels: [NotificationChannel.IN_APP] })
      }
    }
  })

  onEvent(RIDO_EVENTS.PAYOUT_PROCESSED, async (event: RidoEvent) => {
    const { driver_id, fleet_admin_ids, amount, currency } = event.payload as { driver_id: string; fleet_admin_ids?: string[]; amount: number; currency: string }
    await sendNotification({ recipient_id: driver_id, recipient_type: RecipientType.DRIVER, event_type: event.type, title: 'Payout processed', body: `${currency} ${amount.toLocaleString()} has been sent to your account.`, data: { amount, currency }, channels: [NotificationChannel.PUSH, NotificationChannel.SMS] })
    if (fleet_admin_ids?.length) {
      for (const adminId of fleet_admin_ids) {
        await sendNotification({ recipient_id: adminId, recipient_type: RecipientType.FLEET_ADMIN, event_type: event.type, title: 'Payout processed', body: `Fleet payout of ${currency} ${amount.toLocaleString()} has been processed.`, data: { amount, currency }, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] })
      }
    }
  })

  onEvent(RIDO_EVENTS.DRIVER_JOINED_FLEET, async (event: RidoEvent) => {
    const { fleet_admin_ids, driver_name } = event.payload as { fleet_admin_ids: string[]; driver_name: string }
    for (const adminId of fleet_admin_ids) {
      await sendNotification({ recipient_id: adminId, recipient_type: RecipientType.FLEET_ADMIN, event_type: event.type, title: 'New driver joined', body: `${driver_name} has joined your fleet.`, data: event.payload as Record<string, unknown>, channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP] })
    }
  })

  onEvent(RIDO_EVENTS.DRIVER_SUSPENDED, async (event: RidoEvent) => {
    const { driver_id, fleet_admin_ids } = event.payload as { driver_id: string; fleet_admin_ids?: string[] }
    await sendNotification({ recipient_id: driver_id, recipient_type: RecipientType.DRIVER, event_type: event.type, title: 'Account suspended', body: 'Your driver account has been suspended. Please contact support.', data: event.payload as Record<string, unknown>, channels: [NotificationChannel.PUSH, NotificationChannel.SMS] })
    if (fleet_admin_ids?.length) {
      for (const adminId of fleet_admin_ids) {
        await sendNotification({ recipient_id: adminId, recipient_type: RecipientType.FLEET_ADMIN, event_type: event.type, title: 'Driver suspended', body: 'A driver in your fleet has been suspended.', data: event.payload as Record<string, unknown>, channels: [NotificationChannel.IN_APP] })
      }
    }
  })
}
