<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Card;
use App\Models\Tenant\CardTemplate;
use App\Models\Tenant\CardCustomization;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Staff;
use App\Core\Services\TenantService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CardService
{
    protected $tenantService;
    protected $generationService;

    public function __construct(TenantService $tenantService, CardGenerationService $generationService)
    {
        $this->tenantService = $tenantService;
        $this->generationService = $generationService;
    }

    /**
     * Get templates for a card type
     */
    public function getTemplates($cardType, $withPhoto = null)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        $query = CardTemplate::where('instansi_id', $tenant->id)
            ->where('card_type', $cardType)
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($withPhoto !== null) {
            if ($withPhoto) {
                $query->withPhoto();
            } else {
                $query->withoutPhoto();
            }
        }

        return $query->get();
    }

    /**
     * Get or create card for a cardable
     */
    public function getOrCreateCard($cardable, $templateId = null)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        // Determine card type
        $cardType = $this->getCardType($cardable);
        
        // Get template
        if (!$templateId) {
            $template = CardTemplate::where('instansi_id', $tenant->id)
                ->where('card_type', $cardType)
                ->where('is_default', true)
                ->active()
                ->first();
        } else {
            $template = CardTemplate::where('instansi_id', $tenant->id)
                ->where('id', $templateId)
                ->active()
                ->first();
        }

        if (!$template) {
            throw new \Exception('Template tidak ditemukan');
        }

        // Check if card already exists
        $card = Card::where('instansi_id', $tenant->id)
            ->where('cardable_type', get_class($cardable))
            ->where('cardable_id', $cardable->id)
            ->where('card_template_id', $template->id)
            ->active()
            ->first();

        if ($card && $card->image_path && Storage::exists($card->image_path)) {
            return $card;
        }

        // Generate new card
        return $this->generateCard($cardable, $template);
    }

    /**
     * Generate card for a cardable
     */
    public function generateCard($cardable, $template)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $cardType = $this->getCardType($cardable);

        // Generate barcode
        $barcode = $this->generateBarcode($cardable, $cardType);

        // Generate card image
        $imagePath = $this->generationService->generateCardImage($cardable, $template, $barcode);

        // Create or update card record
        $card = Card::updateOrCreate(
            [
                'instansi_id' => $tenant->id,
                'cardable_type' => get_class($cardable),
                'cardable_id' => $cardable->id,
                'card_template_id' => $template->id,
            ],
            [
                'npsn' => $tenant->npsn,
                'card_type' => $cardType,
                'barcode' => $barcode,
                'image_path' => $imagePath,
                'image_format' => 'png',
                'data' => $this->getCardData($cardable, $template),
                'issued_at' => now(),
                'is_active' => true,
            ]
        );

        return $card;
    }

    /**
     * Generate barcode for a cardable
     */
    protected function generateBarcode($cardable, $cardType)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        // Generate unique barcode: TENANT_NPSN + CARD_TYPE + CARDABLE_ID
        // Format: NPSN(8) + TYPE(1) + ID(10) = 19 digits
        $npsn = str_pad($tenant->npsn, 8, '0', STR_PAD_LEFT);
        $typeCode = $this->getCardTypeCode($cardType);
        $cardableId = str_pad($cardable->id, 10, '0', STR_PAD_LEFT);
        
        $barcode = $npsn . $typeCode . $cardableId;
        
        // Add check digit (Luhn algorithm)
        $checkDigit = $this->calculateLuhnCheckDigit($barcode);
        
        return $barcode . $checkDigit;
    }

    /**
     * Get card type code
     */
    protected function getCardTypeCode($cardType)
    {
        $codes = [
            'student' => '1',
            'teacher' => '2',
            'staff' => '3',
        ];
        
        return $codes[$cardType] ?? '0';
    }

    /**
     * Calculate Luhn check digit
     */
    protected function calculateLuhnCheckDigit($number)
    {
        $sum = 0;
        $numDigits = strlen($number);
        $parity = $numDigits % 2;

        for ($i = 0; $i < $numDigits; $i++) {
            $digit = intval($number[$i]);
            
            if ($i % 2 == $parity) {
                $digit *= 2;
            }
            
            if ($digit > 9) {
                $digit -= 9;
            }
            
            $sum += $digit;
        }

        return (10 - ($sum % 10)) % 10;
    }

    /**
     * Get card type from cardable
     */
    protected function getCardType($cardable)
    {
        if ($cardable instanceof Student) {
            return 'student';
        } elseif ($cardable instanceof Teacher) {
            return 'teacher';
        } elseif ($cardable instanceof Staff) {
            return 'staff';
        }
        
        throw new \Exception('Cardable type tidak didukung');
    }

    /**
     * Get card data for storage
     */
    protected function getCardData($cardable, $template)
    {
        $data = [
            'cardable_id' => $cardable->id,
            'cardable_type' => get_class($cardable),
            'template_id' => $template->id,
            'generated_at' => now()->toIso8601String(),
        ];

        // Add cardable specific data
        if ($cardable instanceof Student) {
            $data['nisn'] = $cardable->nisn;
            $data['name'] = $cardable->name;
            $data['class'] = $cardable->class_id ? $cardable->class->name ?? null : null;
        } elseif ($cardable instanceof Teacher) {
            $data['nik'] = $cardable->nik;
            $data['name'] = $cardable->name;
            $data['position'] = $cardable->position ?? null;
        } elseif ($cardable instanceof Staff) {
            $data['nik'] = $cardable->nik;
            $data['name'] = $cardable->name;
            $data['position'] = $cardable->position ?? null;
        }

        return $data;
    }

    /**
     * Delete card
     */
    public function deleteCard($card)
    {
        // Delete image file
        if ($card->image_path && Storage::exists($card->image_path)) {
            Storage::delete($card->image_path);
        }

        // Delete card record
        $card->delete();
    }

    /**
     * Batch generate cards
     */
    public function batchGenerateCards($cardables, $templateId = null)
    {
        $results = [
            'success' => [],
            'failed' => [],
        ];

        foreach ($cardables as $cardable) {
            try {
                $card = $this->getOrCreateCard($cardable, $templateId);
                $results['success'][] = $card;
            } catch (\Exception $e) {
                $results['failed'][] = [
                    'cardable' => $cardable,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}

