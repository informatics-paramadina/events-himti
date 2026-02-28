-- AlterTable untuk Event: ubah id dari Int ke String (UUID)

-- Step 1: Buat kolom uuid_id baru di Event
ALTER TABLE "Event" ADD COLUMN "uuid_id" TEXT;

-- Step 2: Generate UUID untuk semua existing events
UPDATE "Event" SET "uuid_id" = gen_random_uuid()::TEXT WHERE "uuid_id" IS NULL;

-- Step 3: Drop foreign key dari Participant ke Event
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_eventId_fkey";

-- Step 4: Change eventId type from integer to TEXT
ALTER TABLE "Participant" ALTER COLUMN "eventId" SET DATA TYPE TEXT USING "eventId"::TEXT;

-- Step 5: Update eventId di Participant dengan UUID (map dari Event uuid_id)
UPDATE "Participant" AS p
SET "eventId" = e."uuid_id"
FROM "Event" e
WHERE e.id::int = p."eventId"::int;

-- Step 6: Drop primary key dari Event
ALTER TABLE "Event" DROP CONSTRAINT "Event_pkey";

-- Step 7: Drop kolom id lama dan rename uuid_id jadi id
ALTER TABLE "Event" DROP COLUMN "id";
ALTER TABLE "Event" RENAME COLUMN "uuid_id" TO "id";

-- Step 8: Set id sebagai primary key
ALTER TABLE "Event" ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id");

-- Step 9: Recreate foreign key
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_eventId_fkey" 
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



