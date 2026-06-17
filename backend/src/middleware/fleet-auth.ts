import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'

export async function requireFleetAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    return void reply.code(401).send({ success: false, error: 'Unauthorized' })
  }

  const user = request.user
  if (user.role !== 'LOGISTICS_ADMIN' && user.role !== 'FLEET_ADMIN' && user.role !== 'ADMIN' && user.role !== 'CYBERNET_ADMIN') {
    return void reply.code(403).send({ success: false, error: 'Forbidden: fleet admin access required' })
  }

  // LOGISTICS_ADMIN / FLEET_ADMIN must belong to the requested fleet company
  if (user.role === 'LOGISTICS_ADMIN' || user.role === 'FLEET_ADMIN') {
    const params = request.params as Record<string, string>
    const fleetId = params.fleetId || user.fleet_company_id

    if (!fleetId) {
      return void reply.code(403).send({ success: false, error: 'No fleet company associated' })
    }

    const admin = await prisma.fleetCompanyAdmin.findUnique({
      where: { user_id_fleet_company_id: { user_id: user.sub, fleet_company_id: fleetId } },
    })

    if (!admin) {
      return void reply.code(403).send({ success: false, error: 'Forbidden: not an admin of this fleet' })
    }
  }
}
