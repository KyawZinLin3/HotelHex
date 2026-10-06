# Room Management implementation

Entry point: **Rooms** in the sidebar, route `/rooms`. The module uses the existing NestJS API, PostgreSQL/Prisma models, Ant Design, and session authentication.

## Delivered scope

- Property-scoped room types, bed types, amenities, and features; create/edit and activate/deactivate catalog records.
- Room creation/editing, unique property + room number, active/inactive state, inherited occupancy/bed/amenity configuration, smoking and accessibility attributes.
- Validated property/branch/building/floor hierarchy. Room property and branch cannot be moved. Room-number or type changes require `ROOM.STATUS.OVERRIDE` in addition to update permission.
- Atomic bulk creation with prefix, number range and padding (maximum 200 rooms). Existing room numbers are reported and reject the entire batch.
- Independent operational status and derived sellability, logical status transitions, reason-required overrides, immutable status history, transactional audit events and optimistic record versions.
- OOO and OOS creation/release, OOO editing, internal notes, floor-based status board, filters and CSV inventory reports.
- Authenticated API requests with active, unexpired scoped role permissions. UI actions follow those same permissions; the server independently authorizes requests.
- Inventory eligibility API for future Reservation consumers: validates capacity, active state and holds; it does not claim to check bookings.

## Setup before manual testing

No builds, tests, browser checks, app launches, client generation, schema synchronization or database writes were run by the agent for this change.

1. Configure `DATABASE_URL` in a local `.env` and back up an existing database.
2. Use the repository's Prisma workflow to apply the extended schema. This repository has no committed migration baseline and currently uses `db push` in Docker. For local development:

   ```powershell
   npm.cmd exec -- prisma db push
   npm.cmd run db:generate
   ```

   Do not accept data-loss prompts without reviewing them. For production, create/review a migration against the actual deployed baseline instead of applying a blind schema push.

   The current Docker API entrypoint automatically runs `prisma db push --accept-data-loss` on container start. Back up existing data and review the resulting schema before using that workflow; do not use that container command as a production migration process.

3. Start/rebuild the API and web using your normal workflow. The API registers the `ROOM.*` permission catalog at startup.
4. Ensure Organization contains a property, active branch, active building and active floor. A building may be property-wide or belong to the selected branch.
5. Assign a role with the required `ROOM.*` permissions and a matching property/branch scope. A role with no permissions provides no access. Property-wide catalog management requires property/company/deployment scope; branch staff can use shared configuration when creating/managing rooms in their assigned branch.

The Security screen provides role assignment: open **Security ? Users ? Assign roles**, choose an active role and matching company/property/branch scope, set optional effective dates, and assign it. Role permissions are managed from **Security ? Roles ? Configure permissions**.

If you need to bootstrap a first property-scoped room administrator before using Security, a local administrative script is included. Set these environment values yourself (never commit the password):

```text
ROOM_ADMIN_PROPERTY_ID=<existing property ID>
ROOM_ADMIN_USERNAME=<existing or new username>
ROOM_ADMIN_PASSWORD=<12?200 characters, required only for a new user>
ROOM_ADMIN_NAME=<optional display name>
```

Then run:

```powershell
node --env-file=.env scripts/provision-room-admin.mjs
```

This grants room permissions only for the chosen property. It does not grant security administration. Existing passwords are preserved; a new account must change its temporary password on first login. It is a local administrative operation, not a public registration endpoint.

## Manual workflow

1. Open Rooms and sign in. Select a property.
2. Create Bed Types and Amenities, then create a Room Type with occupancy and amenity settings.
3. Create Rooms (or Bulk create), selecting branch, building, floor and room type. New rooms start Vacant Dirty.
4. Use Status to move Vacant Dirty ? Cleaning ? Vacant Clean ? Inspected. Occupancy-changing transitions require an explicit override until Front Desk owns them.
5. Use OOO/OOS on a room. Its condition remains independent from its hold. View/manage holds in their tabs. Releasing a hold returns the room to Vacant Dirty.
6. Use Details for capacity, amenities, features, status history and permitted notes. Use Reports to filter inventory and export CSV.

Record versions are submitted with edits. A concurrent change returns HTTP 409; refresh the list and reopen the record before retrying.

## Hold and inventory policy

- OOO and OOS both prevent assignment while effective. Their meaning remains distinct; inventory policy currently treats both as blocking.
- Start times may be scheduled. Expected end is an estimate, not an automatic release: an unreleased hold continues blocking beyond its expected end.
- One unreleased hold is allowed per room, even if a proposed second hold is scheduled later. Release the first before scheduling another.
- Occupied or inactive rooms cannot receive holds from this module.
- `GET /api/v1/room-management/rooms/{id}/eligibility?adults=2&children=0&from=<ISO>&to=<ISO>` reports inventory eligibility only. Future Reservation code must combine this with bookings and check-in readiness.
- No physical deletion endpoints are exposed.

## Boundaries and remaining FRD work

The supplied Module 1/2 foundation has no Tenant entity or tenant ownership fields, and existing security administration endpoints are not authorization-guarded. This implementation does not claim safe multi-tenant isolation: deploy only as a single client installation until the shared foundation is completed. `TENANT` grants mean the entire current installation; `GROUP` grants are rejected because assignments do not store a group identifier. Property/company/branch grants are evaluated explicitly. Hardening existing Module 1/2 administration is still required before production exposure.

Reservations, Front Desk and Maintenance do not exist yet. Future-reservation conflict checks and work-order validation must be connected when those modules are implemented. No reservation availability or booking workflow is invented here.

Remaining P1/P2 items: room image upload, connecting-room pairs, room-level amenity/capacity overrides, detailed accessibility attributes, note resolution, CSV/Excel import, PDF/XLSX export, advanced multi-tenant/group reports and external integrations. The implemented notes, feature catalog, status board and OOS workflow cover selected P1 items. Catalogs are property-scoped because tenant-level ownership is not present in the existing foundation.

The session is held in browser session storage for compatibility with the existing bearer-token API. Cookies/CSRF strategy and full application-wide login integration remain part of shared security hardening.
