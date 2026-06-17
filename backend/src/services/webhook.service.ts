import { prisma } from '../lib/prisma'
import { signWebhookPayload } from '../lib/crypto'
import { WebhookDeliveryStatus } from '@prisma/client'

const RETRY_DELAYS_MS = [30_000, 120_000, 600_000, 3_600_000, 86_400_000]

export type WebhookEventPayload = {
  shago_order_id?: string
  rido_job_id: string
  event_type: string
  timestamp: string
  payload: Record<string, unknown>
}

export async function dispatchWebhook(
  endpointId: string,
  eventType: string,
  eventPayload: Record<string, unknown>,
  attemptNumber = 1,
): Promise<void> {
  const endpoint = await prisma.webhookEndpoint.findUnique({ where: { id: endpointId } })
  if (!endpoint || !endpoint.is_active) return

  const body: WebhookEventPayload = {
    rido_job_id: (eventPayload.rido_job_id as string) ?? '',
    shago_order_id: eventPayload.shago_order_id as string | undefined,
    event_type: eventType,
    timestamp: new Date().toISOString(),
    payload: eventPayload,
  }

  const bodyStr = JSON.stringify(body)
  const signature = signWebhookPayload(bodyStr, endpoint.secret)

  const log = await prisma.webhookDeliveryLog.create({
    data: { webhook_endpoint_id: endpointId, event_type: eventType, payload: body as object, attempt_number: attemptNumber, status: WebhookDeliveryStatus.PENDING },
  })

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Rido-Signature': signature, 'X-Rido-Event': eventType },
      body: bodyStr,
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const responseBody = await response.text().catch(() => '')

    if (response.ok) {
      await prisma.webhookDeliveryLog.update({ where: { id: log.id }, data: { status: WebhookDeliveryStatus.DELIVERED, response_code: response.status, response_body: responseBody.slice(0, 1000) } })
      await prisma.webhookEndpoint.update({ where: { id: endpointId }, data: { failure_count: 0, last_failure_at: null } })
    } else {
      await scheduleRetry(log.id, endpointId, attemptNumber, response.status, responseBody)
    }
  } catch (err) {
    await scheduleRetry(log.id, endpointId, attemptNumber, null, err instanceof Error ? err.message : String(err))
  }
}

async function scheduleRetry(logId: string, endpointId: string, attemptNumber: number, responseCode: number | null, responseBody: string): Promise<void> {
  const nextAttempt = attemptNumber + 1
  const hasMoreRetries = nextAttempt <= RETRY_DELAYS_MS.length + 1

  await prisma.webhookEndpoint.update({
    where: { id: endpointId },
    data: { failure_count: { increment: 1 }, last_failure_at: new Date(), ...(attemptNumber >= 5 && { is_active: false }) },
  })

  if (hasMoreRetries) {
    const delayMs = RETRY_DELAYS_MS[attemptNumber - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]
    await prisma.webhookDeliveryLog.update({ where: { id: logId }, data: { status: WebhookDeliveryStatus.RETRY, response_code: responseCode, response_body: responseBody.slice(0, 1000), next_retry_at: new Date(Date.now() + delayMs) } })
  } else {
    await prisma.webhookDeliveryLog.update({ where: { id: logId }, data: { status: WebhookDeliveryStatus.FAILED, response_code: responseCode, response_body: responseBody.slice(0, 1000) } })
  }
}

export async function dispatchToIntegration(integrationName: string, fleetCompanyId: string | null, eventType: string, payload: Record<string, unknown>): Promise<void> {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { is_active: true, integration_name: integrationName, ...(fleetCompanyId ? { fleet_company_id: fleetCompanyId } : {}), events: { has: eventType } },
  })
  await Promise.all(endpoints.map((ep) => dispatchWebhook(ep.id, eventType, payload)))
}

export async function processPendingRetries(): Promise<void> {
  const pending = await prisma.webhookDeliveryLog.findMany({
    where: { status: WebhookDeliveryStatus.RETRY, next_retry_at: { lte: new Date() } },
    include: { webhook_endpoint: true },
  })
  await Promise.all(pending.map((log) => dispatchWebhook(log.webhook_endpoint_id, log.event_type, log.payload as Record<string, unknown>, log.attempt_number + 1)))
}
