/*
  Warnings:

  - You are about to drop the column `oneDomain` on the `app` table. All the data in the column will be lost.
  - You are about to drop the column `oneApp` on the `domain` table. All the data in the column will be lost.
  - Added the required column `parentDomain` to the `app` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `app` DROP COLUMN `oneDomain`,
    ADD COLUMN `parentDomain` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `domain` DROP COLUMN `oneApp`;

-- AddForeignKey
ALTER TABLE `app` ADD CONSTRAINT `app_parentDomain_fkey` FOREIGN KEY (`parentDomain`) REFERENCES `domain`(`idDomain`) ON DELETE RESTRICT ON UPDATE CASCADE;
