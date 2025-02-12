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
    `name` VARCHAR(50) NOT NULL,
    `oneDomain` INTEGER NULL,

    PRIMARY KEY (`idApp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `domain` (
    `idDomain` INTEGER NOT NULL AUTO_INCREMENT,
    `oneApp` INTEGER NULL,
    `name` VARCHAR(50) NOT NULL,
    `registered` DATETIME(3) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `updated` DATETIME(3) NOT NULL,
    `parentStatus` INTEGER NULL,
    `nameRegistar` VARCHAR(50) NOT NULL,
    `nameOwner` VARCHAR(50) NOT NULL,
    `access` BOOLEAN NOT NULL,

    PRIMARY KEY (`idDomain`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SSL` (
    `idSSL` INTEGER NOT NULL AUTO_INCREMENT,
    `serialNumber` VARCHAR(50) NOT NULL,
    `namePublisher` VARCHAR(50) NOT NULL,
    `registered` DATETIME(3) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `parentStatus` INTEGER NULL,
    `fingerprint` VARCHAR(50) NOT NULL,
    `publickey` VARCHAR(50) NOT NULL,
    `privatekey` VARCHAR(50) NOT NULL,
    `version` VARCHAR(50) NOT NULL,
    `protocol` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`idSSL`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status` (
    `idStatus` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`idStatus`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `serverHasDomain` (
    `manyServer` INTEGER NOT NULL,
    `manyDomain` INTEGER NOT NULL,

    PRIMARY KEY (`manyServer`, `manyDomain`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `serverHasSSL` (
    `manyServer` INTEGER NOT NULL,
    `manySSL` INTEGER NOT NULL,

    PRIMARY KEY (`manyServer`, `manySSL`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkServerStats` (
    `idCheckServerStats` INTEGER NOT NULL AUTO_INCREMENT,
    `parentServer` INTEGER NOT NULL,
    `totalRAM` VARCHAR(50) NOT NULL,
    `usedRAM` VARCHAR(50) NOT NULL,
    `remainingRAM` VARCHAR(50) NOT NULL,
    `totalMemory` VARCHAR(50) NOT NULL,
    `usedMemory` VARCHAR(50) NOT NULL,
    `remainingMemory` VARCHAR(50) NOT NULL,
    `countProcesses` INTEGER NOT NULL,
    `countErrors` INTEGER NOT NULL,

    PRIMARY KEY (`idCheckServerStats`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkPage` (
    `idCheckPage` INTEGER NOT NULL AUTO_INCREMENT,
    `parentApp` INTEGER NOT NULL,
    `statusLoadPage` VARCHAR(50) NOT NULL,
    `statusLoadContent` VARCHAR(50) NOT NULL,
    `statusLoadDOM` VARCHAR(50) NOT NULL,
    `statusLoadMedia` VARCHAR(50) NOT NULL,
    `statusLoadStyles` VARCHAR(50) NOT NULL,
    `statusLoadScripts` VARCHAR(50) NOT NULL,
    `requestTime` DATETIME(3) NOT NULL,
    `responseTime` DATETIME(3) NOT NULL,
    `responseRate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idCheckPage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `server` ADD CONSTRAINT `server_parentCompany_fkey` FOREIGN KEY (`parentCompany`) REFERENCES `company`(`idCompany`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app` ADD CONSTRAINT `app_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `domain` ADD CONSTRAINT `domain_parentStatus_fkey` FOREIGN KEY (`parentStatus`) REFERENCES `status`(`idStatus`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSL` ADD CONSTRAINT `SSL_parentStatus_fkey` FOREIGN KEY (`parentStatus`) REFERENCES `status`(`idStatus`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serverHasDomain` ADD CONSTRAINT `serverHasDomain_manyServer_fkey` FOREIGN KEY (`manyServer`) REFERENCES `server`(`idServer`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serverHasDomain` ADD CONSTRAINT `serverHasDomain_manyDomain_fkey` FOREIGN KEY (`manyDomain`) REFERENCES `domain`(`idDomain`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serverHasSSL` ADD CONSTRAINT `serverHasSSL_manyServer_fkey` FOREIGN KEY (`manyServer`) REFERENCES `server`(`idServer`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serverHasSSL` ADD CONSTRAINT `serverHasSSL_manySSL_fkey` FOREIGN KEY (`manySSL`) REFERENCES `SSL`(`idSSL`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkServerStats` ADD CONSTRAINT `checkServerStats_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkPage` ADD CONSTRAINT `checkPage_parentApp_fkey` FOREIGN KEY (`parentApp`) REFERENCES `app`(`idApp`) ON DELETE RESTRICT ON UPDATE CASCADE;
