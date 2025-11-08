<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class CardTemplate extends Model
{
    use HasFactory, HasNpsn, HasAuditLog, HasInstansi;

    protected $fillable = [
        'npsn',
        'name',
        'card_type',
        'html_template',
        'css_template',
        'config',
        'has_photo',
        'has_barcode',
        'is_default',
        'is_active',
        'sort_order',
        'instansi_id',
    ];

    protected $casts = [
        'config' => 'array',
        'has_photo' => 'boolean',
        'has_barcode' => 'boolean',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get cards using this template
     */
    public function cards()
    {
        return $this->hasMany(Card::class);
    }

    /**
     * Get customizations for this template
     */
    public function customizations()
    {
        return $this->hasMany(CardCustomization::class);
    }

    /**
     * Get customization for current tenant
     */
    public function customization()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        if (!$tenant) {
            return null;
        }
        
        return $this->hasOne(CardCustomization::class)
            ->where('instansi_id', $tenant->id)
            ->first();
    }

    /**
     * Scope for active templates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for templates by card type
     */
    public function scopeByCardType($query, $cardType)
    {
        return $query->where('card_type', $cardType);
    }

    /**
     * Scope for templates with photo
     */
    public function scopeWithPhoto($query)
    {
        return $query->where('has_photo', true);
    }

    /**
     * Scope for templates without photo
     */
    public function scopeWithoutPhoto($query)
    {
        return $query->where('has_photo', false);
    }

    /**
     * Get merged CSS (template CSS + custom CSS)
     */
    public function getMergedCssAttribute()
    {
        $customization = $this->customization();
        $baseCss = $this->css_template ?? '';
        
        if ($customization && $customization->custom_css) {
            return $baseCss . "\n\n/* Custom CSS */\n" . $customization->custom_css;
        }
        
        return $baseCss;
    }

    /**
     * Get merged config (template config + custom config)
     */
    public function getMergedConfigAttribute()
    {
        $customization = $this->customization();
        $baseConfig = $this->config ?? [];
        
        if ($customization && $customization->custom_config) {
            return array_merge($baseConfig, $customization->custom_config);
        }
        
        return $baseConfig;
    }
}

