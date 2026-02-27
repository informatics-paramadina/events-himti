/*
  Warnings:

  - You are about to drop the column `jam` on the `Event` table. All the data in the column will be lost.
  - Added the required column `jam_berakhir` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jam_mulai` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add new columns with default values first
ALTER TABLE "Event" ADD COLUMN "jam_mulai" TEXT DEFAULT '00:00';
ALTER TABLE "Event" ADD COLUMN "jam_berakhir" TEXT DEFAULT '23:59';

-- Update existing data: Split jam field into jam_mulai and jam_berakhir
UPDATE "Event" 
SET 
  "jam_mulai" = TRIM(SPLIT_PART("jam", '-', 1)),
  "jam_berakhir" = TRIM(SPLIT_PART("jam", '-', 2))
WHERE "jam" IS NOT NULL AND "jam" != '';

-- Handle cases where there's no hyphen (single time)
UPDATE "Event" 
SET 
  "jam_mulai" = "jam",
  "jam_berakhir" = "jam"
WHERE "jam" IS NOT NULL AND "jam" != '' AND POSITION('-' IN "jam") = 0;

-- Remove default values to make columns required
ALTER TABLE "Event" ALTER COLUMN "jam_mulai" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "jam_berakhir" DROP DEFAULT;

-- Now we can safely drop the old jam column
ALTER TABLE "Event" DROP COLUMN "jam";
