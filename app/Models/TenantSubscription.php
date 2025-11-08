<?php

namespace App\Models;

use App\Models\Core\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class TenantSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'subscription_plan_id',
        'student_count_at_billing',
        'current_student_count',
        'pending_student_increase',
        'current_billing_amount',
        'next_billing_amount',
        'billing_cycle',
        'status',
        'is_trial',
        'trial_start_date',
        'trial_end_date',
        'warning_sent',
        'warning_sent_at',
        'start_date',
        'end_date',
        'next_billing_date',
        'last_billing_date',
        'is_paid',
        'paid_at',
        'payment_notes',
        'notes',
    ];

    protected $casts = [
        'student_count_at_billing' => 'integer',
        'current_student_count' => 'integer',
        'pending_student_increase' => 'integer',
        'current_billing_amount' => 'decimal:2',
        'next_billing_amount' => 'decimal:2',
        'is_trial' => 'boolean',
        'trial_start_date' => 'date',
        'trial_end_date' => 'date',
        'warning_sent' => 'boolean',
        'warning_sent_at' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'next_billing_date' => 'date',
        'last_billing_date' => 'date',
        'paid_at' => 'date',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the subscription plan
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    /**
     * Get billing history
     */
    public function billingHistory(): HasMany
    {
        return $this->hasMany(SubscriptionBillingHistory::class);
    }

    /**
     * Update student count and check threshold
     */
    public function updateStudentCount(int $newCount): array
    {
        $oldCount = $this->current_student_count;
        $increase = $newCount - $oldCount;
        
        $this->current_student_count = $newCount;
        
        // Check if tier change is needed
        $newPlan = $this->determinePlanForStudentCount($newCount);
        $tierChanged = $newPlan->id !== $this->subscription_plan_id;
        
        // If tier changed, reset pending increase
        if ($tierChanged) {
            $this->pending_student_increase = 0;
            $this->subscription_plan_id = $newPlan->id;
        } else {
            // Add to pending increase
            $this->pending_student_increase += $increase;
        }
        
        // Calculate next billing amount
        $this->calculateNextBillingAmount();
        
        $this->save();
        
        return [
            'tier_changed' => $tierChanged,
            'new_plan' => $newPlan,
            'pending_increase' => $this->pending_student_increase,
            'threshold_met' => $this->checkThreshold(),
            'old_count' => $oldCount,
            'new_count' => $newCount,
            'increase' => $increase,
        ];
    }

    /**
     * Determine plan based on student count
     */
    public function determinePlanForStudentCount(int $studentCount): SubscriptionPlan
    {
        return SubscriptionPlan::active()
            ->where('min_students', '<=', $studentCount)
            ->where(function($q) use ($studentCount) {
                $q->whereNull('max_students')
                  ->orWhere('max_students', '>=', $studentCount);
            })
            ->orderBy('min_students', 'desc')
            ->first() ?? SubscriptionPlan::where('slug', 'basic')->first();
    }

    /**
     * Check if threshold is met
     */
    public function checkThreshold(): bool
    {
        if ($this->subscriptionPlan->is_free) {
            return false;
        }

        return $this->pending_student_increase >= $this->subscriptionPlan->billing_threshold;
    }

    /**
     * Calculate next billing amount
     */
    public function calculateNextBillingAmount(): void
    {
        $plan = $this->subscriptionPlan;
        $totalStudents = $this->student_count_at_billing + $this->pending_student_increase;
        $this->next_billing_amount = $plan->calculateBillingAmount($totalStudents);
    }

    /**
     * Process billing renewal
     */
    public function processRenewal(): SubscriptionBillingHistory
    {
        $plan = $this->subscriptionPlan;
        
        // If trial ended, convert to paid first
        if ($this->is_trial && $this->isTrialEnded()) {
            $this->is_trial = false;
            $this->trial_end_date = null;
            $this->start_date = now();
        }
        
        // Calculate new student count (including pending)
        $newStudentCount = $this->student_count_at_billing + $this->pending_student_increase;
        
        // Calculate billing amount
        $billingAmount = $plan->calculateBillingAmount($newStudentCount);
        
        // Create billing history
        $billingHistory = SubscriptionBillingHistory::create([
            'tenant_subscription_id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'student_count' => $newStudentCount,
            'previous_student_count' => $this->student_count_at_billing,
            'billing_amount' => $billingAmount,
            'previous_billing_amount' => $this->current_billing_amount,
            'billing_type' => $this->is_trial ? 'initial' : 'renewal',
            'pending_increase_before' => $this->pending_student_increase,
            'pending_increase_after' => 0,
            'threshold_triggered' => $this->pending_student_increase > 0,
            'billing_date' => now(),
            'period_start' => $this->end_date->copy()->addDay(),
            'period_end' => $this->end_date->copy()->addYear(),
        ]);
        
        // Update subscription
        $this->student_count_at_billing = $newStudentCount;
        $this->pending_student_increase = 0;
        $this->current_billing_amount = $billingAmount;
        $this->next_billing_amount = $billingAmount;
        $this->last_billing_date = now();
        $this->start_date = $this->end_date->copy()->addDay();
        $this->end_date = $this->end_date->copy()->addYear();
        $this->next_billing_date = $this->end_date;
        $this->is_paid = false;
        $this->paid_at = null;
        $this->warning_sent = false; // Reset warning for new period
        $this->warning_sent_at = null;
        $this->save();
        
        return $billingHistory;
    }

    /**
     * Get status badge color
     */
    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'active' => 'success',
            'expired' => 'danger',
            'suspended' => 'warning',
            'cancelled' => 'secondary',
            default => 'secondary',
        };
    }

    /**
     * Check if subscription is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->end_date->isFuture();
    }

    /**
     * Check if subscription is expired
     */
    public function isExpired(): bool
    {
        return $this->end_date->isPast();
    }

    /**
     * Get days until renewal
     */
    public function getDaysUntilRenewalAttribute(): int
    {
        if (!$this->next_billing_date) {
            return 0;
        }

        return max(0, now()->diffInDays($this->next_billing_date, false));
    }

    /**
     * Check if subscription is in trial period
     */
    public function isInTrial(): bool
    {
        if (!$this->is_trial || !$this->trial_end_date) {
            return false;
        }

        return now()->isBefore($this->trial_end_date);
    }

    /**
     * Check if trial has ended
     */
    public function isTrialEnded(): bool
    {
        if (!$this->is_trial || !$this->trial_end_date) {
            return false;
        }

        return now()->isAfter($this->trial_end_date);
    }

    /**
     * Check if trial is ending soon (within 7 days)
     */
    public function isTrialEndingSoon(): bool
    {
        if (!$this->is_trial || !$this->trial_end_date) {
            return false;
        }

        $daysUntilTrialEnd = now()->diffInDays($this->trial_end_date, false);
        return $daysUntilTrialEnd <= 7 && $daysUntilTrialEnd >= 0;
    }

    /**
     * Check if subscription is ending soon (within 7 days) - for non-trial
     */
    public function isEndingSoon(): bool
    {
        if ($this->is_trial || !$this->end_date) {
            return false;
        }

        $daysUntilEnd = now()->diffInDays($this->end_date, false);
        return $daysUntilEnd <= 7 && $daysUntilEnd >= 0;
    }

    /**
     * Check if warning should be sent (7 days before end, not sent yet)
     */
    public function shouldSendWarning(): bool
    {
        // Basic plan tidak perlu warning
        if ($this->subscriptionPlan && $this->subscriptionPlan->is_free) {
            return false;
        }

        // Check if already sent
        if ($this->warning_sent) {
            return false;
        }

        // Check if trial ending soon
        if ($this->is_trial && $this->isTrialEndingSoon()) {
            return true;
        }

        // Check if subscription ending soon
        if (!$this->is_trial && $this->isEndingSoon()) {
            return true;
        }

        return false;
    }

    /**
     * Mark warning as sent
     */
    public function markWarningSent(): void
    {
        $this->warning_sent = true;
        $this->warning_sent_at = now();
        $this->save();
    }

    /**
     * Get effective end date (trial end or subscription end)
     */
    public function getEffectiveEndDateAttribute(): Carbon
    {
        if ($this->is_trial && $this->trial_end_date) {
            return $this->trial_end_date;
        }

        return $this->end_date;
    }

    /**
     * Get days until effective end
     */
    public function getDaysUntilEffectiveEndAttribute(): int
    {
        $endDate = $this->effective_end_date;
        return max(0, now()->diffInDays($endDate, false));
    }
}

