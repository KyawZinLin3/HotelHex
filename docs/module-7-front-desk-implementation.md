# Module 7 Front Desk implementation

The Module 7 FRD defines the operational stay lifecycle from arrival through check-out. This implementation adds a Front Desk workspace at `/front-desk`, a NestJS API rooted at `/api/v1/front-desk`, and additive Prisma models for actual stays and their operational history. A reservation remains the planned booking; `FrontDeskStay` records the in-house visit.

## Delivered workflow

- Property/branch-scoped dashboard, arrivals, in-house and due-out lists, room readiness counts, search, and a basic report summary.
- Reservation pre-check with guest and masked identity-document information, room readiness choices, and guest/occupant confirmation.
- Walk-in booking and check-in using existing Reservation and Rate Management services.
- Check-in with property-local timestamps, active guest and identity validation, occupancy and room readiness checks, availability/hold checks, deposit/guarantee gate, reasoned early/late overrides, registration snapshot, occupant records, room history, optional key and note, and reservation/room state updates.
- In-house room moves, extension/late checkout, check-out, key issue/return, visibility-scoped notes, and audit/status history.
- Management note and VIP visibility is permission-gated; identity document numbers are masked in front desk views.
- Version checks and database transactions protect operational changes. Room changes and check-in revalidate inventory at write time.

## API

All endpoints require the existing bearer token and scope property/branch access on the server. The portal sends property and branch selectors for scoped requests.

- `GET /properties`, `/options`, `/dashboard`, `/arrivals`, `/in-house`, `/due-outs`, `/search`, `/reports`, `/walk-in-rooms`
- `GET /guests/:guestId/identities`
- `GET /reservations/:id/precheck`, `/reservations/:id/rooms`
- `POST /walk-ins`, `/check-in`, `/reservations/:id/assign-room`
- `GET /stays/:id`, `/stays/:id/rooms`; `POST /stays/:id/change-room`, `/extend`, `/late-checkout`, `/check-out`
- `POST /stays/:id/keys`, `/stays/:id/keys/:keyId/return`; `GET|POST /stays/:id/notes`

## Setup and permissions

The additive schema is in [front-desk.sql](../prisma/front-desk.sql). It was applied to the configured local database. On another installation, review and apply the SQL once with Prisma `db execute --file prisma/front-desk.sql --schema prisma/schema.prisma`, then run `npm run db:generate` after schema changes.

Front Desk permission keys are registered at API startup. Registration does not silently grant them to existing roles. Assign only the necessary `FRONT_DESK.*` keys to each role. In addition, existing module services enforce their own permissions: room assignment and readiness use Room Management access, walk-in booking uses Reservation and Rate permissions, and guest/identity data uses Guest permissions. Identity detail access additionally checks `FRONT_DESK.ID.VERIFY` and `GUEST.IDENTITY.VIEW`.

## FRD review decisions and remaining scope

- The MVP creates an explicit operational stay record, separate from the reservation, and moves the reservation through `CHECKED_IN` / `CHECKED_OUT` states.
- Check-in requires the room to be clean or inspected and verifies room type, capacity, holds, and overlap. It does not silently change a dirty room to ready. The separate `FRONTDESK.ID.VERIFY` and `GUEST.IDENTITY.VIEW` grants are required only when an identity document is actually selected for verification.
- The current repository has no guest restriction/blacklist model, so restriction screening cannot be claimed. Staff still see the guest records and identity information available through Module 5.
- Deposit/guarantee status is validated and recorded; this module does not process payments or post a folio. This matches the FRD's billing/payment exclusions.
- Overnight extension pricing calls Rate Management. Hourly and day-use extensions use the stored property stay policy / hourly tiers. Existing quote tax and service-charge limitations carry through; no billing charge is posted.
- Hourly overdue and due-out indicators are computed when the dashboard is read. There is no background alert scheduler, SMS/email notification, or automated escalation.
- P1 shift handover, digital signatures, lock/key-system integration, wake-up task delivery, vehicle/parking workflows, self check-in, and advanced automatic room suggestions are not represented as delivered features. The key register is an internal record only.
- Reports are basic operational counts, not configurable exports or analytics. Room cleaning is handed to the existing room-status workflow; this module does not assign housekeeping work.

## Validation

- `npm run db:generate` — Prisma Client generation completed.
- `npm run build -w @hotelhex/api` — passed after the final API change.
- `npm run build -w @hotelhex/web` — passed, including type checking, page generation, and trace collection.
- Additive front desk SQL was applied to the configured local PostgreSQL database. Full production-like concurrency, integration, and hotel-scale performance testing have not been performed.

A multi-property demo dataset is available through [the demo organization seed](demo-organization-seed.md).
