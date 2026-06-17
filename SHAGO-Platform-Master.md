# SHAGO Platform — Master Architecture & Comprehensive Plan

> **SHAGO** = "Shopper" — A metro-based eCommerce platform connecting Wholesalers, Retailers, and Delivery Agents through an AI-driven, location-integrated system operated by **CYBERNET SYSTEMS**.

---

## Table of Contents

1. [Business Overview](#1-business-overview)
2. [The Market Problem](#2-the-market-problem)
3. [The Four User Types](#3-the-four-user-types)
4. [Revenue Model](#4-revenue-model)
5. [System Architecture — The Separation Strategy](#5-system-architecture--the-separation-strategy)
6. [Application Breakdown](#6-application-breakdown)
7. [API Communication Layer](#7-api-communication-layer)
8. [Database Schema Plan](#8-database-schema-plan)
9. [Core Workflows — Step by Step](#9-core-workflows--step-by-step)
10. [Delivery Service Model](#10-delivery-service-model)
11. [Payment & Escrow System](#11-payment--escrow-system)
12. [Customer Service & Dispute Resolution](#12-customer-service--dispute-resolution)
13. [Technology Stack Recommendation](#13-technology-stack-recommendation)
14. [Phased Build Roadmap](#14-phased-build-roadmap)
15. [Key Architectural Decisions](#15-key-architectural-decisions)

---

## 1. Business Overview

SHAGO is a **B2B eCommerce + Logistics platform** that digitises and automates the daily supply chain between wholesale distributors and small-scale retail shops in Nigerian metropolitan areas.

**The core insight:** Retailers spend 1–3 hours every day physically traveling to wholesale markets to restock. This closes their shops during peak hours, costs them sales, and exhausts them. SHAGO eliminates this entirely — a retailer places an order in under 3 minutes, and goods arrive at their door before the morning rush.

**Operated by:** CYBERNET SYSTEMS  
**Primary market:** Metropolitan Nigeria (Kaduna, Kano, and beyond)  
**Currency:** Nigerian Naira (₦)

### The Win-Win-Win-Win Model

| Participant | What They Gain |
|-------------|----------------|
| **Retailer** | Never close shop to restock. Lower delivery costs. Better prices. |
| **Wholesaler** | Hundreds of new retailer customers. Digital orders. Zero queuing chaos. |
| **Logistics Agent** | Multiple deliveries per trip. Predictable zone-based income. |
| **Sales Agent** | Formal employment. Digital skills. Stable daily income. |
| **CYBERNET SYSTEMS** | Passive, autonomous profit from every transaction. |

---

## 2. The Market Problem

### Problem 1: The Daily Reorder Ritual
Retailers physically close their shops every day to travel to wholesale markets. A 2-hour closure on a shop with a ₦10,000 daily profit target = ₦2,500–₦5,000 in lost daily revenue — **₦75,000–₦150,000 per month in preventable losses**.

### Problem 2: Phone Orders Are Unreliable
When reorder lists grow to 20–50 items, phone-based orders break down:
- "Two cartons of **large** milk" → arrives as "two cartons of **small** milk"
- No real-time order status visibility
- No confirmation of receipt or dispatch
- No recourse when the wrong items arrive

### Problem 3: No Dedicated Last-Mile Delivery
Existing transport options (motorcycle taxis, okada, boda boda) are:
- **Expensive** — full trip cost borne by one retailer (₦2,400–₦4,000 per trip)
- **Unreliable** — agents cancel if a better passenger fare appears
- **Unspecialised** — passenger drivers treat goods as secondary cargo

### The SHAGO Solution
```
Problem                         SHAGO Solution
─────────────────────────────────────────────────────────
Shop closes to restock          Order in 3 minutes on mobile app
Phone order errors              Image-based digital order with QR confirmation
No delivery tracking            Live GPS tracking, ETA, and QR scan at delivery
High delivery cost              Shared multi-stop delivery: ₦150–₦500 vs ₦2,400+
No dispute resolution           24/7 CS + photo evidence + escrow-backed refunds
```

### Market Scale (Nigeria)
| City | Estimated Active Retailers | Wholesale Clusters |
|------|--------------------------|-------------------|
| Kaduna | ~2,000 shops | 1–2 dense markets |
| Kano | ~5,000 shops | 2–3 dense markets |
| Lagos | ~20,000+ shops | Multiple zones |

All products flow from **5–10 major wholesalers** within a **500m × 500m to 1km² zone** — extreme supply concentration that makes shared delivery highly efficient.

---

## 3. The Four User Types

### 3.1 Retailer (Shop Owner)
- Places daily product orders via mobile app
- Tracks delivery in real-time
- Confirms receipt via QR scan
- Files complaints within 60-minute window
- Saves "Quick Reorder" templates for repeat orders

### 3.2 Wholesaler (Bulk Distributor)
- Maintains real-time product catalog and inventory on the platform
- Receives digital orders (no more queuing chaos)
- Has pre-negotiated discount rates with CYBERNET SYSTEMS per product
- Receives payment automatically (minus SHAGO's margin) upon delivery confirmation

### 3.3 Sales Agent (Market-Based Fulfillment Worker)
- Stationed inside the wholesale market
- Receives digital orders on tablet/phone
- Physically picks, packs, and tags each order
- Affixes unique ORDER-NUMBER tag to every package
- Marks orders "Ready for Pickup"
- Assigns logistics agent number to packages

### 3.4 Logistics Agent (Delivery Driver)
- Assigned orders grouped by geographic zone
- Picks up bundled packages from wholesale market
- Delivers to multiple retailers per trip (3–8 stops)
- Scans QR code at each shop to confirm delivery
- Uses CNG three-wheelers or electric bikes
- Receives delivery fee automatically via the platform

### 3.5 Admin (CYBERNET SYSTEMS)
- Full oversight via web-based Admin Dashboard
- Onboards and manages all user accounts
- Monitors orders, payments, disputes, and fleet
- Adjusts pricing, discounts, and zone assignments
- Reviews escalated disputes and issues binding resolutions

---

## 4. Revenue Model

### Stream 1: Negotiated Wholesaler Discounts (Primary)
SHAGO negotiates product-specific discount rates before onboarding each wholesaler.

```
Example:
  Wholesale list price:       ₦1,000
  Negotiated discount:        5% (₦50)
  Wholesaler receives:        ₦950
  SHAGO gross profit:         ₦50 per unit — automatically deducted at payment release
```

Typical discount rates by category:
| Category | Discount Range |
|----------|---------------|
| Beverages (Coca-Cola, etc.) | 4–6% |
| Biscuits & Snacks | 3–5% |
| Noodles | 3–4% |
| Dairy | 2–4% |
| Cleaning Supplies | 3–5% |

### Stream 2: Direct Producer Sales (Higher Margin)
For high-demand products, SHAGO sources directly from manufacturers:
```
Factory price:       ₦800
SHAGO sells at:      ₦1,000
Gross profit:        ₦200 per unit (vs ₦50 via wholesaler route)
```

### Stream 3: Wholesaler-to-Consumer Direct (B2C)
End consumers (households) order via the SHAGO consumer app. They pay retail prices; SHAGO captures the spread between wholesale cost and consumer price.

### Stream 4: Delivery Fees (Automated)
```
Distance-based fee calculation:
  1 km:     ₦500
  3 km:     ₦1,200
  5 km:     ₦2,000
  
SHAGO takes 10% of delivery fee.
Logistics agent receives 90%.

At 5 stops × ₦1,200 avg fee = ₦6,000 total delivery revenue per trip
SHAGO earns: ₦600 | Agent earns: ₦5,400 | CNG fuel cost: ₦600
Agent net profit per trip: ₦4,800
```

---

## 5. System Architecture — The Separation Strategy

### The Core Decision: Two Independent Applications

Based on your directive, the platform will be built as **two separate, independently deployable applications** that communicate through a shared backend API:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHAGO BACKEND API SERVER                      │
│              (Single source of truth — shared core)              │
│                                                                   │
│  ┌─────────────────┐              ┌─────────────────────────┐   │
│  │  eCommerce API  │              │    Logistics API         │   │
│  │  /api/commerce  │              │    /api/logistics        │   │
│  └────────┬────────┘              └──────────┬──────────────┘   │
│           │                                   │                   │
└───────────┼───────────────────────────────────┼───────────────────┘
            │                                   │
            ▼                                   ▼
┌─────────────────────┐             ┌───────────────────────┐
│  SHAGO eCOMMERCE    │             │  SHAGO LOGISTICS       │
│  APPLICATION        │             │  APPLICATION           │
│                     │             │                        │
│  • Retailer App     │◄────────────►  • Driver App          │
│  • Wholesaler App   │  API calls  │  • Sales Agent App     │
│  • Consumer App     │             │  • Fleet Dashboard     │
│  • Admin Dashboard  │             │  • Route Optimizer     │
└─────────────────────┘             └───────────────────────┘
```

### Why Separate?

| Reason | Detail |
|--------|--------|
| **Independent scaling** | Logistics traffic spikes at 7–9 AM (morning delivery rush). eCommerce traffic spikes at 6–10 PM (evening ordering). Each app scales independently. |
| **Independent deployment** | A bug fix in the Logistics app doesn't require redeploying the eCommerce app |
| **Team specialisation** | Two development teams can work in parallel without codebase conflicts |
| **Future flexibility** | The Logistics app can be licensed to third parties (other eCommerce businesses) independent of SHAGO's marketplace |
| **Security isolation** | Payment data (eCommerce) and GPS/fleet data (Logistics) have different security profiles and compliance needs |

### How They Communicate
The two apps are **decoupled but coordinated** through the shared backend via:
- **Webhooks** — eCommerce triggers Logistics when an order is marked "Ready for Pickup"
- **REST API calls** — Logistics notifies eCommerce when delivery is confirmed (to release escrow)
- **Shared event queue** — Both apps publish and subscribe to order lifecycle events
- **Shared database** — Single PostgreSQL database with PostGIS, accessed by both via their respective API namespaces

---

## 6. Application Breakdown

### 6.1 SHAGO eCommerce Application

**Purpose:** Everything from order placement to payment. The marketplace side.

**Sub-applications within eCommerce:**

#### Retailer Mobile App (React Native / Expo)
- Image-based product catalog (2 cards per row, large images)
- Category drawer (Beverages, Biscuits, Noodles, Dairy, etc.)
- Cart with real-time total, quantity selectors per unit-of-measure
- Barcode/QR scan-to-reorder
- Saved "Quick Reorder" templates
- Live order tracking (map view of logistics agent)
- Complaint submission with photo upload
- Order history and receipts
- Digital wallet and payment gateway

#### Wholesaler Web/Mobile App
- Product catalog management (add, edit, update inventory)
- Incoming order dashboard with notification badges
- Order detail view (product image, quantity, retailer info)
- Accept/decline specific items (mark out-of-stock)
- Sales analytics (daily/weekly/monthly turnover)
- Payment ledger (what was received, what SHAGO deducted)

#### Consumer Mobile App (B2C — Phase 2)
- Similar to Retailer app but priced for household quantities
- Household delivery scheduling
- Consumer loyalty points

#### Admin Dashboard (Web — Next.js)
- All users, orders, payments, complaints in one view
- Onboard and manage wholesalers (set product-specific discount rates)
- Financial reconciliation (gross revenue, SHAGO margin, agent payouts)
- Dispute resolution tools (view evidence, issue refunds)
- Platform-wide analytics

---

### 6.2 SHAGO Logistics Application

**Purpose:** Everything from package pickup to doorstep delivery. The fleet side.

**Sub-applications within Logistics:**

#### Sales Agent App (Mobile — React Native)
- Receive incoming order notifications
- Order detail view with packing checklist
- Mark items as packed
- Print/generate ORDER-NUMBER tag (QR code with order ID)
- Assign logistics agent from available driver list
- Mark order "Ready for Pickup"
- Photo-capture of packed order (for dispute evidence)

#### Logistics Agent (Driver) App (Mobile — React Native)
- View assigned bundled orders (3–8 per trip)
- Map view: pickup point + all drop-off locations
- Turn-by-turn route navigation (optimal sequence)
- QR scan at each delivery stop (confirm arrival)
- Retailer's "Confirm Receipt" trigger
- Earnings dashboard (per trip, daily, weekly)
- In-app communication with retailers

#### Fleet Management Dashboard (Web)
- All active drivers on a live map
- Zone assignments (Zone 1: Tudun Wada, Zone 2: Barnawa, etc.)
- Current driver load (orders assigned per driver)
- Fleet energy consumption reports (CNG vs electric)
- Driver performance metrics (deliveries per day, complaint rate)
- Driver onboarding and zone assignment

#### Route Optimizer (Internal Engine)
- Groups orders by geographic zone
- Calculates optimal delivery sequence
- Minimises deadhead miles (return trip without cargo)
- Auto-assigns orders to nearest available driver in the correct zone

---

## 7. API Communication Layer

### Shared Backend API Structure

```
SHAGO Backend API
│
├── /api/v1/auth              → Authentication (shared by both apps)
│
├── /api/v1/commerce          → eCommerce API namespace
│   ├── /products             → Product catalog CRUD
│   ├── /orders               → Order placement and management
│   ├── /payments             → Payment gateway and escrow
│   ├── /wholesalers          → Wholesaler management
│   ├── /retailers            → Retailer management
│   └── /complaints           → Dispute and complaint system
│
├── /api/v1/logistics         → Logistics API namespace
│   ├── /agents               → Driver management and assignment
│   ├── /zones                → Geographic zone configuration
│   ├── /routes               → Route optimisation
│   ├── /deliveries           → Delivery lifecycle management
│   ├── /tracking             → Real-time GPS and ETA
│   └── /fleet                → Fleet energy and performance data
│
└── /api/v1/admin             → Admin API (cross-cutting)
    ├── /users                → All user management
    ├── /analytics            → Platform-wide reporting
    └── /config               → System configuration
```

### Cross-App Event Flow (Webhooks)

```
eCommerce App                     Logistics App
─────────────────────────────────────────────────────
Order Placed
    ↓
Payment Held in Escrow
    ↓
Order Routed to Wholesaler
    ↓
Sales Agent Packs Order
    ↓
"Ready for Pickup" event ─────────► Logistics receives order assignment
                                        ↓
                                    Driver assigned to zone
                                        ↓
                                    Driver picks up from market
                                        ↓
                                    "In Transit" event ◄──────── Live tracking feed to eCommerce
                                        ↓
                                    QR scan at retailer shop
                                        ↓
                          "Delivered" event ─────────► eCommerce releases escrow
                                                             ↓
                                                         Wholesaler paid (minus SHAGO margin)
                                                         Driver paid delivery fee
```

### Key API Contracts Between Apps

| Event | From | To | Payload |
|-------|------|----|---------|
| `order.ready_for_pickup` | eCommerce | Logistics | `{order_id, wholesaler_location, items_count, zone_code}` |
| `delivery.in_transit` | Logistics | eCommerce | `{order_id, driver_id, eta_minutes, current_lat, current_lng}` |
| `delivery.location_update` | Logistics | eCommerce | `{order_id, lat, lng, timestamp}` |
| `delivery.completed` | Logistics | eCommerce | `{order_id, delivered_at, qr_scan_timestamp, driver_id}` |
| `delivery.failed` | Logistics | eCommerce | `{order_id, reason, driver_id, timestamp}` |
| `complaint.filed` | eCommerce | Logistics | `{complaint_id, order_id, issue_type, evidence_urls}` |

---

## 8. Database Schema Plan

Both applications share a single PostgreSQL database with PostGIS extension for geospatial operations.

### Core Models

```
USER
  id (UUID), role (RETAILER | WHOLESALER | SALES_AGENT | LOGISTICS_AGENT | ADMIN | CONSUMER)
  name, phone, email, password_hash, status, zone_id
  created_at, updated_at

ZONE
  id (UUID), name, city, boundary (PostGIS POLYGON)
  assigned_agent_count, is_active

WHOLESALER_PROFILE
  id (UUID), user_id, business_name, address, lat, lng
  market_cluster_id, is_verified

PRODUCT
  id (UUID), wholesaler_id, name, category, image_url
  unit_of_measure (PIECE | PACKET | ROLL | CARTON | BAG)
  unit_multiplier (e.g. 24 for a Coca-Cola carton)
  list_price, shago_discount_rate, barcode, qr_code
  stock_count, is_available

PRODUCT_CATEGORY
  id (UUID), name, icon_url, display_order

ORDER
  id (UUID), retailer_id, wholesaler_id
  status (PENDING | CONFIRMED | PACKED | READY | IN_TRANSIT | DELIVERED | DISPUTED | CANCELLED)
  subtotal, delivery_fee, shago_margin, total
  order_number (human-readable, printable)
  delivery_address, delivery_lat, delivery_lng
  created_at, updated_at

ORDER_ITEM
  id (UUID), order_id, product_id
  quantity, unit_price, line_total, shago_discount_amount

DELIVERY
  id (UUID), order_id, logistics_agent_id, sales_agent_id
  status (ASSIGNED | PICKED_UP | IN_TRANSIT | ARRIVED | COMPLETED | FAILED)
  pickup_qr_scanned_at, delivered_at
  delivery_fee, agent_payout, shago_delivery_margin
  route_polyline (PostGIS LINESTRING)

LOCATION_PING
  id (UUID), driver_id, delivery_id
  lat, lng, accuracy, timestamp (no updated_at — append only)

ORDER_TAG
  id (UUID), order_id, tag_number (ORDER-NUMBER printed on package)
  qr_code_url, printed_at, affixed_by (sales_agent_id)

COMPLAINT
  id (UUID), order_id, filed_by (retailer_id)
  type (MISSING_ITEM | DAMAGED | WRONG_ITEM | NOT_DELIVERED | OTHER)
  description, evidence_urls[], status (OPEN | REVIEWING | RESOLVED | CLOSED)
  resolution, refund_amount, resolved_by (admin_id), resolved_at
  created_at

PAYMENT
  id (UUID), order_id, payer_id
  amount, escrow_status (HOLDING | RELEASED | REFUNDED | DISPUTED)
  payment_method, provider_reference
  wholesaler_payout, agent_payout, shago_profit
  released_at, created_at

PRODUCT_DISCOUNT_RATE
  id (UUID), product_id, wholesaler_id
  discount_rate (%), effective_from, effective_to, is_active

QUICK_REORDER_TEMPLATE
  id (UUID), retailer_id, name
  items (JSON array of {product_id, quantity})
  created_at

ZONE_ASSIGNMENT
  id (UUID), logistics_agent_id, zone_id
  assigned_from, assigned_to, is_current
```

### PostGIS Usage
- `Zone.boundary` — POLYGON defining each delivery zone
- `Wholesaler.location` — POINT for proximity queries
- `Delivery.route_polyline` — LINESTRING for route visualisation
- `ST_DWithin` — find drivers within X km of a pickup point
- `ST_Contains` — determine which zone a delivery address falls in
- `ST_Distance` — calculate delivery fee based on exact distance

---

## 9. Core Workflows — Step by Step

### Workflow A: Retailer Places an Order

```
① Retailer opens SHAGO eCommerce app
   └─ Browses image-based catalog by category

② Retailer adds items to cart
   └─ System enforces unit-of-measure rules (e.g. Coca-Cola in multiples of 24)
   └─ Real-time subtotal updates

③ Retailer reviews cart
   └─ System calculates delivery fee (distance matrix: wholesaler → retailer)
   └─ Shows final total including SHAGO-negotiated price (already includes margin)

④ Retailer pays
   └─ Digital wallet / card / bank transfer
   └─ Funds held in ESCROW — not yet released

⑤ Order confirmed
   └─ Unique ORDER-NUMBER generated
   └─ Push notification to assigned Sales Agent
   └─ Push notification to Wholesaler
   └─ Retailer sees "Order Confirmed" status
```

### Workflow B: Sales Agent Fulfills the Order

```
① Sales Agent receives push notification with order details
   └─ Views: product list with images, quantities, special notes

② Sales Agent picks products from wholesaler shelves
   └─ Checks each item against the digital list
   └─ Takes photo of packed contents (dispute evidence)

③ Sales Agent packs and tags the order
   └─ Places items in durable container (crate, bag, or box)
   └─ Prints ORDER-NUMBER tag (QR code + order number + retailer name + address)
   └─ Affixes tag visibly to package

④ Sales Agent assigns a Logistics Agent
   └─ Selects from list of available drivers in the correct zone
   └─ Places package in designated loading area

⑤ Marks order "Ready for Pickup"
   └─ Event fires → Logistics App notified
   └─ Retailer app updates to "Packed — awaiting pickup"
```

### Workflow C: Logistics Agent Delivers

```
① Logistics Agent receives bundled order notification
   └─ Sees 3–8 orders grouped by zone on their driver app

② Agent travels to wholesale market
   └─ Scans PICKUP QR code at market loading area
   └─ System records pickup time and confirms package handoff

③ Agent loads packages, opens route map
   └─ System shows optimised delivery sequence (closest stop first)
   └─ Turn-by-turn navigation active

④ At each retail shop:
   └─ Agent taps "Deliver" and scans QR code on shop doorframe/counter
   └─ System records GPS location + timestamp
   └─ Retailer receives "Driver arrived" push notification

⑤ Retailer verifies goods and taps "Confirm Receipt"
   └─ System marks order DELIVERED
   └─ Escrow releases:
       - Wholesaler receives payment (minus SHAGO margin)
       - Agent receives delivery fee (minus SHAGO's 10%)
       - SHAGO profit credited automatically

⑥ Retailer has 60-minute complaint window
   └─ If no complaint filed → order fully closed
```

### Workflow D: Complaint and Dispute

```
① Retailer finds issue (missing item, wrong product, damage)
   └─ Taps "Report Problem" within 60 minutes of delivery

② Retailer submits complaint
   └─ Selects affected item from order
   └─ Uploads photo evidence
   └─ Writes description

③ System creates complaint ticket
   └─ Notifies Sales Agent and Wholesaler for response
   └─ Escrow for disputed amount placed on hold

④ Customer Service reviews within 4 hours
   └─ Simple errors (missing 1 item) → automatic refund from wholesaler balance
   └─ Complex disputes (missing entire order) → escalated to human manager

⑤ Resolution
   └─ Credit issued to retailer wallet OR
   └─ Partial refund from wholesaler's OR agent's pending balance
   └─ Ticket closed, all parties notified
```

---

## 10. Delivery Service Model

### Energy Strategy

| Vehicle | Fuel Type | Cost per km | Range | Best Use |
|---------|-----------|-------------|-------|----------|
| Three-wheeler (Keke) | CNG | ₦35/km | 150km/fill | 4–8 orders, city routes |
| Two-wheeler (Bike) | Electric | ₦8/km | 60km/charge | 2–4 orders, dense areas |
| Two-wheeler (Bike) | Petrol | ₦80/km | — | Phased out |

### Shared Delivery Economics

```
Example Trip: 5 retailers in Zone 3
─────────────────────────────────────────────
Delivery fees collected:     5 × ₦1,200 = ₦6,000
CNG fuel cost:                             ₦600
SHAGO's 10% of fees:                       ₦600
Agent net earnings:                        ₦4,800

vs. Traditional (one retailer per trip):
Retailer pays:                             ₦3,500
Driver nets (after fuel):                  ₦2,900
```

### Zone-Based Assignment System
Each logistics agent is assigned a specific geographic zone (e.g., Zone 4: Tudun Wada). This ensures:
- Agents know their zone deeply (faster navigation)
- Minimal deadhead miles (agent ends the day near home)
- Fleet efficiency improves by an estimated **30%**
- Retailers in a zone get consistent, familiar delivery agents (builds trust)

### Zone Determination via PostGIS
```sql
-- Which zone does a delivery address fall in?
SELECT z.name FROM zones z
WHERE ST_Contains(z.boundary, ST_Point(retailer_lng, retailer_lat))

-- Which drivers are currently in the right zone and available?
SELECT u.name, u.phone FROM users u
JOIN zone_assignments za ON za.logistics_agent_id = u.id
WHERE za.zone_id = $zone_id AND u.status = 'AVAILABLE'
  AND ST_DWithin(u.current_location, pickup_point, 2000)
ORDER BY ST_Distance(u.current_location, pickup_point)
LIMIT 1
```

---

## 11. Payment & Escrow System

### Payment Flow

```
Retailer pays full order total (subtotal + delivery fee)
                ↓
        [ ESCROW — HOLDING ]
                ↓
    Delivery confirmed (QR scan + Retailer confirms)
                ↓
    ┌───────────────────────────────────┐
    │ Automatic disbursement:           │
    │  Wholesaler ← (subtotal − margin) │
    │  Driver    ← (delivery fee × 90%) │
    │  SHAGO     ← margin + 10% of fee  │
    └───────────────────────────────────┘
```

### Escrow States
```
HOLDING → payment received, delivery pending
RELEASED → delivery confirmed, funds disbursed
REFUNDED → delivery failed or complaint upheld
DISPUTED → complaint filed, funds frozen pending review
```

### Distance-Based Delivery Fee Algorithm
```
Base fee:          ₦300 (covers first 1km)
Rate per km:       ₦200/km beyond 1km
Surge multiplier:  1.0–1.5x (based on peak hours / driver availability)

Formula:
  fee = BASE_FEE + (MAX(0, distance_km − 1) × RATE_PER_KM) × surge_multiplier
  
SHAGO takes 10% of final fee.
Driver receives 90%.
```

---

## 12. Customer Service & Dispute Resolution

### Contact Channels
- **Toll-free voice hotline** — 24/7
- **In-app live chat** — 24/7
- **Email** — non-urgent issues

### Service Level Agreements (SLAs)
| Issue Type | Target Response | Target Resolution |
|------------|----------------|-------------------|
| Phone support wait | < 3 minutes | — |
| Simple complaint (1 missing item) | 2 hours | 4 hours |
| Complex dispute (missing order) | 2 hours | 24 hours |
| Fraud investigation | 4 hours | 48 hours |

### Liability Framework
```
Error Origin              → Who Pays the Refund
─────────────────────────────────────────────────────
Wrong quantity packed     → Wholesaler / Sales Agent employer
Damage during transit     → Logistics Agent (insurance pool)
Delivered to wrong shop   → Logistics Agent
System/app error          → CYBERNET SYSTEMS
Retailer false complaint  → Complaint dismissed; repeat offenders suspended
```

### Fraud Detection
- Automated alert if same retailer files complaints > 3 times per week
- Account temporarily suspended pending investigation
- GPS and QR scan logs cross-referenced with complaint claims

---

## 13. Technology Stack Recommendation

### Backend (Shared API Server)
| Tool | Role |
|------|------|
| **Node.js + TypeScript** | Primary language — strict typing across all systems |
| **Fastify** | High-performance API server — handles GPS ping volume at peak hours |
| **PostgreSQL + PostGIS** | Primary database — geospatial zone, route, and proximity queries |
| **Prisma** | ORM — type-safe database access, managed migrations |
| **Zod** | Runtime validation — protects payment amounts, coordinates, enums |
| **Redis** | Event queue for cross-app webhooks; session caching |
| **BullMQ** | Job queue for delivery assignments, notification dispatches |
| **Socket.io** | Real-time GPS tracking feed from driver to retailer app |

### eCommerce Application
| Tool | Role |
|------|------|
| **React Native + Expo** | Retailer and Consumer mobile apps (Android + iPhone) |
| **Next.js** | Wholesaler web portal + Admin Dashboard |
| **Tailwind CSS** | Styling |
| **React Query** | Server state, order polling, real-time sync |
| **Zustand** | Client-side state (cart, user session) |

### Logistics Application
| Tool | Role |
|------|------|
| **React Native + Expo** | Driver app + Sales Agent app |
| **Next.js** | Fleet Management Dashboard |
| **Google Maps SDK** | Turn-by-turn navigation, route display |
| **Google Distance Matrix API** | Delivery fee calculation |
| **QR Code library** | ORDER-NUMBER tag generation and scanning |

### Infrastructure
| Tool | Role |
|------|------|
| **Docker + docker-compose** | Local development environment |
| **PostgreSQL 15 + PostGIS 3.3** | Geospatial-ready database |
| **Redis 7** | Queue and cache |
| **AWS / DigitalOcean** | Cloud hosting |
| **Cloudinary** | Product image storage and CDN |
| **Paystack** | Nigerian payment gateway (cards, bank transfer, USSD) |

---

## 14. Phased Build Roadmap

### Phase 1 — Foundation (Weeks 1–4)
**Goal:** Monorepo structure, shared database, both API namespaces live.

- [ ] Monorepo setup (`/shago-backend`, `/shago-ecommerce`, `/shago-logistics`, `/shared`)
- [ ] PostgreSQL + PostGIS database with full schema migration
- [ ] Seed data: zones, product categories, sample wholesalers, sample products
- [ ] Shared authentication system (JWT, role-based access)
- [ ] `GET /api/v1/health` endpoints on both API namespaces
- [ ] Docker Compose environment (PostgreSQL + Redis + both API servers)
- [ ] Admin Dashboard scaffold (Next.js)

**Deliverable:** Two live API servers communicating via shared DB. Admin can log in.

---

### Phase 2 — eCommerce Core (Weeks 5–10)
**Goal:** Retailers can browse products and place orders. Wholesalers receive them.

- [ ] Product catalog API (CRUD for wholesalers, read for retailers)
- [ ] Image-based product browsing UI (Retailer mobile app)
- [ ] Category drawer and product search
- [ ] Cart system with unit-of-measure enforcement
- [ ] Order placement with distance-based delivery fee calculation
- [ ] Paystack payment gateway integration (escrow mode)
- [ ] Order status tracking (retailer-facing)
- [ ] Wholesaler order dashboard (incoming orders, notification badges)
- [ ] Quick Reorder templates

**Deliverable:** End-to-end order placement and payment. Retailer orders; wholesaler sees it.

---

### Phase 3 — Logistics Core (Weeks 11–17)
**Goal:** Orders get physically fulfilled and delivered. GPS tracking live.

- [ ] Sales Agent app (pack, tag, assign, mark Ready)
- [ ] ORDER-NUMBER QR tag generation and printing
- [ ] Logistics Agent assignment engine (zone-based, proximity-ranked)
- [ ] Driver app with bundled order view and route map
- [ ] Turn-by-turn navigation integration
- [ ] QR scan at pickup (market) and delivery (shop)
- [ ] Retailer "Confirm Receipt" flow
- [ ] Real-time GPS tracking (Socket.io driver → retailer)
- [ ] Escrow release on delivery confirmation
- [ ] Automatic fund disbursement (wholesaler + driver + SHAGO)
- [ ] Cross-app webhook: `order.ready_for_pickup` → `delivery.completed`

**Deliverable:** Full order lifecycle from placement to paid delivery. Money moves automatically.

---

### Phase 4 — Dispute, CS & Trust Layer (Weeks 18–21)
**Goal:** The platform is trustworthy even when things go wrong.

- [ ] Complaint submission flow (photo evidence, item selection)
- [ ] Customer Service ticketing system (admin dashboard)
- [ ] SLA tracking and escalation workflows
- [ ] Liability determination logic (auto vs manual resolution)
- [ ] Partial refund and credit system from pending balances
- [ ] Fraud detection rules and auto-suspension
- [ ] 24/7 in-app chat support
- [ ] Delivery insurance pool setup (surcharge per delivery)

**Deliverable:** Complete dispute resolution system. Platform is trustworthy at scale.

---

### Phase 5 — Analytics, Optimisation & Scale (Weeks 22–28)
**Goal:** The platform runs itself. CYBERNET SYSTEMS monitors, not operates.

- [ ] Admin analytics dashboard (revenue, orders, complaints, agent performance)
- [ ] Fleet efficiency reports (CNG vs electric consumption, deadhead miles)
- [ ] Wholesaler sales analytics (turnover, top products, retailer growth)
- [ ] Retailer loyalty credits and bulk discount tiers
- [ ] Consumer-facing app (B2C orders — Phase 3's Stream)
- [ ] Direct producer sourcing module (Stream 2)
- [ ] Zone optimisation engine (auto-rebalance agent assignments by demand)
- [ ] Push notification system (order updates, promotions, CS responses)
- [ ] Multi-city expansion framework (zone templates for Kano, Lagos, Abuja)

**Deliverable:** Fully autonomous platform. All five objectives from the business plan met.

---

## 15. Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Two separate apps, one shared backend** | Independent scaling, deployment, and team ownership. Logistics spikes at 7–9 AM; eCommerce spikes at 6–10 PM. |
| **Single shared PostgreSQL database** | Both apps need the same Order and Delivery records. Data consistency is non-negotiable for payments. |
| **PostGIS for all geospatial operations** | Zone assignment, proximity matching, distance-fee calculation, and fleet heatmaps all require true geographic computation — not approximations. |
| **Webhook-based cross-app coordination** | Loose coupling. If the Logistics app is briefly unavailable, eCommerce queues the event in Redis and retries. No tight synchronous dependency. |
| **Escrow-first payments** | Trust between strangers. Money never moves to the wholesaler or driver until delivery is confirmed by the retailer's QR scan. |
| **Zone-based driver assignment** | Eliminates cross-city routes, reduces deadhead miles by 30%, and builds local familiarity between drivers and retailers. |
| **Unit-of-measure enforcement in cart** | Coca-Cola is ordered in cases of 24. Sachet water in packs of 20. Enforcing this at the cart level eliminates the "ordered 3 bottles, got a case" class of errors entirely. |
| **60-minute complaint window** | Long enough for retailers to open and check their order; short enough to prevent post-consumption false claims. |
| **QR scan at both pickup AND delivery** | Creates a tamper-evident chain of custody. If a dispute arises, the system knows exactly when and where a package changed hands. |
| **Shared enums in `/shared` package** | Order statuses, complaint types, and payment states must be identical across both applications and the backend. Shared TypeScript enums prevent silent drift. |
| **CNG / Electric fleet first** | Marginal delivery cost per km is 40–80% lower than petrol. Lower costs = lower fees for retailers = faster platform adoption. |
| **Sales agent photo at packing** | Before-and-after photo evidence eliminates the largest category of disputes (wrong quantity packed). Inserts accountability at the earliest point in the chain. |

---

## Appendix A: User Roles & Permissions Matrix

| Feature | Retailer | Wholesaler | Sales Agent | Logistics Agent | Admin |
|---------|----------|------------|-------------|-----------------|-------|
| Browse products | ✅ | — | — | — | ✅ |
| Place order | ✅ | — | — | — | ✅ |
| View incoming orders | — | ✅ | ✅ | — | ✅ |
| Pack and tag orders | — | — | ✅ | — | — |
| Assign driver | — | — | ✅ | — | ✅ |
| View assigned deliveries | — | — | — | ✅ | ✅ |
| GPS tracking (as viewer) | ✅ | — | — | — | ✅ |
| GPS tracking (as broadcaster) | — | — | — | ✅ | — |
| Scan QR at delivery | — | — | — | ✅ | — |
| Confirm receipt | ✅ | — | — | — | — |
| File complaint | ✅ | — | — | — | — |
| Resolve complaint | — | — | — | — | ✅ |
| Manage products/inventory | — | ✅ | — | — | ✅ |
| View earnings | — | ✅ | ✅ | ✅ | ✅ |
| Manage zones | — | — | — | — | ✅ |
| Onboard users | — | — | — | — | ✅ |

---

## Appendix B: The Minimum Viable Product (MVP) Definition

For the fastest path to first revenue, the MVP must include **only** these:

1. Retailer can browse products and place an order ✅
2. Wholesaler/Sales Agent receives and packs the order ✅
3. Driver delivers and scans QR at retailer shop ✅
4. Retailer confirms receipt ✅
5. Payment releases automatically ✅
6. Basic complaint submission (photo + description) ✅

Everything else (analytics, loyalty credits, consumer B2C, producer direct sourcing, multi-city) is **post-MVP**.

---

*Document version 1.0 — CYBERNET SYSTEMS / SHAGO Platform*  
*Architecture designed for metro-based eCommerce in Nigerian urban markets*  
*Ready for Phase 1 build initiation*
