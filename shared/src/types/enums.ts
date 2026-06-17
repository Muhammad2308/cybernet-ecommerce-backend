// ============================================================
// EXISTING ENUMS
// ============================================================

// ─── Platform ────────────────────────────────────────────────
export enum PlatformType {
  RIDO = 'RIDO',
  SHAGO = 'SHAGO',
}

// ─── Roles ───────────────────────────────────────────────────
export enum Role {
  // RIDO roles
  SENDER = 'SENDER',
  TRAVELER = 'TRAVELER',
  LOGISTICS_ADMIN = 'LOGISTICS_ADMIN',   // fleet admin in RIDO
  FLEET_ADMIN = 'FLEET_ADMIN',           // legacy alias — kept for backward compat

  // SHAGO roles
  RETAILER = 'RETAILER',
  WHOLESALER = 'WHOLESALER',
  SALES_AGENT = 'SALES_AGENT',
  LOGISTICS_AGENT = 'LOGISTICS_AGENT',   // driver in SHAGO
  CONSUMER = 'CONSUMER',

  // Platform-wide
  ADMIN = 'ADMIN',
  CYBERNET_ADMIN = 'CYBERNET_ADMIN',
}

export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum Tier {
  BASIC = 'BASIC',
  VERIFIED = 'VERIFIED',
  PREMIUM = 'PREMIUM',
}

export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  VAN = 'VAN',
  TRUCK = 'TRUCK',
  BUS = 'BUS',
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SizeBracket {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE',
}

export enum WeightBracket {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HEAVY = 'HEAVY',
  EXTRA_HEAVY = 'EXTRA_HEAVY',
}

export enum UrgencyLevel {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  SAME_DAY = 'SAME_DAY',
}

export enum PackageCategory {
  DOCUMENTS = 'DOCUMENTS',
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  FOOD = 'FOOD',
  FRAGILE = 'FRAGILE',
  GENERAL = 'GENERAL',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum DeliveryStatus {
  PENDING_PICKUP = 'PENDING_PICKUP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum EscrowStatus {
  HOLDING = 'HOLDING',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum RoomStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  DISPUTED = 'DISPUTED',
}

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
  NOTIFICATION = 'NOTIFICATION',
}

export enum PingTrigger {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
  GEOFENCE = 'GEOFENCE',
}

export enum DisputeReason {
  NOT_DELIVERED = 'NOT_DELIVERED',
  DAMAGED = 'DAMAGED',
  WRONG_ITEM = 'WRONG_ITEM',
  LATE_DELIVERY = 'LATE_DELIVERY',
  FRAUD = 'FRAUD',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum PricingKey {
  BASE_FEE = 'BASE_FEE',
  DISTANCE_RATE_PER_KM = 'DISTANCE_RATE_PER_KM',
  WEIGHT_LIGHT_MULTIPLIER = 'WEIGHT_LIGHT_MULTIPLIER',
  WEIGHT_MEDIUM_MULTIPLIER = 'WEIGHT_MEDIUM_MULTIPLIER',
  WEIGHT_HEAVY_MULTIPLIER = 'WEIGHT_HEAVY_MULTIPLIER',
  WEIGHT_EXTRA_HEAVY_MULTIPLIER = 'WEIGHT_EXTRA_HEAVY_MULTIPLIER',
  SIZE_SMALL_MULTIPLIER = 'SIZE_SMALL_MULTIPLIER',
  SIZE_MEDIUM_MULTIPLIER = 'SIZE_MEDIUM_MULTIPLIER',
  SIZE_LARGE_MULTIPLIER = 'SIZE_LARGE_MULTIPLIER',
  SIZE_EXTRA_LARGE_MULTIPLIER = 'SIZE_EXTRA_LARGE_MULTIPLIER',
  URGENCY_STANDARD_MULTIPLIER = 'URGENCY_STANDARD_MULTIPLIER',
  URGENCY_EXPRESS_MULTIPLIER = 'URGENCY_EXPRESS_MULTIPLIER',
  URGENCY_SAME_DAY_MULTIPLIER = 'URGENCY_SAME_DAY_MULTIPLIER',
  VEHICLE_MOTORCYCLE_RATE = 'VEHICLE_MOTORCYCLE_RATE',
  VEHICLE_CAR_RATE = 'VEHICLE_CAR_RATE',
  VEHICLE_VAN_RATE = 'VEHICLE_VAN_RATE',
  VEHICLE_TRUCK_RATE = 'VEHICLE_TRUCK_RATE',
  ESCROW_FEE_PERCENTAGE = 'ESCROW_FEE_PERCENTAGE',
  PLATFORM_FEE_PERCENTAGE = 'PLATFORM_FEE_PERCENTAGE',
  MINIMUM_DELIVERY_FEE = 'MINIMUM_DELIVERY_FEE',
}

// ============================================================
// NEW ENUMS
// ============================================================

export enum FleetCompanyStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum FleetDriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum EarningStatus {
  PENDING = 'PENDING',
  SETTLED = 'SETTLED',
  DISPUTED = 'DISPUTED',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  WEBHOOK = 'WEBHOOK',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum RecipientType {
  DRIVER = 'DRIVER',
  SENDER = 'SENDER',
  FLEET_ADMIN = 'FLEET_ADMIN',
  LOGISTICS_ADMIN = 'LOGISTICS_ADMIN',
  LOGISTICS_AGENT = 'LOGISTICS_AGENT',
  RIDO_ADMIN = 'RIDO_ADMIN',
  CYBERNET_ADMIN = 'CYBERNET_ADMIN',
}

export enum WebhookDeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETRY = 'RETRY',
}

export enum ShagoJobStatus {
  PENDING_ASSIGNMENT = 'PENDING_ASSIGNMENT',
  ASSIGNED = 'ASSIGNED',
  DRIVER_AT_PICKUP = 'DRIVER_AT_PICKUP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_AT_DROPOFF = 'ARRIVED_AT_DROPOFF',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  DISPUTED = 'DISPUTED',
}

// Webhook event types fired to external integrations
export enum WebhookEventType {
  JOB_ASSIGNED = 'job.assigned',
  JOB_DRIVER_AT_PICKUP = 'job.driver_at_pickup',
  JOB_PICKED_UP = 'job.picked_up',
  JOB_IN_TRANSIT = 'job.in_transit',
  JOB_ARRIVED_AT_DROPOFF = 'job.arrived_at_dropoff',
  JOB_DELIVERED = 'job.delivered',
  JOB_FAILED = 'job.failed',
  JOB_DISPUTED = 'job.disputed',
}

// Internal event bus event types
export enum RidoEventType {
  DELIVERY_CONFIRMED = 'delivery.confirmed',
  DELIVERY_PICKED_UP = 'delivery.picked_up',
  DELIVERY_IN_TRANSIT = 'delivery.in_transit',
  DELIVERY_ARRIVED = 'delivery.arrived',
  DELIVERY_FAILED = 'delivery.failed',
  DISPUTE_FILED = 'dispute.filed',
  DISPUTE_RESOLVED = 'dispute.resolved',
  PAYOUT_PROCESSED = 'payout.processed',
  DRIVER_JOINED_FLEET = 'driver.joined_fleet',
  DRIVER_SUSPENDED = 'driver.suspended',
  JOB_ASSIGNED = 'job.assigned',
  JOB_POSTED = 'job.posted',
}
