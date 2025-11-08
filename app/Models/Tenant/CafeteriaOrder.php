<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CafeteriaOrder extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'cafeteria_id',
        'student_id',
        'order_number',
        'order_date',
        'pickup_time',
        'quantity',
        'total_price',
        'status',
        'payment_status',
        'payment_method',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'order_date' => 'date',
        'pickup_time' => 'datetime',
        'quantity' => 'integer',
        'total_price' => 'decimal:2',
        'payment_status' => 'boolean',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY = 'ready';
    const STATUS_PICKED_UP = 'picked_up';
    const STATUS_CANCELLED = 'cancelled';

    const PAYMENT_METHOD_CASH = 'cash';
    const PAYMENT_METHOD_CARD = 'card';
    const PAYMENT_METHOD_TRANSFER = 'transfer';
    const PAYMENT_METHOD_QRIS = 'qris';

    /**
     * Get the tenant that owns the order
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the cafeteria item
     */
    public function cafeteria()
    {
        return $this->belongsTo(Cafeteria::class);
    }

    /**
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who created the order
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope for pending orders
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu',
            self::STATUS_CONFIRMED => 'Dikonfirmasi',
            self::STATUS_PREPARING => 'Sedang Disiapkan',
            self::STATUS_READY => 'Siap Diambil',
            self::STATUS_PICKED_UP => 'Sudah Diambil',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get payment method label
     */
    public function getPaymentMethodLabelAttribute()
    {
        return match($this->payment_method) {
            self::PAYMENT_METHOD_CASH => 'Tunai',
            self::PAYMENT_METHOD_CARD => 'Kartu',
            self::PAYMENT_METHOD_TRANSFER => 'Transfer',
            self::PAYMENT_METHOD_QRIS => 'QRIS',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_CONFIRMED => 'info',
            self::STATUS_PREPARING => 'primary',
            self::STATUS_READY => 'success',
            self::STATUS_PICKED_UP => 'dark',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if order is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if order is confirmed
     */
    public function isConfirmed()
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    /**
     * Check if order is ready
     */
    public function isReady()
    {
        return $this->status === self::STATUS_READY;
    }

    /**
     * Check if order is picked up
     */
    public function isPickedUp()
    {
        return $this->status === self::STATUS_PICKED_UP;
    }

    /**
     * Check if order is cancelled
     */
    public function isCancelled()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Get formatted total price
     */
    public function getFormattedTotalPriceAttribute()
    {
        return 'Rp ' . number_format($this->total_price, 0, ',', '.');
    }

    /**
     * Get formatted pickup time
     */
    public function getFormattedPickupTimeAttribute()
    {
        return $this->pickup_time ? $this->pickup_time->format('H:i') : '-';
    }

    /**
     * Confirm order
     */
    public function confirm()
    {
        $this->update(['status' => self::STATUS_CONFIRMED]);
    }

    /**
     * Start preparing
     */
    public function startPreparing()
    {
        $this->update(['status' => self::STATUS_PREPARING]);
    }

    /**
     * Mark as ready
     */
    public function markReady()
    {
        $this->update(['status' => self::STATUS_READY]);
    }

    /**
     * Mark as picked up
     */
    public function markPickedUp()
    {
        $this->update(['status' => self::STATUS_PICKED_UP]);
    }

    /**
     * Cancel order
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $reason,
        ]);
    }

    /**
     * Mark payment as completed
     */
    public function markPaymentCompleted($method = null)
    {
        $this->update([
            'payment_status' => true,
            'payment_method' => $method ?? $this->payment_method,
        ]);
    }
}
