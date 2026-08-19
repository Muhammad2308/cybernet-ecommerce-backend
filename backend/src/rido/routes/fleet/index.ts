import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { requireAdmin } from '../../../middleware/auth'
import { requireFleetAdmin } from '../../../middleware/fleet-auth'
import {
  registerFleetCompany, approveFleetCompany, suspendFleetCompany,
  addFleetAdmin, createFleetInvite, acceptFleetInvite,
  removeDriverFromFleet, suspendFleetDriver, getFleetDrivers, getFleetOverview,
} from '../../services/fleet.service'
import { getFleetEarningsSummary } from '../../services/earnings.service'
import { publishEvent } from '../../../events/event-bus'
import { RIDO_EVENTS } from '../../../events/event-types'

const registerSchema = z.object({
  company_name: z.string().min(2),
  registration_number: z.string().min(4),
  contact_person: z.string().min(2),
  contact_email: z.string().email(),
  contact_phone: z.string().min(10),
  address: z.string(),
  city: z.string(),
  country: z.string().optional(),
  logo_url: z.string().url().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
})

export async function ridoFleetRoutes(server: FastifyInstance): Promise<void> {
  server.post('/fleet/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'Validation failed', details: body.error.flatten().fieldErrors })
    const company = await registerFleetCompany({ ...body.data, platform_type: 'RIDO' } as any).catch((err) => {
      if (err.code === 'P2002') throw Object.assign(new Error('Registration number or email already exists'), { statusCode: 409 })
      throw err
    })
    return reply.code(201).send({ success: true, data: company })
  })

  server.get('/fleet', { preHandler: [requireAdmin] }, async (request, reply) => {
    const query = request.query as { status?: string; page?: string; limit?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(50, parseInt(query.limit ?? '20'))
    const where: Record<string, unknown> = { platform_type: 'RIDO' }
    if (query.status) where['status'] = query.status

    const [companies, total] = await Promise.all([
      prisma.fleetCompany.findMany({ where, skip: (page - 1) * limit, take: limit, include: { _count: { select: { driver_memberships: true } } }, orderBy: { created_at: 'desc' } }),
      prisma.fleetCompany.count({ where }),
    ])
    return reply.send({ success: true, data: companies, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  })

  server.patch('/fleet/:fleetId/approve', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    return reply.send({ success: true, data: await approveFleetCompany(fleetId) })
  })

  server.patch('/fleet/:fleetId/suspend', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    return reply.send({ success: true, data: await suspendFleetCompany(fleetId) })
  })

  server.post('/fleet/:fleetId/admins', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    const { user_id } = request.body as { user_id: string }
    await addFleetAdmin(user_id, fleetId)
    return reply.code(201).send({ success: true, message: 'Fleet admin added' })
  })

  server.get('/fleet/:fleetId/overview', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    return reply.send({ success: true, data: await getFleetOverview(fleetId) })
  })

  server.get('/fleet/:fleetId/drivers', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    const query = request.query as { status?: string; vehicleType?: string }
    return reply.send({ success: true, data: await getFleetDrivers(fleetId, { status: query.status as never, vehicleType: query.vehicleType }) })
  })

  server.patch('/fleet/:fleetId/drivers/:driverId/suspend', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { driverId, fleetId } = request.params as { driverId: string; fleetId: string }
    await suspendFleetDriver(driverId)
    const admins = await prisma.fleetCompanyAdmin.findMany({ where: { fleet_company_id: fleetId } })
    await publishEvent(RIDO_EVENTS.DRIVER_SUSPENDED, { driver_id: driverId, fleet_admin_ids: admins.map((a) => a.user_id) })
    return reply.send({ success: true, message: 'Driver suspended' })
  })

  server.delete('/fleet/:fleetId/drivers/:driverId', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { driverId } = request.params as { driverId: string }
    await removeDriverFromFleet(driverId)
    return reply.send({ success: true, message: 'Driver removed from fleet' })
  })

  server.post('/fleet/:fleetId/invites', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    return reply.code(201).send({ success: true, data: await createFleetInvite(fleetId, request.user.sub) })
  })

  server.post('/fleet/invites/:code/accept', { preHandler: [server.authenticate] }, async (request, reply) => {
    const { code } = request.params as { code: string }
    const fleetCompanyId = await acceptFleetInvite(code, request.user.sub)
    const driver = await prisma.user.findUnique({ where: { id: request.user.sub }, select: { full_name: true } })
    const admins = await prisma.fleetCompanyAdmin.findMany({ where: { fleet_company_id: fleetCompanyId } })
    await publishEvent(RIDO_EVENTS.DRIVER_JOINED_FLEET, {
      driver_id: request.user.sub, driver_name: driver?.full_name ?? 'A driver',
      fleet_company_id: fleetCompanyId, fleet_admin_ids: admins.map((a) => a.user_id),
    })
    return reply.send({ success: true, message: 'Joined fleet', data: { fleet_company_id: fleetCompanyId } })
  })

  server.get('/fleet/:fleetId/earnings', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    const query = request.query as { from?: string; to?: string }
    const to = query.to ? new Date(query.to) : new Date()
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return reply.send({ success: true, data: await getFleetEarningsSummary(fleetId, from, to) })
  })

  server.get('/fleet/:fleetId/deliveries', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    const query = request.query as { page?: string; limit?: string; from?: string; to?: string; driver_id?: string; status?: string }
    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, parseInt(query.limit ?? '20'))
    const where: Record<string, unknown> = { fleet_company_id: fleetId }
    if (query.driver_id) where['driver_id'] = query.driver_id
    if (query.status) where['status'] = query.status
    if (query.from || query.to) where['created_at'] = { ...(query.from && { gte: new Date(query.from) }), ...(query.to && { lte: new Date(query.to) }) }
    const [earnings, total] = await Promise.all([
      prisma.deliveryEarning.findMany({ where, skip: (page - 1) * limit, take: limit, include: { delivery: { include: { shipment: { select: { pickup_address: true, dropoff_address: true } } } } }, orderBy: { created_at: 'desc' } }),
      prisma.deliveryEarning.count({ where }),
    ])
    return reply.send({ success: true, data: earnings, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  })

  server.get('/fleet/:fleetId/drivers/locations', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    const memberships = await prisma.fleetDriverMembership.findMany({ where: { fleet_company_id: fleetId, status: 'ACTIVE' }, select: { driver_id: true } })
    const driverIds = memberships.map((m) => m.driver_id)
    const locations = await prisma.locationPing.findMany({
      where: { user_id: { in: driverIds }, created_at: { gte: new Date(Date.now() - 30_000) } },
      orderBy: { created_at: 'desc' }, distinct: ['user_id'],
      include: { user: { select: { id: true, full_name: true } } },
    })
    return reply.send({ success: true, data: locations })
  })

  server.post('/fleet/:fleetId/webhooks', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    const body = request.body as { url: string; events: string[]; secret: string }
    const endpoint = await prisma.webhookEndpoint.create({ data: { fleet_company_id: fleetId, integration_name: 'FLEET', url: body.url, secret: body.secret, events: body.events } })
    return reply.code(201).send({ success: true, data: endpoint })
  })

  server.get('/fleet/:fleetId/webhooks', { preHandler: [requireFleetAdmin] }, async (request, reply) => {
    const { fleetId } = request.params as { fleetId: string }
    return reply.send({ success: true, data: await prisma.webhookEndpoint.findMany({ where: { fleet_company_id: fleetId } }) })
  })
}
