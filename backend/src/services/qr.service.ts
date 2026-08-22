import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'rido_dev_secret_change_in_production_32chars'

export interface QRPayloadData {
  delivery_id: string
  receiver_id: string
  timestamp: string
  signature: string
}

export function generateUniquePickupId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'RIDO-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateReceiverQRPayload(deliveryId: string, receiverId: string): string {
  const timestamp = new Date().toISOString()
  const dataToSign = `${deliveryId}:${receiverId}:${timestamp}`
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('hex')

  const payloadObj: QRPayloadData = {
    delivery_id: deliveryId,
    receiver_id: receiverId,
    timestamp,
    signature,
  }

  return Buffer.from(JSON.stringify(payloadObj)).toString('base64url')
}

export function verifyQRPayload(encodedPayload: string): { valid: boolean; data?: QRPayloadData; error?: string } {
  try {
    const jsonStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    const data: QRPayloadData = JSON.parse(jsonStr)

    if (!data.delivery_id || !data.receiver_id || !data.timestamp || !data.signature) {
      return { valid: false, error: 'Malformed QR code payload' }
    }

    const dataToSign = `${data.delivery_id}:${data.receiver_id}:${data.timestamp}`
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(dataToSign)
      .digest('hex')

    if (data.signature !== expectedSignature) {
      return { valid: false, error: 'Invalid QR code signature or tampered code' }
    }

    return { valid: true, data }
  } catch (err: any) {
    return { valid: false, error: 'Invalid QR code format' }
  }
}
