-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" BIGINT
);

-- CreateIndex
CREATE UNIQUE INDEX "activities_id_network_key" ON "activities"("id", "network");
