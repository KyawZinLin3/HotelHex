# HotelHex Portal Foundation
Foundation monorepo for the HotelHex web portal.

Room Management (Module 3): see [implementation and setup](docs/module-3-implementation.md). The new screen is `/rooms`; database schema synchronization and room-role assignment are required before use.

## Quick start
copy .env.example .env
npm install
npm run db:generate
npm run db:up
npm run dev

- Web dashboard: http://localhost:3000
- API health: http://localhost:4000/api/health

Guest Management: see [FRD review, implementation and setup](docs/module-5-guest-management-implementation.md). Open /guests; assign scoped GUEST permissions through Security.
