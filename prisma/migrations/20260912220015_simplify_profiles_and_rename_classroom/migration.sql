-- AlterEnum
BEGIN;
CREATE TYPE "ClassRole_new" AS ENUM ('EDUCATOR', 'STUDENT');
ALTER TABLE "DisciplineEnrollment" ALTER COLUMN "roleInClass" TYPE "ClassRole_new" USING ("roleInClass"::text::"ClassRole_new");
ALTER TYPE "ClassRole" RENAME TO "ClassRole_old";
ALTER TYPE "ClassRole_new" RENAME TO "ClassRole";
DROP TYPE "public"."ClassRole_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('STUDENT', 'EDUCATOR', 'MANAGER');
ALTER TABLE "public"."User" ALTER COLUMN "roles" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "roles" TYPE "Role_new"[] USING ("roles"::text::"Role_new"[]);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "roles" SET DEFAULT ARRAY['STUDENT']::"Role"[];
COMMIT;

-- DropForeignKey
ALTER TABLE "Discipline" DROP CONSTRAINT "Discipline_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "Discipline" DROP CONSTRAINT "Discipline_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineEnrollment" DROP CONSTRAINT "DisciplineEnrollment_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineEnrollment" DROP CONSTRAINT "DisciplineEnrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "EssayExample" DROP CONSTRAINT "EssayExample_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "EssayPrompt" DROP CONSTRAINT "EssayPrompt_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "Guardian" DROP CONSTRAINT "Guardian_userId_fkey";

-- DropForeignKey
ALTER TABLE "_DisciplineSigns" DROP CONSTRAINT "_DisciplineSigns_A_fkey";

-- DropForeignKey
ALTER TABLE "_DisciplineSigns" DROP CONSTRAINT "_DisciplineSigns_B_fkey";

-- DropIndex
DROP INDEX "EssayExample_disciplineId_idx";

-- DropIndex
DROP INDEX "EssayPrompt_disciplineId_idx";

-- AlterTable
ALTER TABLE "EssayExample" DROP COLUMN "disciplineId",
ADD COLUMN     "classroomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EssayPrompt" DROP COLUMN "disciplineId",
ADD COLUMN     "classroomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingSeenAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Discipline";

-- DropTable
DROP TABLE "DisciplineEnrollment";

-- DropTable
DROP TABLE "Guardian";

-- DropTable
DROP TABLE "_DisciplineSigns";

-- DropEnum
DROP TYPE "SchoolLevel";

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "colorBackground" TEXT,
    "classCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isContext" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT NOT NULL,
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "roleInClass" "ClassRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClassroomSigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassroomSigns_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_classCode_key" ON "Classroom"("classCode");

-- CreateIndex
CREATE INDEX "Classroom_teacherId_idx" ON "Classroom"("teacherId");

-- CreateIndex
CREATE INDEX "Classroom_classCode_idx" ON "Classroom"("classCode");

-- CreateIndex
CREATE INDEX "Classroom_institutionId_idx" ON "Classroom"("institutionId");

-- CreateIndex
CREATE INDEX "Classroom_isContext_idx" ON "Classroom"("isContext");

-- CreateIndex
CREATE INDEX "ClassroomEnrollment_classroomId_idx" ON "ClassroomEnrollment"("classroomId");

-- CreateIndex
CREATE INDEX "ClassroomEnrollment_userId_idx" ON "ClassroomEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomEnrollment_userId_classroomId_key" ON "ClassroomEnrollment"("userId", "classroomId");

-- CreateIndex
CREATE INDEX "_ClassroomSigns_B_index" ON "_ClassroomSigns"("B");

-- CreateIndex
CREATE INDEX "EssayExample_classroomId_idx" ON "EssayExample"("classroomId");

-- CreateIndex
CREATE INDEX "EssayPrompt_classroomId_idx" ON "EssayPrompt"("classroomId");

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayPrompt" ADD CONSTRAINT "EssayPrompt_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayExample" ADD CONSTRAINT "EssayExample_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomEnrollment" ADD CONSTRAINT "ClassroomEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomEnrollment" ADD CONSTRAINT "ClassroomEnrollment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomSigns" ADD CONSTRAINT "_ClassroomSigns_A_fkey" FOREIGN KEY ("A") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomSigns" ADD CONSTRAINT "_ClassroomSigns_B_fkey" FOREIGN KEY ("B") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

