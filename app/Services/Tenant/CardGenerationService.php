<?php

namespace App\Services\Tenant;

use App\Models\Tenant\CardTemplate;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Staff;
use App\Core\Services\TenantService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;

class CardGenerationService
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Generate card image from template
     */
    public function generateCardImage($cardable, CardTemplate $template, $barcode)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        // Render HTML
        $html = $this->renderCardHtml($cardable, $template, $barcode);
        
        // Convert HTML to image
        $imagePath = $this->htmlToImage($html, $cardable, $template);
        
        return $imagePath;
    }

    /**
     * Render card HTML
     */
    protected function renderCardHtml($cardable, CardTemplate $template, $barcode)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        // Get template HTML and CSS
        $htmlTemplate = $template->html_template;
        $cssTemplate = $template->merged_css;
        
        // Prepare data for template
        $data = $this->prepareCardData($cardable, $template, $barcode);
        
        // Replace placeholders in HTML template
        $html = $this->replacePlaceholders($htmlTemplate, $data);
        
        // Generate barcode image if needed
        $barcodeImage = null;
        if ($template->has_barcode) {
            $barcodeImage = $this->generateBarcodeImage($barcode);
        }
        
        // Get photo if needed
        $photo = null;
        if ($template->has_photo) {
            $photo = $this->getCardablePhoto($cardable);
        }
        
        // Render full HTML
        $fullHtml = view('tenant.cards.template-wrapper', [
            'html' => $html,
            'css' => $cssTemplate,
            'barcode_image' => $barcodeImage,
            'photo' => $photo,
            'data' => $data,
        ])->render();
        
        return $fullHtml;
    }

    /**
     * Prepare card data
     */
    protected function prepareCardData($cardable, CardTemplate $template, $barcode)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $data = [
            'tenant' => $tenant,
            'barcode' => $barcode,
            'card_type' => $template->card_type,
        ];

        if ($cardable instanceof Student) {
            $data['nisn'] = $cardable->nisn;
            $data['name'] = $cardable->name;
            $data['student_number'] = $cardable->student_number;
            $data['class'] = $cardable->class ? $cardable->class->name : null;
            $data['birth_date'] = $cardable->birth_date ? $cardable->birth_date->format('d-m-Y') : null;
            $data['birth_place'] = $cardable->birth_place;
            $data['gender'] = $cardable->gender;
            $data['address'] = $cardable->address;
        } elseif ($cardable instanceof Teacher) {
            $data['nik'] = $cardable->nik;
            $data['nip'] = $cardable->nip;
            $data['name'] = $cardable->name;
            $data['employee_number'] = $cardable->employee_number;
            $data['position'] = $cardable->position ?? null;
            $data['birth_date'] = $cardable->birth_date ? $cardable->birth_date->format('d-m-Y') : null;
            $data['birth_place'] = $cardable->birth_place;
            $data['gender'] = $cardable->gender;
        } elseif ($cardable instanceof Staff) {
            $data['nik'] = $cardable->nik;
            $data['nip'] = $cardable->nip;
            $data['name'] = $cardable->name;
            $data['employee_number'] = $cardable->employee_number;
            $data['position'] = $cardable->position;
            $data['department'] = $cardable->department;
            $data['birth_date'] = $cardable->birth_date ? $cardable->birth_date->format('d-m-Y') : null;
            $data['birth_place'] = $cardable->birth_place;
            $data['gender'] = $cardable->gender;
        }

        return $data;
    }

    /**
     * Replace placeholders in HTML template
     */
    protected function replacePlaceholders($html, $data)
    {
        $placeholders = [
            '{{tenant_name}}' => $data['tenant']->name ?? '',
            '{{tenant_address}}' => $data['tenant']->address ?? '',
            '{{tenant_logo}}' => $data['tenant']->logo ? asset('storage/' . $data['tenant']->logo) : '',
            '{{barcode}}' => $data['barcode'] ?? '',
            '{{card_type}}' => $data['card_type'] ?? '',
        ];

        // Add cardable specific placeholders
        foreach ($data as $key => $value) {
            if ($key !== 'tenant' && $key !== 'card_type') {
                $placeholders['{{' . $key . '}}'] = $value ?? '';
            }
        }

        return str_replace(array_keys($placeholders), array_values($placeholders), $html);
    }

    /**
     * Generate barcode image
     */
    protected function generateBarcodeImage($barcode)
    {
        // Try to use barcode library if available
        if (class_exists('\Picqer\Barcode\BarcodeGeneratorPNG')) {
            $generator = new \Picqer\Barcode\BarcodeGeneratorPNG();
            $barcodeImage = $generator->getBarcode($barcode, $generator::TYPE_CODE_128);
            return 'data:image/png;base64,' . base64_encode($barcodeImage);
        } elseif (class_exists('\Milon\Barcode\DNS1D')) {
            $dns1d = new \Milon\Barcode\DNS1D();
            $barcodeImage = $dns1d->getBarcodePNG($barcode, 'C128');
            return 'data:image/png;base64,' . base64_encode($barcodeImage);
        }

        // Fallback: return text barcode
        return null;
    }

    /**
     * Get cardable photo
     */
    protected function getCardablePhoto($cardable)
    {
        // Try to get photo from cardable
        if (isset($cardable->photo) && $cardable->photo) {
            return asset('storage/' . $cardable->photo);
        }

        // Fallback: return placeholder or null
        return null;
    }

    /**
     * Convert HTML to image
     */
    protected function htmlToImage($html, $cardable, CardTemplate $template)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        // Try to use Browsershot if available
        if (class_exists('\Spatie\Browsershot\Browsershot')) {
            return $this->htmlToImageBrowsershot($html, $cardable, $template);
        }

        // Try to use wkhtmltoimage if available
        if (class_exists('\mikehaertl\wkhtmlto\Image')) {
            return $this->htmlToImageWkhtml($html, $cardable, $template);
        }

        // Fallback: use GD/Imagick (requires HTML to image conversion)
        // For now, save HTML and return path (can be converted later)
        return $this->htmlToImageFallback($html, $cardable, $template);
    }

    /**
     * Convert HTML to image using Browsershot
     */
    protected function htmlToImageBrowsershot($html, $cardable, CardTemplate $template)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $filename = $this->getCardFilename($cardable, $template);
        $path = "cards/{$tenant->npsn}/{$filename}.png";

        try {
            \Spatie\Browsershot\Browsershot::html($html)
                ->setOption('args', ['--disable-web-security', '--no-sandbox'])
                ->setOption('viewportWidth', 600)
                ->setOption('viewportHeight', 400)
                ->waitUntilNetworkIdle()
                ->save(storage_path('app/public/' . $path));

            return $path;
        } catch (\Exception $e) {
            \Log::error('Browsershot error: ' . $e->getMessage());
            return $this->htmlToImageFallback($html, $cardable, $template);
        }
    }

    /**
     * Convert HTML to image using wkhtmltoimage
     */
    protected function htmlToImageWkhtml($html, $cardable, CardTemplate $template)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $filename = $this->getCardFilename($cardable, $template);
        $path = "cards/{$tenant->npsn}/{$filename}.png";

        try {
            $image = new \mikehaertl\wkhtmlto\Image($html);
            $image->setOptions([
                'width' => 600,
                'height' => 400,
                'format' => 'png',
            ]);

            if ($image->save(storage_path('app/public/' . $path))) {
                return $path;
            }

            throw new \Exception('Failed to save image');
        } catch (\Exception $e) {
            \Log::error('wkhtmltoimage error: ' . $e->getMessage());
            return $this->htmlToImageFallback($html, $cardable, $template);
        }
    }

    /**
     * Fallback method: save HTML (can be converted later or use alternative method)
     */
    protected function htmlToImageFallback($html, $cardable, CardTemplate $template)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $filename = $this->getCardFilename($cardable, $template);
        
        // Save HTML file (can be converted using external tool later)
        $htmlPath = "cards/{$tenant->npsn}/{$filename}.html";
        Storage::disk('public')->put($htmlPath, $html);
        
        // For now, return HTML path (will need to convert manually or use other tool)
        // In production, should use proper image conversion
        \Log::warning('Image conversion library not available. HTML saved at: ' . $htmlPath);
        
        // Return placeholder path (will be converted later)
        return $htmlPath;
    }

    /**
     * Get card filename
     */
    protected function getCardFilename($cardable, CardTemplate $template)
    {
        $cardType = $template->card_type;
        $identifier = '';

        if ($cardable instanceof Student) {
            $identifier = $cardable->nisn ?? $cardable->id;
        } elseif ($cardable instanceof Teacher) {
            $identifier = $cardable->nik ?? $cardable->id;
        } elseif ($cardable instanceof Staff) {
            $identifier = $cardable->nik ?? $cardable->id;
        }

        return "{$cardType}_{$identifier}_{$template->id}";
    }
}

