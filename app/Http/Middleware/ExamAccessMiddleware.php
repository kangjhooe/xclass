<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamAttempt;
use Carbon\Carbon;

class ExamAccessMiddleware
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
        $examId = $request->route('exam');
        $attemptId = $request->route('attempt');
        
        // Check if exam exists and belongs to current tenant
        if ($examId) {
            $exam = Exam::where('id', $examId)
                ->where('instansi_id', tenant('id'))
                ->first();
                
            if (!$exam) {
                return redirect(tenant_route('tenant.exam.index'))
                    ->with('error', 'Ujian tidak ditemukan');
            }
            
            // Check exam status and timing
            $now = now();
            
            // Check if exam is scheduled for future
            if ($exam->isScheduled()) {
                return redirect(tenant_route('tenant.exam.index'))
                    ->with('error', 'Ujian belum dimulai. Waktu mulai: ' . $exam->start_time->format('d-m-Y H:i'));
            }
            
            // Check if exam has ended
            if ($exam->hasEnded()) {
                return redirect(tenant_route('tenant.exam.index'))
                    ->with('error', 'Ujian sudah berakhir. Waktu selesai: ' . $exam->end_time->format('d-m-Y H:i'));
            }
            
            // Check if exam is cancelled
            if ($exam->status === Exam::STATUS_CANCELLED) {
                return redirect(tenant_route('tenant.exam.index'))
                    ->with('error', 'Ujian telah dibatalkan');
            }
            
            // Add exam to request for use in controller
            $request->merge(['exam' => $exam]);
        }
        
        // Check if attempt exists and belongs to current user/tenant
        if ($attemptId) {
            $attempt = ExamAttempt::where('id', $attemptId)
                ->where('instansi_id', tenant('id'))
                ->first();
                
            if (!$attempt) {
                return redirect(tenant_route('tenant.exam.index'))
                    ->with('error', 'Data ujian tidak ditemukan');
            }
            
            // Check if attempt belongs to current user (for students)
            if (auth()->user()->role === 'student') {
                if ($attempt->student_id !== auth()->user()->student_id) {
                    return redirect(tenant_route('tenant.exam.index'))
                        ->with('error', 'Anda tidak memiliki akses ke ujian ini');
                }
            }
            
            // Check if attempt is still valid
            if ($attempt->isCompleted() || $attempt->isAbandoned()) {
                return redirect(tenant_route('tenant.exam.results', $attempt))
                    ->with('info', 'Ujian sudah selesai');
            }
            
            // Check if attempt is timed out
            if ($attempt->isTimedOut()) {
                $attempt->autoSubmit();
                return redirect(tenant_route('tenant.exam.results', $attempt))
                    ->with('warning', 'Waktu ujian telah habis. Jawaban disubmit otomatis');
            }
            
            // Add attempt to request for use in controller
            $request->merge(['attempt' => $attempt]);
        }
        
        return $next($request);
    }
}