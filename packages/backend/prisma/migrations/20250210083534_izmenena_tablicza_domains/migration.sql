/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `domain` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `domain` MODIFY `registered` VARCHAR(191) NULL,
    MODIFY `expires` VARCHAR(191) NULL,
    MODIFY `updated` VARCHAR(191) NULL,
    MODIFY `nameRegistar` VARCHAR(50) NULL,
    MODIFY `nameOwner` VARCHAR(50) NULL,
    MODIFY `access` BOOLEAN NULL;

-- CreateIndex
CREATE UNIQUE INDEX `domain_name_key` ON `domain`(`name`);
