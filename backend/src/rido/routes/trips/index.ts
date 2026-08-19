import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  createTrip,
  getTripById,
  listTrips,
  updateTrip,
  cancelTrip,
} from '../../services/trip.service'
import { VehicleType, TripStatus } from '@prisma/client'

const createTripSchema = z.object({
  origin_address: z.string().min(3),
  origin_lat: z.number().min(-90).max(90),
  origin_lng: z.number().min(-180).max(180),
  destination_address: z.string().min(3),
  destination_lat: z.number().min(-90).max(90),
  destination_lng: z.number().min(-180).max(180),
  vehicle_type: z.nativeEnum(VehicleType),
  available_capacity: z.number().positive(),
  departure_time: z.string().datetime({ offset: true }).or(z.string().datetime()),
  notes: z.string().optional(),
})

const updateTripSchema = createTripSchema.partial().extend({
  status: z.nativeEnum(TripStatus).optional(),
})

const listQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.nativeEnum(TripStatus).optional(),
  vehicle_type: z.nativeEnum(VehicleType).optional(),
  my_trips_only: z.coerce.boolean().optional(),
})

export async function tripRoutes(server: FastifyInstance): Promise<void> {
  // ─── Register Trip ────────────────────────────────────────────
  server.post(
    '/trips',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const body = createTripSchema.safeParse(request.body)
      if (!body.success) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          details: body.error.flatten().fieldErrors,
        })
      }

      const traveler_id = request.user.sub
      const trip = await createTrip({
        ...body.data,
        traveler_id,
      })

      return reply.code(201).send({ success: true, data: trip })
    }
  )

  // ─── List Trips ───────────────────────────────────────────────
  server.get(
    '/trips',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const query = listQuerySchema.safeParse(request.query)
      if (!query.success) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid query parameters',
          details: query.error.flatten().fieldErrors,
        })
      }

      const { page, limit, status, vehicle_type, my_trips_only } = query.data
      const traveler_id = my_trips_only ? request.user.sub : undefined

      const result = await listTrips({
        traveler_id,
        status,
        vehicle_type,
        page,
        limit,
      })

      return reply.send({
        success: true,
        data: result.trips,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      })
    }
  )

  // ─── Get Trip Details ─────────────────────────────────────────
  server.get(
    '/trips/:id',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const trip = await getTripById(id)

      if (!trip) {
        return reply.code(404).send({ success: false, error: 'Trip not found' })
      }

      return reply.send({ success: true, data: trip })
    }
  )

  // ─── Update Trip ──────────────────────────────────────────────
  server.patch(
    '/trips/:id',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = updateTripSchema.safeParse(request.body)
      if (!body.success) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          details: body.error.flatten().fieldErrors,
        })
      }

      try {
        const updated = await updateTrip(id, request.user.sub, body.data)
        return reply.send({ success: true, data: updated })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )

  // ─── Cancel Trip ──────────────────────────────────────────────
  server.post(
    '/trips/:id/cancel',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      try {
        const cancelled = await cancelTrip(id, request.user.sub)
        return reply.send({ success: true, data: cancelled })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )
}
