import { prisma } from '../lib/prisma'
import { EarningStatus } from '@prisma/client'

const DEFAULT_PLATFORM_COMMISSION_RATE = 10 // percent

type EarningResult = {
  gross_fee: number
  rido_commission_rate: number
  rido_commission_amount: number
  driver_payout_amount: number
  fleet_payout_amount: number
  currency: string
}

export async function calculateEarning(deliveryId: string): Promise<EarningResult> {
  const delivery = await prisma.delivery.findUniqueOrThrow({
    where: { id: deliveryId },
    include: {
      traveler: {
        include: {
          fleet_membership: { include: { fleet_company: true } },
        },
      },
    },
  })

  const grossFee = delivery.agreed_price
  const membership = delivery.traveler.fleet_membership
  const fleetCompany = membership?.fleet_company ?? null

  // Use fleet-specific commission rate if driver belongs to a fleet
  const commissionRate = fleetCompany
    ? fleetCompany.commission_rate
    : DEFAULT_PLATFORM_COMMISSION_RATE

  const ridoCommission = parseFloat(((grossFee * commissionRate) / 100).toFixed(2))
  const remainder = parseFloat((grossFee - ridoCommission).toFixed(2))

  let driverPayout = remainder
  let fleetPayout = 0

  if (fleetCompany && membership) {
    // Fleet keeps remainder, pays driver their agreed split
    const driverSplitRate = membership.driver_split_rate
    driverPayout = parseFloat(((remainder * driverSplitRate) / 100).toFixed(2))
    fleetPayout = parseFloat((remainder - driverPayout).toFixed(2))
  }

  const currency = fleetCompany?.currency ?? 'NGN'

  return {
    gross_fee: grossFee,
    rido_commission_rate: commissionRate,
    rido_commission_amount: ridoCommission,
    driver_payout_amount: driverPayout,
    fleet_payout_amount: fleetPayout,
    currency,
  }
}

// Idempotent — delivery_id is the unique key; safe to call multiple times
export async function recordDeliveryEarning(deliveryId: string): Promise<void> {
  const existing = await prisma.deliveryEarning.findUnique({ where: { delivery_id: deliveryId } })
  if (existing) return // idempotency guard

  const delivery = await prisma.delivery.findUniqueOrThrow({
    where: { id: deliveryId },
    include: {
      traveler: { include: { fleet_membership: true } },
    },
  })

  const result = await calculateEarning(deliveryId)
  const fleetCompanyId = delivery.traveler.fleet_membership?.fleet_company_id ?? null

  await prisma.deliveryEarning.create({
    data: {
      delivery_id: deliveryId,
      driver_id: delivery.traveler_id,
      fleet_company_id: fleetCompanyId,
      gross_fee: result.gross_fee,
      rido_commission_rate_snapshot: result.rido_commission_rate,
      rido_commission_amount: result.rido_commission_amount,
      driver_payout_amount: result.driver_payout_amount,
      fleet_payout_amount: result.fleet_payout_amount,
      currency: result.currency,
      status: EarningStatus.PENDING,
    },
  })
}

export async function getDriverEarningsSummary(
  driverId: string,
  from: Date,
  to: Date,
): Promise<{
  total_deliveries: number
  gross_earned: number
  rido_commission: number
  net_earned: number
  currency: string
}> {
  const earnings = await prisma.deliveryEarning.findMany({
    where: {
      driver_id: driverId,
      created_at: { gte: from, lte: to },
    },
  })

  const currency = earnings[0]?.currency ?? 'NGN'
  return {
    total_deliveries: earnings.length,
    gross_earned: earnings.reduce((s, e) => s + e.gross_fee, 0),
    rido_commission: earnings.reduce((s, e) => s + e.rido_commission_amount, 0),
    net_earned: earnings.reduce((s, e) => s + e.driver_payout_amount, 0),
    currency,
  }
}

export async function getFleetEarningsSummary(
  fleetCompanyId: string,
  from: Date,
  to: Date,
): Promise<{
  total_deliveries: number
  gross_revenue: number
  rido_commission: number
  net_payout: number
  currency: string
}> {
  const earnings = await prisma.deliveryEarning.findMany({
    where: {
      fleet_company_id: fleetCompanyId,
      created_at: { gte: from, lte: to },
    },
  })

  const currency = earnings[0]?.currency ?? 'NGN'
  return {
    total_deliveries: earnings.length,
    gross_revenue: earnings.reduce((s, e) => s + e.gross_fee, 0),
    rido_commission: earnings.reduce((s, e) => s + e.rido_commission_amount, 0),
    net_payout: earnings.reduce((s, e) => s + e.fleet_payout_amount, 0),
    currency,
  }
}
