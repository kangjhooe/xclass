<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Models\SubscriptionBillingHistory;
use App\Models\Core\Tenant;
use App\Helpers\AuditHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    /**
     * Update student count for tenant and handle threshold-based billing
     */
    public function updateStudentCount(Tenant $tenant, int $newStudentCount): array
    {
        return DB::transaction(function() use ($tenant, $newStudentCount) {
            $subscription = $tenant->subscription ?? $this->createInitialSubscription($tenant);
            
            $result = $subscription->updateStudentCount($newStudentCount);
            
            // Check if threshold is met (but not tier change)
            if (!$result['tier_changed'] && $result['threshold_met']) {
                // Create adjustment billing
                $this->createThresholdBilling($subscription, $result);
            }
            
            // Send notification if needed
            $this->sendBillingNotification($tenant, $subscription, $result);
            
            AuditHelper::info('Student count updated for tenant subscription', [
                'tenant_id' => $tenant->id,
                'old_count' => $result['old_count'],
                'new_count' => $result['new_count'],
                'increase' => $result['increase'],
                'tier_changed' => $result['tier_changed'],
                'threshold_met' => $result['threshold_met'],
            ]);
            
            return $result;
        });
    }

    /**
     * Create initial subscription for tenant
     */
    public function createInitialSubscription(Tenant $tenant): TenantSubscription
    {
        $studentCount = $this->getCurrentStudentCount($tenant);
        $plan = $this->determinePlanForStudentCount($studentCount);
        
        // Check if plan is free (Basic) - no trial
        $isFree = $plan->is_free;
        $isTrial = !$isFree; // All paid plans get 1 month trial
        
        $trialEndDate = $isTrial ? now()->addMonth() : null;
        $subscriptionEndDate = $isTrial ? now()->addYear()->addMonth() : now()->addYear();
        
        $subscription = TenantSubscription::create([
            'tenant_id' => $tenant->id,
            'subscription_plan_id' => $plan->id,
            'student_count_at_billing' => $studentCount,
            'current_student_count' => $studentCount,
            'pending_student_increase' => 0,
            'current_billing_amount' => $isTrial ? 0 : $plan->calculateBillingAmount($studentCount), // Free during trial
            'next_billing_amount' => $plan->calculateBillingAmount($studentCount),
            'billing_cycle' => 'yearly',
            'status' => 'active',
            'is_trial' => $isTrial,
            'trial_start_date' => $isTrial ? now() : null,
            'trial_end_date' => $trialEndDate,
            'warning_sent' => false,
            'start_date' => $isTrial ? $trialEndDate->copy() : now(),
            'end_date' => $subscriptionEndDate,
            'next_billing_date' => $subscriptionEndDate,
            'is_paid' => $isFree, // Free plans are auto-paid
            'paid_at' => $isFree ? now() : null,
        ]);
        
        return $subscription;
    }

    /**
     * Create threshold-based billing when threshold is met
     */
    protected function createThresholdBilling(TenantSubscription $subscription, array $result): SubscriptionBillingHistory
    {
        $plan = $subscription->subscriptionPlan;
        $thresholdIncrease = $subscription->pending_student_increase;
        
        // Calculate additional billing amount
        $additionalAmount = $plan->calculateBillingAmount($thresholdIncrease);
        
        // Create billing history
        $billingHistory = SubscriptionBillingHistory::create([
            'tenant_subscription_id' => $subscription->id,
            'tenant_id' => $subscription->tenant_id,
            'student_count' => $subscription->current_student_count,
            'previous_student_count' => $subscription->student_count_at_billing,
            'billing_amount' => $additionalAmount,
            'previous_billing_amount' => $subscription->current_billing_amount,
            'billing_type' => 'threshold_met',
            'pending_increase_before' => $subscription->pending_student_increase,
            'pending_increase_after' => 0,
            'threshold_triggered' => true,
            'billing_date' => now(),
            'period_start' => $subscription->start_date,
            'period_end' => $subscription->end_date,
            'is_paid' => false,
        ]);
        
        // Generate invoice number
        $billingHistory->generateInvoiceNumber();
        
        // Update subscription - reset pending increase
        $subscription->student_count_at_billing = $subscription->current_student_count;
        $subscription->pending_student_increase = 0;
        $subscription->current_billing_amount += $additionalAmount;
        $subscription->calculateNextBillingAmount();
        $subscription->save();
        
        return $billingHistory;
    }

    /**
     * Process subscription renewal
     */
    public function processRenewal(TenantSubscription $subscription): SubscriptionBillingHistory
    {
        return DB::transaction(function() use ($subscription) {
            // If trial is ending, convert to paid subscription
            if ($subscription->is_trial && $subscription->isTrialEnded()) {
                $this->convertTrialToPaid($subscription);
            }
            
            $billingHistory = $subscription->processRenewal();
            $billingHistory->generateInvoiceNumber();
            
            AuditHelper::info('Subscription renewed', [
                'tenant_id' => $subscription->tenant_id,
                'subscription_id' => $subscription->id,
                'billing_amount' => $billingHistory->billing_amount,
            ]);
            
            return $billingHistory;
        });
    }

    /**
     * Convert trial subscription to paid
     */
    protected function convertTrialToPaid(TenantSubscription $subscription): void
    {
        $plan = $subscription->subscriptionPlan;
        $studentCount = $subscription->current_student_count;
        
        // Calculate actual billing amount
        $billingAmount = $plan->calculateBillingAmount($studentCount);
        
        // Update subscription
        $subscription->is_trial = false;
        $subscription->trial_end_date = null;
        $subscription->current_billing_amount = $billingAmount;
        $subscription->start_date = now();
        $subscription->end_date = now()->addYear();
        $subscription->next_billing_date = $subscription->end_date;
        $subscription->is_paid = false; // Needs payment
        $subscription->save();
        
        // Create billing history for trial conversion
        SubscriptionBillingHistory::create([
            'tenant_subscription_id' => $subscription->id,
            'tenant_id' => $subscription->tenant_id,
            'student_count' => $studentCount,
            'previous_student_count' => $subscription->student_count_at_billing,
            'billing_amount' => $billingAmount,
            'previous_billing_amount' => 0, // Was free during trial
            'billing_type' => 'initial', // First paid billing after trial
            'pending_increase_before' => 0,
            'pending_increase_after' => 0,
            'threshold_triggered' => false,
            'billing_date' => now(),
            'period_start' => now(),
            'period_end' => now()->addYear(),
            'is_paid' => false,
        ]);
    }

    /**
     * Get current student count for tenant
     */
    protected function getCurrentStudentCount(Tenant $tenant): int
    {
        // Assuming you have a Student model with tenant relationship
        return \App\Models\Tenant\Student::where('instansi_id', $tenant->id)->count();
    }

    /**
     * Determine plan based on student count
     */
    protected function determinePlanForStudentCount(int $studentCount): SubscriptionPlan
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
     * Send billing notification to tenant
     */
    protected function sendBillingNotification(Tenant $tenant, TenantSubscription $subscription, array $result): void
    {
        // This will be implemented with notification system
        // For now, we'll just log it
        
        if ($result['threshold_met'] && !$result['tier_changed']) {
            $message = sprintf(
                "Penambahan siswa telah melewati threshold (%d siswa). " .
                "Biaya tambahan sebesar Rp %s akan ditagih. " .
                "Detail lengkap dapat dilihat di dashboard billing.",
                $subscription->subscriptionPlan->billing_threshold,
                number_format($subscription->current_billing_amount, 0, ',', '.')
            );
            
            AuditHelper::info('Threshold billing notification', [
                'tenant_id' => $tenant->id,
                'message' => $message,
            ]);
        }
        
        if ($result['tier_changed']) {
            $message = sprintf(
                "Jumlah siswa telah melewati batas tier. " .
                "Subscription telah diupgrade ke %s. " .
                "Biaya baru akan berlaku pada billing berikutnya.",
                $result['new_plan']->name
            );
            
            AuditHelper::info('Tier change notification', [
                'tenant_id' => $tenant->id,
                'new_plan' => $result['new_plan']->name,
                'message' => $message,
            ]);
        }
    }

    /**
     * Get billing summary for tenant
     */
    public function getBillingSummary(Tenant $tenant): array
    {
        $subscription = $tenant->subscription;
        
        if (!$subscription) {
            return [
                'has_subscription' => false,
            ];
        }
        
        $plan = $subscription->subscriptionPlan;
        $threshold = $plan->billing_threshold;
        $pendingIncrease = $subscription->pending_student_increase;
        $remainingToThreshold = max(0, $threshold - $pendingIncrease);
        
        return [
            'has_subscription' => true,
            'plan' => $plan,
            'current_student_count' => $subscription->current_student_count,
            'student_count_at_billing' => $subscription->student_count_at_billing,
            'pending_increase' => $pendingIncrease,
            'threshold' => $threshold,
            'remaining_to_threshold' => $remainingToThreshold,
            'threshold_met' => $subscription->checkThreshold(),
            'current_billing_amount' => $subscription->current_billing_amount,
            'next_billing_amount' => $subscription->next_billing_amount,
            'next_billing_date' => $subscription->next_billing_date,
            'days_until_renewal' => $subscription->days_until_renewal,
            'status' => $subscription->status,
            'is_paid' => $subscription->is_paid,
        ];
    }
}

