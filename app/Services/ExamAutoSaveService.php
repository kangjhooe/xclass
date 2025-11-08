<?php

namespace App\Services;

use App\Models\Tenant\ExamAnswer;
use App\Models\Tenant\ExamAttempt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

class ExamAutoSaveService
{
    protected $retryAttempts = 3;
    protected $retryDelay = 1000; // milliseconds
    protected $batchSize = 10;
    protected $cacheTimeout = 300; // 5 minutes

    /**
     * Save answer with retry mechanism
     */
    public function saveAnswer($attemptId, $questionId, $answer, $isAutoSave = true)
    {
        $cacheKey = "exam_answer_{$attemptId}_{$questionId}";
        
        // Check if answer is already being processed
        if (Cache::has($cacheKey . '_processing')) {
            return $this->queueAnswer($attemptId, $questionId, $answer, $isAutoSave);
        }

        // Mark as processing
        Cache::put($cacheKey . '_processing', true, 30);

        try {
            $result = $this->performSave($attemptId, $questionId, $answer, $isAutoSave);
            
            // Clear processing flag
            Cache::forget($cacheKey . '_processing');
            
            return $result;
            
        } catch (\Exception $e) {
            // Clear processing flag
            Cache::forget($cacheKey . '_processing');
            
            Log::error('Auto-save failed, queuing for retry', [
                'attempt_id' => $attemptId,
                'question_id' => $questionId,
                'error' => $e->getMessage()
            ]);
            
            return $this->queueAnswer($attemptId, $questionId, $answer, $isAutoSave);
        }
    }

