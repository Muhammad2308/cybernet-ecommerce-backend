import { FastifyInstance } from 'fastify'
import crypto from 'crypto'

export type JwtPayload = {
  sub: string
  email: string
  role: string
  fleet_company_id?: string
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}

export function verifyToken(server: FastifyInstance, token: string): JwtPayload {
  return server.jwt.verify<JwtPayload>(token)
}

export function signToken(server: FastifyInstance, payload: JwtPayload): string {
  return server.jwt.sign(payload, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

/** Short-lived access token (15 minutes) */
export function signAccessToken(server: FastifyInstance, payload: JwtPayload): string {
  return server.jwt.sign(payload, { expiresIn: '15m' })
}

/** Long-lived refresh token (7 days) — opaque random string */
export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('base64url')
}

