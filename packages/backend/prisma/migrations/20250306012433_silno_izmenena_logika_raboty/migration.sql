/*
  Warnings:

  - You are about to drop the `apphasssl` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `serverhasdomain` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `parentDomain` to the `SSL` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `apphasssl` DROP FOREIGN KEY `appHasSSL_manyApp_fkey`;

-- DropForeignKey
ALTER TABLE `apphasssl` DROP FOREIGN KEY `appHasSSL_manySSL_fkey`;

-- DropForeignKey
ALTER TABLE `serverhasdomain` DROP FOREIGN KEY `serverHasDomain_manyDomain_fkey`;

-- DropForeignKey
ALTER TABLE `serverhasdomain` DROP FOREIGN KEY `serverHasDomain_manyServer_fkey`;

-- AlterTable
ALTER TABLE `domain` ADD COLUMN `parentServer` INTEGER NULL;

-- AlterTable
ALTER TABLE `ssl` ADD COLUMN `parentDomain` INTEGER NOT NULL;

-- DropTable
DROP TABLE `apphasssl`;

-- DropTable
DROP TABLE `serverhasdomain`;

-- AddForeignKey
ALTER TABLE `domain` ADD CONSTRAINT `domain_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSL` ADD CONSTRAINT `SSL_parentDomain_fkey` FOREIGN KEY (`parentDomain`) REFERENCES `domain`(`idDomain`) ON DELETE RESTRICT ON UPDATE CASCADE;
