export const RIDO_EVENTS = {
  DELIVERY_CONFIRMED: 'delivery.confirmed',
  DELIVERY_PICKED_UP: 'delivery.picked_up',
  DELIVERY_IN_TRANSIT: 'delivery.in_transit',
  DELIVERY_ARRIVED: 'delivery.arrived',
  DELIVERY_FAILED: 'delivery.failed',
  DISPUTE_FILED: 'dispute.filed',
  DISPUTE_RESOLVED: 'dispute.resolved',
  PAYOUT_PROCESSED: 'payout.processed',
  DRIVER_JOINED_FLEET: 'driver.joined_fleet',
  DRIVER_SUSPENDED: 'driver.suspended',
  JOB_ASSIGNED: 'job.assigned',
  JOB_POSTED: 'job.posted',
} as const

export type RidoEventType = (typeof RIDO_EVENTS)[keyof typeof RIDO_EVENTS]

export type RidoEvent<T = Record<string, unknown>> = {
  type: RidoEventType
  payload: T
  timestamp: string
  source: string
}

export const REDIS_EVENTS_CHANNEL = 'rido:events'
