<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use App\Exports\ActivityLogExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Controller for Activity Log management
 * 
 * Handles activity log viewing and management for Data Pokok module
 */
class ActivityLogController extends Controller
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Display activity logs index
     */
    public function index(Request $request)
    {
        $filters = $request->only(['user_id', 'model_type', 'action', 'start_date', 'end_date', 'search']);
        
        $logs = $this->activityLogService->getLogs($filters);
        $statistics = $this->activityLogService->getStatistics();
        $modelTypes = $this->activityLogService->getModelTypes();
        $actions = $this->activityLogService->getActions();

        return view('tenant.data-pokok.activity-logs.index', compact(
            'logs', 'statistics', 'modelTypes', 'actions', 'filters'
        ));
    }

    /**
     * Display activity logs for specific model
     */
    public function modelLogs(Request $request, string $modelType, int $modelId)
    {
        $logs = $this->activityLogService->getModelLogs($modelType, $modelId);
        
        return view('tenant.data-pokok.activity-logs.model-logs', compact(
            'logs', 'modelType', 'modelId'
        ));
    }

    /**
     * Get recent activity logs for dashboard
     */
    public function recent(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $logs = $this->activityLogService->getRecentLogs($limit);

        return response()->json([
            'success' => true,
            'data' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user->name ?? 'Unknown',
                    'action' => $log->action_label,
                    'model' => $log->model_name,
                    'description' => $log->description,
                    'created_at' => $log->created_at->format('d-m-Y H:i:s'),
                    'time_ago' => $log->created_at->diffForHumans(),
                ];
            })
        ]);
    }

    /**
     * Get activity statistics
     */
    public function statistics(): JsonResponse
    {
        $statistics = $this->activityLogService->getStatistics();

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    /**
     * Export activity logs
     */
    public function export(Request $request): BinaryFileResponse
    {
        $filters = $request->only(['user_id', 'model_type', 'action', 'start_date', 'end_date']);
        
        $logs = $this->activityLogService->exportLogs($filters);
        
        $filename = "activity-logs-" . now()->format('Y-m-d_H-i-s') . ".xlsx";
        
        return Excel::download(new ActivityLogExport($logs), $filename);
    }

    /**
     * Clean old activity logs
     */
    public function clean(Request $request): JsonResponse
    {
        $request->validate([
            'days' => 'required|integer|min:30|max:365'
        ]);

        $days = $request->get('days', 90);
        $deletedCount = $this->activityLogService->cleanOldLogs($days);

        return response()->json([
            'success' => true,
            'message' => "Berhasil menghapus {$deletedCount} log aktivitas yang lebih dari {$days} hari",
            'deleted_count' => $deletedCount
        ]);
    }

    /**
     * Get dashboard data
     */
    public function dashboard(): JsonResponse
    {
        $data = $this->activityLogService->getDashboardLogs();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}