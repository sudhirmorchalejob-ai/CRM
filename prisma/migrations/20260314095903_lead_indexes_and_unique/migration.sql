/*
  Warnings:

  - A unique constraint covering the columns `[facebookLeadId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lead_facebookLeadId_key" ON "Lead"("facebookLeadId");

-- CreateIndex
CREATE INDEX "Lead_sourceId_idx" ON "Lead"("sourceId");

-- CreateIndex
CREATE INDEX "Lead_statusId_idx" ON "Lead"("statusId");
