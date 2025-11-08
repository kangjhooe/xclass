<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Jobs\ExportDataPokokJob;
use App\Jobs\ImportDataPokokJob;
use App\Services\Tenant\InstitutionService;
use App\Services\Tenant\TeacherService;
use App\Services\Tenant\StudentService;
use App\Services\Tenant\StaffService;
use App\Services\Tenant\ClassRoomService;
use App\Exports\InstitutionExport;
use App\Exports\TeacherExport;
use App\Exports\StudentExport;
use App\Exports\StaffExport;
use App\Exports\ClassRoomExport;
use App\Imports\TeacherImport;
use App\Imports\StudentImport;
use App\Imports\StaffImport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

/**
 * Controller for Data Pokok Import/Export
 * 
 * Handles import and export operations for Data Pokok module
 */
class DataPokokImportExportController extends Controller
{
    protected InstitutionService $institutionService;
    protected TeacherService $teacherService;
    protected StudentService $studentService;
    protected StaffService $staffService;
    protected ClassRoomService $classRoomService;

    public function __construct(
        InstitutionService $institutionService,
        TeacherService $teacherService,
        StudentService $studentService,
        StaffService $staffService,
        ClassRoomService $classRoomService
    ) {
        $this->institutionService = $institutionService;
        $this->teacherService = $teacherService;
        $this->studentService = $studentService;
        $this->staffService = $staffService;
        $this->classRoomService = $classRoomService;
    }

    /**
     * Show import/export page
     */
    public function index()
    {
        return view('tenant.data-pokok.import-export.index');
    }

