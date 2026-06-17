# Project Memory — RIDO / SHAGO / N-Trust Ecosystem

> Last updated: 2026-06-16
> Operated by: CYBERNET SYSTEMS

---

## The Big Picture — Three Documents, One Ecosystem

These three documents describe a single, interconnected product ecosystem built and operated by **CYBERNET SYSTEMS**:

| Document | What It Is |
|----------|-----------|
| `N-Trust-Project-Master.md` | The original design document for what became RIDO. "N-Trust" was the working name — N = Nigeria, TRUST = the core principle. The architecture, schema, and stack are identical to RIDO today. |
| `SHAGO-Platform-Master.md` | A B2B eCommerce platform for wholesale-to-retail supply chains in Nigerian metro areas. RIDO is its exclusive logistics engine. |
| `Rido_Project_Analysis.md` | A technical analysis of RIDO confirming architecture soundness and identifying gaps (pricing config, PostGIS validation, pagination contracts). |

---

## RIDO (formerly N-Trust)

**What it is:** A peer-to-peer package delivery platform connecting Senders (people with packages) to Travelers (people already making trips with spare space).

**Original name:** N-Trust — "N" for Nigeria, "TRUST" as the foundational principle behind escrow, GPS tracking, chat, and disputes.

**Operating company:** CYBERNET SYSTEMS

**Core user types:**
- **Sender** — posts shipments with pickup/dropoff, package details, urgency
- **Traveler** — registers trips with route, vehicle, available capacity
- **Admin** — CYBERNET SYSTEMS staff; manages platform, disputes, pricing
- **Fleet Admin** *(added in architecture upgrade)* — manages a registered logistics company's drivers

**The four trust pillars:**
1. Escrow — money held until delivery confirmed
2. GPS tracking — live location during transit
3. In-app chat — direct communication
4. Dispute system — admin resolution

**Current build state (as of 2026-06-16):**
- Phase 1 infrastructure complete (schema, migrations, seed, health endpoint)
- Architecture upgrade complete (Fleet companies, SHAGO integration API, earnings engine, notifications)
- Backend: Fastify v5 + Prisma + PostgreSQL/PostGIS + Redis
- Admin: Next.js 16 + React 19 + Tailwind 4 (boilerplate)
- Mobile: Expo React Native (boilerplate)
- Database: 23+ models including all fleet, earnings, notification, webhook, and SHAGO models

---

## SHAGO

**What it is:** A B2B metro-based eCommerce platform that digitises the daily wholesale-to-retail restock supply chain in Nigerian cities.

**Operating company:** CYBERNET SYSTEMS

**Primary markets:** Kaduna, Kano, Lagos (metro-based, zone-driven)

**Currency:** Nigerian Naira (₦)

**The core problem it solves:**
Retailers physically close their shops 1–3 hours daily to travel to wholesale markets. This costs ₦75,000–₦150,000/month in lost revenue. SHAGO eliminates this — order in 3 minutes, delivery before morning rush.

### SHAGO's Four User Types

| User | Role |
|------|------|
| **Retailer** | Places daily restock orders via mobile app, tracks delivery, confirms receipt via QR |
| **Wholesaler** | Receives digital orders, manages product catalog, gets paid automatically on delivery |
| **Sales Agent** | Stationed in wholesale market — picks, packs, tags orders, assigns drivers |
| **Logistics Agent** | Delivers bundled orders (3–8 stops per trip) via CNG three-wheelers or electric bikes |

### SHAGO's Revenue Streams

1. **Wholesaler discount margin** (primary) — SHAGO negotiates 3–6% discount per product before onboarding. Difference is automatic profit.
2. **Direct producer sourcing** — buys direct from manufacturers at ₦800, sells at ₦1,000 (₦200 margin vs ₦50 via wholesaler)
3. **B2C consumer sales** — household orders at retail price
4. **Delivery fees** — SHAGO takes 10% of every delivery fee; logistics agent keeps 90%

### SHAGO's Architecture

Two separate, independently deployable applications sharing one backend API:
- **SHAGO eCommerce App** — retailer/wholesaler/consumer-facing (marketplace side)
- **SHAGO Logistics App** — driver/sales agent-facing (fleet side)

Both share a single PostgreSQL/PostGIS database. Cross-app coordination via webhooks and Redis event queue.

### SHAGO ↔ RIDO Relationship

**RIDO is the exclusive logistics engine for SHAGO.** Every delivery initiated by SHAGO flows through RIDO. The SHAGO Logistics Application IS RIDO's logistics layer.

The integration is implemented as a versioned internal API:
- `POST /internal/shago/v1/dispatch` — SHAGO sends an order, RIDO returns a job ID
- `GET /internal/shago/v1/jobs/:id/status` — SHAGO polls delivery status
- `POST /internal/shago/v1/jobs/:id/confirm-delivery` — triggers escrow release
- `POST /internal/shago/v1/jobs/:id/dispute` — raises a dispute

RIDO fires 8 webhook events back to SHAGO at each delivery milestone:
`job.assigned` → `job.driver_at_pickup` → `job.picked_up` → `job.in_transit` → `job.arrived_at_dropoff` → `job.delivered` → `job.failed` → `job.disputed`

Each webhook is HMAC-SHA256 signed. Retry logic: 30s → 2m → 10m → 1h → 24h (5 attempts max).

---

## Technical Stack (Shared)

