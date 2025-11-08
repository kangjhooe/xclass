<?php

namespace App\Imports;

use App\Models\Tenant\Staff;
use App\Services\Tenant\StaffService;
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
 * Staff Import Class
 * 
 * Handles Excel import for Staff data
 */
class StaffImport implements ToModel, WithHeadingRow, WithValidation, WithChunkReading, WithEvents
{
    protected StaffService $staffService;
    protected array $errors = [];
    protected int $successCount = 0;
    protected int $errorCount = 0;

    public function __construct(StaffService $staffService)
    {
        $this->staffService = $staffService;
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

            // Create staff
            $staff = $this->staffService->create($this->prepareData($row));
            $this->successCount++;
            
            return $staff;
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
            'nip' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date|before:today',
            'tempat_lahir' => 'nullable|string|max:100',
            'jenis_kelamin' => 'required|in:L,P',
            'agama' => 'nullable|string|max:50',
            'posisi' => 'required|string|max:100',
            'departemen' => 'nullable|string|max:100',
            'pendidikan' => 'nullable|string|max:100',
            'status_kepegawaian' => 'required|in:permanent,contract,honorary,intern,resigned',
            'tanggal_masuk' => 'nullable|date|before_or_equal:today',
            'gaji' => 'nullable|numeric|min:0',
            'status_aktif' => 'boolean',
        ];
    }

    /**
     * Check if data is duplicate
     */
    protected function isDuplicate(array $row): bool
    {
        $query = Staff::where('instansi_id', $this->staffService->repository->currentTenantId);

        if (!empty($row['nip'])) {
            $query->where('nip', $row['nip']);
        }

        if (!empty($row['email'])) {
            $query->where('email', $row['email']);
        }

        return $query->exists();
    }

    /**
     * Prepare data for creation
     */
    protected function prepareData(array $row): array
    {
        return [
            'name' => $row['nama'],
            'nip' => $row['nip'] ?? null,
            'email' => $row['email'] ?? null,
            'phone' => $row['telepon'] ?? null,
            'address' => $row['alamat'] ?? null,
            'birth_date' => $row['tanggal_lahir'] ?? null,
            'birth_place' => $row['tempat_lahir'] ?? null,
            'gender' => $row['jenis_kelamin'],
            'religion' => $row['agama'] ?? null,
            'position' => $row['posisi'],
            'department' => $row['departemen'] ?? null,
            'education_level' => $row['pendidikan'] ?? null,
            'employment_status' => $row['status_kepegawaian'],
            'hire_date' => $row['tanggal_masuk'] ?? null,
            'salary' => $row['gaji'] ?? null,
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
                \Log::error('Staff import failed: ' . $event->getException()->getMessage());
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
