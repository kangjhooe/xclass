<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class CardCustomization extends Model
{
    use HasFactory, HasNpsn, HasAuditLog, HasInstansi;

    protected $fillable = [
        'npsn',
        'card_template_id',
        'custom_css',
        'custom_config',
        'instansi_id',
    ];

    protected $casts = [
        'custom_config' => 'array',
    ];

    /**
     * Get the template for this customization
     */
    public function template()
    {
        return $this->belongsTo(CardTemplate::class, 'card_template_id');
    }
}

