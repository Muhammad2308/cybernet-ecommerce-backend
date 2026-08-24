import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { signAccessToken } from '../../../lib/jwt'
import { sendOtp, verifyOtp } from '../../../services/otp.service'
import { createDeviceSession, revokeDeviceSession, rotateDeviceSession } from '../../../services/device-session.service'

const individualRoleSchema = z.enum(['CUSTOMER', 'TRAVELER'])
const deviceSchema = z.object({ device_id: z.string().min(16).max(255), device_name: z.string().max(120).optional(), platform: z.enum(['ios', 'android']).optional() })
const registerSchema = z.object({ email: z.string().email(), phone: z.string().min(10), full_name: z.string().min(2), password: z.string().min(8), roles: z.array(individualRoleSchema).min(1).max(2).refine((roles) => new Set(roles).size === roles.length), device: deviceSchema })
const loginSchema = z.object({ email: z.string().email(), password: z.string(), device: deviceSchema })
const otpSchema = z.object({ phone: z.string().min(10) })
const verifyOtpSchema = z.object({ phone: z.string().min(10), code: z.string().length(6), full_name: z.string().min(2).optional(), roles: z.array(individualRoleSchema).min(1).max(2).optional(), device: deviceSchema })
const sessionSchema = z.object({ refresh_token: z.string().min(32), device_id: z.string().min(16).max(255) })

function primaryRole(roles: string[]) { return roles.includes('TRAVELER') ? 'TRAVELER' : 'SENDER' }

async function issueMobileSession(server: FastifyInstance, user: { id: string; email: string; role: string }, device: z.infer<typeof deviceSchema>) {
  const fleetCompanyId = user.role === 'LOGISTICS_ADMIN' ? (await prisma.fleetCompanyAdmin.findFirst({ where: { user_id: user.id }, select: { fleet_company_id: true } }))?.fleet_company_id : undefined
  const access_token = signAccessToken(server, { sub: user.id, email: user.email, role: user.role, fleet_company_id: fleetCompanyId })
  const session = await createDeviceSession(user.id, device.device_id, device.device_name, device.platform)
  return { access_token, refresh_token: session.refresh_token, session_expires_at: session.expires_at }
}

function safeUser(user: { password_hash: string } & Record<string, unknown>) { const { password_hash: _, ...result } = user; return result }

export async function ridoAuthRoutes(server: FastifyInstance): Promise<void> {
  server.post('/auth/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'Validation failed', details: body.error.flatten().fieldErrors })
    const { email, phone, full_name, password, roles, device } = body.data
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } })
    if (existing) return reply.code(409).send({ success: false, error: 'Email or phone already registered' })
    const user = await prisma.user.create({ data: { email, phone, full_name, password_hash: await bcrypt.hash(password, 12), role: primaryRole(roles), individual_roles: roles, status: 'ACTIVE' } })
    return reply.code(201).send({ success: true, data: { user: safeUser(user), ...(await issueMobileSession(server, user, device)) } })
  })

  server.post('/auth/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'Validation failed' })
    const user = await prisma.user.findUnique({ where: { email: body.data.email } })
    if (!user || !user.password_hash || !(await bcrypt.compare(body.data.password, user.password_hash))) return reply.code(401).send({ success: false, error: 'Invalid credentials' })
    if (user.status !== 'ACTIVE') return reply.code(403).send({ success: false, error: 'Account is not active' })
    return reply.send({ success: true, data: { user: safeUser(user), ...(await issueMobileSession(server, user, body.data.device)) } })
  })

  server.post('/auth/send-otp', async (request, reply) => {
    const body = otpSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'A valid phone number is required' })
    const result = await sendOtp(body.data.phone)
    return reply.code(result.success ? 200 : 429).send({ success: result.success, message: result.message })
  })

  server.post('/auth/verify-otp', async (request, reply) => {
    const body = verifyOtpSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'Validation failed', details: body.error.flatten().fieldErrors })
    const verified = await verifyOtp(body.data.phone, body.data.code)
    if (!verified.valid) return reply.code(400).send({ success: false, error: verified.error })
    let user = await prisma.user.findUnique({ where: { phone: body.data.phone } })
    if (!user) {
      const roles = body.data.roles ?? ['CUSTOMER']
      user = await prisma.user.create({ data: { phone: body.data.phone, email: `${body.data.phone}@rido.placeholder`, full_name: body.data.full_name ?? `User ${body.data.phone.slice(-4)}`, password_hash: '', role: primaryRole(roles), individual_roles: roles, status: 'ACTIVE' } })
    }
    if (user.status !== 'ACTIVE') return reply.code(403).send({ success: false, error: 'Account is not active' })
    return reply.send({ success: true, data: { user: safeUser(user), ...(await issueMobileSession(server, user, body.data.device)) } })
  })

  // App startup: a device-held refresh token silently restores the session and redirects to dashboard.
  server.post('/auth/session', async (request, reply) => {
    const body = sessionSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'device_id and refresh_token are required' })
    const result = await rotateDeviceSession(body.data.device_id, body.data.refresh_token)
    if (!result || result.user.status !== 'ACTIVE') return reply.code(401).send({ success: false, error: 'Session is expired or invalid; sign in again' })
    const access_token = signAccessToken(server, { sub: result.user.id, email: result.user.email, role: result.user.role })
    return reply.send({ success: true, data: { user: safeUser(result.user), access_token, refresh_token: result.refresh_token, session_expires_at: result.expires_at } })
  })
  server.post('/auth/refresh', async (request, reply) => {
    const body = sessionSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'device_id and refresh_token are required' })
    const result = await rotateDeviceSession(body.data.device_id, body.data.refresh_token)
    if (!result || result.user.status !== 'ACTIVE') return reply.code(401).send({ success: false, error: 'Session is expired or invalid; sign in again' })
    const access_token = signAccessToken(server, { sub: result.user.id, email: result.user.email, role: result.user.role })
    return reply.send({ success: true, data: { user: safeUser(result.user), access_token, refresh_token: result.refresh_token, session_expires_at: result.expires_at } })
  })

  server.post('/auth/logout', { preHandler: [server.authenticate] }, async (request, reply) => {
    const body = z.object({ device_id: z.string().min(16).max(255) }).safeParse(request.body)
    if (!body.success) return reply.code(400).send({ success: false, error: 'device_id is required' })
    await revokeDeviceSession(request.user.sub, body.data.device_id)
    return reply.send({ success: true })
  })
  server.get('/auth/me', { preHandler: [server.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.sub }, select: { id: true, email: true, phone: true, full_name: true, role: true, individual_roles: true, status: true, tier: true, avatar_url: true, is_verified: true, created_at: true } })
    return user ? reply.send({ success: true, data: user }) : reply.code(404).send({ success: false, error: 'User not found' })
  })
}
