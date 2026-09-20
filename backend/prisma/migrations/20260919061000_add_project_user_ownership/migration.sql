/*
  Reshape Project ownership:
  - Replace managerId with userId (FK to User, ON DELETE CASCADE)
  - Add optional description
  - Drop construction-specific columns (customer, status, dates, budget, contractValue)
  Existing rows: userId is backfilled from managerId.
*/
ALTER TABLE "Project" ADD COLUMN "description" TEXT;
ALTER TABLE "Project" ADD COLUMN "userId" INTEGER;

UPDATE "Project" SET "userId" = "managerId" WHERE "userId" IS NULL;

ALTER TABLE "Project" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Project" DROP CONSTRAINT "Project_managerId_fkey";
ALTER TABLE "Project" DROP COLUMN "customer";
ALTER TABLE "Project" DROP COLUMN "managerId";
ALTER TABLE "Project" DROP COLUMN "status";
ALTER TABLE "Project" DROP COLUMN "startDate";
ALTER TABLE "Project" DROP COLUMN "endDate";
ALTER TABLE "Project" DROP COLUMN "budget";
ALTER TABLE "Project" DROP COLUMN "contractValue";

ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;