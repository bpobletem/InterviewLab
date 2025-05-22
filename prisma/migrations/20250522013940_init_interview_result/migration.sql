-- CreateTable
CREATE TABLE "interview_result" (
    "id" UUID NOT NULL,
    "interview_id" UUID NOT NULL,
    "claridadNota" INTEGER NOT NULL,
    "claridadRazon" TEXT NOT NULL,
    "profesionalismoNota" INTEGER NOT NULL,
    "profesionalismoRazon" TEXT NOT NULL,
    "tecnicaNota" INTEGER NOT NULL,
    "tecnicaRazon" TEXT NOT NULL,
    "interesNota" INTEGER NOT NULL,
    "interesRazon" TEXT NOT NULL,
    "ejemplosNota" INTEGER NOT NULL,
    "ejemplosRazon" TEXT NOT NULL,
    "resultadoNota" INTEGER NOT NULL,
    "resultadoRazon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_result_interview_id_key" ON "interview_result"("interview_id");

-- CreateIndex
CREATE INDEX "interview_result_interview_id_idx" ON "interview_result"("interview_id");

-- AddForeignKey
ALTER TABLE "interview_result" ADD CONSTRAINT "interview_result_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
