<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\NpsnChangeRequest;
use App\Core\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Helpers\AuditHelper;

class NpsnChangeRequestController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Display a listing of NPSN change requests for current tenant
     */
    public function index()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        // Only school_admin can access
        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini');
        }

        $requests = NpsnChangeRequest::where('tenant_id', $tenant->id)
            ->with(['requester', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'pending' => NpsnChangeRequest::where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->count(),
            'approved' => NpsnChangeRequest::where('tenant_id', $tenant->id)
                ->where('status', 'approved')
                ->count(),
            'rejected' => NpsnChangeRequest::where('tenant_id', $tenant->id)
                ->where('status', 'rejected')
                ->count(),
        ];

        return view('tenant.npsn-change-requests.index', compact('requests', 'stats', 'tenant'));
    }

    /**
     * Show the form for creating a new NPSN change request
     */
    public function create()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        // Only school_admin can create
        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini');
        }

        // Check if there's already a pending request
        $pendingRequest = NpsnChangeRequest::where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->first();

        if ($pendingRequest) {
            return redirect()->route('tenant.npsn-change-requests.index', ['tenant' => $tenant->npsn])
                ->with('info', 'Anda sudah memiliki permintaan perubahan NPSN yang sedang menunggu persetujuan.');
        }

        return view('tenant.npsn-change-requests.create', compact('tenant'));
    }

    /**
     * Store a newly created NPSN change request
     */
    public function store(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        // Only school_admin can create
        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk melakukan aksi ini');
        }

        // Check if there's already a pending request
        $pendingRequest = NpsnChangeRequest::where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->first();

        if ($pendingRequest) {
            return redirect()->route('tenant.npsn-change-requests.index', ['tenant' => $tenant->npsn])
                ->with('error', 'Anda sudah memiliki permintaan perubahan NPSN yang sedang menunggu persetujuan.');
        }

        $validated = $request->validate([
            'requested_npsn' => [
                'required',
                'string',
                'size:8',
                'regex:/^[0-9]{8}$/',
                function ($attribute, $value, $fail) use ($tenant) {
                    // Check if NPSN is different from current
                    if ($value === $tenant->npsn) {
                        $fail('NPSN baru harus berbeda dengan NPSN saat ini.');
                    }
                    // Check if NPSN already exists
                    if (\App\Models\Core\Tenant::where('npsn', $value)->exists()) {
                        $fail('NPSN yang diminta sudah digunakan oleh tenant lain.');
                    }
                },
            ],
            'reason' => 'required|string|max:1000',
        ]);

        try {
            $npsnRequest = NpsnChangeRequest::create([
                'tenant_id' => $tenant->id,
                'current_npsn' => $tenant->npsn,
                'requested_npsn' => $validated['requested_npsn'],
                'reason' => $validated['reason'],
                'status' => 'pending',
                'requested_by' => $user->id,
            ]);

            AuditHelper::info('NPSN change request created', [
                'request_id' => $npsnRequest->id,
                'tenant_id' => $tenant->id,
                'current_npsn' => $tenant->npsn,
                'requested_npsn' => $validated['requested_npsn'],
                'requested_by' => $user->id,
            ]);

            return redirect()->route('tenant.npsn-change-requests.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Permintaan perubahan NPSN berhasil dikirim. Menunggu persetujuan dari super admin.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat mengirim permintaan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified NPSN change request
     */
    public function show(NpsnChangeRequest $npsnChangeRequest)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini');
        }

        if ($npsnChangeRequest->tenant_id !== $tenant->id) {
            abort(404, 'Permintaan tidak ditemukan');
        }

        $npsnChangeRequest->load(['requester', 'approver', 'tenant']);

        return view('tenant.npsn-change-requests.show', compact('npsnChangeRequest', 'tenant'));
    }
}
