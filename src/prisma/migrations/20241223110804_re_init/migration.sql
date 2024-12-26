/*
  Warnings:

  - You are about to drop the column `isPremium` on the `Profile` table. All the data in the column will be lost.
  - Made the column `price` on table `Assessment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Assessment` MODIFY `price` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `isPremium`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `assessmentId` INTEGER NOT NULL,
    `paymentId` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Enrollment_status_idx`(`status`),
    UNIQUE INDEX `Enrollment_userId_assessmentId_key`(`userId`, `assessmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Payment_status_idx` ON `Payment`(`status`);

-- CreateIndex
CREATE INDEX `Payment_transactionId_idx` ON `Payment`(`transactionId`);

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
