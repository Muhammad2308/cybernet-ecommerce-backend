import { FastifyInstance } from 'fastify'

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

