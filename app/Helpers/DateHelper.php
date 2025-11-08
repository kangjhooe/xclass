<?php

namespace App\Helpers;

use Carbon\Carbon;

/**
 * Date Helper
 * 
 * Provides Indonesian date formatting and utilities
 */
class DateHelper
{
    /**
     * Format date to Indonesian format (DD-MM-YYYY)
     */
    public static function formatIndonesian($date, $includeTime = false): string
    {
        if (!$date) {
            return '';
        }

        $carbon = Carbon::parse($date);
        
        if ($includeTime) {
            return $carbon->format('d-m-Y H:i');
        }
        
        return $carbon->format('d-m-Y');
    }

    /**
     * Format date to Indonesian format with day name
     */
    public static function formatIndonesianWithDay($date, $includeTime = false): string
    {
        if (!$date) {
            return '';
        }

        $carbon = Carbon::parse($date);
        $dayNames = [
            'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
        ];
        
        $dayName = $dayNames[$carbon->dayOfWeek];
        
        if ($includeTime) {
            return $dayName . ', ' . $carbon->format('d-m-Y H:i');
        }
        
        return $dayName . ', ' . $carbon->format('d-m-Y');
    }

    /**
     * Format date to Indonesian format with month name
     */
    public static function formatIndonesianWithMonth($date, $includeTime = false): string
    {
        if (!$date) {
            return '';
        }

        $carbon = Carbon::parse($date);
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        
        $monthName = $monthNames[$carbon->month];
        
        if ($includeTime) {
            return $carbon->format('d') . ' ' . $monthName . ' ' . $carbon->format('Y H:i');
        }
        
        return $carbon->format('d') . ' ' . $monthName . ' ' . $carbon->format('Y');
    }

    /**
     * Format date to Indonesian format with full month and day name
     */
    public static function formatIndonesianFull($date, $includeTime = false): string
    {
        if (!$date) {
            return '';
        }

        $carbon = Carbon::parse($date);
        $dayNames = [
            'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
        ];
        
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        
        $dayName = $dayNames[$carbon->dayOfWeek];
        $monthName = $monthNames[$carbon->month];
        
        if ($includeTime) {
            return $dayName . ', ' . $carbon->format('d') . ' ' . $monthName . ' ' . $carbon->format('Y H:i');
        }
        
        return $dayName . ', ' . $carbon->format('d') . ' ' . $monthName . ' ' . $carbon->format('Y');
    }

    /**
     * Format date to Indonesian relative time (e.g., "2 hari yang lalu")
     */
    public static function formatIndonesianRelative($date): string
    {
        if (!$date) {
            return '';
        }

        $carbon = Carbon::parse($date);
        $now = Carbon::now();
        
        $diff = $carbon->diffForHumans($now, true, true, 2);
        
        // Translate common relative time strings
        $translations = [
            'second' => 'detik',
            'seconds' => 'detik',
            'minute' => 'menit',
            'minutes' => 'menit',
            'hour' => 'jam',
            'hours' => 'jam',
            'day' => 'hari',
            'days' => 'hari',
            'week' => 'minggu',
            'weeks' => 'minggu',
            'month' => 'bulan',
            'months' => 'bulan',
            'year' => 'tahun',
            'years' => 'tahun',
            'ago' => 'yang lalu',
            'from now' => 'dari sekarang'
        ];
        
        $translated = $diff;
        foreach ($translations as $en => $id) {
            $translated = str_replace($en, $id, $translated);
        }
        
        return $translated;
    }

    /**
     * Parse Indonesian date format to Carbon instance
     */
    public static function parseIndonesian($dateString): ?Carbon
    {
        if (!$dateString) {
            return null;
        }

        try {
            // Try DD-MM-YYYY format
            if (preg_match('/^(\d{1,2})-(\d{1,2})-(\d{4})$/', $dateString, $matches)) {
                return Carbon::createFromFormat('d-m-Y', $dateString);
            }
            
            // Try DD-MM-YYYY HH:mm format
            if (preg_match('/^(\d{1,2})-(\d{1,2})-(\d{4}) (\d{1,2}):(\d{2})$/', $dateString, $matches)) {
                return Carbon::createFromFormat('d-m-Y H:i', $dateString);
            }
            
            // Try DD Month YYYY format
            $monthNames = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            
            foreach ($monthNames as $index => $monthName) {
                if (strpos($dateString, $monthName) !== false) {
                    $pattern = str_replace($monthName, sprintf('%02d', $index + 1), $dateString);
                    return Carbon::createFromFormat('d m Y', $pattern);
                }
            }
            
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get Indonesian day names
     */
    public static function getDayNames(): array
    {
        return [
            'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
        ];
    }

    /**
     * Get Indonesian month names
     */
    public static function getMonthNames(): array
    {
        return [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
    }

    /**
     * Get Indonesian month name by number
     */
    public static function getMonthName(int $month): string
    {
        $months = self::getMonthNames();
        return $months[$month] ?? '';
    }

    /**
     * Get Indonesian day name by number (0 = Sunday)
     */
    public static function getDayName(int $dayOfWeek): string
    {
        $days = self::getDayNames();
        return $days[$dayOfWeek] ?? '';
    }

    /**
     * Format date range in Indonesian
     */
    public static function formatDateRange($startDate, $endDate): string
    {
        if (!$startDate || !$endDate) {
            return '';
        }

        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        if ($start->isSameDay($end)) {
            return self::formatIndonesian($start) . ' - ' . $start->format('H:i') . ' - ' . $end->format('H:i');
        }

        return self::formatIndonesian($start) . ' - ' . self::formatIndonesian($end);
    }
}
