import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { requireAdmin } from '../../middleware/auth'
import { generateApiKey, hashApiKey } from '../../lib/crypto'

export async function adminRoutes(server: FastifyInstance): Promise<void> {
  server.addHook('preHandler', requireAdmin)

  server.get('/overview', async (_request, reply) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalUsers, totalFleets, activeFleets, totalDeliveries, deliveriesToday, platformRevenue, totalShagoJobs] = await Promise.all([
      prisma.user.count(),
      prisma.fleetCompany.count(),
      prisma.fleetCompany.count({ where: { status: 'ACTIVE' } }),
      prisma.delivery.count(),
      prisma.delivery.count({ where: { created_at: { gte: today } } }),
      prisma.deliveryEarning.aggregate({ _sum: { rido_commission_amount: true } }),
      prisma.shagoJob.count(),
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
        total_shago_jobs: totalShagoJobs,
      },
    })
  })

  // Users across both platforms
  server.get('/users', async (request, reply) => {
    const query = request.query as { role?: string; platform?: string; page?: string; limit?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '20'))

    const RIDO_ROLES = ['TRAVELER', 'LOGISTICS_ADMIN', 'SENDER']
    const SHAGO_ROLES = ['RETAILER', 'WHOLESALER', 'SALES_AGENT', 'LOGISTICS_AGENT', 'CONSUMER']

    const where: Record<string, unknown> = {}
    if (query.role) where['role'] = query.role
    else if (query.platform === 'rido') where['role'] = { in: RIDO_ROLES }
    else if (query.platform === 'shago') where['role'] = { in: SHAGO_ROLES }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, select: { id: true, full_name: true, email: true, phone: true, role: true, status: true, created_at: true }, orderBy: { created_at: 'desc' } }),
      prisma.user.count({ where }),
    ])
    return reply.send({ success: true, data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  })

  // Fleet companies (both RIDO and SHAGO)
  server.get('/fleets', async (request, reply) => {
    const query = request.query as { platform?: string; status?: string; page?: string; limit?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '20'))
    const where: Record<string, unknown> = {}
    if (query.platform) where['platform_type'] = query.platform.toUpperCase()
    if (query.status) where['status'] = query.status

    const [companies, total] = await Promise.all([
      prisma.fleetCompany.findMany({ where, skip: (page - 1) * limit, take: limit, include: { _count: { select: { driver_memberships: true } } }, orderBy: { created_at: 'desc' } }),
      prisma.fleetCompany.count({ where }),
    ])
    return reply.send({ success: true, data: companies, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  })

  // All deliveries
  server.get('/deliveries', async (request, reply) => {
    const query = request.query as { page?: string; limit?: string; status?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '20'))
    const where = query.status ? { status: query.status as never } : {}
    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({ where, skip: (page - 1) * limit, take: limit, include: { shipment: { select: { pickup_address: true, dropoff_address: true, category: true } }, traveler: { select: { id: true, full_name: true, phone: true } }, earning: true }, orderBy: { created_at: 'desc' } }),
      prisma.delivery.count({ where }),
    ])
    return reply.send({ success: true, data: deliveries, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  })

  // SHAGO jobs
  server.get('/shago-jobs', async (request, reply) => {
    const query = request.query as { page?: string; limit?: string; status?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '20'))
    const where = query.status ? { status: query.status as never } : {}
    const [jobs, total] = await Promise.all([
      prisma.shagoJob.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { created_at: 'desc' } }),
      prisma.shagoJob.count({ where }),
    ])
    return reply.send({ success: true, data: jobs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  })

  // API key management (for SHAGO service-to-service)
  server.get('/api-keys', async (_request, reply) => {
    const keys = await prisma.serviceApiKey.findMany({ select: { id: true, name: true, service_name: true, is_active: true, created_at: true, last_used_at: true } })
    return reply.send({ success: true, data: keys })
  })

  server.post('/api-keys', async (request, reply) => {
    const { name, service_name } = request.body as { name: string; service_name: string }
    const rawKey = generateApiKey()
    await prisma.serviceApiKey.create({ data: { name, service_name, key_hash: hashApiKey(rawKey) } })
    return reply.code(201).send({ success: true, data: { api_key: rawKey, name, service_name } })
  })

  server.delete('/api-keys/:keyId', async (request, reply) => {
    const { keyId } = request.params as { keyId: string }
    await prisma.serviceApiKey.update({ where: { id: keyId }, data: { is_active: false } })
    return reply.send({ success: true, message: 'API key deactivated' })
  })
}
