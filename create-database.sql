-- Script untuk membuat database 'class' jika belum ada
CREATE DATABASE IF NOT EXISTS `class` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Gunakan database
USE `class`;

-- Tampilkan pesan sukses
SELECT 'Database "class" berhasil dibuat atau sudah ada!' AS message;

