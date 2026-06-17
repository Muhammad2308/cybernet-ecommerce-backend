import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { hashApiKey } from '../lib/crypto'

declare module 'fastify' {
  interface FastifyRequest {
    serviceKey?: { id: string; service_name: string }
  }
}

export async function requireServiceKey(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers['x-api-key'] as string | undefined

  if (!authHeader) {
    return void reply.code(401).send({ success: false, error: 'Missing X-Api-Key header' })
  }

  const keyHash = hashApiKey(authHeader)
  const record = await prisma.serviceApiKey.findUnique({ where: { key_hash: keyHash } })

  if (!record || !record.is_active) {
    return void reply.code(401).send({ success: false, error: 'Invalid or inactive API key' })
  }

  // Update last_used_at non-blockingly
  prisma.serviceApiKey
    .update({ where: { id: record.id }, data: { last_used_at: new Date() } })
    .catch(() => {})

  request.serviceKey = { id: record.id, service_name: record.service_name }
}
