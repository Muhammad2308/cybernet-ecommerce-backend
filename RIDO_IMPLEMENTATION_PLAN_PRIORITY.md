# RIDO Implementation Plan — Priority Order

## P0 — must complete before any real delivery or payment

1. Add and apply a Prisma migration for sender/receiver delivery relations, dispatch creator, fleet ownership, and QR expiry. Backfill or retire legacy shipments before making receiver ID non-null.
2. Apply the `DeviceSession` migration and test customer/traveler/both registration, session rotation, logout revocation, expiry, and account suspension.
2. Add integration tests for all authorization boundaries: sender-selected eligible traveler, sender automatic dispatch, fleet-admin assignment, traveler pickup, receiver-only confirmation, unrelated-user denial, QR tampering/expiry/replay, and one-time escrow release.
3. Replace `Float` financial values with integer kobo or Prisma `Decimal`; integrate Paystack’s verified payment and payout webhooks before treating escrow as funded/released.
4. Use PostGIS/indexed location queries and a driver availability/offer state. The present in-memory nearest-ping selection is only a safe functional bridge.

## P1 — complete the stated business workflow

1. Create `FleetAdminOnboardingInvite` persistence: hash, expiry, intended email/phone, sent/used/revoked timestamps, company, and audit event.
2. Implement master-admin create/resend/revoke onboarding endpoints and public token completion endpoint. Add provider adapters for SMS, WhatsApp, and email; store delivery attempts.
3. Add the receiver QR scan/confirmation screen, printable package label, driver pickup flow, and fleet dashboard assignment screen.
4. Build hub entities and hub staff scope. A fleet company may enable hub capability only after approval; use a dedicated hub handover event rather than sharing credentials.

## P2 — operational resilience and SHAGO integration

1. Add state-machine guards, idempotency keys, rate limits, audit logs, and provider retry/dead-letter handling.
2. Add real-time driver availability/location updates and dispatch offer timeout/reassignment.
3. Expose RIDO’s versioned internal dispatch/status APIs to SHAGO only after P0 is tested; SHAGO must never bypass RIDO delivery state or escrow controls.
4. Repair workspace-wide React type dependency alignment so `npm run typecheck` passes for every app in CI.
