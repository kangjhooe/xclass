<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class SppPayment extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'student_id',
        'payment_period',
        'payment_year',
        'payment_month',
        'amount',
        'due_date',
        'paid_date',
        'payment_method',
        'payment_reference',
        'payment_status',
        'payment_notes',
        'receipt_number',
        'receipt_file',
        'created_by',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_date' => 'datetime',
        'verified_at' => 'datetime',
        'payment_status' => 'boolean',
        'amount' => 'decimal:2',
    ];

    const PAYMENT_METHOD_CASH = 'cash';
    const PAYMENT_METHOD_TRANSFER = 'transfer';
    const PAYMENT_METHOD_QRIS = 'qris';
    const PAYMENT_METHOD_EDC = 'edc';
    const PAYMENT_METHOD_VA = 'virtual_account';

    const PAYMENT_STATUS_PENDING = 'pending';
    const PAYMENT_STATUS_PAID = 'paid';
    const PAYMENT_STATUS_OVERDUE = 'overdue';
    const PAYMENT_STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the payment
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the student that owns the payment
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who created the payment
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the user who verified the payment
     */
    public function verifier()
    {
        return $this->belongsTo(\App\Models\User::class, 'verified_by');
    }

    /**
     * Scope for filtering by payment status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Scope for filtering by payment method
     */
    public function scopeByMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Scope for filtering by period
     */
    public function scopeByPeriod($query, $year, $month = null)
    {
        $query->where('payment_year', $year);
        if ($month) {
            $query->where('payment_month', $month);
        }
        return $query;
    }

    /**
     * Scope for overdue payments
     */
    public function scopeOverdue($query)
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_PENDING)
                    ->where('due_date', '<', now()->toDateString());
    }

    /**
     * Get payment method label
     */
    public function getMethodLabelAttribute()
    {
        return match($this->payment_method) {
            self::PAYMENT_METHOD_CASH => 'Tunai',
            self::PAYMENT_METHOD_TRANSFER => 'Transfer Bank',
            self::PAYMENT_METHOD_QRIS => 'QRIS',
            self::PAYMENT_METHOD_EDC => 'EDC',
            self::PAYMENT_METHOD_VA => 'Virtual Account',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get payment status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->payment_status) {
            self::PAYMENT_STATUS_PENDING => 'Belum Bayar',
            self::PAYMENT_STATUS_PAID => 'Lunas',
            self::PAYMENT_STATUS_OVERDUE => 'Terlambat',
            self::PAYMENT_STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->payment_status) {
            self::PAYMENT_STATUS_PENDING => 'warning',
            self::PAYMENT_STATUS_PAID => 'success',
            self::PAYMENT_STATUS_OVERDUE => 'danger',
            self::PAYMENT_STATUS_CANCELLED => 'secondary',
            default => 'secondary'
        };
    }

    /**
     * Check if payment is overdue
     */
    public function isOverdue()
    {
        return $this->payment_status === self::PAYMENT_STATUS_PENDING && 
               $this->due_date < now()->toDateString();
    }

    /**
     * Check if payment is paid
     */
    public function isPaid()
    {
        return $this->payment_status === self::PAYMENT_STATUS_PAID;
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    /**
     * Get payment period label
     */
    public function getPeriodLabelAttribute()
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        return $months[$this->payment_month] . ' ' . $this->payment_year;
    }

    /**
     * Mark payment as paid
     */
    public function markAsPaid($method = null, $reference = null, $notes = null)
    {
        $this->update([
            'payment_status' => self::PAYMENT_STATUS_PAID,
            'paid_date' => now(),
            'payment_method' => $method ?? $this->payment_method,
            'payment_reference' => $reference,
            'payment_notes' => $notes,
        ]);
    }

    /**
     * Mark payment as verified
     */
    public function markAsVerified($userId)
    {
        $this->update([
            'verified_by' => $userId,
            'verified_at' => now(),
        ]);
    }
}
