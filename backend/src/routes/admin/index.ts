import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { requireAdmin } from '../../middleware/auth'
import { generateApiKey, hashApiKey } from '../../lib/crypto'

export async function adminRoutes(server: FastifyInstance): Promise<void> {
  server.addHook('preHandler', requireAdmin)

  // ─── Platform overview ───────────────────────────────────────
  server.get('/admin/overview', async (_request, reply) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      totalFleets,
      activeFleets,
      totalDeliveries,
      deliveriesToday,
      platformRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.fleetCompany.count(),
      prisma.fleetCompany.count({ where: { status: 'ACTIVE' } }),
      prisma.delivery.count(),
      prisma.delivery.count({ where: { created_at: { gte: today } } }),
      prisma.deliveryEarning.aggregate({ _sum: { rido_commission_amount: true } }),
    ])

    return reply.send({
      success: true,
      data: {
        total_users: totalUsers,
        total_fleets: totalFleets,
        active_fleets: activeFleets,
        total_deliveries: totalDeliveries,
        deliveries_today: deliveriesToday,
        platform_revenue_total: platformRevenue._sum.rido_commission_amount ?? 0,
      },
    })
  })

  // ─── Manage service API keys (for SHAGO and other integrations) ─
  server.get('/admin/api-keys', async (_request, reply) => {
    const keys = await prisma.serviceApiKey.findMany({
      select: { id: true, name: true, service_name: true, is_active: true, created_at: true, last_used_at: true },
    })
    return reply.send({ success: true, data: keys })
  })

  server.post('/admin/api-keys', async (request, reply) => {
    const { name, service_name } = request.body as { name: string; service_name: string }

    const rawKey = generateApiKey()
    const keyHash = hashApiKey(rawKey)

    await prisma.serviceApiKey.create({ data: { name, service_name, key_hash: keyHash } })

    // Return raw key ONCE — it is never stored in plaintext
    return reply.code(201).send({ success: true, data: { api_key: rawKey, name, service_name } })
  })

  server.delete('/admin/api-keys/:keyId', async (request, reply) => {
    const { keyId } = request.params as { keyId: string }
    await prisma.serviceApiKey.update({ where: { id: keyId }, data: { is_active: false } })
    return reply.send({ success: true, message: 'API key deactivated' })
  })

  // ─── All deliveries ──────────────────────────────────────────
  server.get('/admin/deliveries', async (request, reply) => {
    const query = request.query as { page?: string; limit?: string; status?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '20'))
    const where = query.status ? { status: query.status as never } : {}

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          shipment: { select: { pickup_address: true, dropoff_address: true, category: true } },
          traveler: { select: { id: true, full_name: true, phone: true } },
          earning: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.delivery.count({ where }),
    ])

    return reply.send({
      success: true,
      data: deliveries,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  })

  // ─── SHAGO jobs overview ─────────────────────────────────────
  server.get('/admin/shago-jobs', async (request, reply) => {
    const query = request.query as { page?: string; limit?: string; status?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '20'))
    const where = query.status ? { status: query.status as never } : {}

    const [jobs, total] = await Promise.all([
      prisma.shagoJob.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.shagoJob.count({ where }),
    ])

    return reply.send({
      success: true,
      data: jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  })
}
