-- AlterTable
ALTER TABLE "Sign" ADD COLUMN     "disciplineId" TEXT;

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "signId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","signId")
);

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_signId_idx" ON "Favorite"("signId");

-- CreateIndex
CREATE INDEX "Sign_disciplineId_idx" ON "Sign"("disciplineId");

-- AddForeignKey
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_signId_fkey" FOREIGN KEY ("signId") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
