/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `domain` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `domain` MODIFY `registered` DATETIME(3) NULL,
    MODIFY `expires` DATETIME(3) NULL,
    MODIFY `updated` DATETIME(3) NULL,
    MODIFY `nameRegistar` VARCHAR(50) NULL,
    MODIFY `nameOwner` VARCHAR(50) NULL,
    MODIFY `access` BOOLEAN NULL;

-- CreateIndex
CREATE UNIQUE INDEX `domain_name_key` ON `domain`(`name`);
