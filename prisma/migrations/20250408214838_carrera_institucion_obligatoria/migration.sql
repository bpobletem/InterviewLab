/*
  Warnings:

  - Made the column `job_description` on table `interview` required. This step will fail if there are existing NULL values in that column.
  - Made the column `institution_id` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `career_id` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_career_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_institution_id_fkey";

-- AlterTable
ALTER TABLE "interview" ALTER COLUMN "job_description" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "institution_id" SET NOT NULL,
ALTER COLUMN "career_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
