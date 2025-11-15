-- Migration: Public Page Forms (Contact Form & PPDB Form)
-- Date: 2025-01-28
-- Description: Add contact forms and PPDB forms tables for public website

-- Create contact_forms table
CREATE TABLE IF NOT EXISTS `contact_forms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
  `reply` TEXT NULL,
  `repliedAt` TIMESTAMP NULL,
  `repliedBy` INT(11) NULL,
  `metadata` JSON NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_instansi_status` (`instansiId`, `status`),
  INDEX `idx_instansi_created` (`instansiId`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ppdb_forms table
CREATE TABLE IF NOT EXISTS `ppdb_forms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `studentName` VARCHAR(255) NOT NULL,
  `studentNIK` VARCHAR(50) NOT NULL,
  `studentBirthDate` DATE NOT NULL,
  `studentBirthPlace` VARCHAR(255) NOT NULL,
  `studentGender` VARCHAR(10) NOT NULL,
  `studentAddress` TEXT NOT NULL,
  `parentName` VARCHAR(255) NOT NULL,
  `parentPhone` VARCHAR(50) NOT NULL,
  `parentEmail` VARCHAR(255) NOT NULL,
  `parentOccupation` VARCHAR(255) NULL,
  `desiredClass` VARCHAR(100) NOT NULL,
  `previousSchool` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `status` ENUM('submitted', 'under_review', 'accepted', 'rejected', 'waitlisted') NOT NULL DEFAULT 'submitted',
  `reviewNotes` TEXT NULL,
  `reviewedAt` TIMESTAMP NULL,
  `reviewedBy` INT(11) NULL,
  `documents` JSON NULL,
  `metadata` JSON NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_instansi_status` (`instansiId`, `status`),
  INDEX `idx_instansi_created` (`instansiId`, `createdAt`),
  INDEX `idx_email` (`parentEmail`),
  INDEX `idx_phone` (`parentPhone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

