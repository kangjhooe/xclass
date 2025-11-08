<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Tenant\Exam;

class CanAdjustGrades
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\JsonResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login')->with('error', 'Anda harus login terlebih dahulu.');
        }

        // Super admin can adjust any grades
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Get exam from route parameter
        $examId = $request->route('exam');
        if (!$examId) {
            return redirect()->back()->with('error', 'Ujian tidak ditemukan.');
        }

        $exam = Exam::find($examId);
        if (!$exam) {
            return redirect()->back()->with('error', 'Ujian tidak ditemukan.');
        }

        // Check if user is school admin for this tenant
        if ($user->role === 'school_admin' && $user->instansi_id === $exam->instansi_id) {
            return $next($request);
        }

        // Check if user is teacher and has subjects in this exam
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Data guru tidak ditemukan.');
            }

            // Check if teacher has subjects in this exam
            $hasSubjectsInExam = $exam->examSubjects()
                ->where('teacher_id', $teacher->id)
                ->exists();

            if ($hasSubjectsInExam) {
                return $next($request);
            }
        }

        return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk menyesuaikan nilai ujian ini.');
    }
}
