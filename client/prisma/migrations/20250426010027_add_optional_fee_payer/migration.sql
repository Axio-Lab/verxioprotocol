/*
  Warnings:

  - Made the column `feePayerPrivate` on table `LoyaltyProgram` required. This step will fail if there are existing NULL values in that column.
  - Made the column `feePayerPublic` on table `LoyaltyProgram` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LoyaltyProgram" ALTER COLUMN "feePayerPrivate" SET NOT NULL,
ALTER COLUMN "feePayerPublic" SET NOT NULL;
