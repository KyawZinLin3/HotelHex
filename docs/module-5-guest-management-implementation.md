# Guest Management implementation and FRD review

The source FRD is named Module 5 but calls itself Module 4. This implementation uses the feature name Guest Management and the route /guests.

## Delivered MVP

- Tenant-wide reusable profiles with immutable internal IDs and transactional GST-YYYY-NNNNNN numbers.
- Flexible names, guest types, Active/Inactive status, nationality, DOB validation, language, occupation, company and preferred contact method.
- Multiple phone/email contacts, addresses and identity records, including primary/active flags.
- Encrypted identity numbers (AES-256-GCM with random IVs), tenant-specific keyed exact-match hashes, masked responses, permissioned and audited full-data reveal, document expiry warnings.
- Paginated search by name, guest number, phone/email and company; exact identity search; status/type/nationality/VIP/creation-date/property filters.
- Duplicate name/contact/identity review. Creation and contact/identity edits require an explicit reason to keep a duplicate. Review reasons are management-only notes. No automatic merging.
- Property/branch/group preferences; property/group/management/department note visibility; resolve/deactivate notes.
- VIP levels with effective dates, reason, actor and permission enforcement.
- Additive configuration for guest types, VIP levels, identity types and preference types.
- Archive without deleting historical data. Archived guests are immutable.
- Transactional audit events and optimistic version checks for profile and child-record edits.
- Master, new-by-date, VIP, nationality, created-at-property and archived guest reports through filters; minimal CSV export with a dedicated permission and spreadsheet-formula escaping.
- Stay-history empty state explicitly identifies the future Reservation/Front Desk dependency.

The API is /api/v1/guests. Every request requires the existing bearer session and a propertyId query parameter; branchId is required for branch-only grants. GET properties provides accessible scopes. GET options provides the caller's effective guest permissions and configuration choices. Profile CRUD uses GET/POST /, GET/PUT /:id and POST /:id/archive. Child records use GET/POST /:id/{contacts,addresses,identities,preferences,notes,vip} and PUT /:id/:section/:childId. Use POST /duplicates, GET /reports, GET /export, GET /:id/audit and POST /configuration for the other workflows. Edits and archive require the latest integer version. Responses are masked; GET /:id?reveal=true additionally requires full-view permissions.

## Decisions and remaining FRD work

1. The existing organization/security schema has no Tenant entity or user-to-tenant association. Guest.tenantId references BusinessGroup. The server derives this from an authorized property's company and never trusts a client tenant ID. Company/property/branch grants are checked before guest lookup. Existing unrestricted TENANT roles retain their installation-wide meaning; a SaaS tenant-account model is a separate prerequisite for externally hosted multi-tenant operation.
2. Reservations, Front Desk and Folios do not exist in this codebase. No stay counts, returning-guest claims or financial totals are fabricated. These modules must later reference Guest.id and preserve transaction snapshots.
3. P1/P2 workflows are not claimed as delivered: restrictions/do-not-rent approval, tags, relationships, marketing consent, merge, attachments, anonymization/retention automation, property-specific VIP, CRM/loyalty and external integrations. The status Restricted is reserved until its authorized workflow exists. Multiple identities and scoped notes were included early.
4. Contacts/identity are optional by default. Property-specific mandatory-contact policy is not implemented. Configuration supports adding options, not deactivating built-in options or a complete configuration lifecycle.
5. Phone normalization removes formatting, translates 00 to +, and validates digit count. It does not infer a country for local numbers.
6. Audit records retain profile metadata and masked identity metadata, not raw identity values, full contacts, address text, preference text or note contents. Audit history is scoped to the selected property/branch and limited to the most recent 200 events. Reports exclude raw contact/identity values.
7. Search is paginated and indexed for tenant/name/status/contact/identity lookup. The 1–2 second production-load target has not been benchmarked.

## Running and access

The local Docker application serves http://localhost:3000/guests.

Set GUEST_ENCRYPTION_KEY to a persistent, random 32-byte hex secret (64 hexadecimal characters). A local ignored .env key was generated during development. Never commit it. Back it up securely with the database; changing it without a migration makes encrypted identities unreadable and invalidates identity search hashes. Identity operations fail closed when the key is absent. Docker Compose passes the secret to the API.

The API registers GUEST permissions at startup. In Security, add the needed guest permissions to an appropriate existing scoped role. No existing user's permissions are silently expanded. At minimum assign GUEST.PROFILE.VIEW; creation also needs GUEST.PROFILE.CREATE, and adding contacts needs GUEST.CONTACT.UPDATE. Full contact/identity views need their VIEW and VIEW_FULL permissions. GUEST.NOTE.MANAGEMENT is a dedicated permission, not inferred from a user's job title. GUEST.CONFIG.MANAGE grants group-wide option creation through an authorized property.

For a fresh local database use the existing Docker workflow:
    docker compose up -d --build

For an existing installation, prisma/guest-management.sql is an additive SQL change for the pre-guest schema. Apply once after backup/review. It does not drop or modify existing business tables. The local database has been updated. The API Docker startup no longer opts into --accept-data-loss.

## Validation

- npm run build -w @hotelhex/api
- npm run build -w @hotelhex/web (also built in Docker)
- node --env-file=.env tests/guest-management.cjs

The integration suite creates isolated business-group fixtures in the configured PostgreSQL database and removes only its own records. It checks authentication, permissions, cross-group and cross-property isolation, branch notes, masking/reveal, encryption/hash search, duplicate review, input validation, VIP filtering, concurrent updates, audit redaction, reports/export and archive integrity.

If Prisma attempts to download Windows binaries despite installed engines, point PRISMA_QUERY_ENGINE_LIBRARY and PRISMA_SCHEMA_ENGINE_BINARY to the corresponding installed files under node_modules/@prisma/engines before db:generate.
