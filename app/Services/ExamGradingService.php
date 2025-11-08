<?php

namespace App\Services;

use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamAttempt;
use App\Models\Tenant\ExamAnswer;
use App\Models\Tenant\ExamQuestion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExamGradingService
{
    /**
     * Grade an exam attempt automatically
     */
    public function gradeAttempt(ExamAttempt $attempt): array
    {
        try {
            DB::beginTransaction();
            
            $exam = $attempt->exam;
            $answers = $attempt->answers()->with('question')->get();
            
            $totalScore = 0;
            $correctAnswers = 0;
            $gradingResults = [];
            
            foreach ($answers as $answer) {
                $question = $answer->question;
                $gradingResult = $this->gradeAnswer($answer, $question);
                
                $gradingResults[] = $gradingResult;
                
                if ($gradingResult['is_correct']) {
                    $totalScore += $question->points;
                    $correctAnswers++;
                }
                
                // Update answer record
                $answer->update([
                    'is_correct' => $gradingResult['is_correct'],
                    'points' => $gradingResult['points'],
                    'grading_data' => $gradingResult['grading_data'] ?? null
                ]);
            }
            
            // Calculate percentage score
            $percentageScore = $exam->total_score > 0 ? 
                round(($totalScore / $exam->total_score) * 100, 2) : 0;
            
            // Determine pass/fail status
            $isPassed = $percentageScore >= $exam->passing_score;
            
            // Update attempt
            $attempt->update([
                'score' => $totalScore,
                'correct_answers' => $correctAnswers,
                'status' => ExamAttempt::STATUS_COMPLETED,
                'submitted_at' => now(),
                'grading_data' => [
                    'percentage_score' => $percentageScore,
                    'is_passed' => $isPassed,
                    'grading_method' => 'automatic',
                    'graded_at' => now()->toISOString()
                ]
            ]);
            
            DB::commit();
            
            return [
                'success' => true,
                'total_score' => $totalScore,
                'percentage_score' => $percentageScore,
                'correct_answers' => $correctAnswers,
                'total_questions' => $answers->count(),
                'is_passed' => $isPassed,
                'grading_results' => $gradingResults
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error grading exam attempt: ' . $e->getMessage(), [
                'attempt_id' => $attempt->id,
                'exam_id' => $attempt->exam_id,
                'error' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Grade a single answer
     */
    public function gradeAnswer(ExamAnswer $answer, ExamQuestion $question): array
    {
        $studentAnswer = $answer->answer;
        $correctAnswer = $question->correct_answer;
        $points = $question->points;
        
        $result = [
            'question_id' => $question->id,
            'question_type' => $question->question_type,
            'student_answer' => $studentAnswer,
            'correct_answer' => $correctAnswer,
            'points' => 0,
            'is_correct' => false,
            'grading_data' => []
        ];
        
        switch ($question->question_type) {
            case 'multiple_choice':
                $result = $this->gradeMultipleChoice($studentAnswer, $correctAnswer, $points, $result);
                break;
                
            case 'true_false':
                $result = $this->gradeTrueFalse($studentAnswer, $correctAnswer, $points, $result);
                break;
                
            case 'fill_blank':
                $result = $this->gradeFillBlank($studentAnswer, $correctAnswer, $points, $result);
                break;
                
            case 'essay':
                $result = $this->gradeEssay($studentAnswer, $correctAnswer, $points, $result);
                break;
                
            case 'matching':
                $result = $this->gradeMatching($studentAnswer, $correctAnswer, $points, $result);
                break;
                
            default:
                $result['grading_data']['error'] = 'Unknown question type';
                break;
        }
        
        return $result;
    }
    
    /**
     * Grade multiple choice question
     */
    private function gradeMultipleChoice(string $studentAnswer, $correctAnswer, int $points, array $result): array
    {
        $isCorrect = strtolower(trim($studentAnswer)) === strtolower(trim($correctAnswer));
        
        $result['is_correct'] = $isCorrect;
        $result['points'] = $isCorrect ? $points : 0;
        $result['grading_data'] = [
            'method' => 'exact_match',
            'case_sensitive' => false,
            'trimmed' => true
        ];
        
        return $result;
    }
    
    /**
     * Grade true/false question
     */
    private function gradeTrueFalse(string $studentAnswer, $correctAnswer, int $points, array $result): array
    {
        $studentBool = filter_var($studentAnswer, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        $correctBool = filter_var($correctAnswer, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        
        $isCorrect = $studentBool === $correctBool;
        
        $result['is_correct'] = $isCorrect;
        $result['points'] = $isCorrect ? $points : 0;
        $result['grading_data'] = [
            'method' => 'boolean_comparison',
            'student_boolean' => $studentBool,
            'correct_boolean' => $correctBool
        ];
        
        return $result;
    }
    
    /**
     * Grade fill in the blank question
     */
    private function gradeFillBlank(string $studentAnswer, $correctAnswer, int $points, array $result): array
    {
        // Normalize answers for comparison
        $studentNormalized = $this->normalizeAnswer($studentAnswer);
        $correctNormalized = $this->normalizeAnswer($correctAnswer);
        
        $isCorrect = $studentNormalized === $correctNormalized;
        
        $result['is_correct'] = $isCorrect;
        $result['points'] = $isCorrect ? $points : 0;
        $result['grading_data'] = [
            'method' => 'normalized_comparison',
            'student_normalized' => $studentNormalized,
            'correct_normalized' => $correctNormalized
        ];
        
        return $result;
    }
    
    /**
     * Grade essay question (manual grading required)
     */
    private function gradeEssay(string $studentAnswer, $correctAnswer, int $points, array $result): array
    {
        // Essay questions require manual grading
        $result['is_correct'] = false; // Will be updated by manual grading
        $result['points'] = 0;
        $result['grading_data'] = [
            'method' => 'manual_grading_required',
            'word_count' => str_word_count($studentAnswer),
            'character_count' => strlen($studentAnswer),
            'requires_manual_review' => true
        ];
        
        return $result;
    }
    
    /**
     * Grade matching question
     */
    private function gradeMatching(string $studentAnswer, $correctAnswer, int $points, array $result): array
    {
        // Parse student answer (format: A1-B2, A2-B1, etc.)
        $studentPairs = $this->parseMatchingAnswer($studentAnswer);
        $correctPairs = $this->parseMatchingAnswer($correctAnswer);
        
        $correctCount = 0;
        $totalPairs = count($correctPairs);
        
        foreach ($studentPairs as $studentPair) {
            if (in_array($studentPair, $correctPairs)) {
                $correctCount++;
            }
        }
        
        $isCorrect = $correctCount === $totalPairs && count($studentPairs) === $totalPairs;
        $partialPoints = $totalPairs > 0 ? round(($correctCount / $totalPairs) * $points) : 0;
        
        $result['is_correct'] = $isCorrect;
        $result['points'] = $isCorrect ? $points : $partialPoints;
        $result['grading_data'] = [
            'method' => 'matching_pairs',
            'correct_pairs' => $correctCount,
            'total_pairs' => $totalPairs,
            'student_pairs' => $studentPairs,
            'correct_pairs_list' => $correctPairs
        ];
        
        return $result;
    }
    
    /**
     * Normalize answer for comparison
     */
    private function normalizeAnswer(string $answer): string
    {
        return strtolower(trim(preg_replace('/\s+/', ' ', $answer)));
    }
    
    /**
     * Parse matching answer string
     */
    private function parseMatchingAnswer(string $answer): array
    {
        $pairs = [];
        $matches = preg_split('/,\s*/', $answer);
        
        foreach ($matches as $match) {
            $match = trim($match);
            if (preg_match('/^([A-Z]\d+)-([A-Z]\d+)$/', $match, $parts)) {
                $pairs[] = $parts[1] . '-' . $parts[2];
            }
        }
        
        return $pairs;
    }
    
    /**
     * Manual grading for essay questions
     */
    public function manualGradeEssay(ExamAnswer $answer, int $points, string $feedback = null): array
    {
        try {
            $question = $answer->question;
            $maxPoints = $question->points;
            
            // Validate points
            if ($points < 0 || $points > $maxPoints) {
                throw new \InvalidArgumentException("Points must be between 0 and {$maxPoints}");
            }
            
            $isCorrect = $points > 0;
            
            $answer->update([
                'is_correct' => $isCorrect,
                'points' => $points,
                'grading_data' => array_merge($answer->grading_data ?? [], [
                    'manual_grading' => true,
                    'graded_by' => auth()->id(),
                    'graded_at' => now()->toISOString(),
                    'feedback' => $feedback,
                    'max_points' => $maxPoints
                ])
            ]);
            
            // Recalculate attempt score
            $this->recalculateAttemptScore($answer->attempt);
            
            return [
                'success' => true,
                'points' => $points,
                'is_correct' => $isCorrect,
                'feedback' => $feedback
            ];
            
        } catch (\Exception $e) {
            Log::error('Error in manual grading: ' . $e->getMessage(), [
                'answer_id' => $answer->id,
                'points' => $points,
                'error' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Recalculate attempt score after manual grading
     */
    public function recalculateAttemptScore(ExamAttempt $attempt): array
    {
        try {
            $answers = $attempt->answers;
            $totalScore = $answers->sum('points');
            $correctAnswers = $answers->where('is_correct', true)->count();
            
            $exam = $attempt->exam;
            $percentageScore = $exam->total_score > 0 ? 
                round(($totalScore / $exam->total_score) * 100, 2) : 0;
            
            $isPassed = $percentageScore >= $exam->passing_score;
            
            $attempt->update([
                'score' => $totalScore,
                'correct_answers' => $correctAnswers,
                'grading_data' => array_merge($attempt->grading_data ?? [], [
                    'percentage_score' => $percentageScore,
                    'is_passed' => $isPassed,
                    'recalculated_at' => now()->toISOString()
                ])
            ]);
            
            return [
                'success' => true,
                'total_score' => $totalScore,
                'percentage_score' => $percentageScore,
                'correct_answers' => $correctAnswers,
                'is_passed' => $isPassed
            ];
            
        } catch (\Exception $e) {
            Log::error('Error recalculating attempt score: ' . $e->getMessage(), [
                'attempt_id' => $attempt->id,
                'error' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get grading statistics for an exam
     */
    public function getGradingStatistics(Exam $exam): array
    {
        $attempts = $exam->attempts()->where('status', ExamAttempt::STATUS_COMPLETED)->get();
        
        if ($attempts->isEmpty()) {
            return [
                'total_attempts' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
                'question_statistics' => []
            ];
        }
        
        $scores = $attempts->pluck('score')->toArray();
        $passedAttempts = $attempts->where('grading_data.is_passed', true)->count();
        
        // Question statistics
        $questionStats = [];
        $questions = $exam->questions;
        
        foreach ($questions as $question) {
            $questionAnswers = ExamAnswer::where('question_id', $question->id)
                ->whereIn('attempt_id', $attempts->pluck('id'))
                ->get();
            
            $correctCount = $questionAnswers->where('is_correct', true)->count();
            $totalCount = $questionAnswers->count();
            $difficultyLevel = $totalCount > 0 ? round((1 - ($correctCount / $totalCount)) * 100, 2) : 0;
            
            $questionStats[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'points' => $question->points,
                'correct_count' => $correctCount,
                'total_count' => $totalCount,
                'difficulty_level' => $difficultyLevel,
                'correct_rate' => $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 2) : 0
            ];
        }
        
        return [
            'total_attempts' => $attempts->count(),
            'average_score' => round(array_sum($scores) / count($scores), 2),
            'highest_score' => max($scores),
            'lowest_score' => min($scores),
            'pass_rate' => round(($passedAttempts / $attempts->count()) * 100, 2),
            'question_statistics' => $questionStats
        ];
    }
}
