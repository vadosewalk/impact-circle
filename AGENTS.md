# Agent Instructions

## Tech Stack & Structure

- **Frontend**: `apps/web` (Next.js)
- **Backend**: `apps/backend` (Node.js, hono)
- **Shared**: `packages/ui` (mapped as `@impact/ui`), `packages/db` (mapped as `@impact/db`)

## Package Managers

- **JS/TS**: **pnpm**: `pnpm install`, `pnpm dev`, `pnpm add`

## File-Scoped Commands

| Task      | Command                             |
| --------- | ----------------------------------- |
| Typecheck | `pnpm tsc --noEmit path/to/file.ts` |
| Lint (JS) | `pnpm biome check path/to/file.ts`  |

## Documentation

- `AGENTS.md`: Canonical agent-facing documentation. Keep under 80 lines.
- `GEMINI.md`: Foundational mandates for Gemini CLI specifically.
- `plan/`: For base plan and core concept.

# Skill mappings - when working in these areas, load the linked skill file into context.

skills:

- task: "Managing local database collections and live queries"
  load: "node_modules/@tanstack/react-db/skills/react-db/SKILL.md"
- task: "Setting up typed collections and selecting sync adapters"
  load: "node_modules/@tanstack/db/skills/db-core/collection-setup/SKILL.md"
- task: "Implementing optimistic mutations and transactions"
  load: "node_modules/@tanstack/db/skills/db-core/mutations-optimistic/SKILL.md"
- task: "Working with persistent local storage (WA-SQLite, expo-sqlite)"
  load: "node_modules/@tanstack/db/skills/db-core/persistence/SKILL.md"
- task: "Configuring environment variables and secrets"
  load: "node_modules/dotenv/skills/dotenvx/SKILL.md"

## 🛠️ Active Skill Constraints

When generating code or reviewing PRs, you must actively apply the loaded skills:

### 1. Authentication & Security (`better-auth`)

- **Core:** Follow `better-auth-best-practices` and `create-auth-skill`.
- **Security:** Adhere to `better-auth-security-best-practices`.
- **Flows:** Use `email-and-password-best-practices` and `two-factor-authentication-best-practices`.
- **Multi-tenant:** Structure orgs according to `organization-best-practices`.

### 2. Next.js & React Ecosystem (`vercel-labs`)

- **Architecture:** Use App Router conventions (`next-best-practices`).
- **Performance:** Optimize caching (`next-cache-components`).
- **React Patterns:** Write modern, concurrent React (`vercel-react-best-practices`).

### 3. Frontend UI/UX Design

- **Components:** Build accessible interfaces using `shadcn` patterns.
- **Design:** Apply `frontend-design` and `web-design-guidelines`.
- **UX:** Polish using `ui-ux-pro-max` (micro-interactions, loading states).

### 4. Backend & Database

- **API:** Structure lightweight, fast edge APIs using `hono`.
- **Database:** Write efficient, scalable SQL queries (`postgres` skills).

### 5. Core Tech Stack & Libraries

- **Framework:** Next.js 16 (App Router) and React 19. Use Server Components by default.
- **State Management:**
  - `zustand` for global client state.
  - `@tanstack/react-query` for data fetching and server state.
- **UI & Styling:**
  - Import shared components from `@impact/ui`.
  - Use Tailwind CSS and `lucide-react` for icons.
- **Database & API:**
  - Import schemas/utilities from `@impact/db`.
  - Utilize `@tanstack/db` for data operations; route APIs using `hono`.

### 6. Repository Architecture (Monorepo Boundaries)

- **Backend (`apps/backend`):** Dedicated backend environment. All core API routes and heavy business logic go here.
- **Shared Packages:** Do not define DB schemas or UI locally within apps. Use `@impact/db` and `@impact/ui`.
- **Cross-Boundary Rules:** - Do not write heavy backend logic inside `apps/web`.
  - Always use workspace imports (e.g., `import { users } from "@impact/db"`) instead of relative file paths.

## 📝 General Directives

1. **Refactoring:** Consider UI/UX and caching impacts first.
2. **Code Style:** Keep functions pure, use declarative patterns, prioritize readability.
3. **Documentation:** Comment on complex server-side logic and queries.
