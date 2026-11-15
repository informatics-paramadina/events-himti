-- AlterTable: field tugas pasca-acara pada Event
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "adaTugas" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "judulTugas" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "deskripsiTugas" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "deadlineTugas" TIMESTAMP(3);

-- CreateTable: Submission (pengumpulan tugas + sertifikat)
CREATE TABLE IF NOT EXISTS "Submission" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "certificateNumber" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    "participantId" INTEGER NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Submission_certificateNumber_key" ON "Submission"("certificateNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Submission_eventId_participantId_key" ON "Submission"("eventId", "participantId");

-- AddForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT IF EXISTS "Submission_eventId_fkey";
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Submission" DROP CONSTRAINT IF EXISTS "Submission_participantId_fkey";
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;