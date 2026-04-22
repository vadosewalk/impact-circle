# Impact Circle: Project Documentation

## 1. Background & Motivation
Impact Circle is a social impact marketplace designed for maximum transparency and accountability. It connects verified NGOs with donors, volunteers, and beneficiaries. The platform is built on the principle of "Proof of Impact," requiring NGOs to provide tangible evidence of their work to build community trust.

## 2. Architecture & Stack
- **Monorepo Architecture:** Powered by **Turborepo** for managing shared types, packages, and multiple applications.
- **Backend:** **Hono** framework running on Node.js, providing a fast, typesafe API layer.
- **Frontend:** **Next.js App Router** for the web application, using React Server Components and modern data fetching patterns.
- **UI System:** **shadcn/ui** (Nova style) with **Tailwind CSS** for a clean, accessible, and responsive interface.
- **Database:** **PostgreSQL** hosted on Supabase, managed via **Drizzle ORM** for schema management and type-safe queries.
- **Authentication:** **Better Auth**, configured with a Drizzle adapter to provide secure session management across the backend and frontend.

## 3. Database & Core Models
The system uses a robust schema designed for fluid user roles and strict accountability.

### Core Enums
- `role`: Defines user capabilities (`admin`, `user`, `ngo`).
- `ngo_status`: Manages the "Fort Knox" verification pipeline (`pending`, `verified`, `rejected`).
- `tender_status`: Tracks community needs (`open`, `claimed`, `fulfilled`, `cancelled`).
- `urgency`: Flags emergency needs (`normal`, `urgent` for SOS).

### Core Tables
- `user`: The "Universal Profile" containing names, emails, trust scores, bios, and flags.
- `ngo`: Detailed organizational profile, including operational radius, registration numbers, and live audit audit logs (`auditMeetLink`).
- `tenders`: The "Needs Board" entries where beneficiaries request aid.
- `drives`: The "Resource Board" entries where NGOs gather support for specific initiatives.
- `polls`: Governance records for community-voted categories.
- `messages`: Handshake protocol DMs limited to 500 characters.

## 4. Security & Connectivity
- **Cross-Origin Security:** The Hono backend uses CORS middleware to whitelist the frontend origin.
- **Next.js API Proxy:** The frontend uses `next.config.mjs` rewrites to proxy `/api/*` calls, avoiding complex cross-domain configurations and simplifying client-side API logic.
- **Session Middleware:** Backend routes are protected by custom Hono middleware that validates Better Auth sessions and enforces role-based access control.
