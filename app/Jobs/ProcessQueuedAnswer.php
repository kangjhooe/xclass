<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\ExamAutoSaveService;
use Illuminate\Support\Facades\Log;

class ProcessQueuedAnswer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $attemptId;
    protected $questionId;
    protected $answer;
    protected $isAutoSave;
    protected $retryCount;
    protected $maxRetries;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct($attemptId, $questionId, $answer, $isAutoSave = true, $retryCount = 0, $maxRetries = 3)
    {
        $this->attemptId = $attemptId;
        $this->questionId = $questionId;
        $this->answer = $answer;
        $this->isAutoSave = $isAutoSave;
        $this->retryCount = $retryCount;
        $this->maxRetries = $maxRetries;
    }

    /**
     * Execute the job.
     */
    public function handle(ExamAutoSaveService $autoSaveService)
    {
        try {
            $result = $autoSaveService->performSave(
                $this->attemptId,
                $this->questionId,
                $this->answer,
                $this->isAutoSave
            );

            if ($result['success']) {
                Log::info('Successfully processed queued answer', [
                    'attempt_id' => $this->attemptId,
                    'question_id' => $this->questionId,
                    'retry_count' => $this->retryCount
                ]);
            } else {
                throw new \Exception('Save operation failed');
            }

        } catch (\Exception $e) {
            Log::error('Failed to process queued answer', [
                'attempt_id' => $this->attemptId,
                'question_id' => $this->questionId,
                'retry_count' => $this->retryCount,
                'error' => $e->getMessage()
            ]);

            // Retry if we haven't exceeded max retries
            if ($this->retryCount < $this->maxRetries) {
                $this->retryCount++;
                
                // Dispatch with exponential backoff
                $delay = pow(2, $this->retryCount) * 60; // 2, 4, 8 minutes
                
                ProcessQueuedAnswer::dispatch(
                    $this->attemptId,
                    $this->questionId,
                    $this->answer,
                    $this->isAutoSave,
                    $this->retryCount,
                    $this->maxRetries
                )->delay(now()->addSeconds($delay));
            } else {
                Log::error('Max retries exceeded for queued answer', [
                    'attempt_id' => $this->attemptId,
                    'question_id' => $this->questionId,
                    'max_retries' => $this->maxRetries
                ]);
            }

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception)
    {
        Log::error('Job failed permanently', [
            'attempt_id' => $this->attemptId,
            'question_id' => $this->questionId,
            'retry_count' => $this->retryCount,
            'error' => $exception->getMessage()
        ]);

        // Store failed answer for manual recovery
        $this->storeFailedAnswer($exception);
    }

    /**
     * Store failed answer for manual recovery
     */
    protected function storeFailedAnswer(\Throwable $exception)
    {
        $failedAnswer = [
            'attempt_id' => $this->attemptId,
            'question_id' => $this->questionId,
            'answer' => $this->answer,
            'is_auto_save' => $this->isAutoSave,
            'failed_at' => now()->toISOString(),
            'error' => $exception->getMessage(),
            'retry_count' => $this->retryCount
        ];

        // Store in cache for manual recovery
        $cacheKey = "failed_answer_{$this->attemptId}_{$this->questionId}";
        \Illuminate\Support\Facades\Cache::put($cacheKey, $failedAnswer, 86400); // 24 hours
    }
}