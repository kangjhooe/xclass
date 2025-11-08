<?php

namespace App\Services;

use App\Models\MutasiSiswa;
use App\Models\Tenant\Student;
use App\Models\Core\Tenant;
use App\Core\Services\TenantService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

/**
 * Service for Student Transfer Management
 * 
 * Handles business logic for student transfers between tenants
 */
class MutasiSiswaService
{
    protected TenantService $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Request student transfer
     */
    public function requestTransfer(int $studentId, int $toTenantId, string $reason, array $additionalData = []): MutasiSiswa
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        $student = Student::where('instansi_id', $currentTenant->id)->findOrFail($studentId);
        
        // Validate that destination tenant exists and has same educational level
        $toTenant = Tenant::findOrFail($toTenantId);
        $this->validateEducationalLevel($currentTenant, $toTenant);
        
        // Check if student already has pending transfer
        $existingTransfer = MutasiSiswa::where('student_id', $studentId)
            ->whereIn('status', ['pending', 'approved'])
            ->first();
            
        if ($existingTransfer) {
            throw new \Exception('Siswa sudah memiliki permintaan mutasi yang sedang berlangsung');
        }

        // Create transfer request
        $mutasi = MutasiSiswa::create([
            'student_id' => $studentId,
            'from_tenant_id' => $currentTenant->id,
            'to_tenant_id' => $toTenantId,
            'status' => 'pending',
            'reason' => $reason,
            'student_data' => $student->toArray(),
            'notes' => $additionalData['notes'] ?? null,
        ]);

        // Log activity
        $mutasi->logActivity('create', [], "Meminta mutasi siswa {$student->name} ke {$toTenant->name}");

