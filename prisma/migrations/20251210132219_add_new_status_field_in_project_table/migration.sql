-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "has_dataset" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_listed" BOOLEAN NOT NULL DEFAULT false;
