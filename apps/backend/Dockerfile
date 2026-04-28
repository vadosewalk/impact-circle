# apps/backend/Dockerfile
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune backend --docker

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
RUN turbo run build --filter=backend
# Debug: show what tsup actually produced
RUN ls -la /app/apps/backend/dist/

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# tsup bundles everything into dist/index.js — no node_modules needed
COPY --from=sourcer /app/apps/backend/dist ./dist
COPY --from=sourcer /app/apps/backend/package.json .

EXPOSE 8080
CMD ["node", "dist/index.js"]
