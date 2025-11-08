<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExamScheduleController extends Controller
{
    public function index()
    {
        return view('tenant.exam.schedules.index');
    }

    public function show($schedule)
    {
        return view('tenant.exam.schedules.show', compact('schedule'));
    }

    public function edit($schedule)
    {
        return view('tenant.exam.schedules.edit', compact('schedule'));
    }

    public function update(Request $request, $schedule)
    {
        // Implementation
    }

    public function start($schedule)
    {
        // Implementation
    }

    public function stop($schedule)
    {
        // Implementation
    }

    public function results($schedule)
    {
        return view('tenant.exam.schedules.results', compact('schedule'));
    }
}
