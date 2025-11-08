<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\CardTemplate;
use App\Models\Tenant\CardCustomization;
use App\Services\Tenant\CardService;
use App\Core\Services\TenantService;
use Illuminate\Http\Request;

class CardTemplateController extends BaseTenantController
{
    protected $cardService;

    public function __construct(TenantService $tenantService, CardService $cardService)
    {
        parent::__construct($tenantService);
        $this->cardService = $cardService;
    }

    /**
     * Display listing of templates
     */
    public function index(Request $request)
    {
        $tenant = $this->getCurrentTenant();
        
        $query = CardTemplate::where('instansi_id', $tenant->id);

        // Filter by card type
        if ($request->filled('card_type')) {
            $query->where('card_type', $request->card_type);
        }

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $templates = $query->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20);

        return view('tenant.cards.templates.index', compact('templates'));
    }

    /**
     * Show template
     */
    public function show(CardTemplate $cardTemplate)
    {
        $cardTemplate->load('customizations');
        
        return view('tenant.cards.templates.show', compact('cardTemplate'));
    }

    /**
     * Show form to edit customization
     */
    public function editCustomization(CardTemplate $cardTemplate)
    {
        $tenant = $this->getCurrentTenant();
        
        $customization = CardCustomization::where('instansi_id', $tenant->id)
            ->where('card_template_id', $cardTemplate->id)
            ->first();

        return view('tenant.cards.templates.customize', compact('cardTemplate', 'customization'));
    }

    /**
     * Update customization
     */
    public function updateCustomization(Request $request, CardTemplate $cardTemplate)
    {
        $request->validate([
            'custom_css' => 'nullable|string',
            'custom_config' => 'nullable|array',
        ]);

        $tenant = $this->getCurrentTenant();

        $customization = CardCustomization::updateOrCreate(
            [
                'instansi_id' => $tenant->id,
                'card_template_id' => $cardTemplate->id,
            ],
            [
                'npsn' => $tenant->npsn,
                'custom_css' => $request->custom_css,
                'custom_config' => $request->custom_config,
            ]
        );

        return redirect()->route('tenant.cards.templates.show', $cardTemplate)
            ->with('success', 'Kustomisasi template berhasil disimpan');
    }

    /**
     * Preview template
     */
    public function preview(CardTemplate $cardTemplate, Request $request)
    {
        $cardType = $cardTemplate->card_type;
        $tenant = $this->getCurrentTenant();
        
        // Get sample data
        $cardable = null;
        if ($cardType === 'student') {
            $cardable = \App\Models\Tenant\Student::where('instansi_id', $tenant->id)->first();
        } elseif ($cardType === 'teacher') {
            $cardable = \App\Models\Tenant\Teacher::where('instansi_id', $tenant->id)->first();
        } elseif ($cardType === 'staff') {
            $cardable = \App\Models\Tenant\Staff::where('instansi_id', $tenant->id)->first();
        }

        if (!$cardable) {
            return redirect()->back()->with('error', 'Tidak ada data untuk preview');
        }

        // Generate preview card
        try {
            $barcode = '12345678901234567890'; // Sample barcode
            $card = $this->cardService->generateCard($cardable, $cardTemplate);
            
            return redirect()->route('tenant.cards.show', $card);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat preview: ' . $e->getMessage());
        }
    }

    /**
     * Get templates for AJAX request
     */
    public function getTemplates(Request $request)
    {
        $cardType = $request->get('type');
        $templates = $this->cardService->getTemplates($cardType);
        
        $result = [];
        foreach ($templates as $template) {
            $result[] = [
                'id' => $template->id,
                'name' => $template->name,
                'has_photo' => $template->has_photo,
                'has_barcode' => $template->has_barcode,
            ];
        }
        
        return response()->json($result);
    }
}

