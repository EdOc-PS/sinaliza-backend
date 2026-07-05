-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "HandConfig" ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "Sign" ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "institutionId" TEXT;

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_cnpj_key" ON "Institution"("cnpj");

-- CreateIndex
CREATE INDEX "Discipline_institutionId_idx" ON "Discipline"("institutionId");

-- CreateIndex
CREATE INDEX "HandConfig_institutionId_idx" ON "HandConfig"("institutionId");

-- CreateIndex
CREATE INDEX "Sign_institutionId_idx" ON "Sign"("institutionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandConfig" ADD CONSTRAINT "HandConfig_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
