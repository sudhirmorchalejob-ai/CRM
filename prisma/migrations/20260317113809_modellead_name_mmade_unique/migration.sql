/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `LeadSource` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LeadSource_name_key" ON "LeadSource"("name");
