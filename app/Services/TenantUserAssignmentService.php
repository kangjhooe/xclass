<?php

namespace App\Services;

use App\Models\TenantUserAssignment;
use App\Models\User;
use App\Models\Core\Tenant;
use App\Core\Services\TenantService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Service for Cross-Tenant User Assignment Management
 * 
 * Handles business logic for assigning users to multiple tenants
 */
class TenantUserAssignmentService
{
    protected TenantService $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Assign user to tenant
     */
    public function assignUser(int $userId, int $tenantId, string $role, bool $isPrimary = false, array $permissions = [], string $notes = null): TenantUserAssignment
    {
        // Validate user exists
        $user = User::findOrFail($userId);
        
        // Validate tenant exists
        $tenant = Tenant::findOrFail($tenantId);
        
        // Check if assignment already exists
        $existingAssignment = TenantUserAssignment::where('user_id', $userId)
            ->where('tenant_id', $tenantId)
            ->where('role', $role)
            ->first();
            
        if ($existingAssignment) {
            if ($existingAssignment->is_active) {
                throw new \Exception('User sudah ditugaskan ke tenant ini dengan role yang sama');
            } else {
                // Reactivate existing assignment
                $existingAssignment->update([
                    'is_active' => true,
                    'assigned_at' => now(),
                    'unassigned_at' => null,
                    'permissions' => $permissions,
                    'notes' => $notes,
                ]);
                return $existingAssignment;
            }
        }

        // If this is set as primary, unset other primary assignments for this user
        if ($isPrimary) {
            $this->unsetPrimaryAssignments($userId, $role);
        }

        // Create new assignment
        $assignment = TenantUserAssignment::create([
            'user_id' => $userId,
            'tenant_id' => $tenantId,
            'role' => $role,
            'is_primary' => $isPrimary,
            'permissions' => $permissions,
            'assigned_at' => now(),
            'is_active' => true,
            'notes' => $notes,
        ]);

        // Log activity
        $assignment->logActivity('create', [], "Menugaskan user {$user->name} ke {$tenant->name} sebagai {$role}");

        return $assignment;
    }

    /**
     * Unassign user from tenant
     */
    public function unassignUser(int $assignmentId, string $reason = null): TenantUserAssignment
    {
        $assignment = TenantUserAssignment::findOrFail($assignmentId);
        
        if (!$assignment->is_active) {
            throw new \Exception('Assignment sudah tidak aktif');
        }

        $assignment->update([
            'is_active' => false,
            'unassigned_at' => now(),
            'notes' => $reason ? ($assignment->notes . "\n\nDibatalkan: " . $reason) : $assignment->notes,
        ]);

        // Log activity
        $assignment->logActivity('update', ['is_active' => ['old' => true, 'new' => false]], 
            "Membatalkan penugasan user {$assignment->user->name} dari {$assignment->tenant->name}");

        return $assignment;
    }

    /**
     * Set primary assignment
     */
    public function setPrimary(int $assignmentId): TenantUserAssignment
    {
        $assignment = TenantUserAssignment::findOrFail($assignmentId);
        
        if (!$assignment->is_active) {
            throw new \Exception('Assignment tidak aktif');
        }

        // Unset other primary assignments for this user and role
        $this->unsetPrimaryAssignments($assignment->user_id, $assignment->role);

        $assignment->update([
            'is_primary' => true,
        ]);

        // Log activity
        $assignment->logActivity('update', ['is_primary' => ['old' => false, 'new' => true]], 
            "Mengatur penugasan utama untuk user {$assignment->user->name}");

        return $assignment;
    }

    /**
     * Update assignment permissions
     */
    public function updatePermissions(int $assignmentId, array $permissions): TenantUserAssignment
    {
        $assignment = TenantUserAssignment::findOrFail($assignmentId);
        
        $oldPermissions = $assignment->permissions;
        
        $assignment->update([
            'permissions' => $permissions,
        ]);

        // Log activity
        $assignment->logActivity('update', [
            'permissions' => ['old' => $oldPermissions, 'new' => $permissions]
        ], "Memperbarui izin untuk user {$assignment->user->name}");

        return $assignment;
    }

