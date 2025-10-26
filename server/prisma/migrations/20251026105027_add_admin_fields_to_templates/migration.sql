-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "TemplateVisibility" AS ENUM ('public', 'private');

-- AlterTable: Rename camelCase columns to snake_case
ALTER TABLE "templates" RENAME COLUMN "thumbnailUrl" TO "thumbnail_url";
ALTER TABLE "templates" RENAME COLUMN "publishedAt" TO "published_at";
ALTER TABLE "templates" RENAME COLUMN "usageCount" TO "usage_count";

-- AlterTable: Add new columns with defaults
ALTER TABLE "templates" ADD COLUMN "slug" TEXT;
ALTER TABLE "templates" ADD COLUMN "description" TEXT;
ALTER TABLE "templates" ADD COLUMN "status" "TemplateStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "templates" ADD COLUMN "visibility" "TemplateVisibility" NOT NULL DEFAULT 'public';
ALTER TABLE "templates" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "templates" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "templates" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Generate slug from existing id for backward compatibility
-- Use full id to ensure uniqueness, format: template-{id}
UPDATE "templates" 
SET "slug" = 'template-' || "id"
WHERE "slug" IS NULL;

-- Set published_at to created_at if published_at exists
UPDATE "templates"
SET "status" = 'published'
WHERE "published_at" IS NOT NULL;

-- AlterTable: Make slug NOT NULL and UNIQUE
ALTER TABLE "templates" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "templates_slug_key" ON "templates"("slug");

-- CreateIndex
CREATE INDEX "templates_status_idx" ON "templates"("status");
CREATE INDEX "templates_visibility_idx" ON "templates"("visibility");
CREATE INDEX "templates_published_at_idx" ON "templates"("published_at");

-- AlterTable: Change id to use uuid default (if not already set)
ALTER TABLE "templates" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

