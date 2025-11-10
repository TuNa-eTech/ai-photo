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
ARG VITE_DEV_AUTH
ARG VITE_DEV_AUTH_TOKEN
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_DEV_AUTH=${VITE_DEV_AUTH}
ENV VITE_DEV_AUTH_TOKEN=${VITE_DEV_AUTH_TOKEN}
ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
ENV VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
ENV VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
ENV VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}

RUN yarn build

# Production stage: serve static files with Node.js
FROM node:20-alpine AS runner
WORKDIR /app

# Install serve package globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["serve", "-s", "dist", "-l", "3001"]

