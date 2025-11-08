<?php

namespace App\Imports;

use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use App\Services\Tenant\StudentService;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeImport;
use Maatwebsite\Excel\Events\AfterImport;
use Maatwebsite\Excel\Events\ImportFailed;
use Illuminate\Support\Facades\Validator;

/**
 * Student Import Class
 * 
 * Handles Excel import for Student data
 */
class StudentImport implements ToModel, WithHeadingRow, WithValidation, WithChunkReading, WithEvents
{
    protected StudentService $studentService;
    protected array $errors = [];
    protected int $successCount = 0;
    protected int $errorCount = 0;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    /**
     * Transform row to model
     */
    public function model(array $row)
    {
        try {
            // Validate row data
            $validator = Validator::make($row, $this->rules());
            
            if ($validator->fails()) {
                $this->errors[] = [
                    'row' => $row,
                    'errors' => $validator->errors()->toArray()
                ];
                $this->errorCount++;
                return null;
            }

            // Check for duplicates
            if ($this->isDuplicate($row)) {
                $this->errors[] = [
                    'row' => $row,
                    'errors' => ['duplicate' => ['Data sudah ada']]
                ];
                $this->errorCount++;
                return null;
            }

            // Validate class exists
            if (!$this->validateClass($row)) {
                $this->errors[] = [
                    'row' => $row,
                    'errors' => ['class' => ['Kelas tidak ditemukan']]
                ];
                $this->errorCount++;
                return null;
            }

            // Create student
            $student = $this->studentService->create($this->prepareData($row));
            $this->successCount++;
            
            return $student;
        } catch (\Exception $e) {
            $this->errors[] = [
                'row' => $row,
                'errors' => ['exception' => [$e->getMessage()]]
            ];
            $this->errorCount++;
            return null;
        }
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
            'nis' => 'nullable|string|max:20',
            'nisn' => 'nullable|string|max:10',
            'email' => 'nullable|email|max:255',
            'telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date|before:today',
            'tempat_lahir' => 'nullable|string|max:100',
            'jenis_kelamin' => 'required|in:L,P',
            'agama' => 'nullable|string|max:50',
            'kelas' => 'required|string',
            'tanggal_masuk' => 'nullable|date|before_or_equal:today',
            'tanggal_lulus' => 'nullable|date|after:tanggal_masuk',
            'status' => 'required|in:active,graduated,transferred,dropped_out',
            'nama_orang_tua' => 'nullable|string|max:255',
            'telepon_orang_tua' => 'nullable|string|max:20',
            'email_orang_tua' => 'nullable|email|max:255',
            'pekerjaan_orang_tua' => 'nullable|string|max:100',
            'golongan_darah' => 'nullable|in:A,B,AB,O',
            'kebutuhan_khusus' => 'boolean',
            'deskripsi_kebutuhan_khusus' => 'nullable|string',
            'transportasi' => 'nullable|string|max:50',
            'status_aktif' => 'boolean',
        ];
    }

    /**
     * Check if data is duplicate
     */
    protected function isDuplicate(array $row): bool
    {
        $query = Student::where('instansi_id', $this->studentService->repository->currentTenantId);

        if (!empty($row['nis'])) {
            $query->where('nis', $row['nis']);
        }

        if (!empty($row['nisn'])) {
            $query->where('nisn', $row['nisn']);
        }

        if (!empty($row['email'])) {
            $query->where('email', $row['email']);
        }

        return $query->exists();
    }

    /**
     * Validate class exists
     */
    protected function validateClass(array $row): bool
    {
        if (empty($row['kelas'])) {
            return false;
        }

        return ClassRoom::where('instansi_id', $this->studentService->repository->currentTenantId)
            ->where('name', $row['kelas'])
            ->exists();
    }

    /**
     * Get class ID by name
     */
    protected function getClassId(string $className): ?int
    {
        $class = ClassRoom::where('instansi_id', $this->studentService->repository->currentTenantId)
            ->where('name', $className)
            ->first();

        return $class ? $class->id : null;
    }

    /**
     * Prepare data for creation
     */
    protected function prepareData(array $row): array
    {
        return [
            'name' => $row['nama'],
            'nis' => $row['nis'] ?? null,
            'nisn' => $row['nisn'] ?? null,
            'email' => $row['email'] ?? null,
            'phone' => $row['telepon'] ?? null,
            'address' => $row['alamat'] ?? null,
            'birth_date' => $row['tanggal_lahir'] ?? null,
            'birth_place' => $row['tempat_lahir'] ?? null,
            'gender' => $row['jenis_kelamin'],
            'religion' => $row['agama'] ?? null,
            'class_id' => $this->getClassId($row['kelas']),
            'enrollment_date' => $row['tanggal_masuk'] ?? null,
            'graduation_date' => $row['tanggal_lulus'] ?? null,
            'status' => $row['status'],
            'parent_name' => $row['nama_orang_tua'] ?? null,
            'parent_phone' => $row['telepon_orang_tua'] ?? null,
            'parent_email' => $row['email_orang_tua'] ?? null,
            'parent_occupation' => $row['pekerjaan_orang_tua'] ?? null,
            'blood_type' => $row['golongan_darah'] ?? null,
            'has_special_needs' => $row['kebutuhan_khusus'] ?? false,
            'special_needs_description' => $row['deskripsi_kebutuhan_khusus'] ?? null,
            'transportation' => $row['transportasi'] ?? null,
            'is_active' => $row['status_aktif'] ?? true,
        ];
    }

    /**
     * Chunk reading for large files
     */
    public function chunkSize(): int
    {
        return 100;
    }

    /**
     * Register events
     */
    public function registerEvents(): array
    {
        return [
            BeforeImport::class => function(BeforeImport $event) {
                $this->errors = [];
                $this->successCount = 0;
                $this->errorCount = 0;
            },
            AfterImport::class => function(AfterImport $event) {
                // Store import results in session
                session([
                    'import_results' => [
                        'success_count' => $this->successCount,
                        'error_count' => $this->errorCount,
                        'errors' => $this->errors,
                    ]
                ]);
            },
            ImportFailed::class => function(ImportFailed $event) {
                // Handle import failure
                \Log::error('Student import failed: ' . $event->getException()->getMessage());
            },
        ];
    }

    /**
     * Get import results
     */
    public function getResults(): array
    {
        return [
            'success_count' => $this->successCount,
            'error_count' => $this->errorCount,
            'errors' => $this->errors,
        ];
    }
}
