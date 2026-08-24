import crypto from 'crypto'
import { prisma } from '../lib/prisma'

const SESSION_TTL_DAYS = 90
const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex')

export async function createDeviceSession(userId: string, deviceId: string, deviceName?: string, platform?: string) {
  const refreshToken = crypto.randomBytes(48).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  await prisma.deviceSession.upsert({
    where: { user_id_device_id: { user_id: userId, device_id: deviceId } },
    update: { refresh_token_hash: hash(refreshToken), device_name: deviceName, platform, expires_at: expiresAt, revoked_at: null, last_seen_at: new Date() },
    create: { user_id: userId, device_id: deviceId, refresh_token_hash: hash(refreshToken), device_name: deviceName, platform, expires_at: expiresAt },
  })
  return { refresh_token: refreshToken, expires_at: expiresAt }
}

export async function rotateDeviceSession(deviceId: string, refreshToken: string) {
  const session = await prisma.deviceSession.findUnique({ where: { refresh_token_hash: hash(refreshToken) }, include: { user: true } })
  if (!session || session.device_id !== deviceId || session.revoked_at || session.expires_at <= new Date()) return null
  const rotated = await createDeviceSession(session.user_id, deviceId, session.device_name ?? undefined, session.platform ?? undefined)
  return { user: session.user, ...rotated }
}

export async function revokeDeviceSession(userId: string, deviceId: string) {
  await prisma.deviceSession.updateMany({ where: { user_id: userId, device_id: deviceId, revoked_at: null }, data: { revoked_at: new Date() } })
}
