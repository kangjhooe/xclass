<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasNpsn
{
    /**
     * Boot the trait
     */
    public static function bootHasNpsn()
    {
        static::creating(function ($model) {
            // Hanya generate NPSN jika tidak ada input dari form
            if (empty($model->npsn) || $model->npsn === '') {
                $model->npsn = static::generateNpsn();
            }
        });
    }

    /**
     * Generate unique NPSN
     */
    public static function generateNpsn(): string
    {
        do {
            $npsn = str_pad(random_int(10000000, 99999999), 8, '0', STR_PAD_LEFT);
        } while (static::where('npsn', $npsn)->exists());

        return $npsn;
    }

    /**
     * Scope untuk filter berdasarkan NPSN
     */
    public function scopeByNpsn(Builder $query, string $npsn): Builder
    {
        return $query->where('npsn', $npsn);
    }

    /**
     * Scope untuk filter berdasarkan instansi_id
     */
    public function scopeByInstansi(Builder $query, int $instansiId): Builder
    {
        return $query->where('instansi_id', $instansiId);
    }

    /**
     * Get NPSN attribute
     */
    public function getNpsnAttribute(): string
    {
        return $this->attributes['npsn'] ?? '';
    }
}
