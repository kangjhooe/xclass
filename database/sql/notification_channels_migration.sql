-- Migration: Notification Channels & Logs
-- Date: 2025-01-28
-- Description: Add notification channels and logs tables for multi-channel notification support

-- Create notification_channels table
CREATE TABLE IF NOT EXISTS `notification_channels` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('sms', 'whatsapp', 'email', 'push') NOT NULL,
  `provider` ENUM('twilio', 'raja_sms', 'zenziva', 'whatsapp_business', 'whatsapp_cloud_api', 'firebase', 'smtp') NOT NULL,
  `config` JSON NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `isDefault` TINYINT(1) NOT NULL DEFAULT 0,
  `priority` INT(11) NOT NULL DEFAULT 0,
  `description` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_instansi_type` (`instansiId`, `type`),
  INDEX `idx_active` (`instansiId`, `isActive`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS `notification_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `notificationId` INT(11) NOT NULL,
  `instansiId` INT(11) NOT NULL,
  `channelId` INT(11) NULL,
  `type` ENUM('email', 'sms', 'whatsapp', 'push', 'in_app') NOT NULL,
  `status` ENUM('pending', 'sent', 'failed', 'delivered') NOT NULL,
  `recipient` TEXT NULL,
  `message` TEXT NULL,
  `requestData` JSON NULL,
  `responseData` JSON NULL,
  `errorMessage` TEXT NULL,
  `providerMessageId` VARCHAR(100) NULL,
  `cost` DECIMAL(10,2) NULL,
  `provider` VARCHAR(50) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notification` (`notificationId`),
  INDEX `idx_instansi_created` (`instansiId`, `createdAt`),
  INDEX `idx_channel` (`channelId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update notifications table to support WhatsApp
ALTER TABLE `notifications` 
  MODIFY COLUMN `type` ENUM('email', 'sms', 'whatsapp', 'push', 'in_app') NOT NULL;

-- Update notification_templates table to support WhatsApp
ALTER TABLE `notification_templates` 
  MODIFY COLUMN `type` ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL;

