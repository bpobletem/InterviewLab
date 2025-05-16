/*
  Warnings:

  - The primary key for the `interview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `interview_id` on the `conversation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `interview` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "conversation" DROP CONSTRAINT "conversation_interview_id_fkey";

-- AlterTable
ALTER TABLE "conversation" DROP COLUMN "interview_id",
ADD COLUMN     "interview_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "interview" DROP CONSTRAINT "interview_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "title" DROP DEFAULT,
ADD CONSTRAINT "interview_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_interview_id_key" ON "conversation"("interview_id");

-- CreateIndex
CREATE INDEX "conversation_interview_id_idx" ON "conversation"("interview_id");

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
