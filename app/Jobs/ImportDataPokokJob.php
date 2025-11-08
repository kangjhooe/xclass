<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\TeacherImport;
use App\Imports\StudentImport;
use App\Imports\StaffImport;
use App\Services\Tenant\TeacherService;
use App\Services\Tenant\StudentService;
use App\Services\Tenant\StaffService;
use App\Core\Services\TenantService;

/**
 * Import Data Pokok Job
 * 
 * Handles large import operations in background
 */
class ImportDataPokokJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $type;
    protected string $filepath;
    protected int $tenantId;
    protected string $userId;

    /**
     * Create a new job instance
     */
    public function __construct(string $type, string $filepath, int $tenantId, string $userId)
    {
        $this->type = $type;
        $this->filepath = $filepath;
        $this->tenantId = $tenantId;
        $this->userId = $userId;
    }

    /**
     * Execute the job
     */
    public function handle()
    {
        try {
            // Set tenant context
            $tenant = \App\Models\Core\Tenant::find($this->tenantId);
            app(TenantService::class)->setCurrentTenant($tenant);

            $results = [];

            switch ($this->type) {
                case 'teachers':
                    $results = $this->importTeachers();
                    break;
                case 'students':
                    $results = $this->importStudents();
                    break;
                case 'staff':
                    $results = $this->importStaff();
                    break;
                default:
                    throw new \Exception("Unknown import type: {$this->type}");
            }

            // Store import results
            $this->storeImportResults($results);

            // Send notification to user
            $this->notifyUser($results);

            // Clean up uploaded file
            $this->cleanupFile();

        } catch (\Exception $e) {
            \Log::error("Import failed: " . $e->getMessage());
            $this->notifyUserError($e->getMessage());
        }
    }

    /**
     * Import teachers
     */
    protected function importTeachers(): array
    {
        $teacherService = app(TeacherService::class);
        $import = new TeacherImport($teacherService);
        
        Excel::import($import, $this->filepath, 'public');
        
        return $import->getResults();
    }

    /**
     * Import students
     */
    protected function importStudents(): array
    {
        $studentService = app(StudentService::class);
        $import = new StudentImport($studentService);
        
        Excel::import($import, $this->filepath, 'public');
        
        return $import->getResults();
    }

    /**
     * Import staff
     */
    protected function importStaff(): array
    {
        $staffService = app(StaffService::class);
        $import = new StaffImport($staffService);
        
        Excel::import($import, $this->filepath, 'public');
        
        return $import->getResults();
    }

    /**
     * Store import results
     */
    protected function storeImportResults(array $results)
    {
        $filename = basename($this->filepath);
        
        cache()->put("import_{$this->userId}_{$filename}", [
            'filename' => $filename,
            'type' => $this->type,
            'tenant_id' => $this->tenantId,
            'success_count' => $results['success_count'],
            'error_count' => $results['error_count'],
            'errors' => $results['errors'],
            'created_at' => now(),
            'status' => 'completed',
        ], now()->addHours(24));
    }

    /**
     * Notify user of import results
     */
    protected function notifyUser(array $results)
    {
        $user = \App\Models\User::find($this->userId);
        
        if ($user) {
            $message = "Import {$this->type} selesai. Berhasil: {$results['success_count']}, Error: {$results['error_count']}";
            \Log::info("Import completed for user {$user->name}: {$message}");
        }
    }

    /**
     * Notify user of import error
     */
    protected function notifyUserError(string $error)
    {
        $user = \App\Models\User::find($this->userId);
        
        if ($user) {
            \Log::error("Import failed for user {$user->name}: {$error}");
        }
    }

    /**
     * Clean up uploaded file
     */
    protected function cleanupFile()
    {
        if (Storage::disk('public')->exists($this->filepath)) {
            Storage::disk('public')->delete($this->filepath);
        }
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception)
    {
        \Log::error("Import job failed: " . $exception->getMessage());
        $this->notifyUserError($exception->getMessage());
        $this->cleanupFile();
    }
}