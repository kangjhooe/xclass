<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\OutgoingLetter;
use App\Models\Tenant\LetterNumberSetting;
use App\Models\Tenant\LetterActivityLog;
use App\Http\Requests\OutgoingLetterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\OutgoingLettersExport;
use Barryvdh\DomPDF\Facade\Pdf;

class OutgoingLetterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = OutgoingLetter::where('instansi_id', auth()->user()->instansi_id);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by jenis surat
        if ($request->filled('jenis_surat')) {
            $query->where('jenis_surat', $request->jenis_surat);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->where('tanggal_surat', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('tanggal_surat', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                  ->orWhere('tujuan', 'like', "%{$search}%")
                  ->orWhere('perihal', 'like', "%{$search}%");
            });
        }

        $letters = $query->orderBy('tanggal_surat', 'desc')->paginate(20);

        return view('tenant.letters.outgoing.index', compact('letters'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $instansiId = auth()->user()->instansi_id;
        
        // Get jenis surat options
        $jenisSuratOptions = OutgoingLetter::getJenisSuratOptions();
        
        // Get templates
        $templates = \App\Models\LetterTemplate::where('instansi_id', $instansiId)
            ->where('is_active', true)
            ->get();
        
        // Get number setting for preview
        $numberSetting = \App\Models\LetterNumberSetting::where('instansi_id', $instansiId)->first();
        
        return view('tenant.letters.outgoing.create', compact('jenisSuratOptions', 'templates', 'numberSetting'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OutgoingLetterRequest $request)
    {
        $data = $request->validated();
        $data['instansi_id'] = auth()->user()->instansi_id;
        $data['created_by'] = auth()->id();

        // Create letter instance for number generation
        $letter = new OutgoingLetter($data);
        
        // Generate nomor surat otomatis
        try {
            $data['nomor_surat'] = $letter->generateNomorSurat();
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }

        // Handle file upload with tenant-specific path
        if ($request->hasFile('file_path')) {
            $file = $request->file('file_path');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs("tenants/{$data['instansi_id']}/letters/outgoing", $filename);
            $data['file_path'] = $path;
        }

        $letter = OutgoingLetter::create($data);

        // Create notification for letter creation
        \App\Models\Notification::createLetterNotification(
            auth()->id(),
            $data['instansi_id'],
            'letter_outgoing',
            'Surat Keluar Baru',
            "Surat keluar baru dibuat: {$letter->nomor_surat}",
            route('tenant.letters.outgoing.show', $letter)
        );

        return redirect()->route('tenant.letters.outgoing.index')
            ->with('success', 'Surat keluar berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(OutgoingLetter $surat_keluar)
    {
        $this->authorize('view', $surat_keluar);
        
        return view('tenant.letters.outgoing.show', compact('surat_keluar'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OutgoingLetter $surat_keluar)
    {
        $this->authorize('update', $surat_keluar);
        
        $jenisSuratOptions = LetterNumberSetting::where('instansi_id', auth()->user()->instansi_id)
            ->pluck('jenis_surat', 'jenis_surat')
            ->toArray();

        return view('tenant.letters.outgoing.edit', compact('surat_keluar', 'jenisSuratOptions'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(OutgoingLetterRequest $request, OutgoingLetter $surat_keluar)
    {
        $this->authorize('update', $surat_keluar);

        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('file_path')) {
            // Delete old file if exists
            if ($surat_keluar->file_path && Storage::disk('public')->exists($surat_keluar->file_path)) {
                Storage::disk('public')->delete($surat_keluar->file_path);
            }

            $file = $request->file('file_path');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('letters/outgoing', $filename, 'public');
            $data['file_path'] = $path;
        }

        $oldValues = $surat_keluar->toArray();
        $surat_keluar->update($data);
        $newValues = $surat_keluar->fresh()->toArray();

        // Log activity
        LetterActivityLog::logActivity(
            LetterActivityLog::LETTER_TYPE_OUTGOING,
            $surat_keluar->id,
            LetterActivityLog::ACTION_UPDATED,
            "Surat keluar diperbarui: {$surat_keluar->nomor_surat}",
            $oldValues,
            $newValues
        );

        return redirect()->route('tenant.letters.outgoing.index')
            ->with('success', 'Surat keluar berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OutgoingLetter $surat_keluar)
    {
        $this->authorize('delete', $surat_keluar);

        // Delete file if exists
        if ($surat_keluar->file_path && Storage::disk('public')->exists($surat_keluar->file_path)) {
            Storage::disk('public')->delete($surat_keluar->file_path);
        }

        $letterData = $surat_keluar->toArray();
        $surat_keluar->delete();

        // Log activity
        LetterActivityLog::logActivity(
            LetterActivityLog::LETTER_TYPE_OUTGOING,
            $letterData['id'],
            LetterActivityLog::ACTION_DELETED,
            "Surat keluar dihapus: {$letterData['nomor_surat']}"
        );

        return redirect()->route('tenant.letters.outgoing.index')
            ->with('success', 'Surat keluar berhasil dihapus');
    }

    /**
     * Preview nomor surat
     */
    public function previewNomorSurat(Request $request)
    {
        $instansiId = auth()->user()->instansi_id;
        $setting = \App\Models\LetterNumberSetting::where('instansi_id', $instansiId)->first();
        
        if (!$setting) {
            return response()->json(['error' => 'Pengaturan nomor surat belum dibuat'], 404);
        }

        $preview = $setting->previewNumber();
        
        return response()->json(['preview' => $preview]);
    }

    /**
     * Process template with variables
     */
    public function processTemplate(Request $request)
    {
        $request->validate([
            'template_id' => 'required|exists:letter_templates,id',
            'variables' => 'nullable|array',
        ]);

        $template = \App\Models\LetterTemplate::findOrFail($request->template_id);
        $variables = $request->input('variables', []);
        
        $processedContent = $template->processTemplate($variables);
        
        return response()->json(['content' => $processedContent]);
    }

    /**
     * Get template variables
     */
    public function getTemplateVariables(Request $request)
    {
        $request->validate([
            'template_id' => 'required|exists:letter_templates,id',
        ]);

        $template = \App\Models\LetterTemplate::findOrFail($request->template_id);
        
        return response()->json([
            'variables' => $template->getAvailableVariables(),
            'default_variables' => \App\Models\LetterTemplate::getDefaultVariables()
        ]);
    }

    /**
     * Download file
     */
    public function download(OutgoingLetter $surat_keluar)
    {
        $this->authorize('view', $surat_keluar);

        if (!$surat_keluar->file_path || !Storage::disk('public')->exists($surat_keluar->file_path)) {
            return redirect()->back()->with('error', 'File tidak ditemukan');
        }

        return Storage::disk('public')->download($surat_keluar->file_path);
    }

    /**
     * Update status
     */
    public function updateStatus(Request $request, OutgoingLetter $surat_keluar)
    {
        $this->authorize('update', $surat_keluar);

        $request->validate([
            'status' => 'required|in:draft,menunggu_ttd,terkirim,arsip',
        ]);

        $surat_keluar->updateStatus($request->status);

        // Log activity
        LetterActivityLog::logActivity(
            LetterActivityLog::LETTER_TYPE_OUTGOING,
            $surat_keluar->id,
            LetterActivityLog::ACTION_STATUS_CHANGED,
            "Status surat keluar diubah menjadi: {$request->status}"
        );

        return redirect()->back()
            ->with('success', 'Status surat berhasil diperbarui');
    }

    /**
     * Archive letter
     */
    public function archive(OutgoingLetter $surat_keluar)
    {
        $this->authorize('update', $surat_keluar);

        $surat_keluar->archive();

        // Log activity
        LetterActivityLog::logActivity(
            LetterActivityLog::LETTER_TYPE_OUTGOING,
            $surat_keluar->id,
            LetterActivityLog::ACTION_ARCHIVED,
            "Surat keluar diarsipkan: {$surat_keluar->nomor_surat}"
        );

        return redirect()->back()
            ->with('success', 'Surat berhasil diarsipkan');
    }


    /**
     * Export to Excel
     */
    public function export(Request $request)
    {
        $query = OutgoingLetter::where('instansi_id', auth()->user()->instansi_id);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('jenis_surat')) {
            $query->where('jenis_surat', $request->jenis_surat);
        }

        if ($request->filled('start_date')) {
            $query->where('tanggal_surat', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('tanggal_surat', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                  ->orWhere('tujuan', 'like', "%{$search}%")
                  ->orWhere('perihal', 'like', "%{$search}%");
            });
        }

        $letters = $query->orderBy('tanggal_surat', 'desc')->get();

        return Excel::download(new OutgoingLettersExport($letters), 'surat_keluar_' . date('Y-m-d') . '.xlsx');
    }

    /**
     * Print to PDF
     */
    public function print(Request $request)
    {
        $query = OutgoingLetter::where('instansi_id', auth()->user()->instansi_id);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('jenis_surat')) {
            $query->where('jenis_surat', $request->jenis_surat);
        }

        if ($request->filled('start_date')) {
            $query->where('tanggal_surat', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('tanggal_surat', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                  ->orWhere('tujuan', 'like', "%{$search}%")
                  ->orWhere('perihal', 'like', "%{$search}%");
            });
        }

        $letters = $query->orderBy('tanggal_surat', 'desc')->get();

        $pdf = Pdf::loadView('tenant.letters.outgoing.print', compact('letters'));
        return $pdf->download('daftar_surat_keluar_' . date('Y-m-d') . '.pdf');
    }

    /**
     * Get activity logs for a letter
     */
    public function activityLogs(OutgoingLetter $surat_keluar)
    {
        $this->authorize('view', $surat_keluar);
        
        $logs = LetterActivityLog::where('instansi_id', auth()->user()->instansi_id)
            ->where('letter_type', LetterActivityLog::LETTER_TYPE_OUTGOING)
            ->where('letter_id', $surat_keluar->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.letters.outgoing.activity-logs', compact('surat_keluar', 'logs'));
    }
}
