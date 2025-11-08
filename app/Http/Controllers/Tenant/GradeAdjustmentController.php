<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GradeAdjustmentController extends Controller
{
    public function index($exam)
    {
        return view('tenant.exam.grade-adjustment.index', compact('exam'));
    }

    public function applyPercentage(Request $request, $exam)
    {
        // Implementation
    }

    public function applyMinimum(Request $request, $exam)
    {
        // Implementation
    }

    public function applyManual(Request $request, $exam)
    {
        // Implementation
    }

    public function history($exam)
    {
        return view('tenant.exam.grade-adjustment.history', compact('exam'));
    }

    public function revert($adjustment)
    {
        // Implementation
    }
}