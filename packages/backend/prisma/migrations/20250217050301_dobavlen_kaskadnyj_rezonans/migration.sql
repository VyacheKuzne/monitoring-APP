-- DropForeignKey
ALTER TABLE `disk` DROP FOREIGN KEY `disk_parentServerStats_fkey`;

-- DropIndex
DROP INDEX `disk_parentServerStats_fkey` ON `disk`;

-- AddForeignKey
ALTER TABLE `disk` ADD CONSTRAINT `disk_parentServerStats_fkey` FOREIGN KEY (`parentServerStats`) REFERENCES `checkServerStats`(`idCheckServerStats`) ON DELETE CASCADE ON UPDATE CASCADE;
