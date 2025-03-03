/*
  Warnings:

  - You are about to drop the `serverhasssl` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `serverhasssl` DROP FOREIGN KEY `serverHasSSL_manySSL_fkey`;

-- DropForeignKey
ALTER TABLE `serverhasssl` DROP FOREIGN KEY `serverHasSSL_manyServer_fkey`;

-- DropTable
DROP TABLE `serverhasssl`;

-- CreateTable
CREATE TABLE `appHasSSL` (
    `manyApp` INTEGER NOT NULL,
    `manySSL` INTEGER NOT NULL,

    PRIMARY KEY (`manyApp`, `manySSL`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `appHasSSL` ADD CONSTRAINT `appHasSSL_manyApp_fkey` FOREIGN KEY (`manyApp`) REFERENCES `app`(`idApp`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appHasSSL` ADD CONSTRAINT `appHasSSL_manySSL_fkey` FOREIGN KEY (`manySSL`) REFERENCES `SSL`(`idSSL`) ON DELETE RESTRICT ON UPDATE CASCADE;