    /**
     * Export data to Excel
     */
    public function export(Request $request): Response
    {
        $request->validate([
            'type' => 'required|in:institutions,teachers,students,staff,classes,all',
            'format' => 'in:excel,pdf',
            'filters' => 'nullable|array',
        ]);

        $type = $request->get('type');
        $format = $request->get('format', 'excel');
        $filters = $request->get('filters', []);

        // For small datasets, export immediately
        if ($this->shouldExportImmediately($type)) {
            return $this->exportImmediately($type, $format, $filters);
        }

        // For large datasets, queue the job
        $this->queueExport($type, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Export sedang diproses. Anda akan mendapat notifikasi ketika selesai.',
            'queued' => true
        ]);
    }

    /**
     * Import data from Excel
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:teachers,students,staff',
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ]);

        $type = $request->get('type');
        $file = $request->file('file');

        // Store file temporarily
        $filepath = $file->store('imports', 'public');

        // Queue import job
        ImportDataPokokJob::dispatch(
            $type,
            $filepath,
            app(\App\Core\Services\TenantService::class)->getCurrentTenant()->id,
            Auth::id()
        );

        return response()->json([
            'success' => true,
            'message' => 'Import sedang diproses. Anda akan mendapat notifikasi ketika selesai.',
            'queued' => true
        ]);
    }

    /**
     * Download template for import
     */
    public function downloadTemplate(Request $request): Response
    {
        $request->validate([
            'type' => 'required|in:teachers,students,staff',
        ]);

        $type = $request->get('type');
        $filename = "template-{$type}.xlsx";

        // Create template based on type
        switch ($type) {
            case 'teachers':
                return $this->createTeacherTemplate($filename);
            case 'students':
                return $this->createStudentTemplate($filename);
            case 'staff':
                return $this->createStaffTemplate($filename);
            default:
                abort(404);
        }
    }

    /**
     * Get export status
     */
    public function exportStatus(Request $request): JsonResponse
    {
        $filename = $request->get('filename');
        $status = cache()->get("export_" . Auth::id() . "_{$filename}");

        if (!$status) {
            return response()->json([
                'success' => false,
                'message' => 'Export tidak ditemukan atau sudah expired'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $status
        ]);
    }

    /**
     * Download exported file
     */
    public function downloadExport(Request $request): Response
    {
        $filename = $request->get('filename');
        $filepath = "exports/data-pokok/{$filename}";

        if (!Storage::disk('public')->exists($filepath)) {
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('public')->download($filepath, $filename);
    }

    /**
     * Get import status
     */
    public function importStatus(Request $request): JsonResponse
    {
        $filename = $request->get('filename');
        $status = cache()->get("import_" . Auth::id() . "_{$filename}");

        if (!$status) {
            return response()->json([
                'success' => false,
                'message' => 'Import tidak ditemukan atau sudah expired'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $status
        ]);
    }

    /**
     * Check if export should be immediate
     */
    protected function shouldExportImmediately(string $type): bool
    {
        $counts = [
            'institutions' => $this->institutionService->getStatistics()['total'],
            'teachers' => $this->teacherService->getStatistics()['total'],
            'students' => $this->studentService->getStatistics()['total'],
            'staff' => $this->staffService->getStatistics()['total'],
            'classes' => $this->classRoomService->getStatistics()['total'],
        ];

        $threshold = 1000; // Export immediately if less than 1000 records

        if ($type === 'all') {
            return array_sum($counts) < $threshold;
        }

        return ($counts[$type] ?? 0) < $threshold;
    }

    /**
     * Export immediately for small datasets
     */
    protected function exportImmediately(string $type, string $format, array $filters): Response
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        $filename = "data-pokok-{$type}-" . now()->format('Y-m-d_H-i-s') . ".xlsx";

        switch ($type) {
            case 'institutions':
                $data = $this->institutionService->prepareExportData($filters);
                return Excel::download(new InstitutionExport($data), $filename);
            case 'teachers':
                $data = $this->teacherService->prepareExportData($filters);
                return Excel::download(new TeacherExport($data), $filename);
            case 'students':
                $data = $this->studentService->prepareExportData($filters);
                return Excel::download(new StudentExport($data), $filename);
            case 'staff':
                $data = $this->staffService->prepareExportData($filters);
                return Excel::download(new StaffExport($data), $filename);
            case 'classes':
                $data = $this->classRoomService->prepareExportData($filters);
                return Excel::download(new ClassRoomExport($data), $filename);
            case 'all':
                return $this->exportAllImmediately($filename);
            default:
                abort(404);
        }
    }

    /**
     * Export all data immediately
     */
    protected function exportAllImmediately(string $filename): Response
    {
        $institutions = $this->institutionService->prepareExportData([]);
        $teachers = $this->teacherService->prepareExportData([]);
        $students = $this->studentService->prepareExportData([]);
        $staff = $this->staffService->prepareExportData([]);
        $classes = $this->classRoomService->prepareExportData([]);

        return Excel::download([
            'Lembaga' => new InstitutionExport($institutions),
            'Guru' => new TeacherExport($teachers),
            'Siswa' => new StudentExport($students),
            'Staf' => new StaffExport($staff),
            'Kelas' => new ClassRoomExport($classes),
        ], $filename);
    }

    /**
     * Queue export job
     */
    protected function queueExport(string $type, array $filters): void
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        ExportDataPokokJob::dispatch(
            $type,
            $tenant->id,
            Auth::id(),
            $filters
        );
    }

    /**
     * Create teacher template
     */
    protected function createTeacherTemplate(string $filename): Response
    {
        $templateData = collect([
            [
                'nama' => 'Contoh Guru',
                'nuptk' => '1234567890123456',
                'nip' => '1965123123456789',
                'email' => 'guru@example.com',
                'telepon' => '08123456789',
                'alamat' => 'Jl. Contoh No. 123',
                'tanggal_lahir' => '1980-01-01',
                'tempat_lahir' => 'Jakarta',
                'jenis_kelamin' => 'L',
                'agama' => 'Islam',
                'mata_pelajaran' => 'Matematika',
                'pendidikan' => 'S1',
                'status_kepegawaian' => 'permanent',
                'tanggal_masuk' => '2020-01-01',
                'gaji' => '5000000',
                'status_aktif' => true,
            ]
        ]);

        return Excel::download(new TeacherExport($templateData), $filename);
    }

    /**
     * Create student template
     */
    protected function createStudentTemplate(string $filename): Response
    {
        $templateData = collect([
            [
                'nama' => 'Contoh Siswa',
                'nis' => '12345',
                'nisn' => '1234567890',
                'email' => 'siswa@example.com',
                'telepon' => '08123456789',
                'alamat' => 'Jl. Contoh No. 123',
                'tanggal_lahir' => '2005-01-01',
                'tempat_lahir' => 'Jakarta',
                'jenis_kelamin' => 'L',
                'agama' => 'Islam',
                'kelas' => 'X IPA 1',
                'tanggal_masuk' => '2023-07-01',
                'status' => 'active',
                'nama_orang_tua' => 'Contoh Orang Tua',
                'telepon_orang_tua' => '08123456789',
                'email_orang_tua' => 'ortu@example.com',
                'pekerjaan_orang_tua' => 'PNS',
                'golongan_darah' => 'O',
                'kebutuhan_khusus' => false,
                'transportasi' => 'Motor',
                'status_aktif' => true,
            ]
        ]);

        return Excel::download(new StudentExport($templateData), $filename);
    }

    /**
     * Create staff template
     */
    protected function createStaffTemplate(string $filename): Response
    {
        $templateData = collect([
            [
                'nama' => 'Contoh Staf',
                'nip' => '1965123123456789',
                'email' => 'staf@example.com',
                'telepon' => '08123456789',
                'alamat' => 'Jl. Contoh No. 123',
                'tanggal_lahir' => '1980-01-01',
                'tempat_lahir' => 'Jakarta',
                'jenis_kelamin' => 'P',
                'agama' => 'Islam',
                'posisi' => 'Administrasi',
                'departemen' => 'Keuangan',
                'pendidikan' => 'D3',
                'status_kepegawaian' => 'contract',
                'tanggal_masuk' => '2020-01-01',
                'gaji' => '3000000',
                'status_aktif' => true,
            ]
        ]);

        return Excel::download(new StaffExport($templateData), $filename);
    }
}