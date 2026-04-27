# Impact Circle ⭕️

**Impact Circle** is a social marketplace designed to bridge the gap between community needs and NGO initiatives. Built with a focus on absolute transparency, it leverages a unique "Handshake Protocol" to ensure every contribution is verified through proof-of-action and recorded on a community-driven trust ledger.

## 🏗 Technical Architecture

This is a high-performance monorepo managed with **Turborepo** and **pnpm**, optimized for deployment on **Netlify**.

### Core Stack

- **Frontend**: Next.js 15+ (App Router) with Tailwind CSS 4.0
- **Backend**: Hono (Node/Serverless)
- **Identity**: Better Auth (with Organization & Passkey support)
- **Database**: PostgreSQL + PostGIS (via Supabase)
- **ORM**: Drizzle ORM
- **UI Library**: Custom `@impact/ui` package built on **Base UI** (unstyled) and Framer Motion.

## 📁 Repository Structure

```text
.
├── apps/
│   ├── web/          # Next.js Application (The Command Terminal)
│   └── backend/      # Hono API (Netlify Functions)
├── packages/
│   ├── db/           # Drizzle Schema & Migrations
│   ├── ui/           # Shared Component Library (@base-ui/react)
│   └── typescript-config/
├── netlify.toml      # Centralized Deployment Config
└── turbo.json        # Pipeline Orchestration
```

## 🚀 Key Features

- **The Handshake Protocol**: A cryptographic verification system for community aid fulfillment.
- **Impact Ledger**: A transparent historical record of all NGO and user contributions.
- **NGO Waiting Room**: A multi-stage manual audit flow for organization verification.
- **Command Center (Cmd+K)**: A rapid navigation palette for power users.
- **Proximity Search**: PostGIS-powered location awareness for hyper-local impact.

## 🛠 Getting Started

### 1. Prerequisites

- **Node.js**: v22 or higher
- **pnpm**: v10 or higher

### 2. Environment Setup

Copy the example environment files in `apps/web` and `apps/backend`:

```bash
cp .env.example .env
```

### 3. Installation

```bash
pnpm install
```

### 4. Development

Run the entire stack (Web + API + DB Watcher):

```bash
pnpm dev
```

## 🧩 UI Component Pattern

We use a modern **render prop** pattern to ensure maximum flexibility and type safety, moving away from the legacy `asChild` approach.

```tsx
import { Button } from "@impact/ui/components/button";

// Pattern: Explicit Rendering
<Button variant="outline" render={<a href="/settings">Configure Terminal</a>} />;
```

## 🌐 Deployment

The project is configured for **Netlify Monorepo** deployment.

- **Build Command**: `pnpm build` (root)
- **Publish Directory**: `apps/web/.next`
- **Functions Directory**: `apps/backend/src` (Serverless Hono)

---

Built with mission-critical intent by the Impact Circle team.
