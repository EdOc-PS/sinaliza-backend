-- AlterTable
ALTER TABLE "Discipline" ALTER COLUMN "schoolYear" DROP NOT NULL,
ALTER COLUMN "schoolLevel" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Param" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Param_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Param_type_idx" ON "Param"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Param_type_value_key" ON "Param"("type", "value");
