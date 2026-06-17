import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireServiceKey } from '../../../../middleware/service-key-auth'
import {
  dispatchShagoJob,
  getShagoJobStatus,
  confirmShagoDelivery,
  fileShagoDispute,
} from '../../../../services/shago.service'

const dispatchSchema = z.object({
  shago_order_id: z.string(),
  pickup_address: z.string(),
  pickup_lat: z.number(),
  pickup_lng: z.number(),
  dropoff_address: z.string(),
  dropoff_lat: z.number(),
  dropoff_lng: z.number(),
  parcel_details: z.record(z.unknown()),
  order_number_tag: z.string(),
  requested_delivery_window: z.string().optional(),
  declared_value: z.number().positive(),
  payment_held_in_escrow: z.boolean(),
  escrow_amount: z.number().optional(),
})

const disputeSchema = z.object({
  reason: z.string(),
  evidence_urls: z.array(z.string()).optional().default([]),
  disputed_amount: z.number().positive(),
})

export async function shagoV1Routes(server: FastifyInstance): Promise<void> {
  // All SHAGO internal routes require service API key
  server.addHook('preHandler', requireServiceKey)

  // POST /internal/shago/v1/dispatch
  server.post('/dispatch', async (request, reply) => {
    const body = dispatchSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({
        success: false,
        error: 'Validation failed',
        details: body.error.flatten().fieldErrors,
      })
    }

    const result = await dispatchShagoJob(body.data)

    if (result.duplicate) {
      return reply.code(200).send({
        success: true,
        data: result,
        message: 'Job already exists — returning existing record',
      })
    }

    return reply.code(201).send({ success: true, data: result })
  })

  // GET /internal/shago/v1/jobs/:ridoJobId/status
  server.get('/jobs/:ridoJobId/status', async (request, reply) => {
    const { ridoJobId } = request.params as { ridoJobId: string }
    const status = await getShagoJobStatus(ridoJobId)

    if (!status) {
      return reply.code(404).send({ success: false, error: 'Job not found' })
    }

    return reply.send({ success: true, data: status })
  })

  // POST /internal/shago/v1/jobs/:ridoJobId/confirm-delivery
  server.post('/jobs/:ridoJobId/confirm-delivery', async (request, reply) => {
    const { ridoJobId } = request.params as { ridoJobId: string }

    const result = await confirmShagoDelivery(ridoJobId).catch((err) => {
      throw Object.assign(new Error(err.message), { statusCode: 422 })
    })

    return reply.send({ success: true, data: result })
  })

  // POST /internal/shago/v1/jobs/:ridoJobId/dispute
  server.post('/jobs/:ridoJobId/dispute', async (request, reply) => {
    const { ridoJobId } = request.params as { ridoJobId: string }

    const body = disputeSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ success: false, error: 'Validation failed' })
    }

    const result = await fileShagoDispute(ridoJobId, body.data).catch((err) => {
      throw Object.assign(new Error(err.message), { statusCode: 422 })
    })

    return reply.send({ success: true, data: result })
  })
}
