import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pricingConfigs = [
  { key: 'BASE_FEE', value: 500, description: 'Base fee in Naira applied to every delivery' },
  { key: 'DISTANCE_RATE_PER_KM', value: 15, description: 'Additional cost per kilometre of delivery distance in Naira' },
  { key: 'WEIGHT_LIGHT_MULTIPLIER', value: 1.0, description: 'Price multiplier for light packages (under 2kg)' },
  { key: 'WEIGHT_MEDIUM_MULTIPLIER', value: 1.2, description: 'Price multiplier for medium weight packages (2-10kg)' },
  { key: 'WEIGHT_HEAVY_MULTIPLIER', value: 1.5, description: 'Price multiplier for heavy packages (10-25kg)' },
  { key: 'WEIGHT_EXTRA_HEAVY_MULTIPLIER', value: 2.0, description: 'Price multiplier for extra heavy packages (over 25kg)' },
  { key: 'SIZE_SMALL_MULTIPLIER', value: 1.0, description: 'Price multiplier for small sized packages' },
  { key: 'SIZE_MEDIUM_MULTIPLIER', value: 1.2, description: 'Price multiplier for medium sized packages' },
  { key: 'SIZE_LARGE_MULTIPLIER', value: 1.5, description: 'Price multiplier for large sized packages' },
  { key: 'SIZE_EXTRA_LARGE_MULTIPLIER', value: 2.0, description: 'Price multiplier for extra large packages' },
  { key: 'URGENCY_STANDARD_MULTIPLIER', value: 1.0, description: 'Price multiplier for standard delivery urgency' },
  { key: 'URGENCY_EXPRESS_MULTIPLIER', value: 1.5, description: 'Price multiplier for express delivery' },
  { key: 'URGENCY_SAME_DAY_MULTIPLIER', value: 2.0, description: 'Price multiplier for same day delivery' },
  { key: 'VEHICLE_MOTORCYCLE_RATE', value: 0.8, description: 'Rate modifier for motorcycle deliveries' },
  { key: 'VEHICLE_CAR_RATE', value: 1.0, description: 'Rate modifier for car deliveries' },
  { key: 'VEHICLE_VAN_RATE', value: 1.3, description: 'Rate modifier for van deliveries' },
  { key: 'VEHICLE_TRUCK_RATE', value: 1.6, description: 'Rate modifier for truck deliveries' },
  { key: 'ESCROW_FEE_PERCENTAGE', value: 2.5, description: 'Percentage of delivery value held as escrow processing fee' },
  { key: 'PLATFORM_FEE_PERCENTAGE', value: 10, description: "Rido's platform commission percentage taken from each delivery" },
  { key: 'MINIMUM_DELIVERY_FEE', value: 300, description: 'Minimum delivery fee in Naira regardless of calculation result' },
  { key: 'DOOR_TO_DOOR_SURCHARGE', value: 500, description: 'Fixed surcharge for direct door-to-door delivery' },
]

async function main() {
  console.log('Seeding pricing configuration...')

  for (const config of pricingConfigs) {
    await prisma.pricingConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: config,
    })
  }

  console.log(`✅ Seeded ${pricingConfigs.length} pricing config records`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
