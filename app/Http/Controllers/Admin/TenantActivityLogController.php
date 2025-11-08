<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Core\Tenant;
use App\Services\TenantActivityLogService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TenantActivityLogController extends Controller
{
    protected TenantActivityLogService $activityLogService;

    public function __construct(TenantActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Show activity logs for tenant
     */
    public function index(Request $request, Tenant $tenant): View
    {
        $filters = [
            'user_id' => $request->get('user_id'),
            'action' => $request->get('action'),
            'model_type' => $request->get('model_type'),
            'start_date' => $request->get('start_date'),
            'end_date' => $request->get('end_date'),
        ];

        $logs = $this->activityLogService->getLogs($tenant, array_filter($filters));

        // Get filter options
        $users = $tenant->users()->get();
        $actions = $tenant->activityLogs()->distinct()->pluck('action');
        $modelTypes = $tenant->activityLogs()->distinct()->pluck('model_type')->filter();

        return view('admin.tenants.activity-logs', compact('tenant', 'logs', 'users', 'actions', 'modelTypes'));
    }

    /**
     * Export activity logs
     */
    public function export(Request $request, Tenant $tenant)
    {
        $filters = [
            'user_id' => $request->get('user_id'),
            'action' => $request->get('action'),
            'model_type' => $request->get('model_type'),
            'start_date' => $request->get('start_date'),
            'end_date' => $request->get('end_date'),
        ];

        $logs = $this->activityLogService->getLogs($tenant, array_filter($filters), 10000);

        // Generate CSV
        $filename = "activity-logs-{$tenant->npsn}-" . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, ['Tanggal', 'User', 'Action', 'Model', 'Description', 'IP Address', 'URL']);
            
            // Data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->logged_at->format('d-m-Y H:i:s'),
                    $log->user ? $log->user->name : 'System',
                    $log->action,
                    $log->model_type ? class_basename($log->model_type) : '-',
                    $log->description,
                    $log->ip_address ?? '-',
                    $log->url ?? '-',
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

