/*
  Warnings:

  - You are about to drop the column `disciplineId` on the `Sign` table. All the data in the column will be lost.
  - You are about to drop the column `grammaticalClass` on the `Sign` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Sign` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sign" DROP CONSTRAINT "Sign_disciplineId_fkey";

-- DropIndex
DROP INDEX "Sign_disciplineId_idx";

-- DropIndex
DROP INDEX "Sign_grammaticalClass_idx";

-- AlterTable (categoryId nullable por enquanto, para permitir backfill)
ALTER TABLE "Sign" DROP COLUMN "disciplineId",
DROP COLUMN "grammaticalClass",
ADD COLUMN     "categoryId" TEXT;

-- DropEnum
DROP TYPE "GrammaticalClass";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DisciplineSigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DisciplineSigns_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_value_key" ON "Category"("value");

-- CreateIndex
CREATE INDEX "_DisciplineSigns_B_index" ON "_DisciplineSigns"("B");

-- CreateIndex
CREATE INDEX "Sign_categoryId_idx" ON "Sign"("categoryId");

-- Seed categoria padrão para backfill de sinais existentes
INSERT INTO "Category" ("id", "name", "value", "updatedAt")
VALUES (gen_random_uuid()::text, 'Outros', 'OUTROS', CURRENT_TIMESTAMP);

-- Backfill: associa sinais existentes à categoria padrão
UPDATE "Sign" SET "categoryId" = (SELECT "id" FROM "Category" WHERE "value" = 'OUTROS');

-- Agora torna a coluna obrigatória
ALTER TABLE "Sign" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisciplineSigns" ADD CONSTRAINT "_DisciplineSigns_A_fkey" FOREIGN KEY ("A") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisciplineSigns" ADD CONSTRAINT "_DisciplineSigns_B_fkey" FOREIGN KEY ("B") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
