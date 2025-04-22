/*
  Warnings:

  - The primary key for the `conversation` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "conversation" DROP CONSTRAINT "conversation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "details" DROP NOT NULL,
ADD CONSTRAINT "conversation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "conversation_id_seq";
