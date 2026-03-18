-- CreateTable
CREATE TABLE "FacebookUser" (
    "id" SERIAL NOT NULL,
    "facebookUserId" TEXT NOT NULL,
    "userToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacebookUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacebookUser_facebookUserId_key" ON "FacebookUser"("facebookUserId");

-- AddForeignKey
ALTER TABLE "FacebookUser" ADD CONSTRAINT "FacebookUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
