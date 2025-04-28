/*
  Warnings:

  - Made the column `network` on table `LoyaltyPass` required. This step will fail if there are existing NULL values in that column.
  - Made the column `network` on table `LoyaltyProgram` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LoyaltyPass" ALTER COLUMN "network" SET NOT NULL;

-- AlterTable
ALTER TABLE "LoyaltyProgram" ALTER COLUMN "network" SET NOT NULL;
