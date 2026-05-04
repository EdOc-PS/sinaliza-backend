-- CreateEnum
CREATE TYPE "SchoolLevel" AS ENUM ('ENSINO_MEDIO_1', 'ENSINO_MEDIO_2', 'ENSINO_MEDIO_3');

-- CreateEnum
CREATE TYPE "ClassRole" AS ENUM ('STUDENT', 'FAMILY', 'INTERPRETER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Discipline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "colorBackground" TEXT,
    "classCode" TEXT NOT NULL,
    "schoolYear" INTEGER NOT NULL,
    "schoolLevel" "SchoolLevel" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "roleInClass" "ClassRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisciplineEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_classCode_key" ON "Discipline"("classCode");

-- CreateIndex
CREATE INDEX "Discipline_teacherId_idx" ON "Discipline"("teacherId");

-- CreateIndex
CREATE INDEX "Discipline_classCode_idx" ON "Discipline"("classCode");

-- CreateIndex
CREATE INDEX "DisciplineEnrollment_disciplineId_idx" ON "DisciplineEnrollment"("disciplineId");

-- CreateIndex
CREATE INDEX "DisciplineEnrollment_userId_idx" ON "DisciplineEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineEnrollment_userId_disciplineId_key" ON "DisciplineEnrollment"("userId", "disciplineId");

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineEnrollment" ADD CONSTRAINT "DisciplineEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineEnrollment" ADD CONSTRAINT "DisciplineEnrollment_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
