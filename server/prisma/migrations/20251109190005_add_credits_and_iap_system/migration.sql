-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('purchase', 'usage', 'bonus');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "credits" INTEGER NOT NULL DEFAULT 2;

-- Update existing users to have 2 credits
UPDATE "users" SET "credits" = 2 WHERE "credits" IS NULL;

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "product_id" TEXT,
    "apple_transaction_id" TEXT,
    "apple_original_transaction_id" TEXT,
    "transaction_data" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iap_products" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL,
    "price" DECIMAL(10,2),
    "currency" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iap_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_apple_transaction_id_idx" ON "transactions"("apple_transaction_id");

-- CreateIndex
CREATE INDEX "transactions_apple_original_transaction_id_idx" ON "transactions"("apple_original_transaction_id");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "iap_products_product_id_key" ON "iap_products"("product_id");

-- CreateIndex
CREATE INDEX "iap_products_product_id_idx" ON "iap_products"("product_id");

-- CreateIndex
CREATE INDEX "iap_products_is_active_idx" ON "iap_products"("is_active");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

