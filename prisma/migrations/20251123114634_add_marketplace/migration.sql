-- CreateEnum
CREATE TYPE "MarketplaceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "marketplace_listings" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "dataset_collection_blob_id" TEXT NOT NULL,
    "dataset_collection_public_key" TEXT NOT NULL,
    "last_sale_epoch_timestamp" BIGINT NOT NULL,
    "total_sales_amount" BIGINT NOT NULL,
    "total_sales_count" BIGINT NOT NULL,
    "curator" TEXT NOT NULL,
    "created_at" BIGINT,
    "updated_at" BIGINT,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_sales" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "paid_amount" BIGINT NOT NULL,
    "bought_at" BIGINT NOT NULL,

    CONSTRAINT "listing_sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_listings_id_network_key" ON "marketplace_listings"("id", "network");

-- CreateIndex
CREATE UNIQUE INDEX "listing_sales_id_network_key" ON "listing_sales"("id", "network");

-- AddForeignKey
ALTER TABLE "listing_sales" ADD CONSTRAINT "listing_sales_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
