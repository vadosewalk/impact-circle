# apps/web/Dockerfile
FROM node:18-alpine AS alpine

# Stage 1: Prune the workspace for the web app
FROM alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# Stage 2: Install dependencies
FROM alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm i -g pnpm && pnpm install --frozen-lockfile

# Stage 3: Build the Next.js app
FROM alpine AS sourcer
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .

# Inject build-time variables for static generation
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npx turbo run build --filter=web

# Stage 4: Production Runner
FROM alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=sourcer /app/apps/web/next.config.mjs .
COPY --from=sourcer /app/apps/web/package.json .
COPY --from=sourcer /app/apps/web/public ./apps/web/public
COPY --from=sourcer /app/apps/web/.next/standalone ./
COPY --from=sourcer /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "server.js"]
