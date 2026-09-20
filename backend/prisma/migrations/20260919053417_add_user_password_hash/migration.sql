/*
  Existing User rows need a value for the new required passwordHash column.
  Placeholder hash is for migration only — those accounts cannot log in with a
  normal password until reset/re-registered (login not implemented yet).
*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '$2b$10$FfBmS9MkzpHFEhdjMVQ0DO48G0EibdAeD.tXWIA/vHreOVLMzJo3m';

-- Remove the temporary default so new users must always provide a hash
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP DEFAULT;
