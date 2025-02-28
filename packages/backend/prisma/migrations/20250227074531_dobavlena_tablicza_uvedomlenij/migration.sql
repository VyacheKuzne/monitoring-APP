-- CreateTable
CREATE TABLE `notification` (
    `idNotification` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `parentCompany` INTEGER NULL,
    `parentServer` INTEGER NULL,
    `parentApp` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idNotification`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_parentCompany_fkey` FOREIGN KEY (`parentCompany`) REFERENCES `company`(`idCompany`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_parentApp_fkey` FOREIGN KEY (`parentApp`) REFERENCES `app`(`idApp`) ON DELETE SET NULL ON UPDATE CASCADE;
