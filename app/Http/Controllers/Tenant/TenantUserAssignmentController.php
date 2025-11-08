<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Services\TenantUserAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Controller for Cross-Tenant User Assignment Management
 * 
 * Handles user assignments across multiple tenants
 */
class TenantUserAssignmentController extends Controller
{
    protected TenantUserAssignmentService $assignmentService;

    public function __construct(TenantUserAssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    /**
     * Display assignments index
     */
    public function index(Request $request)
    {
        $filters = $request->only(['role', 'is_primary', 'user_name']);
        $assignments = $this->assignmentService->getCrossTenantUsers($filters);
        $statistics = $this->assignmentService->getStatistics();
        $availableUsers = $this->assignmentService->getAvailableUsers();
        $availableTenants = $this->assignmentService->getAvailableTenants();

        return view('tenant.data-pokok.tenant-assignments.index', compact(
            'assignments', 'statistics', 'availableUsers', 'availableTenants', 'filters'
        ));
    }

    /**
     * Show form to create assignment
     */
    public function create()
    {
        $availableUsers = $this->assignmentService->getAvailableUsers();
        $availableTenants = $this->assignmentService->getAvailableTenants();

        return view('tenant.data-pokok.tenant-assignments.create', compact(
            'availableUsers', 'availableTenants'
        ));
    }

    /**
     * Store new assignment
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'tenant_id' => 'required|exists:tenants,id',
            'role' => 'required|in:teacher,staff,admin',
            'is_primary' => 'boolean',
            'permissions' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $assignment = $this->assignmentService->assignUser(
                $request->user_id,
                $request->tenant_id,
                $request->role,
                $request->boolean('is_primary'),
                $request->permissions ?? [],
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Penugasan berhasil dibuat',
                'data' => $assignment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Show assignment details
     */
    public function show(int $id)
    {
        $assignment = \App\Models\TenantUserAssignment::with(['user', 'tenant'])
            ->findOrFail($id);
        
        return view('tenant.data-pokok.tenant-assignments.show', compact('assignment'));
    }

    /**
     * Update assignment
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'permissions' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $assignment = $this->assignmentService->updatePermissions(
                $id,
                $request->permissions ?? []
            );

            if ($request->has('notes')) {
                $assignment->update(['notes' => $request->notes]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Penugasan berhasil diperbarui',
                'data' => $assignment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Set as primary assignment
     */
    public function setPrimary(int $id): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->setPrimary($id);

            return response()->json([
                'success' => true,
                'message' => 'Penugasan utama berhasil diatur',
                'data' => $assignment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Unassign user
     */
    public function unassign(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        try {
            $assignment = $this->assignmentService->unassignUser($id, $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Penugasan berhasil dibatalkan',
                'data' => $assignment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get user assignments
     */
    public function userAssignments(int $userId): JsonResponse
    {
        $assignments = $this->assignmentService->getUserAssignments($userId);

        return response()->json([
            'success' => true,
            'data' => $assignments->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'tenant_name' => $assignment->tenant->name,
                    'role' => $assignment->role_label,
                    'is_primary' => $assignment->is_primary,
                    'status' => $assignment->status_label,
                    'assigned_at' => $assignment->assigned_at->format('d-m-Y H:i:s'),
                ];
            })
        ]);
    }

    /**
     * Get multi-tenant users
     */
    public function multiTenantUsers(): JsonResponse
    {
        $users = $this->assignmentService->getMultiTenantUsers();

        return response()->json([
            'success' => true,
            'data' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'assignments_count' => $user->tenantAssignments->count(),
                    'tenants' => $user->tenantAssignments->map(function ($assignment) {
                        return [
                            'tenant_name' => $assignment->tenant->name,
                            'role' => $assignment->role_label,
                            'is_primary' => $assignment->is_primary,
                        ];
                    })
                ];
            })
        ]);
    }

    /**
     * Get assignment statistics
     */
    public function statistics(): JsonResponse
    {
        $statistics = $this->assignmentService->getStatistics();

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    /**
     * Sync user data across tenants
     */
    public function syncUserData(Request $request, int $userId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        try {
            $this->assignmentService->syncUserData($userId, $request->only(['name', 'email', 'phone']));

            return response()->json([
                'success' => true,
                'message' => 'Data user berhasil disinkronkan'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Check if user can be assigned
     */
    public function canAssign(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'tenant_id' => 'required|exists:tenants,id',
            'role' => 'required|in:teacher,staff,admin',
        ]);

        $canAssign = $this->assignmentService->canAssignUser(
            $request->user_id,
            $request->tenant_id,
            $request->role
        );

        return response()->json([
            'success' => true,
            'can_assign' => $canAssign
        ]);
    }
}