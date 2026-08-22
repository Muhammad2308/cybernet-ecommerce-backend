import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  createDelivery,
  confirmPickup,
  confirmDeliveryCompletion,
  getDeliveryDetails,
} from '../../services/delivery.service'

const createDeliverySchema = z.object({
  shipment_id: z.string().uuid(),
  trip_id: z.string().uuid(),
  agreed_price: z.number().positive(),
})

const verifyCodeSchema = z.object({
  code: z.string().length(6),
})

export async function deliveryRoutes(server: FastifyInstance): Promise<void> {
  // ─── Create Delivery Match & Escrow ───────────────────────────
  server.post(
    '/deliveries',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const body = createDeliverySchema.safeParse(request.body)
      if (!body.success) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed',
          details: body.error.flatten().fieldErrors,
        })
      }

      try {
        const result = await createDelivery({
          ...body.data,
          traveler_id: request.user.sub,
        } as any)
        return reply.code(201).send({ success: true, data: result })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )

  // ─── Get Delivery Details ─────────────────────────────────────
  server.get(
    '/deliveries/:id',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const delivery = await getDeliveryDetails(id)

      if (!delivery) {
        return reply.code(404).send({ success: false, error: 'Delivery not found' })
      }

      // Hide codes from non-participants
      const userId = request.user.sub
      const isParticipant =
        userId === delivery.traveler_id || userId === delivery.shipment.sender_id

      if (!isParticipant && request.user.role !== 'ADMIN') {
        return reply.code(403).send({ success: false, error: 'Access denied' })
      }

      return reply.send({ success: true, data: delivery })
    }
  )

  // ─── Confirm Pickup (OTP Verification) ───────────────────────
  server.post(
    '/deliveries/:id/pickup',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = verifyCodeSchema.safeParse(request.body)

      if (!body.success) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed: 6-digit OTP code required',
        })
      }

      try {
        const updated = await confirmPickup(id, body.data.code)
        return reply.send({
          success: true,
          message: 'Pickup confirmed successfully',
          data: updated,
        })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )

  // ─── Confirm Delivery Completion (OTP Verification & Payout) ──
  server.post(
    '/deliveries/:id/confirm',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = verifyCodeSchema.safeParse(request.body)

      if (!body.success) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed: 6-digit OTP code required',
        })
      }

      try {
        const updated = await confirmDeliveryCompletion(id, body.data.code)
        return reply.send({
          success: true,
          message: 'Delivery confirmed and escrow released successfully',
          data: updated,
        })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )

  // ─── Confirm Delivery via QR Code Scan ─────────────────────────
  server.post(
    '/deliveries/:id/verify-qr',
    { preHandler: [server.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const { qr_payload } = request.body as { qr_payload: string }

      if (!qr_payload) {
        return reply.code(400).send({
          success: false,
          error: 'Validation failed: qr_payload is required',
        })
      }

      try {
        const updated = await confirmDeliveryCompletion(id, qr_payload)
        return reply.send({
          success: true,
          message: 'QR Code verified successfully. Delivery confirmed and escrow released.',
          data: updated,
        })
      } catch (err: any) {
        return reply.code(400).send({ success: false, error: err.message })
      }
    }
  )
}
