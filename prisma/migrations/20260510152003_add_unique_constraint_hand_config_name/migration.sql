/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `HandConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HandConfig_name_key" ON "HandConfig"("name");
