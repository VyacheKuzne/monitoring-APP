/*
  Warnings:

  - Added the required column `date` to the `checkPage` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `requestTime` on the `checkpage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `responseTime` on the `checkpage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `responseRate` on the `checkpage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `checkpage` ADD COLUMN `date` DATETIME(3) NOT NULL,
    DROP COLUMN `requestTime`,
    ADD COLUMN `requestTime` DOUBLE NOT NULL,
    DROP COLUMN `responseTime`,
    ADD COLUMN `responseTime` DOUBLE NOT NULL,
    DROP COLUMN `responseRate`,
    ADD COLUMN `responseRate` DOUBLE NOT NULL;
