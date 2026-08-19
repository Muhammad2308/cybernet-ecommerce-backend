import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  findMatchingTripsForShipment,
  findMatchingShipmentsForTrip,
} from '../../services/matching.service'

const matchFilterSchema = z.object({
  max_pickup_distance_km: z.coerce.number().positive().optional(),
  max_dropoff_distance_km: z.coerce.number().positive().optional(),
})

export async function matchingRoutes(server: FastifyInstance): Promise<void> {
  // Find matching trips for a shipment
  server.get(
    '/shipments/:id/matches',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const query = matchFilterSchema.safeParse(request.query)

      try {
        const matches = await findMatchingTripsForShipment(
          id,
          query.success ? query.data : undefined
        )
        return reply.send({ success: true, data: matches })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )

  // Find matching shipments for a trip
  server.get(
    '/trips/:id/matches',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const query = matchFilterSchema.safeParse(request.query)

      try {
        const matches = await findMatchingShipmentsForTrip(
          id,
          query.success ? query.data : undefined
        )
        return reply.send({ success: true, data: matches })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )
}
