import { prisma } from '../../lib/prisma'
import { FleetCompanyStatus, FleetDriverStatus } from '@prisma/client'
import { generateInviteCode } from '../../lib/crypto'

export async function registerFleetCompany(data: {
  company_name: string
  registration_number: string
  contact_person: string
  contact_email: string
  contact_phone: string
  address: string
  city: string
  country?: string
  logo_url?: string
  commission_rate?: number
  platform_type?: 'RIDO' | 'SHAGO'
}) {
  return prisma.fleetCompany.create({ data })
}

export async function approveFleetCompany(fleetCompanyId: string) {
  return prisma.fleetCompany.update({
    where: { id: fleetCompanyId },
    data: { status: FleetCompanyStatus.ACTIVE, verified_at: new Date() },
  })
}

export async function suspendFleetCompany(fleetCompanyId: string) {
  return prisma.fleetCompany.update({
    where: { id: fleetCompanyId },
    data: { status: FleetCompanyStatus.SUSPENDED },
  })
}

export async function addFleetAdmin(userId: string, fleetCompanyId: string) {
  await prisma.user.update({ where: { id: userId }, data: { role: 'LOGISTICS_ADMIN' } })
  return prisma.fleetCompanyAdmin.upsert({
    where: { user_id_fleet_company_id: { user_id: userId, fleet_company_id: fleetCompanyId } },
    update: {},
    create: { user_id: userId, fleet_company_id: fleetCompanyId },
  })
}

export async function createFleetInvite(fleetCompanyId: string, createdById: string) {
  const code = generateInviteCode()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return prisma.fleetInvite.create({
    data: { fleet_company_id: fleetCompanyId, code, created_by_id: createdById, expires_at: expiresAt },
  })
}

export async function acceptFleetInvite(code: string, driverId: string) {
  const invite = await prisma.fleetInvite.findUnique({ where: { code } })
  if (!invite) throw new Error('Invalid invite code')
  if (invite.used_at) throw new Error('Invite code already used')
  if (invite.expires_at < new Date()) throw new Error('Invite code expired')

  const existing = await prisma.fleetDriverMembership.findUnique({ where: { driver_id: driverId } })
  if (existing) throw new Error('Driver already belongs to a fleet company')

  await prisma.$transaction([
    prisma.fleetInvite.update({
      where: { id: invite.id },
      data: { used_at: new Date(), used_by_id: driverId },
    }),
    prisma.fleetDriverMembership.create({
      data: { driver_id: driverId, fleet_company_id: invite.fleet_company_id },
    }),
  ])

  return invite.fleet_company_id
}

export async function removeDriverFromFleet(driverId: string) {
  return prisma.fleetDriverMembership.delete({ where: { driver_id: driverId } })
}

export async function suspendFleetDriver(driverId: string) {
  return prisma.fleetDriverMembership.update({
    where: { driver_id: driverId },
    data: { status: FleetDriverStatus.SUSPENDED },
  })
}

export async function getFleetDrivers(
  fleetCompanyId: string,
  filters: { status?: FleetDriverStatus; vehicleType?: string } = {},
) {
  return prisma.fleetDriverMembership.findMany({
    where: {
      fleet_company_id: fleetCompanyId,
      ...(filters.status && { status: filters.status }),
      ...(filters.vehicleType && { vehicle_type: filters.vehicleType as never }),
    },
    include: {
      driver: {
        select: {
          id: true, full_name: true, phone: true, email: true,
          avatar_url: true, status: true,
          location_pings: { orderBy: { created_at: 'desc' }, take: 1 },
        },
      },
    },
  })
}

export async function getFleetOverview(fleetCompanyId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalDrivers, activeDrivers, deliveriesToday, pendingEarnings] = await Promise.all([
    prisma.fleetDriverMembership.count({ where: { fleet_company_id: fleetCompanyId } }),
    prisma.fleetDriverMembership.count({ where: { fleet_company_id: fleetCompanyId, status: FleetDriverStatus.ACTIVE } }),
    prisma.deliveryEarning.count({ where: { fleet_company_id: fleetCompanyId, created_at: { gte: today } } }),
    prisma.deliveryEarning.aggregate({
      where: { fleet_company_id: fleetCompanyId, status: 'PENDING' },
      _sum: { fleet_payout_amount: true },
    }),
  ])

  return {
    total_drivers: totalDrivers,
    active_drivers: activeDrivers,
    deliveries_today: deliveriesToday,
    pending_payout: pendingEarnings._sum.fleet_payout_amount ?? 0,
  }
}
