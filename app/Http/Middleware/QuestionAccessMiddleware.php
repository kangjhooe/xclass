<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant\ExamQuestion;
use App\Models\Tenant\Exam;

class QuestionAccessMiddleware
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
        $questionId = $request->route('question');
        
        if ($questionId) {
            $question = ExamQuestion::where('id', $questionId)
                ->where('instansi_id', tenant('id'))
                ->with('exam')
                ->first();
                
            if (!$question) {
                return redirect(tenant_route('tenant.exam.questions'))
                    ->with('error', 'Soal tidak ditemukan');
            }
            
            // Check if question belongs to an exam that has attempts
            if ($question->exam->attempts()->count() > 0) {
                // Check if user has permission to edit questions with attempts
                if (!auth()->user()->can('exam:manage_questions_with_attempts')) {
                    return redirect(tenant_route('tenant.exam.questions'))
                        ->with('error', 'Tidak dapat mengedit soal yang sudah memiliki peserta');
                }
            }
            
            // Add question to request for use in controller
            $request->merge(['question' => $question]);
        }
        
        return $next($request);
    }
}