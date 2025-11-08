<?php

namespace App\Core\Services\PPDB;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use finfo;

class FileUploadService
{
    // Allowed MIME types
    const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/jpg'];
    const ALLOWED_DOCUMENT_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    // File size limits (in bytes)
    const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
    const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total per application
    const MAX_DOCUMENTS_COUNT = 5; // Maximum additional documents

    /**
     * Validate and store photo
     */
    public static function uploadPhoto(UploadedFile $file, ?string $oldPath = null): array
    {
        self::validateFile($file, self::ALLOWED_IMAGE_MIMES, self::MAX_PHOTO_SIZE, 'photo');
        
        // Delete old file
        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        $filename = self::generateSafeFilename($file, 'photo');
        $path = $file->storeAs('ppdb/photos', $filename, 'public');

        return [
            'photo_path' => $path,
            'photo_size' => $file->getSize(),
        ];
    }

    /**
     * Validate and store document (ijazah/kk)
     */
    public static function uploadDocument(UploadedFile $file, string $type, ?string $oldPath = null): array
    {
        self::validateFile($file, self::ALLOWED_DOCUMENT_MIMES, self::MAX_DOCUMENT_SIZE, $type);
        
        // Delete old file
        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        $filename = self::generateSafeFilename($file, $type);
        $path = $file->storeAs('ppdb/documents', $filename, 'public');

        return [
            "{$type}_path" => $path,
            "{$type}_size" => $file->getSize(),
        ];
    }

    /**
     * Validate and store multiple additional documents
     */
    public static function uploadDocuments(array $files, array $existingDocuments = []): array
    {
        if (count($existingDocuments) + count($files) > self::MAX_DOCUMENTS_COUNT) {
            throw new \Exception("Maksimal " . self::MAX_DOCUMENTS_COUNT . " dokumen tambahan.");
        }

        $uploadedPaths = [];
        $totalSize = 0;

        foreach ($files as $file) {
            self::validateFile($file, self::ALLOWED_DOCUMENT_MIMES, self::MAX_DOCUMENT_SIZE, 'document');
            $totalSize += $file->getSize();
        }

        // Check total size including existing
        $existingSize = 0;
        foreach ($existingDocuments as $doc) {
            if (Storage::disk('public')->exists($doc)) {
                $existingSize += Storage::disk('public')->size($doc);
            }
        }

        if ($totalSize + $existingSize > self::MAX_TOTAL_SIZE) {
            throw new \Exception("Total ukuran file melebihi batas " . (self::MAX_TOTAL_SIZE / 1024 / 1024) . "MB.");
        }

        foreach ($files as $file) {
            $filename = self::generateSafeFilename($file, 'doc');
            $path = $file->storeAs('ppdb/documents', $filename, 'public');
            $uploadedPaths[] = $path;
        }

        return $uploadedPaths;
    }

    /**
     * Validate file with server-side MIME check
     */
    protected static function validateFile(UploadedFile $file, array $allowedMimes, int $maxSize, string $type): void
    {
        // Check file size
        if ($file->getSize() > $maxSize) {
            throw new \Exception("Ukuran file {$type} melebihi batas " . ($maxSize / 1024 / 1024) . "MB.");
        }

        // Get real MIME type using finfo
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $realMime = $finfo->file($file->getRealPath());
        
        // Also check client MIME type for validation
        $clientMime = $file->getMimeType();

        if (!in_array($realMime, $allowedMimes) && !in_array($clientMime, $allowedMimes)) {
            throw new \Exception("Tipe file {$type} tidak diizinkan. Hanya: " . implode(', ', $allowedMimes));
        }

        // Additional security: Check file extension
        $extension = strtolower($file->getClientOriginalExtension());
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
        
        if (!in_array($extension, $allowedExtensions)) {
            throw new \Exception("Ekstensi file tidak diizinkan.");
        }
    }

    /**
     * Generate safe filename
     */
    protected static function generateSafeFilename(UploadedFile $file, string $prefix): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $timestamp = now()->format('YmdHis');
        $random = Str::random(8);
        
        // Sanitize original filename
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $sanitized = Str::slug($originalName);
        $sanitized = preg_replace('/[^a-z0-9-]/', '', $sanitized);
        $sanitized = substr($sanitized, 0, 50); // Limit length
        
        return "{$prefix}_{$timestamp}_{$random}_{$sanitized}.{$extension}";
    }

    /**
     * Delete file if exists
     */
    public static function deleteFile(?string $path): bool
    {
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }

    /**
     * Get file size in human readable format
     */
    public static function getHumanReadableSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}

