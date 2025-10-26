-- AlterTable
ALTER TABLE "templates" ADD COLUMN "prompt" TEXT,
ADD COLUMN "negative_prompt" TEXT,
ADD COLUMN "model_provider" TEXT NOT NULL DEFAULT 'gemini',
ADD COLUMN "model_name" TEXT NOT NULL DEFAULT 'gemini-1.5-pro';

