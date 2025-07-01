/*
  Warnings:

  - You are about to drop the column `paymentProof` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrls` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "paymentProof",
ADD COLUMN     "paymentProofsBaseKeys" TEXT[];

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "photoUrls",
ADD COLUMN     "photoUrlsBaseKeys" TEXT[];
