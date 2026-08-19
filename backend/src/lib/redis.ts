import Redis from 'ioredis'

let redisClient: Redis | null = null

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
    redisClient.on('error', (err) => {
      console.error('[Redis] connection error:', err.message)
    })
  }
  return redisClient
}

export function createRedisSubscriber(): Redis {
  const sub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })
  sub.on('error', (err) => {
    console.error('[Redis Subscriber] connection error:', err.message)
  })
  return sub
}
