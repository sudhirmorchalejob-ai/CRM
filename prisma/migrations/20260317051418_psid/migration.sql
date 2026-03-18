/*
  Warnings:

  - A unique constraint covering the columns `[psid]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "psid" TEXT,
ADD COLUMN     "step" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_psid_key" ON "Lead"("psid");
