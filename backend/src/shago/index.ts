import { FastifyInstance } from 'fastify'
import { shagoAuthRoutes } from './routes/auth'
import { shagoInternalV1Routes } from './routes/internal/v1'

export async function shagoPlugin(server: FastifyInstance): Promise<void> {
  server.register(shagoAuthRoutes)
  server.register(shagoInternalV1Routes, { prefix: '/internal/v1' })
}
