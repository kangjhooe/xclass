<?php

namespace App\Models;

use App\Models\Core\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionBillingHistory extends Model
{
    use HasFactory;

    protected $table = 'subscription_billing_history';

    protected $fillable = [
        'tenant_subscription_id',
        'tenant_id',
        'student_count',
        'previous_student_count',
        'billing_amount',
        'previous_billing_amount',
        'billing_type',
        'pending_increase_before',
        'pending_increase_after',
        'threshold_triggered',
        'billing_date',
        'period_start',
        'period_end',
        'is_paid',
        'paid_at',
        'invoice_number',
        'payment_notes',
        'notes',
    ];

    protected $casts = [
        'student_count' => 'integer',
        'previous_student_count' => 'integer',
        'billing_amount' => 'decimal:2',
        'previous_billing_amount' => 'decimal:2',
        'pending_increase_before' => 'integer',
        'pending_increase_after' => 'integer',
        'threshold_triggered' => 'boolean',
        'billing_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'paid_at' => 'date',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the tenant subscription
     */
    public function tenantSubscription(): BelongsTo
    {
        return $this->belongsTo(TenantSubscription::class);
    }

    /**
     * Get the tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Generate invoice number
     */
    public function generateInvoiceNumber(): string
    {
        if ($this->invoice_number) {
            return $this->invoice_number;
        }

        $date = $this->billing_date->format('Ymd');
        $tenantId = str_pad($this->tenant_id, 4, '0', STR_PAD_LEFT);
        $sequence = str_pad($this->id, 4, '0', STR_PAD_LEFT);
        
        $this->invoice_number = "INV-{$date}-{$tenantId}-{$sequence}";
        $this->save();
        
        return $this->invoice_number;
    }

    /**
     * Mark as paid
     */
    public function markAsPaid(string $notes = null): void
    {
        $this->is_paid = true;
        $this->paid_at = now();
        $this->payment_notes = $notes;
        $this->save();
        
        // Update subscription
        if ($this->tenantSubscription) {
            $this->tenantSubscription->is_paid = true;
            $this->tenantSubscription->paid_at = now();
            $this->tenantSubscription->save();
        }
    }

    /**
     * Get formatted billing amount
     */
    public function getFormattedBillingAmountAttribute(): string
    {
        return 'Rp ' . number_format($this->billing_amount, 0, ',', '.');
    }
}

