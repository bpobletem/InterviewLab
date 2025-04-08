/*
  Warnings:

  - You are about to drop the column `name` on the `career` table. All the data in the column will be lost.
  - You are about to drop the `institution_career` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `institution_id` to the `career` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "institution_career" DROP CONSTRAINT "institution_career_career_id_fkey";

-- DropForeignKey
ALTER TABLE "institution_career" DROP CONSTRAINT "institution_career_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_institution_id_career_id_fkey";

-- DropIndex
DROP INDEX "area_id_idx";

-- DropIndex
DROP INDEX "career_id_idx";

-- DropIndex
DROP INDEX "conversation_id_idx";

-- DropIndex
DROP INDEX "institution_id_idx";

-- DropIndex
DROP INDEX "interview_id_idx";

-- DropIndex
DROP INDEX "user_id_idx";

-- AlterTable
CREATE SEQUENCE career_id_seq;
ALTER TABLE "career" DROP COLUMN "name",
ADD COLUMN     "institution_id" BIGINT NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('career_id_seq');
ALTER SEQUENCE career_id_seq OWNED BY "career"."id";

-- AlterTable
CREATE SEQUENCE institution_id_seq;
ALTER TABLE "institution" ALTER COLUMN "id" SET DEFAULT nextval('institution_id_seq');
ALTER SEQUENCE institution_id_seq OWNED BY "institution"."id";

-- AlterTable
ALTER TABLE "interview" ADD COLUMN     "job_type_id" BIGINT,
ALTER COLUMN "job_description" DROP NOT NULL;

-- DropTable
DROP TABLE "institution_career";

-- CreateTable
CREATE TABLE "institution_email_domains" (
    "id" BIGSERIAL NOT NULL,
    "institution_id" BIGINT NOT NULL,
    "email_domain" TEXT NOT NULL,

    CONSTRAINT "institution_email_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_types" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "area_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institution_email_domains_institution_id_email_domain_key" ON "institution_email_domains"("institution_id", "email_domain");

-- CreateIndex
CREATE UNIQUE INDEX "job_types_name_key" ON "job_types"("name");

-- CreateIndex
CREATE INDEX "job_types_name_idx" ON "job_types"("name");

-- CreateIndex
CREATE INDEX "job_types_area_id_idx" ON "job_types"("area_id");

-- CreateIndex
CREATE INDEX "career_institution_id_idx" ON "career"("institution_id");

-- CreateIndex
CREATE INDEX "career_area_id_idx" ON "career"("area_id");

-- CreateIndex
CREATE INDEX "conversation_interview_id_idx" ON "conversation"("interview_id");

-- CreateIndex
CREATE INDEX "institution_email_idx" ON "institution"("email");

-- CreateIndex
CREATE INDEX "interview_user_id_idx" ON "interview"("user_id");

-- CreateIndex
CREATE INDEX "interview_job_type_id_idx" ON "interview"("job_type_id");

-- CreateIndex
CREATE INDEX "user_institution_id_idx" ON "user"("institution_id");

-- CreateIndex
CREATE INDEX "user_career_id_idx" ON "user"("career_id");

-- AddForeignKey
ALTER TABLE "institution_email_domains" ADD CONSTRAINT "institution_email_domains_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career" ADD CONSTRAINT "career_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "career"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_types" ADD CONSTRAINT "job_types_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_job_type_id_fkey" FOREIGN KEY ("job_type_id") REFERENCES "job_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
