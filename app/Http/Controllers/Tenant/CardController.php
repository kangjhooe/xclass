<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Card;
use App\Models\Tenant\CardTemplate;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Staff;
use App\Services\Tenant\CardService;
use App\Core\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CardController extends BaseTenantController
{
    protected $cardService;

    public function __construct(TenantService $tenantService, CardService $cardService)
    {
        parent::__construct($tenantService);
        $this->cardService = $cardService;
    }

    /**
     * Display listing of cards
     */
    public function index(Request $request)
    {
        $tenant = $this->getCurrentTenant();
        
        $query = Card::where('instansi_id', $tenant->id);

        // Filter by card type
        if ($request->filled('card_type')) {
            $query->where('card_type', $request->card_type);
        }

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('barcode', 'like', "%{$search}%")
                  ->orWhereHasMorph('cardable', [Student::class], function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('nisn', 'like', "%{$search}%");
                  })
                  ->orWhereHasMorph('cardable', [Teacher::class], function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('nik', 'like', "%{$search}%");
                  })
                  ->orWhereHasMorph('cardable', [Staff::class], function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('nik', 'like', "%{$search}%");
                  });
            });
        }

        $cards = $query->with(['cardable', 'template'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.cards.index', compact('cards'));
    }

    /**
     * Show form to generate card
     */
    public function create(Request $request)
    {
        $cardType = $request->get('type', 'student');
        $cardableId = $request->get('id');
        
        $templates = $this->cardService->getTemplates($cardType);
        
        return view('tenant.cards.create', compact('cardType', 'cardableId', 'templates'));
    }

    /**
     * Generate card
     */
    public function store(Request $request)
    {
        $request->validate([
            'card_type' => 'required|in:student,teacher,staff',
            'cardable_id' => 'required|integer',
            'template_id' => 'nullable|exists:card_templates,id',
        ]);

        $cardType = $request->card_type;
        $cardableId = $request->cardable_id;
        $templateId = $request->template_id;

        // Get cardable
        $cardable = $this->getCardable($cardType, $cardableId);
        
        if (!$cardable) {
            return redirect()->back()->with('error', 'Data tidak ditemukan');
        }

        try {
            $card = $this->cardService->getOrCreateCard($cardable, $templateId);
            
            return redirect()->route('tenant.cards.show', $card)
                ->with('success', 'Kartu berhasil dibuat');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat kartu: ' . $e->getMessage());
        }
    }

    /**
     * Show card
     */
    public function show(Card $card)
    {
        $card->load(['cardable', 'template']);
        
        return view('tenant.cards.show', compact('card'));
    }

    /**
     * Download card image
     */
    public function download(Card $card)
    {
        if (!$card->image_path || !Storage::exists($card->image_path)) {
            return redirect()->back()->with('error', 'File kartu tidak ditemukan');
        }

        $path = storage_path('app/public/' . $card->image_path);
        $filename = 'kartu_' . $card->cardable->name . '_' . now()->format('Ymd') . '.' . $card->image_format;

        return response()->download($path, $filename);
    }

    /**
     * Regenerate card
     */
    public function regenerate(Card $card)
    {
        try {
            $cardable = $card->cardable;
            $template = $card->template;
            
            // Delete old image
            if ($card->image_path && Storage::exists($card->image_path)) {
                Storage::delete($card->image_path);
            }
            
            // Generate new card
            $newCard = $this->cardService->generateCard($cardable, $template);
            
            return redirect()->route('tenant.cards.show', $newCard)
                ->with('success', 'Kartu berhasil dibuat ulang');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat ulang kartu: ' . $e->getMessage());
        }
    }

    /**
     * Delete card
     */
    public function destroy(Card $card)
    {
        try {
            $this->cardService->deleteCard($card);
            
            return redirect()->route('tenant.cards.index')
                ->with('success', 'Kartu berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus kartu: ' . $e->getMessage());
        }
    }

    /**
     * Batch generate cards
     */
    public function batchGenerate(Request $request)
    {
        $request->validate([
            'card_type' => 'required|in:student,teacher,staff',
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'template_id' => 'nullable|exists:card_templates,id',
        ]);

        $cardType = $request->card_type;
        $ids = $request->ids;
        $templateId = $request->template_id;

        // Get cardables
        $cardables = $this->getCardables($cardType, $ids);
        
        if ($cardables->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada data yang dipilih');
        }

        try {
            $results = $this->cardService->batchGenerateCards($cardables, $templateId);
            
            $successCount = count($results['success']);
            $failedCount = count($results['failed']);
            
            $message = "Berhasil membuat {$successCount} kartu";
            if ($failedCount > 0) {
                $message .= ", {$failedCount} gagal";
            }
            
            return redirect()->route('tenant.cards.index', ['card_type' => $cardType])
                ->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat kartu: ' . $e->getMessage());
        }
    }

    /**
     * Get cardable by type and id
     */
    protected function getCardable($cardType, $id)
    {
        $tenant = $this->getCurrentTenant();
        
        switch ($cardType) {
            case 'student':
                return Student::where('instansi_id', $tenant->id)->find($id);
            case 'teacher':
                return Teacher::where('instansi_id', $tenant->id)->find($id);
            case 'staff':
                return Staff::where('instansi_id', $tenant->id)->find($id);
        }
        
        return null;
    }

    /**
     * Get cardables by type and ids
     */
    protected function getCardables($cardType, $ids)
    {
        $tenant = $this->getCurrentTenant();
        
        switch ($cardType) {
            case 'student':
                return Student::where('instansi_id', $tenant->id)->whereIn('id', $ids)->get();
            case 'teacher':
                return Teacher::where('instansi_id', $tenant->id)->whereIn('id', $ids)->get();
            case 'staff':
                return Staff::where('instansi_id', $tenant->id)->whereIn('id', $ids)->get();
        }
        
        return collect();
    }

    /**
     * Get cardables for AJAX request
     */
    public function ajaxGetCardables(Request $request)
    {
        $cardType = $request->get('type');
        $tenant = $this->getCurrentTenant();
        
        $cardables = [];
        
        switch ($cardType) {
            case 'student':
                $items = Student::where('instansi_id', $tenant->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get();
                foreach ($items as $item) {
                    $cardables[] = [
                        'id' => $item->id,
                        'name' => $item->name,
                        'identifier' => $item->nisn ?? $item->student_number,
                    ];
                }
                break;
            case 'teacher':
                $items = Teacher::where('instansi_id', $tenant->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get();
                foreach ($items as $item) {
                    $cardables[] = [
                        'id' => $item->id,
                        'name' => $item->name,
                        'identifier' => $item->nik ?? $item->nip ?? $item->employee_number,
                    ];
                }
                break;
            case 'staff':
                $items = Staff::where('instansi_id', $tenant->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get();
                foreach ($items as $item) {
                    $cardables[] = [
                        'id' => $item->id,
                        'name' => $item->name,
                        'identifier' => $item->nik ?? $item->nip ?? $item->employee_number,
                    ];
                }
                break;
        }
        
        return response()->json($cardables);
    }
}

