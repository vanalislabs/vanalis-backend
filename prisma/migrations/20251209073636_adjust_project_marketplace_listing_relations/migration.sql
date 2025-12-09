/*
  Warnings:

  - You are about to drop the column `owner` on the `marketplace_listings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[project_id]` on the table `marketplace_listings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "marketplace_listings" DROP COLUMN "owner";

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_listings_project_id_key" ON "marketplace_listings"("project_id");

-- CreateIndex
CREATE INDEX "marketplace_listings_project_id_network_idx" ON "marketplace_listings"("project_id", "network");

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
