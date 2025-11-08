<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NpsnChangeRequest;
use App\Models\Core\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use App\Helpers\AuditHelper;

class NpsnChangeRequestController extends Controller
{
    /**
     * Display a listing of all NPSN change requests
     */
    public function index()
    {
        Gate::authorize('bypass-tenant-scope');

        $requests = NpsnChangeRequest::with(['tenant', 'requester', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'pending' => NpsnChangeRequest::where('status', 'pending')->count(),
            'approved' => NpsnChangeRequest::where('status', 'approved')->count(),
            'rejected' => NpsnChangeRequest::where('status', 'rejected')->count(),
        ];

        return view('admin.npsn-change-requests.index', compact('requests', 'stats'));
    }

    /**
     * Display the specified NPSN change request
     */
    public function show(NpsnChangeRequest $npsnChangeRequest)
    {
        Gate::authorize('bypass-tenant-scope');

        $npsnChangeRequest->load(['tenant', 'requester', 'approver']);

        return view('admin.npsn-change-requests.show', compact('npsnChangeRequest'));
    }

    /**
     * Approve NPSN change request
     */
    public function approve(Request $request, NpsnChangeRequest $npsnChangeRequest)
    {
        Gate::authorize('bypass-tenant-scope');

        $user = Auth::user();

        if ($npsnChangeRequest->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Permintaan ini sudah diproses sebelumnya');
        }

        // Validate that requested NPSN is still available
        $existingTenant = Tenant::where('npsn', $npsnChangeRequest->requested_npsn)->first();
        if ($existingTenant && $existingTenant->id !== $npsnChangeRequest->tenant_id) {
            return redirect()->back()
                ->with('error', 'NPSN yang diminta sudah digunakan oleh tenant lain.');
        }

        $validated = $request->validate([
            'response_message' => 'nullable|string|max:1000',
        ]);

        try {
            DB::transaction(function () use ($npsnChangeRequest, $user, $validated) {
                // Update the request status
                $npsnChangeRequest->update([
                    'status' => 'approved',
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                    'response_message' => $validated['response_message'] ?? null,
                ]);

                // Update tenant NPSN
                $tenant = $npsnChangeRequest->tenant;
                $oldNpsn = $tenant->npsn;
                $tenant->npsn = $npsnChangeRequest->requested_npsn;
                $tenant->save();

                AuditHelper::info('NPSN change request approved', [
                    'request_id' => $npsnChangeRequest->id,
                    'tenant_id' => $tenant->id,
                    'old_npsn' => $oldNpsn,
                    'new_npsn' => $npsnChangeRequest->requested_npsn,
                    'approved_by' => $user->id,
                ]);
            });

            return redirect()->route('admin.npsn-change-requests.index')
                ->with('success', 'Permintaan perubahan NPSN telah disetujui dan NPSN tenant telah diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menyetujui permintaan: ' . $e->getMessage());
        }
    }

    /**
     * Reject NPSN change request
     */
    public function reject(Request $request, NpsnChangeRequest $npsnChangeRequest)
    {
        Gate::authorize('bypass-tenant-scope');

        $user = Auth::user();

        if ($npsnChangeRequest->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Permintaan ini sudah diproses sebelumnya');
        }

        $validated = $request->validate([
            'response_message' => 'required|string|max:1000',
        ]);

        try {
            $npsnChangeRequest->update([
                'status' => 'rejected',
                'approved_by' => $user->id,
                'approved_at' => now(),
                'response_message' => $validated['response_message'],
            ]);

            AuditHelper::info('NPSN change request rejected', [
                'request_id' => $npsnChangeRequest->id,
                'tenant_id' => $npsnChangeRequest->tenant_id,
                'rejected_by' => $user->id,
            ]);

            return redirect()->route('admin.npsn-change-requests.index')
                ->with('success', 'Permintaan perubahan NPSN telah ditolak.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menolak permintaan: ' . $e->getMessage());
        }
    }
}
