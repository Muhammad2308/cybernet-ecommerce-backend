import cron from 'node-cron'
import { prisma } from '../lib/prisma'

// Runs daily at 01:00 — aggregates all settled earnings into stats tables
export function startEarningsAggregator(): void {
  cron.schedule('0 1 * * *', async () => {
    console.log('[EarningsAggregator] running daily aggregation...')

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const endOfYesterday = new Date(yesterday)
    endOfYesterday.setHours(23, 59, 59, 999)

    try {
      await aggregateDriverStats(yesterday, endOfYesterday)
      await aggregateFleetStats(yesterday, endOfYesterday)
      console.log('[EarningsAggregator] aggregation complete')
    } catch (err) {
      console.error('[EarningsAggregator] aggregation failed:', err)
    }
  })

  console.log('[EarningsAggregator] scheduled (daily at 01:00)')
}

async function aggregateDriverStats(from: Date, to: Date): Promise<void> {
  const earnings = await prisma.deliveryEarning.groupBy({
    by: ['driver_id', 'currency'],
    where: { created_at: { gte: from, lte: to } },
    _count: { id: true },
    _sum: {
      gross_fee: true,
      rido_commission_amount: true,
      driver_payout_amount: true,
    },
  })

  for (const e of earnings) {
    await prisma.driverStats.upsert({
      where: { driver_id: e.driver_id },
      update: {
        total_deliveries: { increment: e._count.id },
        total_gross_earned: { increment: e._sum.gross_fee ?? 0 },
        total_rido_commission: { increment: e._sum.rido_commission_amount ?? 0 },
        total_net_earned: { increment: e._sum.driver_payout_amount ?? 0 },
        currency: e.currency,
      },
      create: {
        driver_id: e.driver_id,
        total_deliveries: e._count.id,
        total_gross_earned: e._sum.gross_fee ?? 0,
        total_rido_commission: e._sum.rido_commission_amount ?? 0,
        total_net_earned: e._sum.driver_payout_amount ?? 0,
        currency: e.currency,
      },
    })
  }
}

async function aggregateFleetStats(from: Date, to: Date): Promise<void> {
  const earnings = await prisma.deliveryEarning.groupBy({
    by: ['fleet_company_id', 'currency'],
    where: {
      fleet_company_id: { not: null },
      created_at: { gte: from, lte: to },
    },
    _count: { id: true },
    _sum: {
      gross_fee: true,
      rido_commission_amount: true,
      fleet_payout_amount: true,
    },
  })

  for (const e of earnings) {
    if (!e.fleet_company_id) continue

    // Count active drivers (those who had at least one delivery that day)
    const activeDrivers = await prisma.deliveryEarning.groupBy({
      by: ['driver_id'],
      where: {
        fleet_company_id: e.fleet_company_id,
        created_at: { gte: from, lte: to },
      },
    })

    await prisma.fleetCompanyStats.upsert({
      where: {
        fleet_company_id_stat_date: {
          fleet_company_id: e.fleet_company_id,
          stat_date: from,
        },
      },
      update: {
        total_deliveries: { increment: e._count.id },
        total_gross_revenue: { increment: e._sum.gross_fee ?? 0 },
        total_rido_commission: { increment: e._sum.rido_commission_amount ?? 0 },
        total_net_payout: { increment: e._sum.fleet_payout_amount ?? 0 },
        total_drivers_active: activeDrivers.length,
        currency: e.currency,
      },
      create: {
        fleet_company_id: e.fleet_company_id,
        stat_date: from,
        total_deliveries: e._count.id,
        total_gross_revenue: e._sum.gross_fee ?? 0,
        total_rido_commission: e._sum.rido_commission_amount ?? 0,
        total_net_payout: e._sum.fleet_payout_amount ?? 0,
        total_drivers_active: activeDrivers.length,
        currency: e.currency,
      },
    })
  }
}
