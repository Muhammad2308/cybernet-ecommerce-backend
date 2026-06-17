import { FastifyInstance } from 'fastify'
import { ridoAuthRoutes } from './routes/auth'
import { ridoFleetRoutes } from './routes/fleet'
import { ridoNotificationRoutes } from './routes/notifications'

export async function ridoPlugin(server: FastifyInstance): Promise<void> {
  server.register(ridoAuthRoutes)
  server.register(ridoFleetRoutes)
  server.register(ridoNotificationRoutes)
}
