/*
  Warnings:

  - Added the required column `total_reward_pool` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "total_reward_pool" BIGINT NOT NULL;
