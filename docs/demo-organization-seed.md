# Demo organization seed

The repository includes an idempotent seed for the multi-property sample dataset and a demo login. With `DATABASE_URL` configured and Prisma Client generated, run:

```powershell
node scripts/seed-demo-organization.mjs
```

The seed creates or updates the `HH-DEMO-MULTI` business group, its demo company, and three Myanmar properties (Yangon, Bagan, and Inle Lake). Each property receives one branch, a building with two floors, six rooms in two room types, active overnight and hourly rate plans, stay policies, departments, and front desk cost-center data. The group receives nine synthetic guest profiles with `.example` emails, nine reservations (arrival, upcoming, and in-house per property), and three active Front Desk stays with occupants, registration snapshots, notes, key records, and request examples.

The demo login is `demo.admin` with password `HotelHex-Demo-2026!`. It has a company-scoped operations role for the three demo properties; the role excludes Security module permission grants. You can override the seed password by setting `HOTELHEX_DEMO_PASSWORD` before running the command. Re-running the seed resets the demo account password to the configured value.

All records use `DEMO` codes/numbers and clearly labeled names or notes. The seed does not delete records. It uses stable unique keys and can be run again without duplicating the demo organization. Re-running it reapplies the sample room statuses and in-house stay fixtures, so use it only for a demo/test database, never production. The published demo password is intentionally public and must not be reused on a real deployment.
