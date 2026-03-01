/*
  Warnings:

  - The values [PAID] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `paymentProof` on the `Participant` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('FREE', 'PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "Participant" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "Participant" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "Participant" ALTER COLUMN "paymentStatus" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "paymentProof",
ADD COLUMN     "buktiPembayaran" TEXT,
ALTER COLUMN "paymentStatus" SET DEFAULT 'FREE';
