/*
  Warnings:

  - You are about to drop the column `supplierId` on the `Material` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_supplierId_fkey";

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "supplierId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD COLUMN     "supplier" TEXT;

-- CreateIndex
CREATE INDEX "Material_projectId_idx" ON "Material"("projectId");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
