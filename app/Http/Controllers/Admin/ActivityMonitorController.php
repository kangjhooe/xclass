<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use App\Models\Core\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ActivityMonitorController extends Controller
{
    /**
     * Display activity monitoring dashboard
     */
    public function index(Request $request)
    {
        // Filter parameters
        $tenantId = $request->get('tenant_id');
        $userId = $request->get('user_id');
        $dateFrom = $request->get('date_from', now()->subDays(7)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $action = $request->get('action');

        // Build query
        $query = SystemLog::with(['user', 'tenant'])
            ->whereBetween('created_at', [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay()
            ]);

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($action) {
            $query->where('action', 'like', "%{$action}%");
        }

        $activities = $query->orderBy('created_at', 'desc')->paginate(50);

        // Statistics
        $stats = [
            'total_activities' => SystemLog::whereBetween('created_at', [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay()
            ])->count(),
            'by_tenant' => $this->getActivitiesByTenant($dateFrom, $dateTo),
            'by_action' => $this->getActivitiesByAction($dateFrom, $dateTo),
            'by_hour' => $this->getActivitiesByHour($dateFrom, $dateTo),
            'recent_errors' => SystemLog::whereBetween('created_at', [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay()
            ])->whereIn('level', ['error', 'critical'])->count(),
        ];

        // Get tenants and users for filters
        $tenants = Tenant::orderBy('name')->get();
        $users = User::whereIn('role', ['super_admin', 'school_admin'])->orderBy('name')->get();

        return view('admin.activity-monitor.index', compact(
            'activities',
            'stats',
            'tenants',
            'users',
            'tenantId',
            'userId',
            'dateFrom',
            'dateTo',
            'action'
        ));
    }

    /**
     * Get activities grouped by tenant
     */
    private function getActivitiesByTenant($dateFrom, $dateTo): array
    {
        return SystemLog::select('tenant_id', DB::raw('count(*) as total'))
            ->whereBetween('created_at', [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay()
            ])
            ->whereNotNull('tenant_id')
            ->groupBy('tenant_id')
            ->with('tenant:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'tenant' => $item->tenant ? $item->tenant->name : 'Unknown',
                    'total' => $item->total
                ];
            })
            ->toArray();
    }

    /**
     * Get activities grouped by action
     */
    private function getActivitiesByAction($dateFrom, $dateTo): array
    {
        return SystemLog::select('action', DB::raw('count(*) as total'))
            ->whereBetween('created_at', [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay()
            ])
            ->whereNotNull('action')
            ->groupBy('action')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'action' => $item->action ?? 'Unknown',
                    'total' => $item->total
                ];
            })
            ->toArray();
    }

    /**
     * Get activities grouped by hour
     */
    private function getActivitiesByHour($dateFrom, $dateTo): array
    {
        return SystemLog::select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as total'))
            ->whereBetween('created_at', [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay()
            ])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => sprintf('%02d:00', $item->hour),
                    'total' => $item->total
                ];
            })
            ->toArray();
    }

    /**
     * Export activities
     */
    public function export(Request $request)
    {
        // Similar filtering logic as index
        $tenantId = $request->get('tenant_id');
        $userId = $request->get('user_id');
        $dateFrom = $request->get('date_from', now()->subDays(7)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $query = SystemLog::with(['user', 'tenant'])
            ->whereBetween('created_at', [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay()
            ]);

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $activities = $query->orderBy('created_at', 'desc')->get();

        // Generate CSV
        $filename = 'activity-monitor-' . date('Y-m-d-His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($activities) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, ['Timestamp', 'User', 'Tenant', 'Action', 'Level', 'Message']);
            
            // Data
            foreach ($activities as $activity) {
                fputcsv($file, [
                    $activity->created_at->format('Y-m-d H:i:s'),
                    $activity->user ? $activity->user->name : 'N/A',
                    $activity->tenant ? $activity->tenant->name : 'N/A',
                    $activity->action ?? 'N/A',
                    $activity->level ?? 'info',
                    $activity->message ?? 'N/A',
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

