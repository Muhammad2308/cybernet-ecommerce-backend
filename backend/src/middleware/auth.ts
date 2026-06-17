import { FastifyRequest, FastifyReply } from 'fastify'
import { JwtPayload } from '../lib/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    reply.code(401).send({ success: false, error: 'Unauthorized' })
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await authenticate(request, reply)
  if (reply.sent) return
  if (request.user.role !== 'ADMIN' && request.user.role !== 'CYBERNET_ADMIN') {
    reply.code(403).send({ success: false, error: 'Forbidden: admin access required' })
  }
}
