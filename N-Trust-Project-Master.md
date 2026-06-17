# N-Trust Platform — Master Project Document

> **N** = Nigeria. **TRUST** = The foundation every feature is built on.
> A peer-to-peer package delivery platform connecting Senders to Travelers — built for Nigeria.

---

## Table of Contents

1. [What is N-Trust?](#1-what-is-n-trust)
2. [How a Delivery Works](#2-how-a-delivery-works)
3. [Technical Architecture](#3-technical-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Database Schema — 13 Models](#5-database-schema--13-models)
6. [Pricing Engine](#6-pricing-engine)
7. [Escrow & Payment Flow](#7-escrow--payment-flow)
8. [Matching System](#8-matching-system)
9. [Phase 1 — What Is Being Built Now](#9-phase-1--what-is-being-built-now)
10. [Roadmap Beyond Phase 1](#10-roadmap-beyond-phase-1)
11. [Key Architectural Decisions](#11-key-architectural-decisions)
12. [Claude Code Build Prompt](#12-claude-code-build-prompt)
13. [NotebookLM Prompts](#13-notebooklm-prompts)

---

## 1. What is N-Trust?

N-Trust is a **peer-to-peer package delivery platform** operating in the Nigerian market.

**The core model:** Someone is already driving from Lagos to Abuja. Why not have them carry your package? N-Trust connects people who need packages delivered (*Senders*) with people already making journeys who have spare space (*Travelers*) — earning money along their existing route.

Think of it as the Uber of package delivery, but instead of dedicated drivers, regular people making trips carry packages.

### The Three User Types

| User | Role |
|------|------|
| **Sender** | Posts a shipment — package details, pickup location, destination, urgency |
| **Traveler** | Registers a trip — route, vehicle, available space, departure time |
| **Admin** | Internal N-Trust staff — monitors platform, resolves disputes, manages pricing |

### The Four Trust Pillars

- 💰 **Escrow** — money held safely until delivery confirmed
- 📍 **GPS Tracking** — live location during transit
- 💬 **In-App Chat** — sender and traveler communicate directly
- ⚖️ **Dispute System** — admin resolution if anything goes wrong

---

## 2. How a Delivery Works

```
① Sender posts shipment
   └─ "2kg box, Lagos Island → Abuja CBD"

② System finds matching Travelers
   └─ Someone driving that route with boot space

③ Match made → Delivery record created
   └─ Both parties notified

④ Sender pays into escrow
   └─ Money held — not yet released

⑤ Traveler picks up the package
   └─ Confirmed in app, GPS tracking begins

⑥ Live location tracking during transit
   └─ Sender watches progress in real time

⑦ Package delivered, receiver confirms
   └─ Escrow releases payment to Traveler

⑧ If something goes wrong → Dispute system
   └─ Admin reviews evidence and resolves
```

---

## 3. Technical Architecture

N-Trust is a **monorepo** — four separate applications living under one root folder:

```
/n-trust
├── /backend    → Fastify API server, Prisma ORM, all business logic
├── /mobile     → Expo React Native app (Senders and Travelers)
├── /admin      → Next.js dashboard (internal N-Trust staff)
└── /shared     → TypeScript types and enums used by ALL three
                  ↑ THE CONTRACT LAYER — keeps everything in sync
```

**Why a monorepo?** When the backend changes a delivery status name, the shared package updates automatically and the mobile app instantly knows about it. No manual syncing. No mismatches.

**Why `/shared` is critical:** The most common source of frontend/backend drift in TypeScript monorepos is duplicated definitions that diverge silently. `/shared` is the single source of truth.

---

## 4. Technology Stack

### Backend

| Tool | Role | What Breaks Without It |
|------|------|------------------------|
| **TypeScript** | Primary language — strict typing | Silent bugs reach production; money and delivery logic breaks |
| **PostgreSQL** | Primary database | Financial transactions lose integrity; complex joins become impossible |
| **PostGIS** | Geospatial extension for PostgreSQL | Matching 10,000 trips becomes impossibly slow; platform cannot exist at scale |
| **Fastify** | Web server framework | GPS pings overwhelm the server; live tracking lags |
| **Prisma** | ORM — database gateway | Database gets out of sync with code; queries return unsafe data |
| **Zod** | Runtime data validation | Bad data enters the database; payments and coordinates corrupted |

### Mobile
| Tool | Role |
|------|------|
| **Expo + React Native** | Cross-platform app — one codebase for Android and iPhone |
| **TypeScript** | Type safety shared with backend via `/shared` |

### Admin
| Tool | Role |
|------|------|
| **Next.js** | Web-based internal dashboard |
| **Tailwind CSS** | Styling |

---

### Tool Deep Dives

#### TypeScript
TypeScript is JavaScript with a safety net. It catches type errors before code runs. For N-Trust, this is critical because the backend and mobile app are constantly passing data between each other. Without TypeScript, a status called `"IN_TRANSIT"` on the backend could silently mismatch `"in_transit"` on mobile — breaking live tracking. With the `/shared` package, both sides are forced to use identical definitions.

#### PostgreSQL + PostGIS
PostgreSQL was chosen for one decisive reason: **it supports PostGIS**.

PostGIS teaches the database to understand geography. Without it, finding travelers near a pickup point requires loading every active trip into memory and calculating distances manually in code — impossibly slow at scale. With PostGIS:

```sql
SELECT * FROM trips
WHERE ST_DWithin(origin_point, sender_location, 10000)
```

This runs in milliseconds for 10,000+ trips using spatial indexes.

**PostGIS enables in N-Trust:**
- Proximity matching at pickup AND dropoff
- Live tracking and ETA calculation
- Geofencing (alert when traveler enters pickup zone)
- Distance-based pricing
- Admin heatmaps of delivery density across Nigeria

#### Fastify
Chosen over Express for ~2-3x faster raw request throughput. When a traveler's phone sends a GPS ping every few seconds across thousands of concurrent deliveries, this performance difference is real and meaningful.

#### Prisma
`schema.prisma` is the single source of truth. From it, Prisma generates:
- The actual database tables (via migrations)
- A fully TypeScript-typed query client
- Complete data structure documentation

#### Zod
TypeScript checks code at build time. Zod validates data at runtime — from external sources TypeScript cannot protect against. Critical for N-Trust because:
- Payment amounts must be valid numbers, never strings
- GPS coordinates must be real lat/lng values
- Enum values must match exactly

Zod also bridges to TypeScript: `type CreateShipment = z.infer<typeof CreateShipmentSchema>` — one definition gives both compile-time and runtime safety.

---

## 5. Database Schema — 13 Models

### Relationship Map

```
        [ USER ]
       ↙        ↘
   [ TRIP ]   [ SHIPMENT ]
       ↘        ↙
      [ DELIVERY ]
           ↓
  [ TRANSACTION ROOM ]
    ↙      ↓       ↘
[MESSAGE] [PAYMENT] [DISPUTE]
           ↓
   [DELIVERY EVENT]
   [LOCATION PING]
   [PRICING CONFIG]
```

### Model Reference

| # | Model | What It Represents |
|---|-------|-------------------|
| 1 | **User** | All user types in one table — Role enum differentiates Sender, Traveler, Admin |
| 2 | **Trip** | A traveler's journey: route, vehicle type, available capacity, departure time |
| 3 | **Shipment** | A sender's package: size, weight, category, urgency, pickup/dropoff coordinates |
| 4 | **Delivery** | The match record — bridges a Shipment to a Trip |
| 5 | **TransactionRoom** | Escrow + communication container for each active delivery |
| 6 | **Message** | Individual chat messages inside a TransactionRoom |
| 7 | **LocationPing** | GPS coordinate snapshots from traveler's phone during transit |
| 8 | **Payment** | Financial records: escrow holds, payouts, platform fees |
| 9 | **DeliveryEvent** | Immutable, append-only activity log — picked up, in transit, delivered |
| 10 | **Dispute** | Conflict record with reason, evidence URLs, admin resolution |
| 11 | **PricingConfig** | The 20 configurable rules powering the pricing engine |

### Key Schema Decisions

- **UUID primary keys** — avoids sequential ID leakage, supports future scaling
- **Append-only tables** (Message, LocationPing, DeliveryEvent) have no `updated_at` — they are never modified, only added to
- **`snake_case` mapping** — matches PostgreSQL convention

### All Enums

```
Role:            SENDER | TRAVELER | ADMIN
AccountStatus:   PENDING | ACTIVE | SUSPENDED | BANNED
Tier:            BASIC | VERIFIED | PREMIUM
VehicleType:     MOTORCYCLE | CAR | VAN | TRUCK | BUS
TripStatus:      SCHEDULED | ACTIVE | COMPLETED | CANCELLED
SizeBracket:     SMALL | MEDIUM | LARGE | EXTRA_LARGE
WeightBracket:   LIGHT | MEDIUM | HEAVY | EXTRA_HEAVY
UrgencyLevel:    STANDARD | EXPRESS | SAME_DAY
PackageCategory: DOCUMENTS | ELECTRONICS | CLOTHING | FOOD | FRAGILE | GENERAL
ShipmentStatus:  PENDING | MATCHED | IN_TRANSIT | DELIVERED | CANCELLED | DISPUTED
DeliveryStatus:  PENDING_PICKUP | PICKED_UP | IN_TRANSIT | ARRIVED | DELIVERED | FAILED | CANCELLED
EscrowStatus:    HOLDING | RELEASED | REFUNDED | DISPUTED
PaymentStatus:   PENDING | PROCESSING | COMPLETED | FAILED | REFUNDED
RoomStatus:      ACTIVE | CLOSED | DISPUTED
MessageType:     TEXT | SYSTEM | NOTIFICATION
PingTrigger:     AUTOMATIC | MANUAL | GEOFENCE
DisputeReason:   NOT_DELIVERED | DAMAGED | WRONG_ITEM | LATE_DELIVERY | FRAUD | OTHER
DisputeStatus:   OPEN | UNDER_REVIEW | RESOLVED | CLOSED
```

---

## 6. Pricing Engine

20 database-stored rules calculate every delivery price in Naira:

```
┌─────────────────────────────────┐
│         BASE FEE (₦500)         │
├─────────────────────────────────┤
│  + DISTANCE RATE (₦15 per km)   │
├─────────────────────────────────┤
│  × WEIGHT MULTIPLIER            │
│    Light 1.0x → Extra Heavy 2.0x│
├─────────────────────────────────┤
│  × SIZE MULTIPLIER              │
│    Small 1.0x → Extra Large 2.0x│
├─────────────────────────────────┤
│  × URGENCY MULTIPLIER           │
│    Standard 1.0x → Same Day 2.0x│
├─────────────────────────────────┤
│  × VEHICLE RATE MODIFIER        │
│    Motorcycle 0.8x → Truck 1.6x │
├─────────────────────────────────┤
│  − PLATFORM FEE (10%)           │
│  − ESCROW FEE (2.5%)            │
├─────────────────────────────────┤
│  FLOOR: Minimum ₦300            │
└─────────────────────────────────┘
```

### All 20 Pricing Config Keys

| Key | Value | Description |
|-----|-------|-------------|
| `BASE_FEE` | ₦500 | Flat starting cost for any delivery |
| `DISTANCE_RATE_PER_KM` | ₦15 | Cost per kilometre |
| `WEIGHT_LIGHT_MULTIPLIER` | 1.0x | Under 2kg |
| `WEIGHT_MEDIUM_MULTIPLIER` | 1.2x | 2–10kg |
| `WEIGHT_HEAVY_MULTIPLIER` | 1.5x | 10–25kg |
| `WEIGHT_EXTRA_HEAVY_MULTIPLIER` | 2.0x | Over 25kg |
| `SIZE_SMALL_MULTIPLIER` | 1.0x | Small package |
| `SIZE_MEDIUM_MULTIPLIER` | 1.2x | Medium package |
| `SIZE_LARGE_MULTIPLIER` | 1.5x | Large package |
| `SIZE_EXTRA_LARGE_MULTIPLIER` | 2.0x | Extra large package |
| `URGENCY_STANDARD_MULTIPLIER` | 1.0x | Standard delivery |
| `URGENCY_EXPRESS_MULTIPLIER` | 1.5x | Express delivery |
| `URGENCY_SAME_DAY_MULTIPLIER` | 2.0x | Same day delivery |
| `VEHICLE_MOTORCYCLE_RATE` | 0.8x | Motorcycle modifier |
| `VEHICLE_CAR_RATE` | 1.0x | Car modifier |
| `VEHICLE_VAN_RATE` | 1.3x | Van modifier |
| `VEHICLE_TRUCK_RATE` | 1.6x | Truck modifier |
| `ESCROW_FEE_PERCENTAGE` | 2.5% | Escrow processing fee |
| `PLATFORM_FEE_PERCENTAGE` | 10% | N-Trust commission |
| `MINIMUM_DELIVERY_FEE` | ₦300 | Floor price |

> **Why stored in the database:** Business team adjusts pricing for market conditions without touching code or requiring a deployment.

---

## 7. Escrow & Payment Flow

Escrow is the **"Trust" in N-Trust — made tangible**.

### EscrowStatus State Machine

```
Sender Pays
     ↓
[ 💰 HOLDING ]
     ↓              ↘               ↘
[ ✅ RELEASED ]  [ ⚠️ DISPUTED ]  [ 🔄 REFUNDED ]
  Delivered         Problem raised    Delivery failed
  confirmed         Admin steps in    Sender refunded
```

### PaymentStatus States
`PENDING → PROCESSING → COMPLETED | FAILED | REFUNDED`

### TransactionRoom — the unified context

```
         [ TRANSACTION ROOM ]
        ↙         ↓         ↘
  [DELIVERY]  [PAYMENT]   [DISPUTE]
                  ↓
             [MESSAGES]
```

One room. One context. All parties. All money. All evidence.

---

## 8. Matching System

### How Matching Works

```
① Sender posts shipment
   📍 Pickup: Lagos Island   📍 Dropoff: Abuja CBD

② PostGIS queries the database
   ST_DWithin(pickup_point, 10km) AND
   ST_DWithin(dropoff_point, 10km)

③ Qualifying Travelers returned
   Only routes passing near BOTH points qualify

④ Match created
   Delivery record links Shipment + Trip
```

**Critical rule:** Both pickup AND dropoff must be within range. One out of two is not a match.

### Preventing Double-Matching

State machines on `TripStatus` and `ShipmentStatus` ensure once matched, neither can be matched again:

```
SHIPMENT: PENDING → MATCHED (locked)
TRIP: SCHEDULED → ACTIVE (locked)
```

---

## 9. Phase 1 — What Is Being Built Now

Phase 1 is **infrastructure only**. No user-facing features.

### ✅ Built in Phase 1
- Monorepo folder structure
- All four packages initialised
- Full Prisma schema (13 models, all enums)
- PostGIS enabled via Prisma preview features
- Database migration ready
- Seed script with 20 PricingConfig values
- Minimal Fastify server with `GET /api/v1/health`
- Expo mobile scaffold
- Next.js admin scaffold
- `docker-compose.yml` (PostGIS PostgreSQL + Redis)
- All `.env.example` files
- Root `.gitignore`

### ❌ Not Yet Built
- Authentication
- Matching algorithm
- Payment processing
- Mobile screens
- Admin pages
- Real-time systems
- Push notifications
- Ratings

### Verification Checklist

```bash
# 1. Start the database
docker-compose up -d

# 2. Copy and configure env
cp backend/.env.example backend/.env

# 3. Run migration
cd backend && npx prisma migrate dev --name init

# 4. Seed the database
npx prisma db seed

# 5. Start the server
npx tsx src/index.ts

# 6. Test health endpoint
curl http://localhost:3000/api/v1/health
# Expected: { "success": true, "message": "N-Trust API is running" }

# 7. Verify PostGIS
# In PostgreSQL: SELECT PostGIS_Version();
```

### Phase 1 Success Criteria

- [ ] `/n-trust` folder on Desktop with all four subfolders
- [ ] `npm install` runs without errors from root
- [ ] `prisma generate` runs without errors
- [ ] `prisma migrate dev` creates all 13 tables
- [ ] `SELECT PostGIS_Version()` returns a result
- [ ] `prisma db seed` inserts all 20 pricing records
- [ ] `GET /api/v1/health` returns `{ success: true }`
- [ ] Prisma Studio shows all tables and seed data
- [ ] Expo project initialises without errors
- [ ] Next.js project initialises without errors

> **Do not proceed to Phase 2 until every item above is confirmed.**

---

## 10. Roadmap Beyond Phase 1

```
🔵 PHASE 1 — NOW
   Foundation: monorepo, schema, migrations, seed, health check

🔵 PHASE 2
   Backend: authentication, trip/shipment APIs, PostGIS matching algorithm

🔵 PHASE 3
   Money: payment processing, escrow system, pricing engine

🔵 PHASE 4
   Mobile: screens, navigation, live tracking, chat UI, auth flows

🔵 PHASE 5
   Operations: admin dashboard, dispute management, moderation, analytics

🔵 PHASE 6+
   Scale: real-time systems, push notifications, ratings, performance
```

Each phase builds on the last. Skip a phase and the next one breaks.

---

## 11. Key Architectural Decisions

| Decision | Why |
|----------|-----|
| **Monorepo** | Shared types prevent frontend/backend drift |
| **PostgreSQL over NoSQL** | Financial integrity requires relational structure and ACID compliance |
| **PostGIS** | Geography at scale cannot be handled in application code |
| **Fastify over Express** | GPS ping volume demands high throughput |
| **Prisma** | Type-safe database access with managed migrations |
| **Zod** | External data cannot be trusted without runtime validation |
| **UUID keys** | Security and future scalability over sequential integers |
| **Configurable pricing** | Business rules belong in the database, not in code |
| **Escrow model** | Trust between strangers requires a neutral financial hold |
| **Shared enums package** | Most common source of silent mismatches is duplicated enum definitions |

---

## 12. Claude Code Build Prompt

Copy and paste the following into Claude Code to begin building Phase 1:

---

```
# N-Trust Platform — Phase 1 Build Instructions

## What You Are Building

You are building the foundational infrastructure for N-Trust, a peer-to-peer package 
delivery platform built for the Nigerian market. N-Trust connects Senders (people with 
packages) to Travelers (people already making journeys with spare space) who carry 
packages along their existing route for payment.

The name means everything: "N" for Nigeria, "Trust" for the foundational principle 
every feature is built on — escrow payments, GPS tracking, in-app chat, and dispute 
resolution all exist to build trust between strangers.

The platform handles:
- Real money (escrow-based payments in Naira)
- Real-time GPS tracking of deliveries in transit
- Geospatial matching of senders to nearby travelers using PostGIS
- In-app chat between senders and travelers
- Admin moderation, dispute resolution, and pricing management

This is NOT a simple CRUD app. Correctness and type safety are critical throughout.

---

## Monorepo Structure

Create this on the Desktop:
~/Desktop/n-trust/
  /backend     → Fastify API server, Prisma ORM, all business logic
  /mobile      → Expo React Native app for senders and travelers
  /admin       → Next.js dashboard for internal N-Trust staff
  /shared      → Shared TypeScript types and enums used by all packages

---

## Technology Stack

Backend: TypeScript, Fastify, PostgreSQL, PostGIS, Prisma, Zod, dotenv
Mobile: Expo (managed workflow), TypeScript
Admin: Next.js, Tailwind CSS, TypeScript
Shared: TypeScript only — no runtime dependencies

---

## Phase 1 Objectives

1. Complete monorepo folder structure
2. All four packages initialised with correct package.json files
3. npm workspaces configured at root
4. Shared TypeScript base config at root
5. Shared enums and API types in /shared
6. Full Prisma schema with all 13 models and all enums
7. PostGIS enabled via Prisma preview features
8. Database migration ready to run
9. Seed script with 20 PricingConfig default values (Naira-based)
10. Minimal Fastify server with GET /api/v1/health
11. Mobile Expo app initialised
12. Admin Next.js app initialised with TypeScript and Tailwind
13. docker-compose.yml with PostGIS PostgreSQL and Redis
14. All .env.example files
15. Root .gitignore

---

## Root Files

### package.json
{
  "name": "n-trust",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["backend", "mobile", "admin", "shared"],
  "scripts": {
    "dev:backend": "npm run dev --workspace=backend",
    "dev:mobile": "npm run dev --workspace=mobile",
    "dev:admin": "npm run dev --workspace=admin",
    "build:backend": "npm run build --workspace=backend",
    "build:admin": "npm run build --workspace=admin"
  }
}

### tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}

### docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    container_name: n_trust_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: n_trust_db
    ports:
      - "5432:5432"
    volumes:
      - n_trust_postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
  redis:
    image: redis:7-alpine
    container_name: n_trust_redis
    ports:
      - "6379:6379"
    volumes:
      - n_trust_redis_data:/data
    restart: unless-stopped
volumes:
  n_trust_postgres_data:
  n_trust_redis_data:

---

## Shared Package

### shared/src/types/enums.ts
Export all enums: Role, AccountStatus, Tier, VehicleType, TripStatus, SizeBracket, 
WeightBracket, UrgencyLevel, PackageCategory, ShipmentStatus, DeliveryStatus, 
EscrowStatus, PaymentStatus, RoomStatus, MessageType, PingTrigger, DisputeReason, 
DisputeStatus, PricingKey

### shared/src/types/api.ts
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

---

## Prisma Schema (backend/prisma/schema.prisma)

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

Include all enums from the shared package mirrored here.
Include all 13 models: User, Trip, Shipment, Delivery, TransactionRoom, Message,
LocationPing, Payment, DeliveryEvent, Dispute, PricingConfig.

All models use UUID @id @default(uuid()).
All models have created_at DateTime @default(now()).
User, Trip, Shipment, Delivery, TransactionRoom, Payment, Dispute, PricingConfig 
also have updated_at DateTime @updatedAt.
Message, LocationPing, DeliveryEvent are append-only — no updated_at.

---

## Seed Script (backend/prisma/seed.ts)

Insert 20 PricingConfig records using upsert (idempotent):
BASE_FEE: 500
DISTANCE_RATE_PER_KM: 15
WEIGHT_LIGHT_MULTIPLIER: 1.0
WEIGHT_MEDIUM_MULTIPLIER: 1.2
WEIGHT_HEAVY_MULTIPLIER: 1.5
WEIGHT_EXTRA_HEAVY_MULTIPLIER: 2.0
SIZE_SMALL_MULTIPLIER: 1.0
SIZE_MEDIUM_MULTIPLIER: 1.2
SIZE_LARGE_MULTIPLIER: 1.5
SIZE_EXTRA_LARGE_MULTIPLIER: 2.0
URGENCY_STANDARD_MULTIPLIER: 1.0
URGENCY_EXPRESS_MULTIPLIER: 1.5
URGENCY_SAME_DAY_MULTIPLIER: 2.0
VEHICLE_MOTORCYCLE_RATE: 0.8
VEHICLE_CAR_RATE: 1.0
VEHICLE_VAN_RATE: 1.3
VEHICLE_TRUCK_RATE: 1.6
ESCROW_FEE_PERCENTAGE: 2.5
PLATFORM_FEE_PERCENTAGE: 10
MINIMUM_DELIVERY_FEE: 300

---

## Health Endpoint (backend/src/index.ts)

Fastify server listening on PORT env var (default 3000).
GET /api/v1/health returns:
{ success: true, message: "N-Trust API is running", timestamp: ISO string, version: "1.0.0" }

---

## Mobile

Run inside /mobile:
npx create-expo-app . --template blank-typescript
Set package name to @n-trust/mobile

---

## Admin

Run inside /admin:
npx create-next-app . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
Set package name to @n-trust/admin

---

## Verification

docker-compose up -d
cp backend/.env.example backend/.env
cd backend && npx prisma migrate dev --name init
npx prisma db seed
npx tsx src/index.ts
curl http://localhost:3000/api/v1/health

Phase 1 complete when all 13 tables exist, 20 seed records inserted,
health endpoint returns success, and SELECT PostGIS_Version() returns a result.
Do not proceed to Phase 2 until all verified.
```

---

## 13. NotebookLM Prompts

### Concise Research Prompt

```
Generate a comprehensive video overview for N-Trust, a peer-to-peer 
package delivery platform built for the Nigerian market.

Cover these sections:
1. WHAT IS N-TRUST — name meaning, business model, three user types, delivery lifecycle
2. TECHNICAL ARCHITECTURE — monorepo, four packages, why /shared is the contract layer
3. TECHNOLOGY STACK — for each tool: what it does, why chosen for N-Trust, what breaks without it
   (TypeScript, PostgreSQL, PostGIS, Fastify, Prisma, Zod, Expo, Next.js)
4. DATABASE SCHEMA — all 13 models and their relationships
5. PRICING ENGINE — the 20 Naira-based configurable rules, why stored in DB not code
6. ESCROW AND PAYMENT FLOW — EscrowStatus state machine, TransactionRoom as unified context
7. MATCHING SYSTEM — PostGIS ST_DWithin, why BOTH pickup and dropoff must qualify
8. PHASE 1 — what is and isn't built, the concrete slab analogy
9. ROADMAP — six phases from foundation to scale
10. KEY DECISIONS — every architectural choice tied back to N-Trust being location-dependent, money-handling, trust-first

TONE: Mixed audience — developers and non-technical Nigerian market investors.
Open with what the name N-Trust means. Use Nigerian context (Lagos to Abuja, Naira, 
Android/iPhone market reality). Plain analogies before technical terms.
Close with the vision: any Nigerian can send anything, anywhere, with anyone — safely.
```

### Infographic Prompt

```
Create a single comprehensive infographic for N-Trust, a peer-to-peer 
package delivery platform built for Nigeria.

STYLE: Modern, clean, dark background, Nigerian green and white accent colours, 
icon-driven, minimal text, maximum visual clarity.

LAYOUT: 10 panels in a magazine-style grid on one canvas.

PANEL 1 — WHAT IS N-TRUST?
Hero headline: "Send Anything. Anywhere. With Anyone. Safely."
Name split: [N] = Nigeria  [TRUST] = Foundation of every feature
3 user icons: 📦 Sender  🚗 Traveler  🛡️ Admin
6-step timeline: Post → Match → Pay Escrow → Pickup → Track → Delivered

PANEL 2 — ARCHITECTURE
Tree: /n-trust → /backend  /mobile  /admin  /shared
Callout: "/shared is the contract layer keeping all four in sync"

PANEL 3 — TECH STACK
8-card grid: Tool name + emoji + one line on what breaks without it
TypeScript · PostgreSQL · PostGIS · Fastify · Prisma · Zod · Expo · Next.js

PANEL 4 — DATABASE: 13 MODELS
Node diagram: User → Trip + Shipment → Delivery → TransactionRoom
→ Message + Payment + Dispute + DeliveryEvent + LocationPing + PricingConfig

PANEL 5 — PRICING ENGINE
Stacked formula blocks in Naira:
Base Fee ₦500 + Distance ₦15/km × Weight × Size × Urgency × Vehicle
− Platform Fee 10% − Escrow Fee 2.5% ≥ Floor ₦300
Badge: 20 configurable database values. No hardcoding.

PANEL 6 — ESCROW FLOW
State machine: Sender Pays → [HOLDING] → RELEASED ✅ / DISPUTED ⚠️ / REFUNDED 🔄
Callout: "The Trust in N-Trust. Made tangible."

PANEL 7 — MATCHING SYSTEM
Map of Nigeria with two pins: Lagos pickup · Abuja dropoff
PostGIS ST_DWithin draws 10km radius around both pins
Label: "Traveler must pass near BOTH points to qualify"

PANEL 8 — PHASE 1 NOW
Two columns:
✅ Built: schema · migrations · seed · health endpoint · scaffolding
❌ Not yet: auth · matching · payments · screens · real-time
Bottom: "Phase 1 is the concrete slab. Nothing builds without it."

PANEL 9 — ROADMAP
Vertical timeline: ① Foundation ② Auth + APIs ③ Payments ④ Mobile ⑤ Admin ⑥ Scale

PANEL 10 — CLOSING BANNER
Full-width bold type:
"Any Nigerian. Any package. Any route.
Safely. Transparently. With complete trust."
Logo centred: N-TRUST · Built in Nigeria. Built for Nigeria.
```

---

*Last updated: Phase 1 planning complete. Proceed to Phase 2 only after all Phase 1 verification criteria are confirmed.*
