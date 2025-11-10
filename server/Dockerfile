# syntax=docker/dockerfile:1

# Build stage: install deps, generate Prisma client, build NestJS
FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack (yarn) and install dependencies
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# Copy sources and prisma schema
COPY prisma ./prisma
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
# Copy Firebase Admin SDK credentials (if exists)
COPY firebase-adminsdk.json* ./

# Generate Prisma client and build the app
RUN yarn prisma:generate
RUN yarn build

# Runtime stage: minimal image with built artifacts
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
# Copy prisma folder for migrations
COPY --from=builder /app/prisma ./prisma
# Copy Firebase Admin SDK credentials (if exists)
COPY --from=builder /app/firebase-adminsdk.json* ./

# Expose port and run the server
EXPOSE 8080
CMD ["node", "dist/main.js"]
