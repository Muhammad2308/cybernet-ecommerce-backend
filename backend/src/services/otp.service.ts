import crypto from 'crypto'
import { getRedis } from '../lib/redis'

const OTP_TTL_SECONDS = 300 // 5 minutes
const OTP_RATE_LIMIT_SECONDS = 60 // 1 OTP per minute per phone
const OTP_MAX_ATTEMPTS = 5 // max verification attempts before lockout

/**
 * Generate a 6-digit OTP code
 */
function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Send OTP to a phone number. Stores OTP in Redis with 5-minute TTL.
 * Rate-limited to 1 OTP per 60 seconds per phone number.
 */
export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const redis = getRedis()
  const rateLimitKey = `otp:ratelimit:${phone}`
  const otpKey = `otp:code:${phone}`
  const attemptsKey = `otp:attempts:${phone}`

  // Rate limit check
  const rateLimited = await redis.get(rateLimitKey)
  if (rateLimited) {
    return { success: false, message: 'Please wait 60 seconds before requesting another OTP' }
  }

  const code = generateOtpCode()

  // Store OTP code with TTL
  await redis.setex(otpKey, OTP_TTL_SECONDS, code)
  // Set rate limit (1 request per 60 seconds)
  await redis.setex(rateLimitKey, OTP_RATE_LIMIT_SECONDS, '1')
  // Reset attempt counter
  await redis.del(attemptsKey)

  // TODO: Integrate real SMS gateway (Termii, Twilio, Africa's Talking)
  // For development, log OTP to console
  console.log(`[OTP] Code for ${phone}: ${code}`)

  return { success: true, message: 'OTP sent successfully' }
}

/**
 * Verify an OTP code for a given phone number.
 * Returns true if valid, false if invalid or expired.
 * Implements brute-force protection with max 5 attempts.
 */
export async function verifyOtp(phone: string, code: string): Promise<{ valid: boolean; error?: string }> {
  const redis = getRedis()
  const otpKey = `otp:code:${phone}`
  const attemptsKey = `otp:attempts:${phone}`

  // Check attempts
  const attempts = parseInt((await redis.get(attemptsKey)) || '0', 10)
  if (attempts >= OTP_MAX_ATTEMPTS) {
    await redis.del(otpKey)
    return { valid: false, error: 'Too many failed attempts. Request a new OTP.' }
  }

  const storedCode = await redis.get(otpKey)
  if (!storedCode) {
    return { valid: false, error: 'OTP expired or not found. Request a new code.' }
  }

  if (storedCode !== code) {
    await redis.incr(attemptsKey)
    await redis.expire(attemptsKey, OTP_TTL_SECONDS)
    return { valid: false, error: 'Invalid OTP code' }
  }

  // OTP is valid — clean up
  await redis.del(otpKey)
  await redis.del(attemptsKey)

  return { valid: true }
}

/**
 * Store a refresh token in Redis with expiry
 */
export async function storeRefreshToken(userId: string, refreshToken: string, ttlSeconds: number = 604800): Promise<void> {
  const redis = getRedis()
  const key = `refresh:${userId}`
  await redis.setex(key, ttlSeconds, refreshToken)
}

/**
 * Validate and consume a refresh token (rotation: old token is invalidated)
 */
export async function validateRefreshToken(userId: string, token: string): Promise<boolean> {
  const redis = getRedis()
  const key = `refresh:${userId}`
  const stored = await redis.get(key)
  if (!stored || stored !== token) return false
  // Invalidate old token (rotation)
  await redis.del(key)
  return true
}