    /**
     * Perform the actual save operation
     */
    protected function performSave($attemptId, $questionId, $answer, $isAutoSave)
    {
        DB::beginTransaction();
        
        try {
            $examAnswer = ExamAnswer::updateOrCreate(
                [
                    'attempt_id' => $attemptId,
                    'question_id' => $questionId,
                ],
                [
                    'instansi_id' => tenant('id'),
                    'student_id' => auth()->id(),
                    'answer' => $answer,
                    'is_auto_saved' => $isAutoSave,
                    'answered_at' => now(),
                    'metadata' => [
                        'auto_save_timestamp' => now()->toISOString(),
                        'connection_stable' => $this->checkConnectionStability(),
                    ]
                ]
            );

            // Update attempt's last activity
            ExamAttempt::where('id', $attemptId)->update([
                'updated_at' => now()
            ]);

            DB::commit();

            return [
                'success' => true,
                'answer_id' => $examAnswer->id,
                'timestamp' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Queue answer for retry
     */
    protected function queueAnswer($attemptId, $questionId, $answer, $isAutoSave)
    {
        $queueData = [
            'attempt_id' => $attemptId,
            'question_id' => $questionId,
            'answer' => $answer,
            'is_auto_save' => $isAutoSave,
            'retry_count' => 0,
            'max_retries' => $this->retryAttempts
        ];

        // Store in cache for immediate retry
        $cacheKey = "queued_answer_{$attemptId}_{$questionId}";
        Cache::put($cacheKey, $queueData, $this->cacheTimeout);

        // Also queue for background processing
        Queue::push(\App\Jobs\ProcessQueuedAnswer::class, $queueData);

        return [
            'success' => false,
            'queued' => true,
            'message' => 'Answer queued for retry due to connection issues'
        ];
    }

    /**
     * Process queued answers
     */
    public function processQueuedAnswers($attemptId = null)
    {
        $pattern = $attemptId ? "queued_answer_{$attemptId}_*" : "queued_answer_*";
        $keys = Cache::getRedis()->keys($pattern);
        
        $processed = 0;
        $failed = 0;

        foreach ($keys as $key) {
            $data = Cache::get($key);
            
            if (!$data) continue;

            try {
                $result = $this->performSave(
                    $data['attempt_id'],
                    $data['question_id'],
                    $data['answer'],
                    $data['is_auto_save']
                );

                if ($result['success']) {
                    Cache::forget($key);
                    $processed++;
                } else {
                    $failed++;
                }

            } catch (\Exception $e) {
                Log::error('Failed to process queued answer', [
                    'key' => $key,
                    'data' => $data,
                    'error' => $e->getMessage()
                ]);
                $failed++;
            }
        }

        return [
            'processed' => $processed,
            'failed' => $failed,
            'total' => count($keys)
        ];
    }

    /**
     * Batch save multiple answers
     */
    public function batchSaveAnswers($attemptId, $answers)
    {
        $results = [];
        $successCount = 0;
        $failureCount = 0;

        DB::beginTransaction();
        
        try {
            foreach ($answers as $questionId => $answer) {
                try {
                    $result = $this->performSave($attemptId, $questionId, $answer, true);
                    $results[$questionId] = $result;
                    $successCount++;
                } catch (\Exception $e) {
                    $results[$questionId] = [
                        'success' => false,
                        'error' => $e->getMessage()
                    ];
                    $failureCount++;
                }
            }

            DB::commit();

            return [
                'success' => true,
                'results' => $results,
                'success_count' => $successCount,
                'failure_count' => $failureCount
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'results' => $results
            ];
        }
    }

    /**
     * Get pending answers for an attempt
     */
    public function getPendingAnswers($attemptId)
    {
        $pattern = "queued_answer_{$attemptId}_*";
        $keys = Cache::getRedis()->keys($pattern);
        
        $pending = [];
        
        foreach ($keys as $key) {
            $data = Cache::get($key);
            if ($data) {
                $pending[] = $data;
            }
        }

        return $pending;
    }

    /**
     * Check connection stability
     */
    protected function checkConnectionStability()
    {
        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            $end = microtime(true);
            
            $responseTime = ($end - $start) * 1000; // Convert to milliseconds
            
            return $responseTime < 1000; // Consider stable if response time < 1 second
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get connection quality metrics
     */
    public function getConnectionMetrics()
    {
        $metrics = Cache::get('connection_metrics', [
            'response_times' => [],
            'error_count' => 0,
            'success_count' => 0,
            'last_check' => null
        ]);

        // Test current connection
        $start = microtime(true);
        try {
            DB::select('SELECT 1');
            $responseTime = (microtime(true) - $start) * 1000;
            
            $metrics['response_times'][] = $responseTime;
            $metrics['success_count']++;
            
            // Keep only last 10 response times
            if (count($metrics['response_times']) > 10) {
                $metrics['response_times'] = array_slice($metrics['response_times'], -10);
            }
            
        } catch (\Exception $e) {
            $metrics['error_count']++;
        }

        $metrics['last_check'] = now()->toISOString();
        $metrics['average_response_time'] = count($metrics['response_times']) > 0 
            ? array_sum($metrics['response_times']) / count($metrics['response_times'])
            : 0;
        $metrics['is_stable'] = $metrics['average_response_time'] < 1000 && $metrics['error_count'] < 3;

        Cache::put('connection_metrics', $metrics, 300);

        return $metrics;
    }

    /**
     * Optimize auto-save frequency based on connection quality
     */
    public function getOptimalSaveInterval()
    {
        $metrics = $this->getConnectionMetrics();
        
        if ($metrics['is_stable']) {
            return 30; // 30 seconds for stable connection
        } elseif ($metrics['average_response_time'] < 2000) {
            return 60; // 1 minute for moderate connection
        } else {
            return 120; // 2 minutes for poor connection
        }
    }

    /**
     * Clean up old queued answers
     */
    public function cleanupOldQueuedAnswers($hours = 24)
    {
        $cutoffTime = now()->subHours($hours);
        $pattern = "queued_answer_*";
        $keys = Cache::getRedis()->keys($pattern);
        
        $cleaned = 0;
        
        foreach ($keys as $key) {
            $data = Cache::get($key);
            
            if ($data && isset($data['created_at'])) {
                $createdAt = \Carbon\Carbon::parse($data['created_at']);
                
                if ($createdAt->lt($cutoffTime)) {
                    Cache::forget($key);
                    $cleaned++;
                }
            }
        }

        return $cleaned;
    }

    /**
     * Get auto-save statistics
     */
    public function getAutoSaveStatistics($attemptId = null)
    {
        $query = ExamAnswer::where('is_auto_saved', true);
        
        if ($attemptId) {
            $query->where('attempt_id', $attemptId);
        }

        $totalAutoSaves = $query->count();
        $recentAutoSaves = $query->where('answered_at', '>=', now()->subHour())->count();
        
        $queuedCount = $attemptId 
            ? count($this->getPendingAnswers($attemptId))
            : count(Cache::getRedis()->keys("queued_answer_*"));

        return [
            'total_auto_saves' => $totalAutoSaves,
            'recent_auto_saves' => $recentAutoSaves,
            'queued_answers' => $queuedCount,
            'connection_metrics' => $this->getConnectionMetrics(),
            'optimal_interval' => $this->getOptimalSaveInterval()
        ];
    }
}
