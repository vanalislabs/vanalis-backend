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
    "created_at" BIGINT NOT NULL,
    "deadline" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "contributor" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "reward_paid" BIGINT NOT NULL,
    "full_dataset_public_key" TEXT NOT NULL,
    "submitted_at" BIGINT NOT NULL,
    "reviewed_at" BIGINT NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aes_keypairs" (
    "creator" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "private_key" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "account_access_aes_keypairs" (
    "address" TEXT NOT NULL,
    "public_key" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_id_network_key" ON "projects"("id", "network");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_id_network_key" ON "submissions"("id", "network");

-- CreateIndex
CREATE UNIQUE INDEX "aes_keypairs_creator_public_key_private_key_key" ON "aes_keypairs"("creator", "public_key", "private_key");

-- CreateIndex
CREATE UNIQUE INDEX "account_access_aes_keypairs_address_public_key_key" ON "account_access_aes_keypairs"("address", "public_key");
