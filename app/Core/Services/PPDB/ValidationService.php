<?php

namespace App\Core\Services\PPDB;

use App\Models\PPDBApplication;
use App\Models\PPDBProfile;

class ValidationService
{
    /**
     * Validate that all required fields are filled before submission
     */
    public static function validateBeforeSubmit(PPDBApplication $application): array
    {
        $errors = [];
        $profile = $application->profile;

        // Step 1: Data Siswa (Wajib)
        if (empty($application->major_choice)) {
            $errors[] = 'Pilihan jurusan wajib diisi.';
        }
        if (empty($application->registration_path)) {
            $errors[] = 'Jalur pendaftaran wajib diisi.';
        }
        
        if ($profile) {
            // Alamat lengkap wajib
            if (empty($profile->address_province) || empty($profile->address_city) || 
                empty($profile->address_district) || empty($profile->address_village) ||
                empty($profile->address_dusun_jalan)) {
                $errors[] = 'Alamat lengkap (Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan, dan Dusun/Jalan) wajib diisi.';
            }

            // Kontak wajib
            if (empty($application->phone) && empty($application->email)) {
                $errors[] = 'Minimal satu kontak (telepon atau email) wajib diisi.';
            }
        } else {
            $errors[] = 'Data profil siswa belum lengkap. Silakan lengkapi data di Langkah 1.';
        }

        // Step 4: Upload dokumen wajib
        if (empty($application->photo_path)) {
            $errors[] = 'Foto wajib diunggah.';
        }
        if (empty($application->ijazah_path)) {
            $errors[] = 'Scan Ijazah wajib diunggah.';
        }
        if (empty($application->kk_path)) {
            $errors[] = 'Scan Kartu Keluarga (KK) wajib diunggah.';
        }

        return $errors;
    }

    /**
     * Check if application can be edited
     */
    public static function canEdit(PPDBApplication $application): bool
    {
        // Can edit if status is pending or revisi requested
        return in_array($application->status, [
            PPDBApplication::STATUS_PENDING,
            PPDBApplication::STATUS_REVISI_REQUIRED, // Assuming this status exists
        ]);
    }

    /**
     * Check if application is locked
     */
    public static function isLocked(PPDBApplication $application): bool
    {
        return !self::canEdit($application);
    }
}

