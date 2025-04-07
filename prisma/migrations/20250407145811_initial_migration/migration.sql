-- CreateTable
CREATE TABLE "area" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_career" (
    "institution_id" BIGINT NOT NULL,
    "career_id" BIGINT NOT NULL,

    CONSTRAINT "institution_career_pkey" PRIMARY KEY ("institution_id","career_id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthday" DATE NOT NULL,
    "institution_id" BIGINT,
    "career_id" BIGINT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "job_description" TEXT NOT NULL,
    "resume_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" BIGSERIAL NOT NULL,
    "interview_id" BIGINT NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "area_id_idx" ON "area"("id");

-- CreateIndex
CREATE INDEX "institution_id_idx" ON "institution"("id");

-- CreateIndex
CREATE INDEX "career_id_idx" ON "career"("id");

-- CreateIndex
CREATE INDEX "institution_career_institution_id_idx" ON "institution_career"("institution_id");

-- CreateIndex
CREATE INDEX "institution_career_career_id_idx" ON "institution_career"("career_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_id_idx" ON "user"("id");

-- CreateIndex
CREATE INDEX "interview_id_idx" ON "interview"("id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_interview_id_key" ON "conversation"("interview_id");

-- CreateIndex
CREATE INDEX "conversation_id_idx" ON "conversation"("id");

-- AddForeignKey
ALTER TABLE "institution_career" ADD CONSTRAINT "institution_career_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_career" ADD CONSTRAINT "institution_career_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_institution_id_career_id_fkey" FOREIGN KEY ("institution_id", "career_id") REFERENCES "institution_career"("institution_id", "career_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
