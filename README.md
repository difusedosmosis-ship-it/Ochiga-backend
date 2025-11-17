# Ochiga Backend (Supabase + Express + TypeScript)

## Setup
1. Copy `.env.example` → `.env.local` and fill keys.
2. `npm install`
3. Run DB migration (use migrations/schema.sql in Supabase SQL editor)
4. `npm run dev`

## Notes
- This project uses Supabase as primary DB/auth store.
- Endpoints issue a JWT (signed with APP_JWT_SECRET) used by the frontend to route users to dashboards.
