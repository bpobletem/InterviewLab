/*
  Warnings:

  - You are about to drop the column `resume_url` on the `interview` table. All the data in the column will be lost.
  - Added the required column `resume` to the `interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "interview" DROP COLUMN "resume_url",
ADD COLUMN     "resume" TEXT NOT NULL;
