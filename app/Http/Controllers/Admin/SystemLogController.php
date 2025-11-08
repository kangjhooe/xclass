<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;

class SystemLogController extends Controller
{
    /**
     * Display a listing of system logs
     */
    public function index(Request $request)
    {
        $query = SystemLog::query()
            ->with(['user', 'tenant'])
            ->orderBy('created_at', 'desc');

        // Filter by log level
        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        // Filter by tenant
        if ($request->filled('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->paginate(50);

        return view('admin.logs.index', compact('logs'));
    }

    /**
     * Display the specified log entry
     */
    public function show(SystemLog $log)
    {
        $log->load(['user', 'tenant']);
        
        return view('admin.logs.show', compact('log'));
    }
}
