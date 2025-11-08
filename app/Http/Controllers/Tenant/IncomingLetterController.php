<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\IncomingLetter;
use App\Models\Tenant\LetterActivityLog;
use App\Http\Requests\IncomingLetterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\IncomingLettersExport;
use Barryvdh\DomPDF\Facade\Pdf;

class IncomingLetterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = IncomingLetter::where('instansi_id', auth()->user()->instansi_id);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->where('tanggal_terima', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('tanggal_terima', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                  ->orWhere('pengirim', 'like', "%{$search}%")
                  ->orWhere('perihal', 'like', "%{$search}%");
            });
        }

        $letters = $query->orderBy('tanggal_terima', 'desc')->paginate(20);

        return view('tenant.letters.incoming.index', compact('letters'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('tenant.letters.incoming.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(IncomingLetterRequest $request)
    {
        $data = $request->validated();
        $data['instansi_id'] = auth()->user()->instansi_id;
        $data['created_by'] = auth()->id();

        // Handle file upload
        if ($request->hasFile('file_path')) {
            $file = $request->file('file_path');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('letters/incoming', $filename, 'public');
            $data['file_path'] = $path;
        }

        $letter = IncomingLetter::create($data);

        // Log activity
        LetterActivityLog::logActivity(
            LetterActivityLog::LETTER_TYPE_INCOMING,
            $letter->id,
            LetterActivityLog::ACTION_CREATED,
            "Surat masuk baru dibuat: {$letter->nomor_surat}"
        );

        return redirect()->route('tenant.letters.incoming.index')
            ->with('success', 'Surat masuk berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(IncomingLetter $surat_masuk)
    {
        $this->authorize('view', $surat_masuk);
        
        return view('tenant.letters.incoming.show', compact('surat_masuk'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(IncomingLetter $surat_masuk)
    {
        $this->authorize('update', $surat_masuk);
        
        return view('tenant.letters.incoming.edit', compact('surat_masuk'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(IncomingLetterRequest $request, IncomingLetter $surat_masuk)
    {
        $this->authorize('update', $surat_masuk);

        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('file_path')) {
            // Delete old file if exists
            if ($surat_masuk->file_path && Storage::disk('public')->exists($surat_masuk->file_path)) {
                Storage::disk('public')->delete($surat_masuk->file_path);
            }

            $file = $request->file('file_path');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('letters/incoming', $filename, 'public');
            $data['file_path'] = $path;
        }

        $oldValues = $surat_masuk->toArray();
        $surat_masuk->update($data);
        $newValues = $surat_masuk->fresh()->toArray();

        // Log activity
        LetterActivityLog::logActivity(
            LetterActivityLog::LETTER_TYPE_INCOMING,
            $surat_masuk->id,
            LetterActivityLog::ACTION_UPDATED,
            "Surat masuk diperbarui: {$surat_masuk->nomor_surat}",
            $oldValues,
            $newValues
        );

        return redirect()->route('tenant.letters.incoming.index')
            ->with('success', 'Surat masuk berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(IncomingLetter $surat_masuk)
    {
        $this->authorize('delete', $surat_masuk);

        // Delete file if exists
        if ($surat_masuk->file_path && Storage::disk('public')->exists($surat_masuk->file_path)) {
            Storage::disk('public')->delete($surat_masuk->file_path);
        }

        $letterData = $surat_masuk->toArray();
        $surat_masuk->delete();

        // Log activity
        LetterActivityLog::logActivity(
            LetterActivityLog::LETTER_TYPE_INCOMING,
            $letterData['id'],
            LetterActivityLog::ACTION_DELETED,
            "Surat masuk dihapus: {$letterData['nomor_surat']}"
        );

        return redirect()->route('tenant.letters.incoming.index')
            ->with('success', 'Surat masuk berhasil dihapus');
    }

    /**
     * Download file
     */
    public function download(IncomingLetter $surat_masuk)
    {
        $this->authorize('view', $surat_masuk);

        if (!$surat_masuk->file_path || !Storage::disk('public')->exists($surat_masuk->file_path)) {
            return redirect()->back()->with('error', 'File tidak ditemukan');
        }

        return Storage::disk('public')->download($surat_masuk->file_path);
    }

    /**
     * Update status
     */
    public function updateStatus(Request $request, IncomingLetter $surat_masuk)
    {
        $this->authorize('update', $surat_masuk);

        $request->validate([
            'status' => 'required|in:baru,diproses,selesai',
        ]);

        $surat_masuk->updateStatus($request->status);

        return redirect()->back()
            ->with('success', 'Status surat berhasil diperbarui');
    }

    /**
     * Add disposition
     */
    public function addDisposition(Request $request, IncomingLetter $surat_masuk)
    {
        $this->authorize('update', $surat_masuk);

        $request->validate([
            'penerima' => 'required|string|max:255',
            'catatan' => 'required|string|max:500',
        ]);

        $surat_masuk->addDisposition($request->penerima, $request->catatan);

        // Log activity
        LetterActivityLog::logActivity(
            LetterActivityLog::LETTER_TYPE_INCOMING,
            $surat_masuk->id,
            LetterActivityLog::ACTION_DISPOSITION_ADDED,
            "Disposisi ditambahkan untuk surat {$surat_masuk->nomor_surat}"
        );

        return redirect()->back()
            ->with('success', 'Disposisi berhasil ditambahkan');
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'letter_ids' => 'required|string',
            'status' => 'required|in:baru,diproses,selesai',
        ]);

        $letterIds = json_decode($request->letter_ids, true);
        $instansiId = auth()->user()->instansi_id;

        $letters = IncomingLetter::where('instansi_id', $instansiId)
            ->whereIn('id', $letterIds)
            ->get();

        $updatedCount = 0;
        foreach ($letters as $letter) {
            $letter->updateStatus($request->status);
            
            // Log activity
            LetterActivityLog::logActivity(
                LetterActivityLog::LETTER_TYPE_INCOMING,
                $letter->id,
                LetterActivityLog::ACTION_STATUS_UPDATED,
                "Status surat {$letter->nomor_surat} diubah menjadi {$request->status}"
            );
            
            $updatedCount++;
        }

        return redirect()->back()
            ->with('success', "Status {$updatedCount} surat berhasil diperbarui menjadi " . ucfirst($request->status));
    }

    /**
     * Get search suggestions
     */
    public function searchSuggestions(Request $request)
    {
        $query = $request->get('q', '');
        $instansiId = auth()->user()->instansi_id;
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $suggestions = collect();

        // Search in nomor surat
        $nomorSurat = IncomingLetter::where('instansi_id', $instansiId)
            ->where('nomor_surat', 'like', "%{$query}%")
            ->limit(5)
            ->get(['nomor_surat'])
            ->map(function($item) {
                return [
                    'text' => $item->nomor_surat,
                    'type' => 'Nomor Surat'
                ];
            });

        // Search in pengirim
        $pengirim = IncomingLetter::where('instansi_id', $instansiId)
            ->where('pengirim', 'like', "%{$query}%")
            ->distinct()
            ->limit(5)
            ->get(['pengirim'])
            ->map(function($item) {
                return [
                    'text' => $item->pengirim,
                    'type' => 'Pengirim'
                ];
            });

        // Search in perihal
        $perihal = IncomingLetter::where('instansi_id', $instansiId)
            ->where('perihal', 'like', "%{$query}%")
            ->limit(5)
            ->get(['perihal'])
            ->map(function($item) {
                return [
                    'text' => $item->perihal,
                    'type' => 'Perihal'
                ];
            });

        $suggestions = $suggestions->merge($nomorSurat)->merge($pengirim)->merge($perihal);

        return response()->json($suggestions->unique('text')->take(10)->values());
    }

    /**
     * Export to Excel/PDF/CSV
     */
    public function export(Request $request)
    {
        $query = IncomingLetter::where('instansi_id', auth()->user()->instansi_id);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date')) {
            $query->where('tanggal_terima', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('tanggal_terima', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                  ->orWhere('pengirim', 'like', "%{$search}%")
                  ->orWhere('perihal', 'like', "%{$search}%");
            });
        }

        $letters = $query->orderBy('tanggal_terima', 'desc')->get();
        $format = $request->get('format', 'excel');
        $filename = 'surat_masuk_' . date('Y-m-d');

        switch ($format) {
            case 'pdf':
                $pdf = PDF::loadView('tenant.letters.incoming.export-pdf', compact('letters'));
                return $pdf->download($filename . '.pdf');
                
            case 'csv':
                return Excel::download(new IncomingLettersExport($letters), $filename . '.csv', \Maatwebsite\Excel\Excel::CSV);
                
            case 'excel':
            default:
                return Excel::download(new IncomingLettersExport($letters), $filename . '.xlsx');
        }
    }

    /**
     * Print to PDF
     */
    public function print(Request $request)
    {
        $query = IncomingLetter::where('instansi_id', auth()->user()->instansi_id);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date')) {
            $query->where('tanggal_terima', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('tanggal_terima', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                  ->orWhere('pengirim', 'like', "%{$search}%")
                  ->orWhere('perihal', 'like', "%{$search}%");
            });
        }

        $letters = $query->orderBy('tanggal_terima', 'desc')->get();

        $pdf = Pdf::loadView('tenant.letters.incoming.print', compact('letters'));
        return $pdf->download('daftar_surat_masuk_' . date('Y-m-d') . '.pdf');
    }

    /**
     * Get activity logs for a letter
     */
    public function activityLogs(IncomingLetter $surat_masuk)
    {
        $this->authorize('view', $surat_masuk);
        
        $logs = LetterActivityLog::where('instansi_id', auth()->user()->instansi_id)
            ->where('letter_type', LetterActivityLog::LETTER_TYPE_INCOMING)
            ->where('letter_id', $surat_masuk->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.letters.incoming.activity-logs', compact('surat_masuk', 'logs'));
    }
}
