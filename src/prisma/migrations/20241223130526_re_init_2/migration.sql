/*
  Warnings:

  - You are about to drop the column `joinDate` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Enrollment` MODIFY `status` ENUM('ACTIVE', 'REVOKED', 'PENDING') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `joinDate`;
