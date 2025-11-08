<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'min_students',
        'max_students',
        'price_per_student_per_year',
        'billing_threshold',
        'is_free',
        'is_active',
        'sort_order',
        'features',
    ];

    protected $casts = [
        'price_per_student_per_year' => 'decimal:2',
        'billing_threshold' => 'integer',
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'features' => 'array',
    ];

    /**
     * Get subscriptions using this plan
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class);
    }

    /**
     * Check if student count matches this plan
     */
    public function matchesStudentCount(int $studentCount): bool
    {
        if ($studentCount < $this->min_students) {
            return false;
        }

        if ($this->max_students === null) {
            return true; // Unlimited
        }

        return $studentCount <= $this->max_students;
    }

    /**
     * Calculate billing amount for given student count
     */
    public function calculateBillingAmount(int $studentCount): float
    {
        if ($this->is_free) {
            return 0;
        }

        return $studentCount * $this->price_per_student_per_year;
    }

    /**
     * Get formatted price per student
     */
    public function getFormattedPricePerStudentAttribute(): string
    {
        if ($this->is_free) {
            return 'Gratis';
        }

        return 'Rp ' . number_format($this->price_per_student_per_year, 0, ',', '.') . ' / siswa / tahun';
    }

    /**
     * Scope for active plans
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for free plans
     */
    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    /**
     * Scope for paid plans
     */
    public function scopePaid($query)
    {
        return $query->where('is_free', false);
    }
}

