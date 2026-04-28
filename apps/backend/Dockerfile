# apps/backend/Dockerfile
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune backend --docker

FROM node:18-alpine AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm i -g pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS sourcer
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
RUN npx turbo run build --filter=backend

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=sourcer /app/apps/backend/dist ./dist
COPY --from=sourcer /app/apps/backend/package.json .
COPY --from=sourcer /app/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "dist/index.js"]
