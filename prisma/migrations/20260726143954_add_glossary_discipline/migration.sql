-- CreateTable
CREATE TABLE "GlossaryDiscipline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlossaryDiscipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GlossaryDisciplineSigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GlossaryDisciplineSigns_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GlossaryDisciplineSigns_B_index" ON "_GlossaryDisciplineSigns"("B");

-- AddForeignKey
ALTER TABLE "_GlossaryDisciplineSigns" ADD CONSTRAINT "_GlossaryDisciplineSigns_A_fkey" FOREIGN KEY ("A") REFERENCES "GlossaryDiscipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GlossaryDisciplineSigns" ADD CONSTRAINT "_GlossaryDisciplineSigns_B_fkey" FOREIGN KEY ("B") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
