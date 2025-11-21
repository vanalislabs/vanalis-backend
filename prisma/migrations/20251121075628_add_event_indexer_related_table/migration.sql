/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "deleted_at";

-- CreateTable
CREATE TABLE "cursor_events" (
    "type" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "event_seq" TEXT NOT NULL,
    "tx_digest" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "event_logs" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "transaction_module" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parsed_json" JSONB NOT NULL,
    "bcs_encoding" TEXT NOT NULL,
    "bcs" TEXT NOT NULL,
    "timestamp_ms" BIGINT NOT NULL,
    "raw_data" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "cursor_events_type_network_key" ON "cursor_events"("type", "network");

-- CreateIndex
CREATE UNIQUE INDEX "event_logs_id_network_key" ON "event_logs"("id", "network");
