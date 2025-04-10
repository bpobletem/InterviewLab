/*
  Warnings:

  - Added the required column `name` to the `career` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "career" ADD COLUMN     "name" TEXT NOT NULL;
