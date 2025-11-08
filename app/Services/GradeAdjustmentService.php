<?php

namespace App\Services;

use App\Models\Tenant\GradeAdjustment;
use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamAttempt;
use App\Models\Tenant\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GradeAdjustmentService
{
    /**
     * Apply percentage adjustment to exam grades
     */
    public function applyPercentageAdjustment(Exam $exam, $percentage, $userId, $role, $note = null): array
    {
        try {
            DB::beginTransaction();

            $results = [
                'success' => [],
                'failed' => []
            ];

            $attempts = $exam->attempts()
                ->where('status', ExamAttempt::STATUS_COMPLETED)
                ->get();

            foreach ($attempts as $attempt) {
                $beforeValue = $attempt->score;
                $afterValue = $beforeValue + ($beforeValue * $percentage / 100);
                
                // Ensure score doesn't exceed total score
                $afterValue = min($afterValue, $exam->total_score);

                $attempt->update(['score' => $afterValue]);

                // Create grade adjustment record
                GradeAdjustment::create([
                    'exam_id' => $exam->id,
                    'user_id' => $userId,
                    'role' => $role,
                    'adjustment_type' => GradeAdjustment::TYPE_PERCENT,
                    'before_value' => $beforeValue,
                    'after_value' => $afterValue,
                    'applied_to' => $attempt->student_id,
                    'note' => $note,
                    'adjustment_data' => [
                        'percentage' => $percentage,
                        'applied_at' => now()
                    ]
                ]);

                $results['success'][] = $attempt->student_id;
            }

            Log::info('Percentage grade adjustment applied', [
                'exam_id' => $exam->id,
                'percentage' => $percentage,
                'adjusted_count' => count($results['success']),
                'user_id' => $userId,
                'role' => $role
            ]);

            DB::commit();
            return $results;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to apply percentage grade adjustment', [
                'exam_id' => $exam->id,
                'percentage' => $percentage,
                'error' => $e->getMessage()
            ]);
            return ['success' => [], 'failed' => []];
        }
    }

    /**
     * Apply minimum grade adjustment
     */
    public function applyMinimumGradeAdjustment(Exam $exam, $minimumGrade, $userId, $role, $note = null): array
    {
        try {
            DB::beginTransaction();

            $results = [
                'success' => [],
                'failed' => []
            ];

            $attempts = $exam->attempts()
                ->where('status', ExamAttempt::STATUS_COMPLETED)
                ->where('score', '<', $minimumGrade)
                ->get();

            foreach ($attempts as $attempt) {
                $beforeValue = $attempt->score;
                $afterValue = $minimumGrade;

                $attempt->update(['score' => $afterValue]);

                // Create grade adjustment record
                GradeAdjustment::create([
                    'exam_id' => $exam->id,
                    'user_id' => $userId,
                    'role' => $role,
                    'adjustment_type' => GradeAdjustment::TYPE_MINIMUM,
                    'before_value' => $beforeValue,
                    'after_value' => $afterValue,
                    'applied_to' => $attempt->student_id,
                    'note' => $note,
                    'adjustment_data' => [
                        'minimum_grade' => $minimumGrade,
                        'applied_at' => now()
                    ]
                ]);

                $results['success'][] = $attempt->student_id;
            }

            Log::info('Minimum grade adjustment applied', [
                'exam_id' => $exam->id,
                'minimum_grade' => $minimumGrade,
                'adjusted_count' => count($results['success']),
                'user_id' => $userId,
                'role' => $role
            ]);

            DB::commit();
            return $results;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to apply minimum grade adjustment', [
                'exam_id' => $exam->id,
                'minimum_grade' => $minimumGrade,
                'error' => $e->getMessage()
            ]);
            return ['success' => [], 'failed' => []];
        }
    }

    /**
     * Apply manual grade adjustment for specific student
     */
    public function applyManualGradeAdjustment(Exam $exam, $studentId, $newGrade, $userId, $role, $note = null): bool
    {
        try {
            DB::beginTransaction();

            $attempt = $exam->attempts()
                ->where('student_id', $studentId)
                ->where('status', ExamAttempt::STATUS_COMPLETED)
                ->first();

            if (!$attempt) {
                throw new \Exception('Student attempt not found');
            }

            $beforeValue = $attempt->score;
            $afterValue = $newGrade;

            // Ensure score doesn't exceed total score
            $afterValue = min($afterValue, $exam->total_score);

            $attempt->update(['score' => $afterValue]);

            // Create grade adjustment record
            GradeAdjustment::create([
                'exam_id' => $exam->id,
                'user_id' => $userId,
                'role' => $role,
                'adjustment_type' => GradeAdjustment::TYPE_MANUAL,
                'before_value' => $beforeValue,
                'after_value' => $afterValue,
                'applied_to' => $studentId,
                'note' => $note,
                'adjustment_data' => [
                    'applied_at' => now()
                ]
            ]);

            Log::info('Manual grade adjustment applied', [
                'exam_id' => $exam->id,
                'student_id' => $studentId,
                'before_value' => $beforeValue,
                'after_value' => $afterValue,
                'user_id' => $userId,
                'role' => $role
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to apply manual grade adjustment', [
                'exam_id' => $exam->id,
                'student_id' => $studentId,
                'new_grade' => $newGrade,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get grade adjustment history for exam
     */
    public function getExamAdjustmentHistory(Exam $exam)
    {
        return GradeAdjustment::where('exam_id', $exam->id)
            ->with(['user', 'student'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get grade adjustment history for student
     */
    public function getStudentAdjustmentHistory($studentId, $examId = null)
    {
        $query = GradeAdjustment::where('applied_to', $studentId)
            ->with(['exam', 'user']);

        if ($examId) {
            $query->where('exam_id', $examId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get grade adjustment statistics
     */
    public function getAdjustmentStatistics(Exam $exam)
    {
        $adjustments = GradeAdjustment::where('exam_id', $exam->id)->get();

        $totalAdjustments = $adjustments->count();
        $percentageAdjustments = $adjustments->where('adjustment_type', GradeAdjustment::TYPE_PERCENT)->count();
        $minimumAdjustments = $adjustments->where('adjustment_type', GradeAdjustment::TYPE_MINIMUM)->count();
        $manualAdjustments = $adjustments->where('adjustment_type', GradeAdjustment::TYPE_MANUAL)->count();

        $totalIncrease = $adjustments->where('after_value', '>', 'before_value')->sum(function ($adj) {
            return $adj->after_value - $adj->before_value;
        });

        $totalDecrease = $adjustments->where('after_value', '<', 'before_value')->sum(function ($adj) {
            return $adj->before_value - $adj->after_value;
        });

        return [
            'total_adjustments' => $totalAdjustments,
            'percentage_adjustments' => $percentageAdjustments,
            'minimum_adjustments' => $minimumAdjustments,
            'manual_adjustments' => $manualAdjustments,
            'total_increase' => $totalIncrease,
            'total_decrease' => $totalDecrease,
            'net_change' => $totalIncrease - $totalDecrease,
        ];
    }

    /**
     * Revert grade adjustment
     */
    public function revertGradeAdjustment(GradeAdjustment $adjustment): bool
    {
        try {
            DB::beginTransaction();

            $attempt = ExamAttempt::where('exam_id', $adjustment->exam_id)
                ->where('student_id', $adjustment->applied_to)
                ->where('status', ExamAttempt::STATUS_COMPLETED)
                ->first();

            if (!$attempt) {
                throw new \Exception('Student attempt not found');
            }

            // Revert to original grade
            $attempt->update(['score' => $adjustment->before_value]);

            // Mark adjustment as reverted
            $adjustment->update([
                'adjustment_data' => array_merge($adjustment->adjustment_data ?? [], [
                    'reverted_at' => now(),
                    'reverted_by' => auth()->id()
                ])
            ]);

            Log::info('Grade adjustment reverted', [
                'adjustment_id' => $adjustment->id,
                'exam_id' => $adjustment->exam_id,
                'student_id' => $adjustment->applied_to,
                'reverted_by' => auth()->id()
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to revert grade adjustment', [
                'adjustment_id' => $adjustment->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get students eligible for grade adjustment
     */
    public function getEligibleStudents(Exam $exam, $teacherId = null)
    {
        $query = $exam->attempts()
            ->where('status', ExamAttempt::STATUS_COMPLETED)
            ->with(['student']);

        // If teacher ID provided, filter by teacher's subjects
        if ($teacherId) {
            $query->whereHas('exam.examSubjects', function ($q) use ($teacherId) {
                $q->where('teacher_id', $teacherId);
            });
        }

        return $query->get();
    }

    /**
     * Bulk apply grade adjustments
     */
    public function bulkApplyAdjustments(Exam $exam, array $adjustments, $userId, $role): array
    {
        $results = [
            'success' => [],
            'failed' => []
        ];

        foreach ($adjustments as $adjustment) {
            $success = false;

            switch ($adjustment['type']) {
                case 'percent':
                    $result = $this->applyPercentageAdjustment(
                        $exam,
                        $adjustment['value'],
                        $userId,
                        $role,
                        $adjustment['note'] ?? null
                    );
                    $success = !empty($result['success']);
                    break;

                case 'minimum':
                    $result = $this->applyMinimumGradeAdjustment(
                        $exam,
                        $adjustment['value'],
                        $userId,
                        $role,
                        $adjustment['note'] ?? null
                    );
                    $success = !empty($result['success']);
                    break;

                case 'manual':
                    $success = $this->applyManualGradeAdjustment(
                        $exam,
                        $adjustment['student_id'],
                        $adjustment['value'],
                        $userId,
                        $role,
                        $adjustment['note'] ?? null
                    );
                    break;
            }

            if ($success) {
                $results['success'][] = $adjustment;
            } else {
                $results['failed'][] = $adjustment;
            }
        }

        return $results;
    }
}
