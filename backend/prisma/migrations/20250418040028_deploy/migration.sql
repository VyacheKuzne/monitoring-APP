-- CreateTable
CREATE TABLE `company` (
    `idCompany` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`idCompany`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `server` (
    `idServer` INTEGER NOT NULL AUTO_INCREMENT,
    `parentCompany` INTEGER NOT NULL,
    `ipAddress` VARCHAR(50) NOT NULL,
    `hostname` VARCHAR(50) NOT NULL,
    `location` VARCHAR(50) NOT NULL,
    `os` VARCHAR(50) NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idServer`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app` (
    `idApp` INTEGER NOT NULL AUTO_INCREMENT,
    `parentServer` INTEGER NOT NULL,
    `parentDomain` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`idApp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `domain` (
    `idDomain` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `registered` DATETIME(3) NULL,
    `expires` DATETIME(3) NULL,
    `updated` DATETIME(3) NULL,
    `parentStatus` INTEGER NULL,
    `nameRegistar` VARCHAR(50) NULL,
    `nameOwner` VARCHAR(50) NULL,
    `access` BOOLEAN NULL,
    `parentServer` INTEGER NULL,

    UNIQUE INDEX `domain_name_key`(`name`),
    PRIMARY KEY (`idDomain`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SSL` (
    `idSSL` INTEGER NOT NULL AUTO_INCREMENT,
    `serialNumber` VARCHAR(64) NOT NULL,
    `namePublisher` VARCHAR(50) NOT NULL,
    `registered` DATETIME(3) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `parentStatus` INTEGER NULL,
    `fingerprint` VARCHAR(500) NOT NULL,
    `publickey` VARCHAR(50) NOT NULL,
    `privatekey` VARCHAR(50) NOT NULL,
    `version` VARCHAR(50) NOT NULL,
    `parentDomain` INTEGER NOT NULL,

    UNIQUE INDEX `SSL_serialNumber_key`(`serialNumber`),
    PRIMARY KEY (`idSSL`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status` (
    `idStatus` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`idStatus`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkServerStats` (
    `idCheckServerStats` INTEGER NOT NULL AUTO_INCREMENT,
    `parentServer` INTEGER NULL,
    `modelCPU` VARCHAR(191) NOT NULL,
    `loadCPU` DOUBLE NOT NULL,
    `totalRAM` BIGINT NOT NULL,
    `usedRAM` BIGINT NOT NULL,
    `remainingRAM` BIGINT NOT NULL,
    `iface` VARCHAR(191) NOT NULL,
    `ip4` VARCHAR(191) NOT NULL,
    `ip6` VARCHAR(191) NOT NULL,
    `received` BIGINT NOT NULL,
    `sent` BIGINT NOT NULL,
    `speed` DOUBLE NOT NULL,
    `countProcesses` INTEGER NULL,
    `countErrors` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idCheckServerStats`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disk` (
    `idDisk` INTEGER NOT NULL AUTO_INCREMENT,
    `parentServerStats` INTEGER NOT NULL,
    `device` VARCHAR(191) NULL,
    `mount` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `totalMemory` BIGINT NOT NULL,
    `usedMemory` BIGINT NOT NULL,
    `remainingMemory` BIGINT NOT NULL,
    `loadMemory` DOUBLE NOT NULL,

    PRIMARY KEY (`idDisk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page` (
    `idPage` INTEGER NOT NULL AUTO_INCREMENT,
    `parentApp` INTEGER NOT NULL,
    `title` VARCHAR(70) NOT NULL,
    `urlPage` VARCHAR(700) NOT NULL,

    UNIQUE INDEX `page_urlPage_key`(`urlPage`),
    PRIMARY KEY (`idPage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkPage` (
    `idCheckPage` INTEGER NOT NULL AUTO_INCREMENT,
    `parentPage` INTEGER NULL,
    `statusLoadPage` VARCHAR(50) NOT NULL,
    `statusLoadContent` VARCHAR(50) NOT NULL,
    `statusLoadDOM` VARCHAR(50) NOT NULL,
    `statusLoadMedia` VARCHAR(50) NOT NULL,
    `statusLoadStyles` VARCHAR(50) NOT NULL,
    `statusLoadScripts` VARCHAR(50) NOT NULL,
    `responseTime` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idCheckPage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `idNotification` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `parentCompany` INTEGER NULL,
    `parentServer` INTEGER NULL,
    `status` VARCHAR(191) NULL,
    `parentApp` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idNotification`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `server` ADD CONSTRAINT `server_parentCompany_fkey` FOREIGN KEY (`parentCompany`) REFERENCES `company`(`idCompany`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app` ADD CONSTRAINT `app_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app` ADD CONSTRAINT `app_parentDomain_fkey` FOREIGN KEY (`parentDomain`) REFERENCES `domain`(`idDomain`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `domain` ADD CONSTRAINT `domain_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `domain` ADD CONSTRAINT `domain_parentStatus_fkey` FOREIGN KEY (`parentStatus`) REFERENCES `status`(`idStatus`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSL` ADD CONSTRAINT `SSL_parentDomain_fkey` FOREIGN KEY (`parentDomain`) REFERENCES `domain`(`idDomain`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSL` ADD CONSTRAINT `SSL_parentStatus_fkey` FOREIGN KEY (`parentStatus`) REFERENCES `status`(`idStatus`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkServerStats` ADD CONSTRAINT `checkServerStats_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disk` ADD CONSTRAINT `disk_parentServerStats_fkey` FOREIGN KEY (`parentServerStats`) REFERENCES `checkServerStats`(`idCheckServerStats`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_parentApp_fkey` FOREIGN KEY (`parentApp`) REFERENCES `app`(`idApp`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkPage` ADD CONSTRAINT `checkPage_parentPage_fkey` FOREIGN KEY (`parentPage`) REFERENCES `page`(`idPage`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_parentCompany_fkey` FOREIGN KEY (`parentCompany`) REFERENCES `company`(`idCompany`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_parentApp_fkey` FOREIGN KEY (`parentApp`) REFERENCES `app`(`idApp`) ON DELETE SET NULL ON UPDATE CASCADE;
