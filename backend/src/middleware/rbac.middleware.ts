import { FastifyRequest, FastifyReply } from 'fastify'
import { JwtPayload } from '../lib/jwt'

type RoleName =
  | 'SENDER'
  | 'RECEIVER'
  | 'TRAVELER'
  | 'LOGISTICS_ADMIN'
  | 'RECEIVER_HUB'
  | 'FLEET_ADMIN'
  | 'CYBERNET_ADMIN'
  | 'ADMIN'

/**
 * RBAC middleware factory — restricts route access to one or more roles.
 *
 * Usage:
 *   { preHandler: [server.authenticate, requireRole('SENDER', 'TRAVELER')] }
 */
export function requireRole(...allowedRoles: RoleName[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.user as JwtPayload
    if (!user) {
      reply.code(401).send({ success: false, error: 'Unauthorized' })
      return
    }

    // CYBERNET_ADMIN and ADMIN always have access
    if (user.role === 'CYBERNET_ADMIN' || user.role === 'ADMIN') return

    if (!allowedRoles.includes(user.role as RoleName)) {
      reply.code(403).send({
        success: false,
        error: `Forbidden: requires one of [${allowedRoles.join(', ')}]`,
      })
    }
  }
}

/**
 * Fleet-scoped middleware — ensures the requesting user belongs to the
 * fleet company referenced in the route (via :fleetCompanyId param or body).
 *
 * Usage:
 *   { preHandler: [server.authenticate, requireRole('FLEET_ADMIN', 'LOGISTICS_ADMIN'), requireFleetScope()] }
 */
export function requireFleetScope() {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.user as JwtPayload

    // CYBERNET_ADMIN / ADMIN bypass fleet scoping
    if (user.role === 'CYBERNET_ADMIN' || user.role === 'ADMIN') return

    const params = request.params as Record<string, string>
    const body = request.body as Record<string, string> | undefined

    const targetFleetId = params?.fleetCompanyId || params?.fleet_company_id || body?.fleet_company_id

    if (!targetFleetId) {
      reply.code(400).send({ success: false, error: 'fleet_company_id is required' })
      return
    }

    if (user.fleet_company_id && user.fleet_company_id !== targetFleetId) {
      reply.code(403).send({
        success: false,
        error: 'Forbidden: you do not belong to this fleet company',
      })
    }
  }
}

/**
 * Receiver Hub scoped middleware — ensures the requesting user has RECEIVER_HUB role.
 *
 * Usage:
 *   { preHandler: [server.authenticate, requireHubScope()] }
 */
export function requireHubScope() {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.user as JwtPayload

    // CYBERNET_ADMIN / ADMIN bypass
    if (user.role === 'CYBERNET_ADMIN' || user.role === 'ADMIN') return

    if (user.role !== 'RECEIVER_HUB') {
      reply.code(403).send({
        success: false,
        error: 'Forbidden: receiver hub access required',
      })
    }
  }
}
