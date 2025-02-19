/*
  Warnings:

  - Added the required column `date` to the `checkServerStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checkserverstats` ADD COLUMN `date` DATETIME(3) NOT NULL;
