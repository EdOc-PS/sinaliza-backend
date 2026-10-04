-- AlterTable
ALTER TABLE "ClassroomEnrollment" ADD COLUMN "lastSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Classroom" ADD COLUMN "teacherLastSeenAt" TIMESTAMP(3);
