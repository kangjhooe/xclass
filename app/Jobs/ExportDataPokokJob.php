<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InstitutionExport;
use App\Exports\TeacherExport;
use App\Exports\StudentExport;
use App\Exports\StaffExport;
use App\Exports\ClassRoomExport;
use App\Models\Tenant\Institution;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;
use App\Models\Tenant\Staff;
use App\Models\Tenant\ClassRoom;
use App\Core\Services\TenantService;

/**
 * Export Data Pokok Job
 * 
 * Handles large export operations in background
 */
class ExportDataPokokJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $type;
    protected int $tenantId;
    protected string $userId;
    protected array $filters;

    /**
     * Create a new job instance
     */
    public function __construct(string $type, int $tenantId, string $userId, array $filters = [])
    {
        $this->type = $type;
        $this->tenantId = $tenantId;
        $this->userId = $userId;
        $this->filters = $filters;
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

            $filename = $this->generateFilename();
            $filepath = "exports/data-pokok/{$filename}";

            switch ($this->type) {
                case 'institutions':
                    $this->exportInstitutions($filepath);
                    break;
                case 'teachers':
                    $this->exportTeachers($filepath);
                    break;
                case 'students':
                    $this->exportStudents($filepath);
                    break;
                case 'staff':
                    $this->exportStaff($filepath);
                    break;
                case 'classes':
                    $this->exportClasses($filepath);
                    break;
                case 'all':
                    $this->exportAll($filepath);
                    break;
                default:
                    throw new \Exception("Unknown export type: {$this->type}");
            }

            // Store export info in database or cache
            $this->storeExportInfo($filename, $filepath);

            // Send notification to user
            $this->notifyUser($filename, $filepath);

        } catch (\Exception $e) {
            \Log::error("Export failed: " . $e->getMessage());
            $this->notifyUserError($e->getMessage());
        }
    }

    /**
     * Export institutions
     */
    protected function exportInstitutions(string $filepath)
    {
        $institutions = Institution::where('instansi_id', $this->tenantId)
            ->when(isset($this->filters['type']), function ($query) {
                $query->where('type', $this->filters['type']);
            })
            ->when(isset($this->filters['accreditation_status']), function ($query) {
                $query->where('accreditation_status', $this->filters['accreditation_status']);
            })
            ->get();

        Excel::store(new InstitutionExport($institutions), $filepath, 'public');
    }

    /**
     * Export teachers
     */
    protected function exportTeachers(string $filepath)
    {
        $teachers = Teacher::where('instansi_id', $this->tenantId)
            ->when(isset($this->filters['subject']), function ($query) {
                $query->where('subject', $this->filters['subject']);
            })
            ->when(isset($this->filters['employment_status']), function ($query) {
                $query->where('employment_status', $this->filters['employment_status']);
            })
            ->get();

        Excel::store(new TeacherExport($teachers), $filepath, 'public');
    }

    /**
     * Export students
     */
    protected function exportStudents(string $filepath)
    {
        $students = Student::with('class')
            ->where('instansi_id', $this->tenantId)
            ->when(isset($this->filters['class_id']), function ($query) {
                $query->where('class_id', $this->filters['class_id']);
            })
            ->when(isset($this->filters['status']), function ($query) {
                $query->where('status', $this->filters['status']);
            })
            ->get();

        Excel::store(new StudentExport($students), $filepath, 'public');
    }

    /**
     * Export staff
     */
    protected function exportStaff(string $filepath)
    {
        $staff = Staff::where('instansi_id', $this->tenantId)
            ->when(isset($this->filters['position']), function ($query) {
                $query->where('position', $this->filters['position']);
            })
            ->when(isset($this->filters['department']), function ($query) {
                $query->where('department', $this->filters['department']);
            })
            ->get();

        Excel::store(new StaffExport($staff), $filepath, 'public');
    }

    /**
     * Export classes
     */
    protected function exportClasses(string $filepath)
    {
        $classes = ClassRoom::with(['teacher', 'students'])
            ->where('instansi_id', $this->tenantId)
            ->when(isset($this->filters['level']), function ($query) {
                $query->where('level', $this->filters['level']);
            })
            ->when(isset($this->filters['type']), function ($query) {
                $query->where('type', $this->filters['type']);
            })
            ->get();

        Excel::store(new ClassRoomExport($classes), $filepath, 'public');
    }

    /**
     * Export all data
     */
    protected function exportAll(string $filepath)
    {
        // Create multiple sheets in one file
        $institutions = Institution::where('instansi_id', $this->tenantId)->get();
        $teachers = Teacher::where('instansi_id', $this->tenantId)->get();
        $students = Student::with('class')->where('instansi_id', $this->tenantId)->get();
        $staff = Staff::where('instansi_id', $this->tenantId)->get();
        $classes = ClassRoom::with(['teacher', 'students'])->where('instansi_id', $this->tenantId)->get();

        Excel::store([
            'Lembaga' => new InstitutionExport($institutions),
            'Guru' => new TeacherExport($teachers),
            'Siswa' => new StudentExport($students),
            'Staf' => new StaffExport($staff),
            'Kelas' => new ClassRoomExport($classes),
        ], $filepath, 'public');
    }

    /**
     * Generate filename
     */
    protected function generateFilename(): string
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        return "data-pokok-{$this->type}-{$timestamp}.xlsx";
    }

    /**
     * Store export information
     */
    protected function storeExportInfo(string $filename, string $filepath)
    {
        // Store in cache or database
        cache()->put("export_{$this->userId}_{$filename}", [
            'filename' => $filename,
            'filepath' => $filepath,
            'type' => $this->type,
            'tenant_id' => $this->tenantId,
            'created_at' => now(),
            'status' => 'completed',
        ], now()->addHours(24));
    }

    /**
     * Notify user of successful export
     */
    protected function notifyUser(string $filename, string $filepath)
    {
        // Send notification or email
        $user = \App\Models\User::find($this->userId);
        
        if ($user) {
            // You can implement notification system here
            \Log::info("Export completed for user {$user->name}: {$filename}");
        }
    }

    /**
     * Notify user of export error
     */
    protected function notifyUserError(string $error)
    {
        $user = \App\Models\User::find($this->userId);
        
        if ($user) {
            \Log::error("Export failed for user {$user->name}: {$error}");
        }
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception)
    {
        \Log::error("Export job failed: " . $exception->getMessage());
        $this->notifyUserError($exception->getMessage());
    }
}