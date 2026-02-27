/*
  Warnings:

  - Made the column `jam_mulai` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jam_berakhir` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "jam_mulai" SET NOT NULL,
ALTER COLUMN "jam_berakhir" SET NOT NULL;
