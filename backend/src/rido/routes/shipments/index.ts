import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  createShipment,
  getShipmentById,
  listShipments,
  updateShipment,
  cancelShipment,
} from '../../services/shipment.service'
import { PackageCategory, SizeBracket, WeightBracket, UrgencyLevel, ShipmentStatus } from '@prisma/client'
import { prisma } from '../../../lib/prisma'

const createShipmentSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.nativeEnum(PackageCategory),
  size: z.nativeEnum(SizeBracket),
  weight_bracket: z.nativeEnum(WeightBracket),
  weight_kg: z.number().positive(),
  urgency: z.nativeEnum(UrgencyLevel).optional(),
  pickup_address: z.string().min(3),
  pickup_lat: z.number().min(-90).max(90),
  pickup_lng: z.number().min(-180).max(180),
  dropoff_address: z.string().min(3),
  dropoff_lat: z.number().min(-90).max(90),
  dropoff_lng: z.number().min(-180).max(180),
  receiver_name: z.string().min(2),
  receiver_phone: z.string().min(8),
  receiver_id: z.string().uuid(),
  estimated_price: z.number().positive().optional(),
})

const updateShipmentSchema = createShipmentSchema.partial().extend({
  status: z.nativeEnum(ShipmentStatus).optional(),
})

const listQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.nativeEnum(ShipmentStatus).optional(),
  category: z.nativeEnum(PackageCategory).optional(),
  my_shipments_only: z.coerce.boolean().optional(),
})

export async function shipmentRoutes(server: FastifyInstance): Promise<void> {
  // ─── Create Shipment ──────────────────────────────────────────
  server.post(
    '/shipments',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const body = createShipmentSchema.safeParse(request.body)
      if (!body.success) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          details: body.error.flatten().fieldErrors,
        })
      }

      const sender_id = request.user.sub
      if (body.data.receiver_id === sender_id) {
        return reply.code(400).send({ success: false, error: 'Receiver must be a different registered user' })
      }
      const receiver = await prisma.user.findUnique({ where: { id: body.data.receiver_id } })
      if (!receiver || receiver.phone !== body.data.receiver_phone || receiver.full_name !== body.data.receiver_name) {
        return reply.code(400).send({ success: false, error: 'Receiver must be a registered user matching the supplied name and phone' })
      }
      const shipment = await createShipment({ ...body.data, sender_id } as any)

      return reply.code(201).send({ success: true, data: shipment })
    }
  )

  // ─── List Shipments ───────────────────────────────────────────
  server.get(
    '/shipments',
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

      const { page, limit, status, category, my_shipments_only } = query.data
      const sender_id = my_shipments_only !== false ? request.user.sub : undefined

      const result = await listShipments({
        sender_id,
        status,
        category,
        page,
        limit,
      })

      return reply.send({
        success: true,
        data: result.shipments,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      })
    }
  )

  // ─── Get Shipment Details ─────────────────────────────────────
  server.get(
    '/shipments/:id',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const shipment = await getShipmentById(id)

      if (!shipment) {
        return reply.code(404).send({ success: false, error: 'Shipment not found' })
      }

      return reply.send({ success: true, data: shipment })
    }
  )

  // ─── Update Shipment ──────────────────────────────────────────
  server.patch(
    '/shipments/:id',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = updateShipmentSchema.safeParse(request.body)
      if (!body.success) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          details: body.error.flatten().fieldErrors,
        })
      }

      try {
        const updated = await updateShipment(id, request.user.sub, body.data)
        return reply.send({ success: true, data: updated })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )

  // ─── Cancel Shipment ──────────────────────────────────────────
  server.post(
    '/shipments/:id/cancel',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      try {
        const cancelled = await cancelShipment(id, request.user.sub)
        return reply.send({ success: true, data: cancelled })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )
}
