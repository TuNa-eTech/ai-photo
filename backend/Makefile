# Makefile for backend utilities

MIGRATE_CMD=migrate -path ./migrations -database "postgres://imageai:imageai_pass@localhost:5432/imageai_db?sslmode=disable"

.PHONY: migrate-up migrate-down migrate-new test test-cover

migrate-up:
	$(MIGRATE_CMD) up

migrate-down:
	$(MIGRATE_CMD) down

migrate-new:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make migrate-new name=your_migration_name"; \
		exit 1; \
	fi; \
	migrate create -ext sql -dir ./migrations -seq $(name)

test:
	go test ./...

test-cover:
	go test -cover ./...
