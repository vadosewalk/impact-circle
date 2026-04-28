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
RUN npm i -g pnpm turbo
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
RUN turbo run build --filter=backend

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the built files from the backend app
COPY --from=sourcer /app/apps/backend/dist ./dist
COPY --from=sourcer /app/apps/backend/package.json .

# Copy the root node_modules and the backend node_modules
# In pnpm, we need to be careful with symlinks.
COPY --from=sourcer /app/node_modules ./node_modules
COPY --from=sourcer /app/apps/backend/node_modules ./apps/backend/node_modules

EXPOSE 8080

# Use a shell form to allow debugging if it fails
CMD ["node", "dist/index.js"]
