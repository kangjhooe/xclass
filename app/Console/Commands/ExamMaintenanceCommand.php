<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExamAutoSaveService;
use App\Services\StudentActivityService;
use App\Models\Tenant\ExamAttempt;
use App\Models\Tenant\ExamAnswer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExamMaintenanceCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'exam:maintenance 
                            {--clean-queued : Clean old queued answers}
                            {--clean-logs : Clean old activity logs}
                            {--process-queue : Process queued answers}
                            {--optimize : Optimize database tables}
                            {--all : Run all maintenance tasks}';

    /**
     * The console command description.
     */
    protected $description = 'Perform maintenance tasks for the exam system';

    protected $autoSaveService;
    protected $activityService;

    public function __construct(ExamAutoSaveService $autoSaveService, StudentActivityService $activityService)
    {
        parent::__construct();
        $this->autoSaveService = $autoSaveService;
        $this->activityService = $activityService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting exam system maintenance...');

        $tasks = [];

        if ($this->option('all') || $this->option('clean-queued')) {
            $tasks[] = 'clean-queued';
        }

        if ($this->option('all') || $this->option('clean-logs')) {
            $tasks[] = 'clean-logs';
        }

        if ($this->option('all') || $this->option('process-queue')) {
            $tasks[] = 'process-queue';
        }

        if ($this->option('all') || $this->option('optimize')) {
            $tasks[] = 'optimize';
        }

        if (empty($tasks)) {
            $this->error('No tasks specified. Use --help to see available options.');
            return 1;
        }

        foreach ($tasks as $task) {
            $this->runTask($task);
        }

        $this->info('Maintenance completed successfully!');
        return 0;
    }

    protected function runTask($task)
    {
        switch ($task) {
            case 'clean-queued':
                $this->cleanQueuedAnswers();
                break;
            case 'clean-logs':
                $this->cleanActivityLogs();
                break;
            case 'process-queue':
                $this->processQueuedAnswers();
                break;
            case 'optimize':
                $this->optimizeDatabase();
                break;
        }
    }

    protected function cleanQueuedAnswers()
    {
        $this->info('Cleaning old queued answers...');
        
        $cleaned = $this->autoSaveService->cleanupOldQueuedAnswers(24);
        
        $this->info("Cleaned {$cleaned} old queued answers.");
        
        Log::info('Cleaned old queued answers', ['count' => $cleaned]);
    }

    protected function cleanActivityLogs()
    {
        $this->info('Cleaning old activity logs...');
        
        $cleaned = $this->activityService->cleanOldLogs(90);
        
        $this->info("Cleaned {$cleaned} old activity logs.");
        
        Log::info('Cleaned old activity logs', ['count' => $cleaned]);
    }

    protected function processQueuedAnswers()
    {
        $this->info('Processing queued answers...');
        
        $result = $this->autoSaveService->processQueuedAnswers();
        
        $this->info("Processed {$result['processed']} queued answers, {$result['failed']} failed.");
        
        Log::info('Processed queued answers', $result);
    }

    protected function optimizeDatabase()
    {
        $this->info('Optimizing database tables...');
        
        try {
            // Whitelist of allowed table names to prevent SQL injection
            $allowedTables = [
                'exam_attempts',
                'exam_answers',
                'exam_questions',
                'exams',
                'student_activity_logs'
            ];

            // Validate and optimize each table
            foreach ($allowedTables as $table) {
                // Additional validation: ensure table name contains only alphanumeric and underscores
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
                    $this->warn("Skipping invalid table name: {$table}");
                    continue;
                }

                // Use parameter binding for safety
                DB::statement("OPTIMIZE TABLE `{$table}`");
                $this->line("Optimized table: {$table}");
            }

            // Update table statistics with proper escaping
            $escapedTables = array_map(function($table) {
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
                    return null;
                }
                return "`{$table}`";
            }, $allowedTables);

            $escapedTables = array_filter($escapedTables);
            if (!empty($escapedTables)) {
                DB::statement("ANALYZE TABLE " . implode(', ', $escapedTables));
            }
            
            $this->info('Database optimization completed.');
            
            Log::info('Database optimization completed', ['tables' => $allowedTables]);
            
        } catch (\Exception $e) {
            $this->error("Database optimization failed: " . $e->getMessage());
            Log::error('Database optimization failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get system statistics
     */
    public function getSystemStatistics()
    {
        $stats = [
            'total_exams' => DB::table('exams')->count(),
            'total_attempts' => DB::table('exam_attempts')->count(),
            'total_answers' => DB::table('exam_answers')->count(),
            'total_activity_logs' => DB::table('student_activity_logs')->count(),
            'queued_answers' => count(\Illuminate\Support\Facades\Cache::getRedis()->keys("queued_answer_*")),
            'failed_answers' => count(\Illuminate\Support\Facades\Cache::getRedis()->keys("failed_answer_*")),
        ];

        return $stats;
    }

    /**
     * Display system statistics
     */
    public function displayStatistics()
    {
        $stats = $this->getSystemStatistics();
        
        $this->info('System Statistics:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Exams', $stats['total_exams']],
                ['Total Attempts', $stats['total_attempts']],
                ['Total Answers', $stats['total_answers']],
                ['Activity Logs', $stats['total_activity_logs']],
                ['Queued Answers', $stats['queued_answers']],
                ['Failed Answers', $stats['failed_answers']],
            ]
        );
    }
}