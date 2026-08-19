import Fastify from 'fastify'
import cors from '@fastify/cors'
import formbody from '@fastify/formbody'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'

import { ridoPlugin } from './rido'
import { shagoPlugin } from './shago'
import { adminRoutes } from './admin/routes'
import { startEventBus } from './events/event-bus'
import { registerNotificationHandlers } from './services/notification.service'
import { startEarningsAggregator } from './rido/workers/earnings-aggregator'
import { startWebhookRetryWorker } from './rido/workers/webhook-retry'
import { authenticate } from './middleware/auth'

import { shagoInternalV1Routes } from './shago/routes/internal/v1/index.js'

dotenv.config()

const server = Fastify({ logger: true })

// ─── Plugins ────────────────────────────────────────────────
server.register(cors, {
  origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3001'],
  credentials: true,
})
server.register(formbody)
server.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'change-me-in-production',
})
server.decorate('authenticate', authenticate)

// ─── Route namespaces ───────────────────────────────────────
server.register(ridoPlugin,   { prefix: '/api/rido/v1' })
server.register(shagoPlugin,  { prefix: '/api/shago/v1' })
server.register(adminRoutes,  { prefix: '/api/admin/v1' })
server.register(shagoInternalV1Routes, { prefix: '/internal/shago/v1' })

// ─── Health ─────────────────────────────────────────────────
server.get('/health', async () => ({
  success: true,
  message: 'Cybernet Platform API is running',
  version: '3.0.0',
  timestamp: new Date().toISOString(),
  platforms: ['rido', 'shago'],
}))

// Legacy health alias
server.get('/api/v1/health', async () => ({
  success: true, message: 'Cybernet Platform API is running', version: '3.0.0',
}))

// ─── Global error handler ────────────────────────────────────
server.setErrorHandler((error: any, _request, reply) => {
  const statusCode = (error as { statusCode?: number }).statusCode ?? 500
  server.log.error(error)
  reply.code(statusCode).send({
    success: false,
    error: statusCode < 500 ? (error as any).message : 'Internal server error',
  })
})

// ─── Boot ────────────────────────────────────────────────────
const start = async () => {
  try {
    await startEventBus()
    registerNotificationHandlers()
    startEarningsAggregator()
    startWebhookRetryWorker()

    const port = Number(process.env.PORT) || 3000
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Cybernet Platform v3.0 running on port ${port}`)
    console.log(`   RIDO API  → http://localhost:${port}/api/rido/v1`)
    console.log(`   SHAGO API → http://localhost:${port}/api/shago/v1`)
    console.log(`   Admin API → http://localhost:${port}/api/admin/v1`)
    console.log(`   SHAGO internal → http://localhost:${port}/internal/shago/v1`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

if (!process.env.VERCEL) {
  start()
}

export default async function handler(req: any, res: any) {
  try {
    await server.ready()
    server.server.emit('request', req, res)
  } catch (err: any) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }))
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate
  }
}
