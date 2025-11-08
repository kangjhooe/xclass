<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StudentExamController extends Controller
{
    public function index()
    {
        return view('tenant.exam.student.index');
    }

    public function show($exam)
    {
        return view('tenant.exam.student.show', compact('exam'));
    }

    public function start($exam)
    {
        return view('tenant.exam.student.start', compact('exam'));
    }

    public function submit(Request $request, $exam)
    {
        // Implementation
    }

    public function result($exam)
    {
        return view('tenant.exam.student.result', compact('exam'));
    }
}
