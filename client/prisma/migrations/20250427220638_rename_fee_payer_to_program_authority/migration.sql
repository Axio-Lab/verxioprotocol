/*
  Warnings:

  - You are about to drop the column `feePayerPrivate` on the `LoyaltyProgram` table. All the data in the column will be lost.
  - You are about to drop the column `feePayerPublic` on the `LoyaltyProgram` table. All the data in the column will be lost.
  - Added the required column `programAuthorityPrivate` to the `LoyaltyProgram` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programAuthorityPublic` to the `LoyaltyProgram` table without a default value. This is not possible if the table is not empty.

*/
-- Rename columns in LoyaltyProgram table
ALTER TABLE "LoyaltyProgram" RENAME COLUMN "feePayerPrivate" TO "programAuthorityPrivate";
ALTER TABLE "LoyaltyProgram" RENAME COLUMN "feePayerPublic" TO "programAuthorityPublic";
