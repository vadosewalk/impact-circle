<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo.png">
    <source media="(prefers-color-scheme: light)" srcset=".github/assets/logo-dark.png">
    <img src=".github/assets/logo.png" width="120" height="120" alt="Impact Circle Logo" />
  </picture>
  <h1>Impact Circle</h1>
  <p><strong>A trust-based platform for community impact.</strong></p>

  <p>
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-deployment">Deployment</a>
  </p>
</div>

---

## 🚀 Tech Stack

- **Monorepo Management**: [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Backend**: [Hono](https://hono.dev/) (Node.js runtime)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) with [PostgreSQL](https://www.postgresql.org/)
- **Auth**: [Better Auth](https://www.better-auth.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [React Query](https://tanstack.com/query/latest)

## 📁 Project Structure

```text
.
├── apps/
│   ├── web/          # Next.js frontend
│   └── backend/      # Hono API server (bundled with tsup)
├── packages/
│   ├── db/           # Drizzle schema & database client
│   ├── ui/           # Shared Shadcn UI components
│   └── typescript-config/ # Shared TS configurations
├── deploy-gcp.sh     # Interactive GCP deployment script
└── turbo.json        # Turborepo configuration
```

## 🛠️ Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/) (v10+)
- [Google Cloud CLI](https://cloud.google.com/sdk/gcloud) (for deployment)

### Local Development

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Setup environment variables**:
   Create `.env.production` in both `apps/web` and `apps/backend` (or use local `.env` files).

3. **Run development servers**:

   ```bash
   pnpm dev
   ```

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:8080](http://localhost:8080)

## 🚢 Deployment (Google Cloud)

We use an automated script to deploy both services to Google Cloud Run.

```bash
# Deploy everything
./deploy-gcp.sh <PROJECT_ID>

# Deploy only the web app
./deploy-gcp.sh <PROJECT_ID> --web-only

# Deploy only the backend
./deploy-gcp.sh <PROJECT_ID> --backend-only
```

### Deployment Features

- **Zero-Config Env Loading**: Automatically sources credentials from `.env.production` files.
- **Tsup Bundling**: Backend is bundled into a single file to eliminate monorepo pathing issues in Docker.
- **Standalone Mode**: Frontend uses Next.js standalone output for optimized container sizes.

---

<div align="center">
  Built with ❤️ for community impact.
</div>
