/*
  Warnings:

  - The values [DEPOSIT,WITHDRAW] on the enum `TokenTransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenTransactionType_new" AS ENUM ('CREDIT', 'DEBIT');
ALTER TABLE "TokenTransaction" ALTER COLUMN "type" TYPE "TokenTransactionType_new" USING ("type"::text::"TokenTransactionType_new");
ALTER TYPE "TokenTransactionType" RENAME TO "TokenTransactionType_old";
ALTER TYPE "TokenTransactionType_new" RENAME TO "TokenTransactionType";
DROP TYPE "TokenTransactionType_old";
COMMIT;
