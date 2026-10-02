-- CreateTable
CREATE TABLE "SignAccess" (
    "id" TEXT NOT NULL,
    "signId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignAccess_createdAt_idx" ON "SignAccess"("createdAt");

-- CreateIndex
CREATE INDEX "SignAccess_signId_idx" ON "SignAccess"("signId");

-- AddForeignKey
ALTER TABLE "SignAccess" ADD CONSTRAINT "SignAccess_signId_fkey" FOREIGN KEY ("signId") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignAccess" ADD CONSTRAINT "SignAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
