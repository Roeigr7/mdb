-- Orphan suppliers had no ownership; clear them before requiring userId.
DELETE FROM "Supplier";

ALTER TABLE "Supplier" ADD COLUMN "notes" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "userId" INTEGER NOT NULL;

ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Supplier_userId_idx" ON "Supplier"("userId");
