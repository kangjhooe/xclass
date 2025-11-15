-- Migration: Biometric Attendance & Digital Signature
-- Date: 2025-01-28
-- Description: Add biometric devices, enrollments, attendance, and digital signature tables

-- Create biometric_devices table
CREATE TABLE IF NOT EXISTS `biometric_devices` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `deviceId` VARCHAR(255) NOT NULL,
  `type` ENUM('fingerprint', 'face_recognition', 'card_reader') NOT NULL,
  `status` ENUM('active', 'inactive', 'maintenance', 'error') NOT NULL DEFAULT 'active',
  `location` VARCHAR(255) NULL,
  `config` JSON NULL,
  `ipAddress` VARCHAR(45) NULL,
  `port` INT(11) NULL,
  `apiUrl` VARCHAR(255) NULL,
  `apiKey` VARCHAR(255) NULL,
  `lastSyncAt` TIMESTAMP NULL,
  `lastError` TEXT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `description` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_device_instansi` (`deviceId`, `instansiId`),
  INDEX `idx_instansi_active` (`instansiId`, `isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create biometric_enrollments table
CREATE TABLE IF NOT EXISTS `biometric_enrollments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `studentId` INT(11) NOT NULL,
  `deviceId` INT(11) NOT NULL,
  `biometricId` VARCHAR(50) NOT NULL,
  `status` ENUM('pending', 'enrolled', 'failed', 'deleted') NOT NULL DEFAULT 'pending',
  `biometricData` JSON NULL,
  `errorMessage` TEXT NULL,
  `enrolledAt` TIMESTAMP NULL,
  `deletedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_student_device` (`studentId`, `deviceId`),
  INDEX `idx_instansi_status` (`instansiId`, `status`),
  FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`deviceId`) REFERENCES `biometric_devices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create biometric_attendances table
CREATE TABLE IF NOT EXISTS `biometric_attendances` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `deviceId` INT(11) NOT NULL,
  `studentId` INT(11) NOT NULL,
  `biometricId` VARCHAR(50) NOT NULL,
  `type` ENUM('fingerprint', 'face', 'card') NOT NULL,
  `timestamp` TIMESTAMP NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `syncStatus` ENUM('pending', 'synced', 'failed') NOT NULL DEFAULT 'pending',
  `rawData` JSON NULL,
  `errorMessage` TEXT NULL,
  `syncedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_device_timestamp` (`deviceId`, `timestamp`),
  INDEX `idx_student_date` (`studentId`, `date`),
  INDEX `idx_instansi_date` (`instansiId`, `date`),
  FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`deviceId`) REFERENCES `biometric_devices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create digital_signatures table
CREATE TABLE IF NOT EXISTS `digital_signatures` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `userId` INT(11) NOT NULL,
  `type` ENUM('headmaster', 'teacher', 'admin', 'counselor') NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `signatureImage` TEXT NOT NULL,
  `signatureHash` VARCHAR(255) NULL,
  `status` ENUM('active', 'inactive', 'revoked') NOT NULL DEFAULT 'active',
  `metadata` JSON NULL,
  `validFrom` TIMESTAMP NULL,
  `validUntil` TIMESTAMP NULL,
  `revokedAt` TIMESTAMP NULL,
  `revokeReason` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_status` (`userId`, `status`),
  INDEX `idx_instansi_status` (`instansiId`, `status`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create signed_documents table
CREATE TABLE IF NOT EXISTS `signed_documents` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instansiId` INT(11) NOT NULL,
  `studentId` INT(11) NOT NULL,
  `documentType` ENUM('report_card', 'transcript', 'certificate', 'letter', 'other') NOT NULL,
  `documentNumber` VARCHAR(255) NOT NULL,
  `documentPath` TEXT NOT NULL,
  `documentHash` VARCHAR(255) NULL,
  `signatureId` INT(11) NOT NULL,
  `status` ENUM('draft', 'signed', 'verified', 'revoked') NOT NULL DEFAULT 'draft',
  `signatureMetadata` JSON NULL,
  `documentMetadata` JSON NULL,
  `signedAt` TIMESTAMP NULL,
  `verifiedAt` TIMESTAMP NULL,
  `verificationHash` VARCHAR(255) NULL,
  `revokeReason` TEXT NULL,
  `revokedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_document_number` (`documentNumber`, `instansiId`),
  INDEX `idx_student_type` (`studentId`, `documentType`),
  INDEX `idx_instansi_status` (`instansiId`, `status`),
  INDEX `idx_signature` (`signatureId`),
  FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`signatureId`) REFERENCES `digital_signatures`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

