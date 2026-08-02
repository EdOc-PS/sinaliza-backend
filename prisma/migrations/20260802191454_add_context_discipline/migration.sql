-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN     "isContext" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EssayPrompt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "disciplineId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayPromptCompletion" (
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EssayPromptCompletion_pkey" PRIMARY KEY ("userId","promptId")
);

-- CreateTable
CREATE TABLE "EssayExample" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayExample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EssayPrompt_disciplineId_idx" ON "EssayPrompt"("disciplineId");

-- CreateIndex
CREATE INDEX "EssayPromptCompletion_userId_idx" ON "EssayPromptCompletion"("userId");

-- CreateIndex
CREATE INDEX "EssayPromptCompletion_promptId_idx" ON "EssayPromptCompletion"("promptId");

-- CreateIndex
CREATE INDEX "EssayExample_disciplineId_idx" ON "EssayExample"("disciplineId");

-- CreateIndex
CREATE INDEX "Discipline_isContext_idx" ON "Discipline"("isContext");

-- AddForeignKey
ALTER TABLE "EssayPrompt" ADD CONSTRAINT "EssayPrompt_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayPromptCompletion" ADD CONSTRAINT "EssayPromptCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayPromptCompletion" ADD CONSTRAINT "EssayPromptCompletion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "EssayPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayExample" ADD CONSTRAINT "EssayExample_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
