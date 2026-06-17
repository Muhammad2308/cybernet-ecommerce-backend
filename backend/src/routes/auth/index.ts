import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { signToken } from '../../lib/jwt'

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  full_name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(['SENDER', 'TRAVELER']),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function authRoutes(server: FastifyInstance): Promise<void> {
  server.post('/auth/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ success: false, error: 'Validation failed', details: body.error.flatten().fieldErrors })
    }

    const { email, phone, full_name, password, role } = body.data

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } })
    if (existing) {
      return reply.code(409).send({ success: false, error: 'Email or phone already registered' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, phone, full_name, password_hash, role },
      select: { id: true, email: true, phone: true, full_name: true, role: true, status: true, created_at: true },
    })

    const token = signToken(server, { sub: user.id, email: user.email, role: user.role })

    return reply.code(201).send({ success: true, data: { user, token } })
  })

  server.post('/auth/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ success: false, error: 'Validation failed' })
    }

    const { email, password } = body.data
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return reply.code(401).send({ success: false, error: 'Invalid credentials' })
    }

    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return reply.code(403).send({ success: false, error: 'Account is not active' })
    }

    // Include fleet_company_id for FLEET_ADMIN users
    let fleet_company_id: string | undefined
    if (user.role === 'FLEET_ADMIN') {
      const admin = await prisma.fleetCompanyAdmin.findFirst({ where: { user_id: user.id } })
      fleet_company_id = admin?.fleet_company_id
    }

    const token = signToken(server, {
      sub: user.id,
      email: user.email,
      role: user.role,
      fleet_company_id,
    })

    const { password_hash: _, ...safeUser } = user

    return reply.send({ success: true, data: { user: safeUser, token } })
  })

  server.get('/auth/me', { preHandler: [server.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      select: {
        id: true, email: true, phone: true, full_name: true, role: true,
        status: true, tier: true, avatar_url: true, is_verified: true, created_at: true,
        fleet_membership: { include: { fleet_company: true } },
        fleet_admin_of: { include: { fleet_company: true } },
      },
    })

    if (!user) return reply.code(404).send({ success: false, error: 'User not found' })

    return reply.send({ success: true, data: user })
  })
}
