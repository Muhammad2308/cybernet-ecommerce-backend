import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { authenticate } from '../../../middleware/auth'

const prefSchema = z.object({
  event_type: z.string(),
  channel: z.enum(['PUSH', 'SMS', 'EMAIL', 'IN_APP', 'WEBHOOK']),
  enabled: z.boolean(),
  quiet_hours_start: z.number().min(0).max(23).optional(),
  quiet_hours_end: z.number().min(0).max(23).optional(),
})

export async function ridoNotificationRoutes(server: FastifyInstance): Promise<void> {
  server.get('/notifications', { preHandler: [authenticate] }, async (request, reply) => {
    const query = request.query as { page?: string; limit?: string; unread?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(50, parseInt(query.limit ?? '20'))
    const where: Record<string, unknown> = { recipient_id: request.user.sub, channel: 'IN_APP' }
    if (query.unread === 'true') where['read_at'] = null
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { created_at: 'desc' } }),
      prisma.notification.count({ where }),
    ])
    return reply.send({ success: true, data: notifications, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  })

  server.patch('/notifications/:id/read', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.notification.updateMany({ where: { id, recipient_id: request.user.sub }, data: { read_at: new Date() } })
    return reply.send({ success: true })
  })

  server.patch('/notifications/read-all', { preHandler: [authenticate] }, async (request, reply) => {
    await prisma.notification.updateMany({ where: { recipient_id: request.user.sub, read_at: null }, data: { read_at: new Date() } })
    return reply.send({ success: true })
  })

  server.get('/notifications/preferences', { preHandler: [authenticate] }, async (request, reply) => {
    return reply.send({ success: true, data: await prisma.notificationPreference.findMany({ where: { user_id: request.user.sub } }) })
  })

  server.put('/notifications/preferences', { preHandler: [authenticate] }, async (request, reply) => {
    const body = prefSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'Validation failed' })
    const { event_type, channel, enabled, quiet_hours_start, quiet_hours_end } = body.data
    const pref = await prisma.notificationPreference.upsert({
      where: { user_id_event_type_channel: { user_id: request.user.sub, event_type, channel: channel as never } },
      update: { enabled, quiet_hours_start, quiet_hours_end },
      create: { user_id: request.user.sub, event_type, channel: channel as never, enabled, quiet_hours_start, quiet_hours_end },
    })
    return reply.send({ success: true, data: pref })
  })
}
