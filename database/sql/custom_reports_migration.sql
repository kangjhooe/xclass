-- Migration: Custom Reports & Report Executions
-- Date: 2025-01-28
-- Description: Add custom reports and report executions tables for advanced analytics

-- Create custom_reports table
CREATE TABLE IF NOT EXISTS `custom_reports` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `type` ENUM('students', 'teachers', 'attendance', 'grades', 'financial', 'custom') NOT NULL,
  `config` JSON NOT NULL,
  `format` ENUM('pdf', 'excel', 'csv', 'json') NOT NULL,
  `schedule` ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'manual') NOT NULL DEFAULT 'manual',
  `scheduleTime` TIME NULL,
  `scheduleDay` INT(11) NULL,
  `emailRecipients` TEXT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdBy` INT(11) NULL,
  `lastRunAt` TIMESTAMP NULL,
  `lastRunResult` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_instansi_active` (`instansiId`, `isActive`),
  INDEX `idx_instansi_created` (`instansiId`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create report_executions table
CREATE TABLE IF NOT EXISTS `report_executions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `reportId` INT(11) NOT NULL,
  `status` ENUM('pending', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `filePath` TEXT NULL,
  `errorMessage` TEXT NULL,
  `parameters` JSON NULL,
  `recordCount` INT(11) NULL,
  `startedAt` TIMESTAMP NULL,
  `completedAt` TIMESTAMP NULL,
  `executedBy` INT(11) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_report_status` (`reportId`, `status`),
  INDEX `idx_instansi_created` (`instansiId`, `createdAt`),
  FOREIGN KEY (`reportId`) REFERENCES `custom_reports`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

