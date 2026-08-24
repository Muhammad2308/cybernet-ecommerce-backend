# RIDO Requirements Specification

## Identities and permissions

| Actor | Can do | Cannot do |
|---|---|---|
| Sender | Create shipment; select an eligible nearby traveler from RIDO recommendations or start automatic dispatch | Assign an unavailable/distant driver or confirm receiver handover |
| Receiver | Own a distinct account; scan tagged QR and confirm receipt | Be the sender for the same shipment; release another delivery's escrow |
| Traveler | Receive assigned work, navigate to pickup, confirm pickup | Create a trip/delivery or self-assign work |
| Logistics admin | Onboarded by master-admin invitation; create dispatches and assign own active fleet drivers | Assign drivers from another company |
| Receiving hub | An approved logistics company with hub option enabled; records hub handover | Obtain authority through public registration |
| Master admin | Approves companies/hubs and issues onboarding invitations | Bypass auditable delivery state transitions |

## Delivery and escrow invariant

`sender_id != receiver_id`; both are registered `User` records with unique email and phone. The receiver is stored on the shipment and copied to the delivery. Escrow release is permitted only once, from an eligible in-transit state, after authenticated receiver QR/OTP confirmation. It must atomically update the delivery, shipment, escrow room, and append a delivery event.

## QR package tag

The printable tag contains the RIDO delivery reference and a signed receiver-specific QR payload. The mobile receiver screen scans it while logged in. Verification must enforce:

- signed, tamper-resistant payload;
- matching delivery and receiver IDs;
- stored payload hash and expiry;
- receiver identity from the JWT, never a body-supplied identity;
- idempotent rejection after delivery is complete.

## Notifications

Dispatch notifies sender, assigned driver, and fleet admins. Receiver confirmation notifies sender, receiver, driver, and fleet admins. Delivery notifications are persisted before provider delivery; SMS/WhatsApp/email adapters must be retryable and auditable.

## Individual mobile registration and session

An individual may register as a **customer**, a **traveler**, or **both**. These are capabilities on one account; registering twice is not permitted because email and phone are unique. The app creates an app-generated device ID and stores it with a random refresh token in platform secure storage. The device ID only selects a session record—it is never proof of identity.

On startup, the client calls `POST /auth/session` with the device ID and refresh token. A valid, unrevoked session receives a new 15-minute access token and is redirected to the dashboard. Refresh tokens rotate, sessions expire after 90 days, and logout revokes the session for that device. Do not store refresh tokens in AsyncStorage or use hardware/device fingerprinting as authentication.

## Company onboarding

The nominated admin gets a 7-day, single-use invitation link from the master admin. Completion verifies the invitee’s email/phone, establishes a password, activates dashboard access, and provides the Play Store link. Registration and approval must be separate actions.
