/*
  Warnings:

  - You are about to drop the column `job_type_id` on the `interview` table. All the data in the column will be lost.
  - You are about to drop the `job_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "interview" DROP CONSTRAINT "interview_job_type_id_fkey";

-- DropForeignKey
ALTER TABLE "job_types" DROP CONSTRAINT "job_types_area_id_fkey";

-- DropIndex
DROP INDEX "interview_job_type_id_idx";

-- AlterTable
ALTER TABLE "interview" DROP COLUMN "job_type_id";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'Masculino';

-- DropTable
DROP TABLE "job_types";
