# syntax=docker/dockerfile:1

# Build stage: install deps and build static files
FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack (yarn) and install dependencies
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application (outputs to dist/)
# Environment variables for build-time (Vite)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN yarn build

# Production stage: serve static files with Node.js
FROM node:20-alpine AS runner
WORKDIR /app

# Install serve package globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3002
CMD ["serve", "-s", "dist", "-l", "3002"]