    /**
     * Get user assignments
     */
    public function getUserAssignments(int $userId, bool $activeOnly = true)
    {
        $query = TenantUserAssignment::with(['tenant', 'user'])
            ->where('user_id', $userId);

        if ($activeOnly) {
            $query->active();
        }

        return $query->latest('assigned_at')->get();
    }

    /**
     * Get tenant assignments
     */
    public function getTenantAssignments(int $tenantId, bool $activeOnly = true)
    {
        $query = TenantUserAssignment::with(['user', 'tenant'])
            ->where('tenant_id', $tenantId);

        if ($activeOnly) {
            $query->active();
        }

        return $query->latest('assigned_at')->get();
    }

    /**
     * Get cross-tenant users for current tenant
     */
    public function getCrossTenantUsers(array $filters = [], int $perPage = 15)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        $query = TenantUserAssignment::with(['user', 'tenant'])
            ->where('tenant_id', $currentTenant->id)
            ->active();

        // Apply filters
        if (isset($filters['role']) && $filters['role']) {
            $query->role($filters['role']);
        }

        if (isset($filters['is_primary']) && $filters['is_primary'] !== '') {
            $query->where('is_primary', $filters['is_primary']);
        }

        if (isset($filters['user_name']) && $filters['user_name']) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['user_name']}%");
            });
        }

        return $query->latest('assigned_at')->paginate($perPage);
    }

    /**
     * Get users with multiple tenant assignments
     */
    public function getMultiTenantUsers()
    {
        return User::whereHas('tenantAssignments', function ($query) {
            $query->active();
        })
        ->with(['tenantAssignments' => function ($query) {
            $query->active()->with('tenant');
        }])
        ->get()
        ->filter(function ($user) {
            return $user->tenantAssignments->count() > 1;
        });
    }

    /**
     * Get assignment statistics
     */
    public function getStatistics(): array
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        $query = TenantUserAssignment::where('tenant_id', $currentTenant->id);
        
        return [
            'total' => $query->count(),
            'active' => $query->active()->count(),
            'inactive' => $query->where('is_active', false)->count(),
            'by_role' => $query->active()
                ->selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->pluck('count', 'role')
                ->toArray(),
            'primary' => $query->active()->primary()->count(),
            'multi_tenant_users' => $this->getMultiTenantUsers()->count(),
        ];
    }

    /**
     * Sync user data across tenants
     */
    public function syncUserData(int $userId, array $data): void
    {
        $assignments = TenantUserAssignment::where('user_id', $userId)
            ->active()
            ->get();

        foreach ($assignments as $assignment) {
            // Update user data in each tenant
            // This is a simplified example - you might want to implement
            // more sophisticated data synchronization logic
            $user = $assignment->user;
            $user->update($data);
        }
    }

    /**
     * Get available users for assignment
     */
    public function getAvailableUsers(string $role = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = User::where('is_active', true);
        
        if ($role) {
            // Filter users based on role requirements
            // This is a simplified example
            $query->where('role', $role);
        }

        return $query->get();
    }

    /**
     * Get available tenants for assignment
     */
    public function getAvailableTenants(): \Illuminate\Database\Eloquent\Collection
    {
        return Tenant::where('is_active', true)->get();
    }

    /**
     * Unset primary assignments for user and role
     */
    protected function unsetPrimaryAssignments(int $userId, string $role): void
    {
        TenantUserAssignment::where('user_id', $userId)
            ->where('role', $role)
            ->where('is_primary', true)
            ->update(['is_primary' => false]);
    }

    /**
     * Check if user can be assigned to tenant
     */
    public function canAssignUser(int $userId, int $tenantId, string $role): bool
    {
        // Check if user is already assigned
        $existing = TenantUserAssignment::where('user_id', $userId)
            ->where('tenant_id', $tenantId)
            ->where('role', $role)
            ->active()
            ->exists();

        return !$existing;
    }

    /**
     * Get user's primary assignment
     */
    public function getUserPrimaryAssignment(int $userId, string $role = null): ?TenantUserAssignment
    {
        $query = TenantUserAssignment::where('user_id', $userId)
            ->active()
            ->primary();

        if ($role) {
            $query->role($role);
        }

        return $query->first();
    }
}
