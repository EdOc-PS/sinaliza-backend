-- CreateEnum
CREATE TYPE "GrammaticalClass" AS ENUM ('VERB', 'ADJECTIVE', 'NOUN', 'OTHER');

-- CreateTable
CREATE TABLE "Sign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grammaticalClass" "GrammaticalClass" NOT NULL,
    "handConfigId" TEXT NOT NULL,
    "videoUrl" TEXT,
    "anotherUrl" TEXT,
    "imgUrl" TEXT,
    "examplePt" TEXT,
    "exampleLibras" TEXT,
    "movementDescription" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sign_handConfigId_idx" ON "Sign"("handConfigId");

-- CreateIndex
CREATE INDEX "Sign_creatorId_idx" ON "Sign"("creatorId");

-- CreateIndex
CREATE INDEX "Sign_grammaticalClass_idx" ON "Sign"("grammaticalClass");

-- AddForeignKey
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_handConfigId_fkey" FOREIGN KEY ("handConfigId") REFERENCES "HandConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
