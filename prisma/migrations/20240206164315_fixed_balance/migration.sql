/*
  Warnings:

  - You are about to drop the column `balance` on the `BalanceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `token_count` on the `BalanceHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BalanceHistory" DROP COLUMN "balance",
DROP COLUMN "token_count",
ADD COLUMN     "amount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 10000;
