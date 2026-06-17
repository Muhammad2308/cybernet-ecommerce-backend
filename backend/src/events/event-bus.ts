import { getRedis, createRedisSubscriber } from '../lib/redis'
import { RidoEvent, RidoEventType, REDIS_EVENTS_CHANNEL } from './event-types'
import { prisma } from '../lib/prisma'

type EventHandler = (event: RidoEvent) => Promise<void>

const handlers = new Map<string, EventHandler[]>()
let subscriber: ReturnType<typeof createRedisSubscriber> | null = null

export async function publishEvent<T>(
  type: RidoEventType,
  payload: T,
  source = 'system',
): Promise<void> {
  const event: RidoEvent<T> = {
    type,
    payload,
    timestamp: new Date().toISOString(),
    source,
  }

  // Persist to DB for audit trail (fire-and-forget, non-blocking)
  prisma.notificationEvent
    .create({ data: { event_type: type, source, payload: payload as object } })
    .catch((err) => console.error('[EventBus] failed to persist event:', err.message))

  await getRedis().publish(REDIS_EVENTS_CHANNEL, JSON.stringify(event))
}

export function onEvent(eventType: RidoEventType | '*', handler: EventHandler): void {
  const key = eventType
  if (!handlers.has(key)) handlers.set(key, [])
  handlers.get(key)!.push(handler)
}

export async function startEventBus(): Promise<void> {
  subscriber = createRedisSubscriber()

  await subscriber.subscribe(REDIS_EVENTS_CHANNEL)

  subscriber.on('message', (_channel: string, message: string) => {
    try {
      const event: RidoEvent = JSON.parse(message)

      const specificHandlers = handlers.get(event.type) ?? []
      const wildcardHandlers = handlers.get('*') ?? []

      for (const handler of [...specificHandlers, ...wildcardHandlers]) {
        handler(event).catch((err) =>
          console.error(`[EventBus] handler error for ${event.type}:`, err.message),
        )
      }
    } catch (err) {
      console.error('[EventBus] failed to parse event message:', err)
    }
  })

  console.log('[EventBus] started, listening on channel:', REDIS_EVENTS_CHANNEL)
}
