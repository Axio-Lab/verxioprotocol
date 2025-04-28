/*
  Warnings:

  - You are about to drop the column `programId` on the `Raffle` table. All the data in the column will be lost.
  - Added the required column `programAddress` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Raffle" DROP CONSTRAINT "Raffle_programId_fkey";

-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "programId",
ADD COLUMN     "programAddress" TEXT NOT NULL;
