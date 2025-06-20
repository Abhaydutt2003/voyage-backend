/*
  Warnings:

  - You are about to drop the column `paymentProof` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerMonth` on the `Property` table. All the data in the column will be lost.
  - Added the required column `pricePerNight` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN "paymentProof" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "paymentProof";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "pricePerMonth",
ADD COLUMN "pricePerNight" DOUBLE PRECISION NOT NULL DEFAULT (random() * 99 + 1);

-- Remove the default after setting initial values
ALTER TABLE "Property" ALTER COLUMN "pricePerNight" DROP DEFAULT;
