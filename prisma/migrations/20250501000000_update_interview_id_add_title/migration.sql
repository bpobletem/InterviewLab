-- AlterTable
ALTER TABLE "conversation" DROP CONSTRAINT "conversation_interview_id_fkey";

-- AlterTable
ALTER TABLE "interview" DROP CONSTRAINT "interview_pkey";
ALTER TABLE "interview" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "interview" ALTER COLUMN "id" SET DATA TYPE TEXT;
ALTER TABLE "interview" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Entrevista sin título';
ALTER TABLE "interview" ADD CONSTRAINT "interview_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "conversation" ALTER COLUMN "interview_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;