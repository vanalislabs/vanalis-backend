-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'OPEN', 'COMPLETED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "curator" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "submission_requirements" TEXT[],
    "data_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "reward_pool" BIGINT NOT NULL,
    "target_submissions" BIGINT NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "submissions_count" BIGINT NOT NULL,
    "approved_count" BIGINT NOT NULL,
    "rejected_count" BIGINT NOT NULL,
    "created_at" BIGINT,
    "deadline" BIGINT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "contributor" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "reward_paid" BIGINT NOT NULL,
    "full_dataset_public_key" BYTEA NOT NULL,
    "submitted_at" BIGINT,
    "reviewed_at" BIGINT,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_keypairs" (
    "creator" TEXT NOT NULL,
    "public_key" BYTEA NOT NULL,
    "private_key" BYTEA NOT NULL,
    "key_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "account_access_crypto_keypairs" (
    "address" TEXT NOT NULL,
    "public_key" BYTEA NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_id_network_key" ON "projects"("id", "network");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_id_network_key" ON "submissions"("id", "network");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_keypairs_creator_public_key_key" ON "crypto_keypairs"("creator", "public_key");

-- CreateIndex
CREATE UNIQUE INDEX "account_access_crypto_keypairs_address_public_key_key" ON "account_access_crypto_keypairs"("address", "public_key");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
