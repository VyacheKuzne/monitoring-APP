-- DropForeignKey
ALTER TABLE `checkpage` DROP FOREIGN KEY `checkPage_parentApp_fkey`;

-- DropIndex
DROP INDEX `checkPage_parentApp_fkey` ON `checkpage`;

-- AlterTable
ALTER TABLE `checkpage` MODIFY `parentApp` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `checkPage` ADD CONSTRAINT `checkPage_parentApp_fkey` FOREIGN KEY (`parentApp`) REFERENCES `app`(`idApp`) ON DELETE SET NULL ON UPDATE CASCADE;
