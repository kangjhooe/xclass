<?php

namespace App\Http\Controllers\Tenant;

use App\Services\MutasiSiswaService;
use App\Core\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Controller for Student Transfer Management
 * 
 * Handles student transfer requests and approvals
 */
class MutasiSiswaController extends BaseTenantController
{
    protected MutasiSiswaService $mutasiSiswaService;

    public function __construct(TenantService $tenantService, MutasiSiswaService $mutasiSiswaService)
    {
        parent::__construct($tenantService);
        $this->mutasiSiswaService = $mutasiSiswaService;
    }

    /**
     * Display transfer requests index
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'student_name', 'date_from', 'date_to']);
        $transfers = $this->mutasiSiswaService->getTransferRequests($filters);
        $statistics = $this->mutasiSiswaService->getStatistics();
        $availableDestinations = $this->mutasiSiswaService->getAvailableDestinations();

        return view('tenant.data-pokok.mutasi-siswa.index', compact(
            'transfers', 'statistics', 'availableDestinations', 'filters'
        ));
    }

    /**
     * Show form to request transfer
     */
    public function create()
    {
        $availableDestinations = $this->mutasiSiswaService->getAvailableDestinations();
        
        // Get current tenant students
        $currentTenant = $this->getCurrentTenant();
        $students = \App\Models\Tenant\Student::where('instansi_id', $currentTenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
        
        return view('tenant.data-pokok.mutasi-siswa.create', compact('availableDestinations', 'students'));
    }

    /**
     * Store transfer request
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'to_tenant_id' => 'required|exists:tenants,id',
            'reason' => 'required|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $mutasi = $this->mutasiSiswaService->requestTransfer(
                $request->student_id,
                $request->to_tenant_id,
                $request->reason,
                ['notes' => $request->notes]
            );

            return response()->json([
                'success' => true,
                'message' => 'Permintaan mutasi berhasil dikirim',
                'data' => $mutasi
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Show transfer details
     */
    public function show(int $id)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure transfer belongs to current tenant (either from or to)
        $transfer = \App\Models\MutasiSiswa::with(['student', 'fromTenant', 'toTenant', 'processedBy'])
            ->where(function($q) use ($tenant) {
                $q->where('from_tenant_id', $tenant->id)
                  ->orWhere('to_tenant_id', $tenant->id);
            })
            ->findOrFail($id);
        
        return view('tenant.data-pokok.mutasi-siswa.show', compact('transfer'));
    }

    /**
     * Approve transfer request
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $mutasi = $this->mutasiSiswaService->approveTransfer($id, $request->notes);

            return response()->json([
                'success' => true,
                'message' => 'Mutasi berhasil disetujui',
                'data' => $mutasi
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Reject transfer request
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        try {
            $mutasi = $this->mutasiSiswaService->rejectTransfer($id, $request->rejection_reason);

            return response()->json([
                'success' => true,
                'message' => 'Mutasi berhasil ditolak',
                'data' => $mutasi
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Complete transfer
     */
    public function complete(int $id): JsonResponse
    {
        try {
            $mutasi = $this->mutasiSiswaService->completeTransfer($id);

            return response()->json([
                'success' => true,
                'message' => 'Mutasi berhasil diselesaikan',
                'data' => $mutasi
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Cancel transfer request
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        try {
            $mutasi = $this->mutasiSiswaService->cancelTransfer($id, $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Mutasi berhasil dibatalkan',
                'data' => $mutasi
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get pending approvals
     */
    public function pendingApprovals(): JsonResponse
    {
        $pending = $this->mutasiSiswaService->getPendingApprovals();

        return response()->json([
            'success' => true,
            'data' => $pending->map(function ($mutasi) {
                return [
                    'id' => $mutasi->id,
                    'student_name' => $mutasi->student->name,
                    'from_tenant' => $mutasi->fromTenant->name,
                    'reason' => $mutasi->reason,
                    'created_at' => $mutasi->created_at->format('d-m-Y H:i:s'),
                    'time_ago' => $mutasi->created_at->diffForHumans(),
                ];
            })
        ]);
    }

    /**
     * Get transfer statistics
     */
    public function statistics(): JsonResponse
    {
        $statistics = $this->mutasiSiswaService->getStatistics();

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    /**
     * Get available destinations
     */
    public function destinations(): JsonResponse
    {
        $destinations = $this->mutasiSiswaService->getAvailableDestinations();

        return response()->json([
            'success' => true,
            'data' => $destinations->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'educational_level' => $tenant->educational_level,
                ];
            })
        ]);
    }
}