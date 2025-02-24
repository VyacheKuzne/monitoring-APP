/*
  Warnings:

  - Added the required column `urlPage` to the `checkPage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checkpage` ADD COLUMN `urlPage` VARCHAR(2050) NOT NULL;
