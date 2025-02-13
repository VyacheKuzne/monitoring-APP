/*
  Warnings:

  - You are about to drop the column `remainingMemory` on the `checkserverstats` table. All the data in the column will be lost.
  - You are about to drop the column `totalMemory` on the `checkserverstats` table. All the data in the column will be lost.
  - You are about to drop the column `usedMemory` on the `checkserverstats` table. All the data in the column will be lost.
  - You are about to alter the column `totalRAM` on the `checkserverstats` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `BigInt`.
  - You are about to alter the column `usedRAM` on the `checkserverstats` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `BigInt`.
  - You are about to alter the column `remainingRAM` on the `checkserverstats` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `BigInt`.
  - You are about to alter the column `registered` on the `domain` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `expires` on the `domain` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `updated` on the `domain` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - Added the required column `iface` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip4` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip6` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loadCPU` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelCPU` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `received` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sent` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speed` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `checkserverstats` DROP FOREIGN KEY `checkServerStats_parentServer_fkey`;

-- DropIndex
DROP INDEX `checkServerStats_parentServer_fkey` ON `checkserverstats`;

-- AlterTable
ALTER TABLE `checkserverstats` DROP COLUMN `remainingMemory`,
    DROP COLUMN `totalMemory`,
    DROP COLUMN `usedMemory`,
    ADD COLUMN `iface` VARCHAR(191) NOT NULL,
    ADD COLUMN `ip4` VARCHAR(191) NOT NULL,
    ADD COLUMN `ip6` VARCHAR(191) NOT NULL,
    ADD COLUMN `loadCPU` DOUBLE NOT NULL,
    ADD COLUMN `modelCPU` VARCHAR(191) NOT NULL,
    ADD COLUMN `received` BIGINT NOT NULL,
    ADD COLUMN `sent` BIGINT NOT NULL,
    ADD COLUMN `speed` DOUBLE NOT NULL,
    MODIFY `parentServer` INTEGER NULL,
    MODIFY `totalRAM` BIGINT NOT NULL,
    MODIFY `usedRAM` BIGINT NOT NULL,
    MODIFY `remainingRAM` BIGINT NOT NULL,
    MODIFY `countProcesses` INTEGER NULL,
    MODIFY `countErrors` INTEGER NULL;

-- AlterTable
ALTER TABLE `domain` MODIFY `registered` DATETIME(3) NULL,
    MODIFY `expires` DATETIME(3) NULL,
    MODIFY `updated` DATETIME(3) NULL;

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

-- AddForeignKey
ALTER TABLE `checkServerStats` ADD CONSTRAINT `checkServerStats_parentServer_fkey` FOREIGN KEY (`parentServer`) REFERENCES `server`(`idServer`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disk` ADD CONSTRAINT `disk_parentServerStats_fkey` FOREIGN KEY (`parentServerStats`) REFERENCES `checkServerStats`(`idCheckServerStats`) ON DELETE RESTRICT ON UPDATE CASCADE;
