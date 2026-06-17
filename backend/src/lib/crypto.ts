import { createHmac, randomBytes, createHash } from 'crypto'

export function generateApiKey(): string {
  return `rido_${randomBytes(32).toString('hex')}`
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export function generateInviteCode(): string {
  return randomBytes(8).toString('hex').toUpperCase()
}

export function signWebhookPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function verifyWebhookSignature(payload: string, secret: string, signature: string): boolean {
  const expected = signWebhookPayload(payload, secret)
  return expected === signature
}
