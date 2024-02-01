/*
  Warnings:

  - You are about to drop the column `balance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_new` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TokenTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "balance",
DROP COLUMN "is_new",
ADD COLUMN     "settings" TEXT;

-- DropTable
DROP TABLE "TokenTransaction";
