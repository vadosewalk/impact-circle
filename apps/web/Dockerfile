# apps/web/Dockerfile
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm i -g pnpm && pnpm install --no-frozen-lockfile

FROM node:20-alpine AS sourcer
RUN npm i -g pnpm turbo
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Remove the postbuild script (opennextjs-cloudflare) — not needed for Cloud Run
RUN sed -i '/"postbuild"/d' /app/apps/web/package.json
RUN turbo run build --filter=web --env-mode=loose

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=sourcer /app/apps/web/next.config.mjs .
COPY --from=sourcer /app/apps/web/package.json .
COPY --from=sourcer /app/apps/web/public ./public
COPY --from=sourcer /app/apps/web/.next/standalone ./
COPY --from=sourcer /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