| Layer | Technology |
|-------|-----------|
| Backend language | TypeScript (strict) |
| API server | Fastify v5 |
| Database | PostgreSQL 15 + PostGIS 3.3 |
| ORM | Prisma 5 |
| Cache / Queue | Redis 7 |
| Validation | Zod |
| Auth | JWT (@fastify/jwt) |
| Mobile | Expo / React Native |
| Admin frontend | Next.js 16 + Tailwind CSS 4 |
| Payment gateway | Paystack (Nigerian) |
| SMS | Termii or Sendchamp (African-focused) |
| Push notifications | FCM (Android) + APNs (iOS) |
| Containerisation | Docker + docker-compose |

---

## RIDO Database — Key Models (Current State)

### Original 13 models
User, Trip, Shipment, Delivery, TransactionRoom, Message, LocationPing, Payment, DeliveryEvent, Dispute, PricingConfig

### 10 new models added in architecture upgrade
FleetCompany, FleetCompanyAdmin, FleetDriverMembership, FleetInvite, DeliveryEarning, FleetCompanyStats, DriverStats, ShagoJob, ServiceApiKey, Notification, NotificationEvent, NotificationPreference, WebhookEndpoint, WebhookDeliveryLog

### Key design decisions
- UUID primary keys throughout
- Append-only tables (Message, LocationPing, DeliveryEvent) have no `updated_at`
- PostGIS for all geospatial: proximity matching, ETA, geofencing, heatmaps
- `delivery_id` as idempotency key on DeliveryEarning (prevents duplicate earnings on retry)
- Webhook retry: exponential backoff, endpoint marked unreachable after 5 failures
- Multi-currency: every financial record carries a `currency` field (NGN, GHS, KES)

---

## RIDO Pricing Engine (20 configurable DB rules)

```
Base Fee ₦500
+ Distance × ₦15/km
× Weight multiplier (1.0–2.0x)
× Size multiplier (1.0–2.0x)
× Urgency multiplier (1.0–2.0x)
× Vehicle rate modifier (0.8–1.6x)
− Platform commission (10% default, overridable per fleet company)
− Escrow fee (2.5%)
≥ Minimum fee ₦300
```

Rules stored in `pricing_configs` table — business team adjusts without code changes.

---

## SHAGO Delivery Economics

```
Example: 5-stop trip, Zone 3, Kaduna
Delivery fees collected:  5 × ₦1,200 = ₦6,000
SHAGO 10% cut:                          ₦600
CNG fuel:                               ₦600
Logistics agent net:                    ₦4,800

vs. Traditional (one retailer per trip):
Retailer pays:                          ₦3,500
Driver nets (after fuel):               ₦2,900
```

Zone-based assignment reduces deadhead miles by ~30%.

---

## Roles & Access Control

| Role | Scope |
|------|-------|
| `SENDER` | Own shipments only |
| `TRAVELER` | Own trips and deliveries only |
| `ADMIN` | Full RIDO platform (RIDO super admin = CYBERNET SYSTEMS) |
| `FLEET_ADMIN` | Own fleet company's data only |

---

## Build Phases (RIDO Roadmap)

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Monorepo, schema, migrations, seed, health endpoint |
| 2 | ✅ Complete (architecture upgrade) | Fleet companies, SHAGO API, earnings engine, notifications, webhooks |
| 3 | Pending | Authentication flows, trip/shipment APIs, PostGIS matching |
| 4 | Pending | Payment processing (Paystack), escrow system |
| 5 | Pending | Mobile app screens (Expo) |
| 6 | Pending | Admin dashboard (Next.js) |
| 7 | Pending | Real-time systems, push notifications, ratings |

---

## To Run the Project

```bash
# Prerequisites: Docker Desktop running, Node.js installed

# 1. Start database + Redis
docker-compose up -d

# 2. Install backend dependencies
cd backend && npm install

# 3. Run database migrations (creates all tables)
npx prisma migrate dev --name fleet-and-integrations

# 4. Seed pricing config (20 rules)
npm run prisma:seed

# 5. Start backend server
npm run dev

# 6. Verify
curl http://localhost:3000/api/v1/health
# → { "success": true, "version": "2.0.0" }

# 7. Browse database visually
npx prisma studio  # opens at http://localhost:5555
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | Single source of truth for all database models |
| `backend/src/index.ts` | Server entry point — registers all routes, plugins, workers |
| `backend/src/services/earnings.service.ts` | Idempotent profit calculation (per-delivery, per-driver, per-fleet) |
| `backend/src/services/shago.service.ts` | SHAGO integration logic |
| `backend/src/services/webhook.service.ts` | Webhook dispatch + exponential backoff retry |
| `backend/src/services/notification.service.ts` | Event-driven, role-aware notifications |
| `backend/src/events/event-bus.ts` | Redis Pub/Sub event bus |
| `backend/src/routes/internal/shago/v1/index.ts` | SHAGO internal API endpoints |
| `shared/src/types/enums.ts` | Shared enums — single source of truth across all workspaces |
| `docker-compose.yml` | PostgreSQL 15/PostGIS + Redis 7 |

---

## Risks / Known Gaps (from Rido_Project_Analysis.md)

| Priority | Risk |
|----------|------|
| High | PostGIS validation — confirm `SELECT PostGIS_Version()` returns a result after migration |
| High | Prisma `postgresqlExtensions` preview feature — must be enabled and tested |
| Medium | Pagination contracts not yet standardised across all list endpoints |
| Medium | Matching engine (PostGIS ST_DWithin) not yet implemented |
| Low | No linting/formatting config (ESLint, Prettier) at monorepo level |
| Low | Expo app is boilerplate — no screens built |
| Low | Next.js admin is boilerplate — no pages built |
