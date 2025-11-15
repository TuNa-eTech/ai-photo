-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('local', 's3', 'cdn');

-- CreateEnum
CREATE TYPE "AssetKind" AS ENUM ('thumbnail', 'preview', 'cover', 'sample');

-- CreateEnum
CREATE TYPE "ProcessedImageStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "quality" INTEGER,
    "hash" TEXT,
    "storage_type" "StorageType" NOT NULL DEFAULT 'local',
    "bucket" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_assets" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "kind" "AssetKind" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "alt_text" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_images" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "original_file_id" TEXT,
    "result_file_id" TEXT NOT NULL,
    "prompt" TEXT,
    "negative_prompt" TEXT,
    "model_used" TEXT NOT NULL,
    "model_version" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "processing_time_ms" INTEGER,
    "credits_used" INTEGER NOT NULL DEFAULT 1,
    "status" "ProcessedImageStatus" NOT NULL DEFAULT 'completed',
    "error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processed_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_filename_key" ON "files"("filename");

-- CreateIndex
CREATE INDEX "files_mime_type_idx" ON "files"("mime_type");

-- CreateIndex
CREATE INDEX "files_storage_type_idx" ON "files"("storage_type");

-- CreateIndex
CREATE INDEX "files_hash_idx" ON "files"("hash");

-- CreateIndex
CREATE INDEX "template_assets_template_id_idx" ON "template_assets"("template_id");

-- CreateIndex
CREATE INDEX "template_assets_file_id_idx" ON "template_assets"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_assets_template_id_kind_key" ON "template_assets"("template_id", "kind");

-- CreateIndex
CREATE INDEX "processed_images_user_id_idx" ON "processed_images"("user_id");

-- CreateIndex
CREATE INDEX "processed_images_template_id_idx" ON "processed_images"("template_id");

-- CreateIndex
CREATE INDEX "processed_images_created_at_idx" ON "processed_images"("created_at");

-- CreateIndex
CREATE INDEX "processed_images_status_idx" ON "processed_images"("status");

-- AddForeignKey
ALTER TABLE "template_assets" ADD CONSTRAINT "template_assets_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_assets" ADD CONSTRAINT "template_assets_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_images" ADD CONSTRAINT "processed_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_images" ADD CONSTRAINT "processed_images_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_images" ADD CONSTRAINT "processed_images_result_file_id_fkey" FOREIGN KEY ("result_file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
