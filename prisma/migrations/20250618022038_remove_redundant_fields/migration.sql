/*
  Warnings:

  - You are about to drop the column `deposit` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `rent` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `applicationFee` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `securityDeposit` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "deposit",
DROP COLUMN "rent";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "applicationFee",
DROP COLUMN "securityDeposit";
