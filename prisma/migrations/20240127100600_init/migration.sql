/*
  Warnings:

  - You are about to drop the column `token_balance` on the `TokenTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `token_used` on the `TokenTransaction` table. All the data in the column will be lost.
  - Added the required column `amount` to the `TokenTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance` to the `TokenTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TokenTransaction" DROP COLUMN "token_balance",
DROP COLUMN "token_used",
ADD COLUMN     "amount" BIGINT NOT NULL,
ADD COLUMN     "balance" BIGINT NOT NULL;
