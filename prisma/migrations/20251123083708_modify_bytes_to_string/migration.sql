-- AlterTable
ALTER TABLE "account_access_crypto_keypairs" ALTER COLUMN "public_key" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "crypto_keypairs" ALTER COLUMN "public_key" SET DATA TYPE TEXT,
ALTER COLUMN "private_key" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "submissions" ALTER COLUMN "full_dataset_public_key" SET DATA TYPE TEXT;
