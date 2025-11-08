<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use App\Imports\StudentsImport;
use App\Http\Requests\Tenant\StoreStudentRequest;
use App\Http\Requests\Tenant\UpdateStudentRequest;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends BaseTenantController
{
    /**
     * Display a listing of students
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Student::class);

        $tenant = $this->getCurrentTenant();
        
        $query = Student::where('instansi_id', $tenant->id);

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = trim($request->get('search'));
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('student_number', 'like', "%{$search}%")
                      ->orWhere('nisn', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
        }

        // Filter berdasarkan kelas
        if ($request->filled('class_id')) {
            $classId = $request->get('class_id');
            if (!empty($classId)) {
                $query->where('class_id', $classId);
            }
        }
        
        // Filter berdasarkan status aktif
        if ($request->filled('status')) {
            $status = $request->get('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        // Filter berdasarkan jenis kelamin
        if ($request->filled('gender')) {
            $gender = $request->get('gender');
            if (!empty($gender)) {
                $query->where('gender', $gender);
            }
        }
        
        // Order by name untuk hasil yang lebih konsisten
        $query->orderBy('name', 'asc');

        $students = $query->with('classRoom')->paginate(20);
        
        // Append query parameters to pagination links
        $students->appends($request->only(['search', 'class_id', 'status', 'gender']));
        
        $classes = ClassRoom::where('instansi_id', $tenant->id)->active()->get();

        return view('tenant.students.index', compact('students', 'classes', 'tenant'));
    }

    /**
     * Show the form for creating a new student
     */
    public function create()
    {
        $this->authorize('create', Student::class);

        $tenant = $this->getCurrentTenant();
        $classes = ClassRoom::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.students.create', compact('classes'));
    }

    /**
     * Store a newly created student
     */
    public function store(StoreStudentRequest $request)
    {
        $this->authorize('create', Student::class);

        $validated = $request->validated();

        try {
            // Prepare data with tenant info and only allowed fields
            $data = $this->prepareTenantData($validated);
            $data['is_active'] = true;

            Student::create($data);

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.students.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Siswa berhasil ditambahkan');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan siswa');
        }
    }

    /**
     * Display the specified student
     */
    public function show($student)
    {
        // Route::bind di AppServiceProvider sudah resolve student sebagai Student instance
        // Jika masih string, berarti Route::bind tidak bekerja, coba resolve manual
        if (is_string($student)) {
            $tenantService = app(\App\Core\Services\TenantService::class);
            $tenant = $tenantService->getCurrentTenant();
            
            if (!$tenant) {
                abort(404, 'Tenant tidak ditemukan');
            }
            
            $student = Student::where('nisn', $student)
                ->where('instansi_id', $tenant->id)
                ->first();
        }
        
        // Ensure it's a Student instance
        if (!$student instanceof Student) {
            abort(404, 'Siswa tidak ditemukan');
        }
        
        // Ensure tenant access and load relations
        $this->ensureTenantAccess($student);
        
        $student->load([
            'classRoom',
            'attendances',
            'grades'
        ]);
        
        $this->authorize('view', $student);
        
        return view('tenant.students.show', ['student' => $student]);
    }

    /**
     * Show the form for editing the specified student
     */
    public function edit($student)
    {
        // Route::bind should have resolved this, but if it's still a string, resolve manually
        if (is_string($student)) {
            $studentModel = new Student();
            $student = $studentModel->resolveRouteBinding($student, 'nisn');
        }
        
        // Ensure it's a Student instance
        if (!$student instanceof Student) {
            abort(404, 'Siswa tidak ditemukan');
        }
        
        $this->ensureTenantAccess($student);
        $this->authorize('update', $student);
        
        $tenant = $this->getCurrentTenant();
        $classes = ClassRoom::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.students.edit', ['student' => $student, 'classes' => $classes]);
    }

    /**
     * Update the specified student
     */
    public function update(UpdateStudentRequest $request, $student)
    {
        // Route::bind should have resolved this, but if it's still a string, resolve manually
        if (is_string($student)) {
            $studentModel = new Student();
            $student = $studentModel->resolveRouteBinding($student, 'nisn');
        }
        
        // Ensure it's a Student instance
        if (!$student instanceof Student) {
            abort(404, 'Siswa tidak ditemukan');
        }
        
        $this->ensureTenantAccess($student);
        $this->authorize('update', $student);

        $validated = $request->validated();

        try {
            // Only update allowed fields, prevent mass assignment
            $allowedFields = [
                'name',
                'email',
                'phone',
                'address',
                'birth_date',
                'birth_place',
                'gender',
                'religion',
                'class_id',
                'student_number',
                'nisn',
                'parent_name',
                'parent_phone',
                'parent_email',
            ];

            $data = $this->getAllowedFields($request, $allowedFields);
            $student->update($data);

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.students.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data siswa berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui siswa');
        }
    }

    /**
     * Remove the specified student
     */
    public function destroy($student)
    {
        // Route::bind should have resolved this, but if it's still a string, resolve manually
        if (is_string($student)) {
            $studentModel = new Student();
            $student = $studentModel->resolveRouteBinding($student, 'nisn');
        }
        
        // Ensure it's a Student instance
        if (!$student instanceof Student) {
            abort(404, 'Siswa tidak ditemukan');
        }
        
        $this->ensureTenantAccess($student);
        $this->authorize('delete', $student);

        try {
            // Check for related records before deletion
            $issues = $this->checkRelationsBeforeDelete($student, [
                'attendances' => 'Siswa masih memiliki :count data absensi.',
                'grades' => 'Siswa masih memiliki :count data nilai.',
            ]);

            if (!empty($issues)) {
                return redirect()->back()
                    ->with('error', implode(' ', $issues) . ' Hapus data terkait terlebih dahulu sebelum menghapus siswa.');
            }

            $student->delete();

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.students.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Siswa berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus siswa');
        }
    }

    /**
     * Show student grades
     */
    public function grades($student)
    {
        // Route::bind should have resolved this, but if it's still a string, resolve manually
        if (is_string($student)) {
            $studentModel = new Student();
            $student = $studentModel->resolveRouteBinding($student, 'nisn');
        }
        
        // Ensure it's a Student instance
        if (!$student instanceof Student) {
            abort(404, 'Siswa tidak ditemukan');
        }
        
        $this->ensureTenantAccess($student);
        $student->load([
            'grades.subject',
            'grades.teacher'
        ]);
        $this->authorize('view', $student);
        
        return view('tenant.students.grades', ['student' => $student]);
    }

    /**
     * Show student attendance
     */
    public function attendance($student)
    {
        // Route::bind should have resolved this, but if it's still a string, resolve manually
        if (is_string($student)) {
            $studentModel = new Student();
            $student = $studentModel->resolveRouteBinding($student, 'nisn');
        }
        
        // Ensure it's a Student instance
        if (!$student instanceof Student) {
            abort(404, 'Siswa tidak ditemukan');
        }
        
        $this->ensureTenantAccess($student);
        $student->load([
            'attendances.schedule',
            'attendances.teacher'
        ]);
        $this->authorize('view', $student);
        
        return view('tenant.students.attendance', ['student' => $student]);
    }

    /**
     * Show import form
     */
    public function importForm()
    {
        $this->authorize('import', Student::class);

        $tenant = $this->getCurrentTenant();
        return view('tenant.students.import', compact('tenant'));
    }

    /**
     * Process Excel import
     */
    public function import(Request $request)
    {
        $this->authorize('import', Student::class);

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Max 10MB
        ]);

        $tenant = $this->getCurrentTenant();

        try {
            $import = new StudentsImport();
            Excel::import($import, $request->file('file'));

            $successCount = $import->getSuccessCount();
            $errors = $import->getErrors();

            $message = "Berhasil mengimpor {$successCount} data siswa.";
            if (!empty($errors)) {
                $message .= " Terdapat " . count($errors) . " error yang perlu diperbaiki.";
            }

            return redirect()->route('tenant.students.index', ['tenant' => $tenant->npsn])
                ->with('success', $message)
                ->with('import_errors', $errors);

        } catch (\Exception $e) {
            return $this->handleException($e, 'mengimpor data siswa');
        }
    }

    /**
     * Export students to Excel
     */
    public function export(Request $request)
    {
        $this->authorize('export', Student::class);

        $tenant = $this->getCurrentTenant();
        
        // Build query with same filters as index
        $query = Student::where('instansi_id', $tenant->id);

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = trim($request->get('search'));
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('student_number', 'like', "%{$search}%")
                      ->orWhere('nisn', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
        }

        // Filter berdasarkan kelas
        if ($request->filled('class_id')) {
            $classId = $request->get('class_id');
            if (!empty($classId)) {
                $query->where('class_id', $classId);
            }
        }
        
        // Filter berdasarkan status aktif
        if ($request->filled('status')) {
            $status = $request->get('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        // Filter berdasarkan jenis kelamin
        if ($request->filled('gender')) {
            $gender = $request->get('gender');
            if (!empty($gender)) {
                $query->where('gender', $gender);
            }
        }
        
        $query->orderBy('name', 'asc');
        
        $students = $query->with('classRoom')->get();
        
        $filename = 'data_siswa_' . $tenant->npsn . '_' . date('Y-m-d_His') . '.xlsx';
        
        return Excel::download(new \App\Exports\StudentExport($students), $filename);
    }

    /**
     * Download Excel template
     */
    public function downloadTemplate()
    {
        $this->authorize('export', Student::class);

        $tenant = $this->getCurrentTenant();
        
        // Buat template Excel dengan data contoh
        $templateData = [
            [
                'nama_lengkap' => 'Ahmad Fauzi',
                'email' => 'ahmad.fauzi@email.com',
                'nomor_telepon' => '08123456789',
                'tanggal_lahir' => '15-01-2008',
                'tempat_lahir' => 'Jakarta',
                'jenis_kelamin' => 'L',
                'agama' => 'Islam',
                'nik' => '1234567890123456',
                'nisn' => '1234567890',
                'nomor_induk_siswa' => 'S001',
                'kelas' => 'X IPA 1',
                'alamat' => 'Jl. Merdeka No. 123',
                'rt' => '001',
                'rw' => '005',
                'desa_kelurahan' => 'Menteng',
                'kecamatan' => 'Menteng',
                'kabupaten_kota' => 'Jakarta Pusat',
                'kota' => 'Jakarta',
                'provinsi' => 'DKI Jakarta',
                'kode_pos' => '10310',
                'jenis_tempat_tinggal' => 'Rumah Pribadi',
                'alat_transportasi' => 'Sepeda Motor',
                'sekolah_sebelumnya' => 'SMP Negeri 1 Jakarta',
                'alamat_sekolah_sebelumnya' => 'Jl. Pendidikan No. 1',
                'kota_sekolah_sebelumnya' => 'Jakarta',
                'provinsi_sekolah_sebelumnya' => 'DKI Jakarta',
                'telepon_sekolah_sebelumnya' => '021-12345678',
                'kepala_sekolah_sebelumnya' => 'Dr. Budi Santoso',
                'tahun_lulus_sekolah_sebelumnya' => '2023',
                'nomor_ijazah_sekolah_sebelumnya' => 'IJZ/2023/001',
                'nama_ayah' => 'Budi Santoso',
                'nik_ayah' => '1234567890123457',
                'tanggal_lahir_ayah' => '15-01-1980',
                'tempat_lahir_ayah' => 'Jakarta',
                'pendidikan_ayah' => 'S1',
                'pekerjaan_ayah' => 'PNS',
                'perusahaan_ayah' => 'Kementerian Pendidikan',
                'telepon_ayah' => '08123456788',
                'email_ayah' => 'budi.santoso@email.com',
                'penghasilan_ayah' => '5000000',
                'nama_ibu' => 'Siti Aminah',
                'nik_ibu' => '1234567890123458',
                'tanggal_lahir_ibu' => '20-05-1985',
                'tempat_lahir_ibu' => 'Jakarta',
                'pendidikan_ibu' => 'S1',
                'pekerjaan_ibu' => 'Guru',
                'perusahaan_ibu' => 'SMP Negeri 2 Jakarta',
                'telepon_ibu' => '08123456787',
                'email_ibu' => 'siti.aminah@email.com',
                'penghasilan_ibu' => '4000000',
                'nama_wali' => '',
                'nik_wali' => '',
                'tanggal_lahir_wali' => '',
                'tempat_lahir_wali' => '',
                'pendidikan_wali' => '',
                'pekerjaan_wali' => '',
                'perusahaan_wali' => '',
                'telepon_wali' => '',
                'email_wali' => '',
                'penghasilan_wali' => '',
                'hubungan_wali' => '',
                'tinggi_badan' => '165',
                'berat_badan' => '55',
                'kondisi_kesehatan' => 'Sehat',
                'catatan_kesehatan' => 'Tidak ada',
                'alergi' => 'Tidak ada',
                'obat_obatan' => 'Tidak ada',
                'tanggal_masuk' => '15-07-2024',
                'semester_masuk' => '1',
                'tahun_masuk' => '2024',
                'status_siswa' => 'active',
                'catatan_khusus' => 'Siswa berprestasi',
                'nama_kontak_darurat' => 'Budi Santoso',
                'telepon_kontak_darurat' => '08123456788',
                'hubungan_kontak_darurat' => 'Ayah'
            ]
        ];

        $filename = 'template_import_siswa_' . $tenant->npsn . '_' . date('Y-m-d') . '.xlsx';
        
        return Excel::download(new \App\Exports\StudentsTemplateExport($templateData), $filename);
    }
}
