/*
  Warnings:

  - You are about to drop the column `institute` on the `Educator` table. All the data in the column will be lost.
  - You are about to drop the column `institute` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Educator" DROP COLUMN "institute";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "institute";
