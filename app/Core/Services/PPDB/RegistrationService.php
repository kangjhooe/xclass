<?php

namespace App\Core\Services\PPDB;

use App\Models\PPDBApplication;

class RegistrationService
{
    public static function baseRules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'birth_date' => 'required|date|before:today',
            'birth_place' => 'required|string|max:255',
            'gender' => 'required|in:L,P,male,female',
            'address' => 'required|string',
            'previous_school' => 'required|string|max:255',
            'previous_school_address' => 'required|string',
            'major_choice' => 'required|string|max:255',
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|max:20',
            'parent_occupation' => 'required|string|max:255',
            'parent_income' => 'nullable|numeric|min:0',
            'registration_path' => 'nullable|string|in:zonasi,affirmative,transfer,achievement,academic',
            'academic_year' => 'nullable|string',
            'batch' => 'nullable|string',
        ];
    }

    public static function fileRules(bool $isCreate = true): array
    {
        if ($isCreate) {
            return [
                'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'ijazah' => 'required|file|mimes:pdf,jpeg,png,jpg|max:5120',
                'kk' => 'required|file|mimes:pdf,jpeg,png,jpg|max:5120',
            ];
        }
        return [
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'ijazah' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            'kk' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
        ];
    }

    public static function normalize(array $data): array
    {
        // Gender normalization to 'L' or 'P'
        if (isset($data['gender'])) {
            $gender = strtolower((string) $data['gender']);
            $data['gender'] = ($gender === 'male' || $gender === 'l') ? 'L' : (($gender === 'female' || $gender === 'p') ? 'P' : $data['gender']);
        }

        // Default academic year and batch
        if (empty($data['academic_year'])) {
            $data['academic_year'] = date('Y') . '/' . (date('Y') + 1);
        }
        if (empty($data['batch'])) {
            $data['batch'] = 'Gelombang 1';
        }

        return $data;
    }

    public static function generateRegistrationNumber(string $academicYear, string $batch): string
    {
        $prefix = 'PPDB';
        $year = substr($academicYear, 0, 4);
        $batchCode = strtoupper(substr($batch, 0, 3));

        $count = PPDBApplication::where('academic_year', $academicYear)
            ->where('batch', $batch)
            ->count();

        $sequence = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        return "{$prefix}{$year}{$batchCode}{$sequence}";
    }
}


