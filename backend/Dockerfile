# syntax=docker/dockerfile:1

FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install git for go mod if needed
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o imageai-backend ./cmd/api

# ---

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/imageai-backend .
COPY --from=builder /app/internal /app/internal
COPY --from=builder /app/go.mod /app/go.mod

EXPOSE 8080

CMD ["./imageai-backend"]
