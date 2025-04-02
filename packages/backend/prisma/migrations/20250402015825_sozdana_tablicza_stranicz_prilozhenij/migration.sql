/*
  Warnings:

  - You are about to drop the column `parentApp` on the `checkpage` table. All the data in the column will be lost.
  - You are about to drop the column `requestTime` on the `checkpage` table. All the data in the column will be lost.
  - You are about to drop the column `responseRate` on the `checkpage` table. All the data in the column will be lost.
  - You are about to drop the column `urlPage` on the `checkpage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `checkpage` DROP FOREIGN KEY `checkPage_parentApp_fkey`;

-- DropIndex
DROP INDEX `checkPage_parentApp_fkey` ON `checkpage`;

-- AlterTable
ALTER TABLE `checkpage` DROP COLUMN `parentApp`,
    DROP COLUMN `requestTime`,
    DROP COLUMN `responseRate`,
    DROP COLUMN `urlPage`,
    ADD COLUMN `parentPage` INTEGER NULL;

-- CreateTable
CREATE TABLE `page` (
    `idPage` INTEGER NOT NULL AUTO_INCREMENT,
    `parentApp` INTEGER NOT NULL,
    `title` VARCHAR(70) NOT NULL,
    `urlPage` VARCHAR(2050) NOT NULL,

    UNIQUE INDEX `page_urlPage_key`(`urlPage`),
    PRIMARY KEY (`idPage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_parentApp_fkey` FOREIGN KEY (`parentApp`) REFERENCES `app`(`idApp`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkPage` ADD CONSTRAINT `checkPage_parentPage_fkey` FOREIGN KEY (`parentPage`) REFERENCES `page`(`idPage`) ON DELETE SET NULL ON UPDATE CASCADE;
