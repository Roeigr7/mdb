-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('MANUAL', 'SCANNED', 'IMPORTED');

-- AlterTable Document
ALTER TABLE "Document" ADD COLUMN "originalName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Document" ADD COLUMN "storageKey" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Document" ADD COLUMN "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream';
ALTER TABLE "Document" ADD COLUMN "size" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Document" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill storageKey for any existing rows before unique constraint
UPDATE "Document"
SET "storageKey" = 'legacy/' || "id"::text || '-' || md5(random()::text || clock_timestamp()::text)
WHERE "storageKey" = '';

ALTER TABLE "Document" ALTER COLUMN "originalName" DROP DEFAULT;
ALTER TABLE "Document" ALTER COLUMN "storageKey" DROP DEFAULT;
ALTER TABLE "Document" ALTER COLUMN "mimeType" DROP DEFAULT;
ALTER TABLE "Document" ALTER COLUMN "size" DROP DEFAULT;
ALTER TABLE "Document" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");
CREATE INDEX "Document_projectId_idx" ON "Document"("projectId");

-- Drop old RESTRICT FK and recreate with Cascade
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_projectId_fkey";
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Expense
ALTER TABLE "Expense" ADD COLUMN "vatAmount" DOUBLE PRECISION;
ALTER TABLE "Expense" ADD COLUMN "supplier" TEXT;
ALTER TABLE "Expense" ADD COLUMN "documentNumber" TEXT;
ALTER TABLE "Expense" ADD COLUMN "documentUrl" TEXT;
ALTER TABLE "Expense" ADD COLUMN "currency" TEXT;
ALTER TABLE "Expense" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Expense" ADD COLUMN "source" "TransactionSource" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "Expense" ADD COLUMN "documentId" INTEGER;

CREATE INDEX "Expense_documentId_idx" ON "Expense"("documentId");
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable Revenue
ALTER TABLE "Revenue" ADD COLUMN "vatAmount" DOUBLE PRECISION;
ALTER TABLE "Revenue" ADD COLUMN "documentNumber" TEXT;
ALTER TABLE "Revenue" ADD COLUMN "documentUrl" TEXT;
ALTER TABLE "Revenue" ADD COLUMN "currency" TEXT;
ALTER TABLE "Revenue" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Revenue" ADD COLUMN "source" "TransactionSource" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "Revenue" ADD COLUMN "documentId" INTEGER;

CREATE INDEX "Revenue_documentId_idx" ON "Revenue"("documentId");
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
