import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { calculateShipmentPrice } from '../../services/pricing.service'
import { SizeBracket, WeightBracket, UrgencyLevel, VehicleType } from '@prisma/client'

const estimatePriceSchema = z.object({
  pickup_lat: z.number().min(-90).max(90),
  pickup_lng: z.number().min(-180).max(180),
  dropoff_lat: z.number().min(-90).max(90),
  dropoff_lng: z.number().min(-180).max(180),
  weight_bracket: z.nativeEnum(WeightBracket),
  size: z.nativeEnum(SizeBracket),
  urgency: z.nativeEnum(UrgencyLevel).optional(),
  vehicle_type: z.nativeEnum(VehicleType).optional(),
  currency: z.string().optional(),
})

export async function pricingRoutes(server: FastifyInstance): Promise<void> {
  server.post(
    '/pricing/estimate',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const body = estimatePriceSchema.safeParse(request.body)
      if (!body.success) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          details: body.error.flatten().fieldErrors,
        })
      }

      const breakdown = await calculateShipmentPrice(body.data as any)
      return reply.send({ success: true, data: breakdown })
    }
  )
}
