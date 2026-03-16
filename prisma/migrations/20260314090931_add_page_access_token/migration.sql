/*
  Warnings:

  - Added the required column `pageAccessToken` to the `FacebookPage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FacebookPage" ADD COLUMN     "pageAccessToken" TEXT NOT NULL;
