<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant\Exam;
use App\Models\Tenant\GradeAdjustment;

class GradeAdjustmentAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();
        
        if (!$user) {
            return redirect()->route('login')->with('error', 'Anda harus login terlebih dahulu');
        }

        // Check if user is admin or teacher
        if (!$user->hasRole(['admin', 'teacher'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk melakukan katrol nilai');
        }

        // Get exam from route parameter
        $examId = $request->route('exam');
        if ($examId) {
            $exam = Exam::find($examId);
            
            if (!$exam) {
                return redirect()->back()->with('error', 'Ujian tidak ditemukan');
            }

            // Check if exam belongs to current tenant
            if ($exam->instansi_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak memiliki akses ke ujian ini');
            }

            // For teachers, check if they teach any subject in this exam
            if ($user->hasRole('teacher')) {
                $teacher = $user->teacher;
                if (!$teacher) {
                    return redirect()->back()->with('error', 'Data guru tidak ditemukan');
                }

                $hasAccess = $exam->examSubjects()
                    ->where('teacher_id', $teacher->id)
                    ->exists();

                if (!$hasAccess) {
                    return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk melakukan katrol nilai pada ujian ini');
                }
            }

            // Add exam to request for use in controller
            $request->merge(['exam' => $exam]);
        }

        // Check for grade adjustment ID if provided
        $adjustmentId = $request->route('adjustment');
        if ($adjustmentId) {
            $adjustment = GradeAdjustment::find($adjustmentId);
            
            if (!$adjustment) {
                return redirect()->back()->with('error', 'Data penyesuaian nilai tidak ditemukan');
            }

            // Check if adjustment belongs to current tenant
            if ($adjustment->exam->instansi_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak memiliki akses ke data penyesuaian nilai ini');
            }

            // For teachers, check if they can access this adjustment
            if ($user->hasRole('teacher')) {
                $teacher = $user->teacher;
                if (!$teacher) {
                    return redirect()->back()->with('error', 'Data guru tidak ditemukan');
                }

                // Check if teacher teaches the subject in this exam
                $hasAccess = $adjustment->exam->examSubjects()
                    ->where('teacher_id', $teacher->id)
                    ->exists();

                if (!$hasAccess) {
                    return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk mengubah penyesuaian nilai ini');
                }
            }

            // Add adjustment to request for use in controller
            $request->merge(['adjustment' => $adjustment]);
        }

        return $next($request);
    }
}
