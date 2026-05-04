/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "LibrasLevel" AS ENUM ('BASICO', 'INTERMEDIARIO', 'AVANCADO', 'FLUENTE');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'INTERPRETER';

-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "Educator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,

    CONSTRAINT "Educator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interpreter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificate" TEXT NOT NULL,
    "areaAtuacao" TEXT NOT NULL,
    "proficienciaLibras" "LibrasLevel" NOT NULL,
    "institute" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "Interpreter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institute" TEXT,
    "grauEscolar" TEXT NOT NULL,
    "necessidadesEspeciais" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "studentEmail" TEXT,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Educator_userId_key" ON "Educator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Interpreter_userId_key" ON "Interpreter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_userId_key" ON "Guardian"("userId");

-- AddForeignKey
ALTER TABLE "Educator" ADD CONSTRAINT "Educator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interpreter" ADD CONSTRAINT "Interpreter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
