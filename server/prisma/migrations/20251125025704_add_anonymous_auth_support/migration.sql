-- Add anonymous authentication fields to users table
-- Skip category_id since it already exists

-- AlterTable users - add anonymous fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "device_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_anonymous" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "process_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex (skip if exists)
CREATE INDEX IF NOT EXISTS "users_device_id_idx" ON "users"("device_id");
CREATE INDEX IF NOT EXISTS "users_is_anonymous_created_at_idx" ON "users"("is_anonymous", "created_at");