        return $mutasi;
    }

    /**
     * Approve student transfer
     */
    public function approveTransfer(int $mutasiId, string $notes = null): MutasiSiswa
    {
        $mutasi = MutasiSiswa::findOrFail($mutasiId);
        
        if (!$mutasi->canBeApproved()) {
            throw new \Exception('Mutasi tidak dapat disetujui');
        }

        // Check if current user has permission to approve
        $this->validateApprovalPermission($mutasi);

        $mutasi->update([
            'status' => 'approved',
            'processed_by' => Auth::id(),
            'processed_at' => now(),
            'notes' => $notes,
        ]);

        // Log activity
        $mutasi->logActivity('update', ['status' => ['old' => 'pending', 'new' => 'approved']], 
            "Menyetujui mutasi siswa {$mutasi->student->name}");

        return $mutasi;
    }

    /**
     * Reject student transfer
     */
    public function rejectTransfer(int $mutasiId, string $rejectionReason): MutasiSiswa
    {
        $mutasi = MutasiSiswa::findOrFail($mutasiId);
        
        if (!$mutasi->canBeRejected()) {
            throw new \Exception('Mutasi tidak dapat ditolak');
        }

        // Check if current user has permission to reject
        $this->validateApprovalPermission($mutasi);

        $mutasi->update([
            'status' => 'rejected',
            'rejection_reason' => $rejectionReason,
            'processed_by' => Auth::id(),
            'processed_at' => now(),
        ]);

        // Log activity
        $mutasi->logActivity('update', ['status' => ['old' => 'pending', 'new' => 'rejected']], 
            "Menolak mutasi siswa {$mutasi->student->name}");

        return $mutasi;
    }

    /**
     * Complete student transfer
     */
    public function completeTransfer(int $mutasiId): MutasiSiswa
    {
        $mutasi = MutasiSiswa::findOrFail($mutasiId);
        
        if (!$mutasi->canBeCompleted()) {
            throw new \Exception('Mutasi tidak dapat diselesaikan');
        }

        return DB::transaction(function () use ($mutasi) {
            // Update student's tenant
            $student = $mutasi->student;
            $student->update([
                'instansi_id' => $mutasi->to_tenant_id,
            ]);

            // Update mutasi status
            $mutasi->update([
                'status' => 'completed',
                'processed_by' => Auth::id(),
                'processed_at' => now(),
            ]);

            // Log activity
            $mutasi->logActivity('update', ['status' => ['old' => 'approved', 'new' => 'completed']], 
                "Menyelesaikan mutasi siswa {$student->name}");

            return $mutasi;
        });
    }

    /**
     * Get transfer requests for current tenant
     */
    public function getTransferRequests(array $filters = [], int $perPage = 15)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        $query = MutasiSiswa::with(['student', 'fromTenant', 'toTenant', 'processedBy'])
            ->where(function ($q) use ($currentTenant) {
                $q->where('from_tenant_id', $currentTenant->id)
                  ->orWhere('to_tenant_id', $currentTenant->id);
            });

        // Apply filters
        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['student_name']) && $filters['student_name']) {
            $query->whereHas('student', function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['student_name']}%");
            });
        }

        if (isset($filters['date_from']) && $filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to']) && $filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Get pending approvals for current tenant
     */
    public function getPendingApprovals()
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        return MutasiSiswa::with(['student', 'fromTenant'])
            ->where('to_tenant_id', $currentTenant->id)
            ->where('status', 'pending')
            ->latest()
            ->get();
    }

    /**
     * Get transfer statistics
     */
    public function getStatistics(): array
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        $query = MutasiSiswa::where(function ($q) use ($currentTenant) {
            $q->where('from_tenant_id', $currentTenant->id)
              ->orWhere('to_tenant_id', $currentTenant->id);
        });

        return [
            'total' => $query->count(),
            'pending' => $query->where('status', 'pending')->count(),
            'approved' => $query->where('status', 'approved')->count(),
            'rejected' => $query->where('status', 'rejected')->count(),
            'completed' => $query->where('status', 'completed')->count(),
            'outgoing' => MutasiSiswa::where('from_tenant_id', $currentTenant->id)->count(),
            'incoming' => MutasiSiswa::where('to_tenant_id', $currentTenant->id)->count(),
        ];
    }

    /**
     * Validate educational level compatibility
     */
    protected function validateEducationalLevel(Tenant $fromTenant, Tenant $toTenant): void
    {
        // This is a simplified validation - you might want to add more complex logic
        // based on your educational level structure
        if ($fromTenant->educational_level !== $toTenant->educational_level) {
            throw new \Exception('Mutasi hanya dapat dilakukan antar lembaga dengan jenjang pendidikan yang sama');
        }
    }

    /**
     * Validate approval permission
     */
    protected function validateApprovalPermission(MutasiSiswa $mutasi): void
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        // Only destination tenant can approve/reject
        if ($mutasi->to_tenant_id !== $currentTenant->id) {
            throw new \Exception('Anda tidak memiliki izin untuk menyetujui mutasi ini');
        }

        // Add additional permission checks here if needed
        // For example, check if user has admin role or specific permission
    }

    /**
     * Get available destination tenants
     */
    public function getAvailableDestinations(): \Illuminate\Database\Eloquent\Collection
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        return Tenant::where('id', '!=', $currentTenant->id)
            ->where('educational_level', $currentTenant->educational_level)
            ->where('is_active', true)
            ->get();
    }

    /**
     * Cancel transfer request
     */
    public function cancelTransfer(int $mutasiId, string $reason = null): MutasiSiswa
    {
        $mutasi = MutasiSiswa::findOrFail($mutasiId);
        
        if ($mutasi->status !== 'pending') {
            throw new \Exception('Hanya mutasi yang sedang menunggu persetujuan yang dapat dibatalkan');
        }

        $currentTenant = $this->tenantService->getCurrentTenant();
        
        if ($mutasi->from_tenant_id !== $currentTenant->id) {
            throw new \Exception('Anda tidak memiliki izin untuk membatalkan mutasi ini');
        }

        $mutasi->update([
            'status' => 'rejected',
            'rejection_reason' => $reason ?? 'Dibatalkan oleh pengirim',
            'processed_by' => Auth::id(),
            'processed_at' => now(),
        ]);

        // Log activity
        $mutasi->logActivity('update', ['status' => ['old' => 'pending', 'new' => 'rejected']], 
            "Membatalkan mutasi siswa {$mutasi->student->name}");

        return $mutasi;
    }
}
