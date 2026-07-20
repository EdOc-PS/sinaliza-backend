-- CreateEnum
CREATE TYPE "GlobalStatus" AS ENUM ('PRIVATE', 'PENDING', 'PUBLIC', 'REJECTED');

-- AlterTable
ALTER TABLE "Sign" ADD COLUMN     "globalStatus" "GlobalStatus" NOT NULL DEFAULT 'PRIVATE';

-- CreateIndex
CREATE INDEX "Sign_globalStatus_idx" ON "Sign"("globalStatus");
