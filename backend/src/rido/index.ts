import { FastifyInstance } from 'fastify'
import { ridoAuthRoutes } from './routes/auth'
import { ridoFleetRoutes } from './routes/fleet'
import { ridoNotificationRoutes } from './routes/notifications'
import { shipmentRoutes } from './routes/shipments'
import { tripRoutes } from './routes/trips'
import { pricingRoutes } from './routes/pricing'
import { matchingRoutes } from './routes/matching'
import { deliveryRoutes } from './routes/deliveries'

export async function ridoPlugin(server: FastifyInstance): Promise<void> {
  server.register(ridoAuthRoutes)
  server.register(ridoFleetRoutes)
  server.register(ridoNotificationRoutes)
  server.register(shipmentRoutes)
  server.register(tripRoutes)
  server.register(pricingRoutes)
  server.register(matchingRoutes)
  server.register(deliveryRoutes)
}



