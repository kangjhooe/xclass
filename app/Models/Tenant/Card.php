<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class Card extends Model
{
    use HasFactory, HasNpsn, HasAuditLog, HasInstansi;

    protected $fillable = [
        'npsn',
        'card_type',
        'cardable_type',
        'cardable_id',
        'card_template_id',
        'barcode',
        'image_path',
        'image_format',
        'data',
        'issued_at',
        'expires_at',
        'is_active',
        'instansi_id',
    ];

    protected $casts = [
        'data' => 'array',
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the cardable model (Student, Teacher, or Staff)
     */
    public function cardable()
    {
        return $this->morphTo();
    }

    /**
     * Get the template for this card
     */
    public function template()
    {
        return $this->belongsTo(CardTemplate::class, 'card_template_id');
    }

    /**
     * Scope for active cards
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for cards by type
     */
    public function scopeByCardType($query, $cardType)
    {
        return $query->where('card_type', $cardType);
    }

    /**
     * Scope for cards by cardable
     */
    public function scopeForCardable($query, $cardableType, $cardableId)
    {
        return $query->where('cardable_type', $cardableType)
            ->where('cardable_id', $cardableId);
    }

    /**
     * Check if card is expired
     */
    public function isExpired()
    {
        if (!$this->expires_at) {
            return false;
        }
        
        return $this->expires_at->isPast();
    }

    /**
     * Get cardable model name
     */
    public function getCardableModelAttribute()
    {
        $models = [
            'student' => Student::class,
            'teacher' => Teacher::class,
            'staff' => Staff::class,
        ];
        
        return $models[$this->card_type] ?? null;
    }
}

