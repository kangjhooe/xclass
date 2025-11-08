<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\IncomingLetter;
use App\Models\Tenant\OutgoingLetter;
use App\Models\Tenant\LetterTemplate;
use App\Models\Tenant\LetterNumberSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CorrespondenceController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get correspondence statistics
        $stats = [
            'total_incoming' => IncomingLetter::where('instansi_id', $instansiId)->count(),
            'total_outgoing' => OutgoingLetter::where('instansi_id', $instansiId)->count(),
            'this_month_incoming' => IncomingLetter::where('instansi_id', $instansiId)
                ->whereMonth('tanggal_terima', now()->month)
                ->whereYear('tanggal_terima', now()->year)
                ->count(),
            'this_month_outgoing' => OutgoingLetter::where('instansi_id', $instansiId)
                ->whereMonth('tanggal_surat', now()->month)
                ->whereYear('tanggal_surat', now()->year)
                ->count(),
            'pending_incoming' => IncomingLetter::where('instansi_id', $instansiId)
                ->where('status', 'baru')
                ->count(),
            'pending_outgoing' => OutgoingLetter::where('instansi_id', $instansiId)
                ->where('status', 'draft')
                ->count()
        ];

        // Get recent incoming letters
        $recentIncoming = IncomingLetter::where('instansi_id', $instansiId)
            ->orderBy('tanggal_terima', 'desc')
            ->limit(5)
            ->get();

        // Get recent outgoing letters
        $recentOutgoing = OutgoingLetter::where('instansi_id', $instansiId)
            ->orderBy('tanggal_surat', 'desc')
            ->limit(5)
            ->get();

        // Get templates count
        $templatesCount = LetterTemplate::where('instansi_id', $instansiId)
            ->where('is_active', true)
            ->count();

        return view('tenant.correspondence.index', [
            'title' => 'Dashboard Persuratan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => null]
            ],
            'stats' => $stats,
            'recentIncoming' => $recentIncoming,
            'recentOutgoing' => $recentOutgoing,
            'templatesCount' => $templatesCount
        ]);
    }

    /**
     * API endpoint for new letters notification
     */
    public function apiNewLetters()
    {
        $user = auth()->user();
        if (!$user || !$user->instansi_id) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $instansiId = $user->instansi_id;
        
        // Get new letters from last 5 minutes
        $newIncoming = IncomingLetter::where('instansi_id', $instansiId)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count();
            
        $newOutgoing = OutgoingLetter::where('instansi_id', $instansiId)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count();

        return response()->json([
            'newIncoming' => $newIncoming,
            'newOutgoing' => $newOutgoing
        ]);
    }

    /**
     * Display incoming correspondence
     */
    public function incoming(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = IncomingLetter::where('instansi_id', $instansiId);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('letter_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('letter_date', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('letter_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('sender', 'like', "%{$search}%");
            });
        }

        $letters = $query->orderBy('letter_date', 'desc')->paginate(20);

        return view('tenant.correspondence.incoming', [
            'title' => 'Surat Masuk',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => route('tenant.correspondence.index')],
                ['name' => 'Surat Masuk', 'url' => null]
            ],
            'letters' => $letters
        ]);
    }

    /**
     * Display outgoing correspondence
     */
    public function outgoing(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = OutgoingLetter::where('instansi_id', $instansiId);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('letter_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('letter_date', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('letter_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('recipient', 'like', "%{$search}%");
            });
        }

        $letters = $query->orderBy('letter_date', 'desc')->paginate(20);

        return view('tenant.correspondence.outgoing', [
            'title' => 'Surat Keluar',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => route('tenant.correspondence.index')],
                ['name' => 'Surat Keluar', 'url' => null]
            ],
            'letters' => $letters
        ]);
    }

    /**
     * Show the form for creating a new incoming letter.
     */
    public function createIncoming()
    {
        return view('tenant.correspondence.incoming.create', [
            'title' => 'Tambah Surat Masuk',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => route('tenant.correspondence.index')],
                ['name' => 'Surat Masuk', 'url' => route('tenant.correspondence.incoming')],
                ['name' => 'Tambah Surat Masuk', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created incoming letter in storage.
     */
    public function storeIncoming(Request $request)
    {
        $request->validate([
            'letter_number' => 'required|string|max:255',
            'letter_date' => 'required|date',
            'received_date' => 'required|date',
            'sender' => 'required|string|max:255',
            'subject' => 'required|string|max:500',
            'content' => 'nullable|string',
            'status' => 'required|in:new,processed,archived',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $letter = IncomingLetter::create([
                'instansi_id' => $instansiId,
                'letter_number' => $request->letter_number,
                'letter_date' => $request->letter_date,
                'received_date' => $request->received_date,
                'sender' => $request->sender,
                'subject' => $request->subject,
                'content' => $request->content,
                'status' => $request->status
            ]);

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('files/correspondence/incoming'), $fileName);
                $letter->update(['file_path' => 'files/correspondence/incoming/' . $fileName]);
            }

            DB::commit();

            return redirect()->route('tenant.correspondence.incoming')
                ->with('success', 'Surat masuk berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new outgoing letter.
     */
    public function createOutgoing()
    {
        $instansiId = $this->getInstansiId();
        
        $templates = LetterTemplate::where('instansi_id', $instansiId)->get();
        $numberSettings = LetterNumberSetting::where('instansi_id', $instansiId)->first();

        return view('tenant.correspondence.outgoing.create', [
            'title' => 'Tambah Surat Keluar',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => route('tenant.correspondence.index')],
                ['name' => 'Surat Keluar', 'url' => route('tenant.correspondence.outgoing')],
                ['name' => 'Tambah Surat Keluar', 'url' => null]
            ],
            'templates' => $templates,
            'numberSettings' => $numberSettings
        ]);
    }

    /**
     * Store a newly created outgoing letter in storage.
     */
    public function storeOutgoing(Request $request)
    {
        $request->validate([
            'letter_number' => 'required|string|max:255',
            'letter_date' => 'required|date',
            'recipient' => 'required|string|max:255',
            'subject' => 'required|string|max:500',
            'content' => 'nullable|string',
            'status' => 'required|in:draft,sent,delivered',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $letter = OutgoingLetter::create([
                'instansi_id' => $instansiId,
                'letter_number' => $request->letter_number,
                'letter_date' => $request->letter_date,
                'recipient' => $request->recipient,
                'subject' => $request->subject,
                'content' => $request->content,
                'status' => $request->status
            ]);

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('files/correspondence/outgoing'), $fileName);
                $letter->update(['file_path' => 'files/correspondence/outgoing/' . $fileName]);
            }

            DB::commit();

            return redirect()->route('tenant.correspondence.outgoing')
                ->with('success', 'Surat keluar berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified incoming letter.
     */
    public function showIncoming(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $letter = IncomingLetter::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.correspondence.incoming.show', [
            'title' => 'Detail Surat Masuk',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => route('tenant.correspondence.index')],
                ['name' => 'Surat Masuk', 'url' => route('tenant.correspondence.incoming')],
                ['name' => 'Detail Surat Masuk', 'url' => null]
            ],
            'letter' => $letter
        ]);
    }

    /**
     * Show the specified outgoing letter.
     */
    public function showOutgoing(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $letter = OutgoingLetter::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.correspondence.outgoing.show', [
            'title' => 'Detail Surat Keluar',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => route('tenant.correspondence.index')],
                ['name' => 'Surat Keluar', 'url' => route('tenant.correspondence.outgoing')],
                ['name' => 'Detail Surat Keluar', 'url' => null]
            ],
            'letter' => $letter
        ]);
    }

    /**
     * Show the form for editing the specified incoming letter.
     */
    public function editIncoming(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $letter = IncomingLetter::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.correspondence.incoming.edit', [
            'title' => 'Edit Surat Masuk',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => route('tenant.correspondence.index')],
                ['name' => 'Surat Masuk', 'url' => route('tenant.correspondence.incoming')],
                ['name' => 'Edit Surat Masuk', 'url' => null]
            ],
            'letter' => $letter
        ]);
    }

    /**
     * Show the form for editing the specified outgoing letter.
     */
    public function editOutgoing(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $letter = OutgoingLetter::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.correspondence.outgoing.edit', [
            'title' => 'Edit Surat Keluar',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => route('tenant.dashboard')],
                ['name' => 'Persuratan', 'url' => route('tenant.correspondence.index')],
                ['name' => 'Surat Keluar', 'url' => route('tenant.correspondence.outgoing')],
                ['name' => 'Edit Surat Keluar', 'url' => null]
            ],
            'letter' => $letter
        ]);
    }

    /**
     * Update the specified incoming letter in storage.
     */
    public function updateIncoming(Request $request, string $id)
    {
        $request->validate([
            'letter_number' => 'required|string|max:255',
            'letter_date' => 'required|date',
            'received_date' => 'required|date',
            'sender' => 'required|string|max:255',
            'subject' => 'required|string|max:500',
            'content' => 'nullable|string',
            'status' => 'required|in:new,processed,archived',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $letter = IncomingLetter::where('instansi_id', $instansiId)->findOrFail($id);
            
            $letter->update([
                'letter_number' => $request->letter_number,
                'letter_date' => $request->letter_date,
                'received_date' => $request->received_date,
                'sender' => $request->sender,
                'subject' => $request->subject,
                'content' => $request->content,
                'status' => $request->status
            ]);

            // Handle file upload
            if ($request->hasFile('file')) {
                // Delete old file
                if ($letter->file_path && file_exists(public_path($letter->file_path))) {
                    unlink(public_path($letter->file_path));
                }
                
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('files/correspondence/incoming'), $fileName);
                $letter->update(['file_path' => 'files/correspondence/incoming/' . $fileName]);
            }

            DB::commit();

            return redirect()->route('tenant.correspondence.incoming')
                ->with('success', 'Surat masuk berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified outgoing letter in storage.
     */
    public function updateOutgoing(Request $request, string $id)
    {
        $request->validate([
            'letter_number' => 'required|string|max:255',
            'letter_date' => 'required|date',
            'recipient' => 'required|string|max:255',
            'subject' => 'required|string|max:500',
            'content' => 'nullable|string',
            'status' => 'required|in:draft,sent,delivered',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $letter = OutgoingLetter::where('instansi_id', $instansiId)->findOrFail($id);
            
            $letter->update([
                'letter_number' => $request->letter_number,
                'letter_date' => $request->letter_date,
                'recipient' => $request->recipient,
                'subject' => $request->subject,
                'content' => $request->content,
                'status' => $request->status
            ]);

            // Handle file upload
            if ($request->hasFile('file')) {
                // Delete old file
                if ($letter->file_path && file_exists(public_path($letter->file_path))) {
                    unlink(public_path($letter->file_path));
                }
                
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('files/correspondence/outgoing'), $fileName);
                $letter->update(['file_path' => 'files/correspondence/outgoing/' . $fileName]);
            }

            DB::commit();

            return redirect()->route('tenant.correspondence.outgoing')
                ->with('success', 'Surat keluar berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified incoming letter from storage.
     */
    public function destroyIncoming(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $letter = IncomingLetter::where('instansi_id', $instansiId)->findOrFail($id);
            
            // Delete file if exists
            if ($letter->file_path && file_exists(public_path($letter->file_path))) {
                unlink(public_path($letter->file_path));
            }
            
            $letter->delete();

            return redirect()->route('tenant.correspondence.incoming')
                ->with('success', 'Surat masuk berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified outgoing letter from storage.
     */
    public function destroyOutgoing(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $letter = OutgoingLetter::where('instansi_id', $instansiId)->findOrFail($id);
            
            // Delete file if exists
            if ($letter->file_path && file_exists(public_path($letter->file_path))) {
                unlink(public_path($letter->file_path));
            }
            
            $letter->delete();

            return redirect()->route('tenant.correspondence.outgoing')
                ->with('success', 'Surat keluar berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
