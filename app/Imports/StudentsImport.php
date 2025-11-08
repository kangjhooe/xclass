<?php

namespace App\Imports;

use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use App\Core\Services\TenantService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class StudentsImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnError, SkipsOnFailure
{
    use Importable, SkipsErrors, SkipsFailures;

    protected $tenant;
    protected $errors = [];
    protected $successCount = 0;

    public function __construct()
    {
        $this->tenant = app(TenantService::class)->getCurrentTenant();
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            try {
                $this->createStudent($row);
                $this->successCount++;
            } catch (\Exception $e) {
                $this->errors[] = "Baris " . ($row->getIndex() + 2) . ": " . $e->getMessage();
            }
        }
    }

    protected function createStudent($row)
    {
        // Validasi data yang diperlukan
        if (empty($row['nama_lengkap'])) {
            throw new \Exception('Nama lengkap harus diisi');
        }

        // Cari kelas berdasarkan nama
        $classId = null;
        if (!empty($row['kelas'])) {
            $class = ClassRoom::where('instansi_id', $this->tenant->id)
                ->where('name', 'like', '%' . $row['kelas'] . '%')
                ->first();
            $classId = $class ? $class->id : null;
        }

        // Konversi tanggal
        $birthDate = $this->parseDate($row['tanggal_lahir']);
        $fatherBirthDate = $this->parseDate($row['tanggal_lahir_ayah']);
        $motherBirthDate = $this->parseDate($row['tanggal_lahir_ibu']);
        $guardianBirthDate = $this->parseDate($row['tanggal_lahir_wali']);
        $enrollmentDate = $this->parseDate($row['tanggal_masuk']);

        // Konversi gender
        $gender = $this->parseGender($row['jenis_kelamin']);

        // Konversi penghasilan
        $fatherIncome = $this->parseIncome($row['penghasilan_ayah']);
        $motherIncome = $this->parseIncome($row['penghasilan_ibu']);
        $guardianIncome = $this->parseIncome($row['penghasilan_wali']);

        $studentData = [
            'npsn' => $this->tenant->npsn,
            'instansi_id' => $this->tenant->id,
            'name' => $row['nama_lengkap'],
            'email' => $row['email'] ?? null,
            'phone' => $row['nomor_telepon'] ?? null,
            'address' => $row['alamat'] ?? null,
            'birth_date' => $birthDate,
            'birth_place' => $row['tempat_lahir'] ?? null,
            'gender' => $gender,
            'religion' => $row['agama'] ?? null,
            'class_id' => $classId,
            'student_number' => $row['nomor_induk_siswa'] ?? null,
            'nisn' => $row['nisn'] ?? null,
            'parent_name' => $row['nama_orang_tua'] ?? null,
            'parent_phone' => $row['telepon_orang_tua'] ?? null,
            'parent_email' => $row['email_orang_tua'] ?? null,
            'is_active' => true,

            // Data Pribadi Lengkap
            'nik' => $row['nik'] ?? null,
            'nationality' => $row['kewarganegaraan'] ?? 'Indonesia',
            'ethnicity' => $row['suku'] ?? null,
            'language' => $row['bahasa'] ?? 'Bahasa Indonesia',
            'blood_type' => $row['golongan_darah'] ?? null,
            'disability_type' => $row['jenis_disabilitas'] ?? null,
            'disability_description' => $row['deskripsi_disabilitas'] ?? null,

            // Data Alamat Lengkap
            'rt' => $row['rt'] ?? null,
            'rw' => $row['rw'] ?? null,
            'village' => $row['desa_kelurahan'] ?? null,
            'sub_district' => $row['kecamatan'] ?? null,
            'district' => $row['kabupaten_kota'] ?? null,
            'city' => $row['kota'] ?? null,
            'province' => $row['provinsi'] ?? null,
            'postal_code' => $row['kode_pos'] ?? null,
            'residence_type' => $row['jenis_tempat_tinggal'] ?? null,
            'transportation' => $row['alat_transportasi'] ?? null,

            // Data Asal Sekolah
            'previous_school' => $row['sekolah_sebelumnya'] ?? null,
            'previous_school_address' => $row['alamat_sekolah_sebelumnya'] ?? null,
            'previous_school_city' => $row['kota_sekolah_sebelumnya'] ?? null,
            'previous_school_province' => $row['provinsi_sekolah_sebelumnya'] ?? null,
            'previous_school_phone' => $row['telepon_sekolah_sebelumnya'] ?? null,
            'previous_school_principal' => $row['kepala_sekolah_sebelumnya'] ?? null,
            'previous_school_graduation_year' => $row['tahun_lulus_sekolah_sebelumnya'] ?? null,
            'previous_school_certificate_number' => $row['nomor_ijazah_sekolah_sebelumnya'] ?? null,

            // Data Ayah
            'father_name' => $row['nama_ayah'] ?? null,
            'father_nik' => $row['nik_ayah'] ?? null,
            'father_birth_date' => $fatherBirthDate,
            'father_birth_place' => $row['tempat_lahir_ayah'] ?? null,
            'father_education' => $row['pendidikan_ayah'] ?? null,
            'father_occupation' => $row['pekerjaan_ayah'] ?? null,
            'father_company' => $row['perusahaan_ayah'] ?? null,
            'father_phone' => $row['telepon_ayah'] ?? null,
            'father_email' => $row['email_ayah'] ?? null,
            'father_income' => $fatherIncome,

            // Data Ibu
            'mother_name' => $row['nama_ibu'] ?? null,
            'mother_nik' => $row['nik_ibu'] ?? null,
            'mother_birth_date' => $motherBirthDate,
            'mother_birth_place' => $row['tempat_lahir_ibu'] ?? null,
            'mother_education' => $row['pendidikan_ibu'] ?? null,
            'mother_occupation' => $row['pekerjaan_ibu'] ?? null,
            'mother_company' => $row['perusahaan_ibu'] ?? null,
            'mother_phone' => $row['telepon_ibu'] ?? null,
            'mother_email' => $row['email_ibu'] ?? null,
            'mother_income' => $motherIncome,

            // Data Wali
            'guardian_name' => $row['nama_wali'] ?? null,
            'guardian_nik' => $row['nik_wali'] ?? null,
            'guardian_birth_date' => $guardianBirthDate,
            'guardian_birth_place' => $row['tempat_lahir_wali'] ?? null,
            'guardian_education' => $row['pendidikan_wali'] ?? null,
            'guardian_occupation' => $row['pekerjaan_wali'] ?? null,
            'guardian_company' => $row['perusahaan_wali'] ?? null,
            'guardian_phone' => $row['telepon_wali'] ?? null,
            'guardian_email' => $row['email_wali'] ?? null,
            'guardian_income' => $guardianIncome,
            'guardian_relationship' => $row['hubungan_wali'] ?? null,

            // Data Kesehatan
            'height' => $row['tinggi_badan'] ?? null,
            'weight' => $row['berat_badan'] ?? null,
            'health_condition' => $row['kondisi_kesehatan'] ?? null,
            'health_notes' => $row['catatan_kesehatan'] ?? null,
            'allergies' => $row['alergi'] ?? null,
            'medications' => $row['obat_obatan'] ?? null,

            // Data Akademik
            'enrollment_date' => $enrollmentDate,
            'enrollment_semester' => $row['semester_masuk'] ?? null,
            'enrollment_year' => $row['tahun_masuk'] ?? null,
            'student_status' => $row['status_siswa'] ?? 'active',
            'notes' => $row['catatan_khusus'] ?? null,

            // Data Darurat
            'emergency_contact_name' => $row['nama_kontak_darurat'] ?? null,
            'emergency_contact_phone' => $row['telepon_kontak_darurat'] ?? null,
            'emergency_contact_relationship' => $row['hubungan_kontak_darurat'] ?? null,
        ];

        Student::create($studentData);
    }

    protected function parseDate($date)
    {
        if (empty($date)) {
            return null;
        }

        try {
            // Coba berbagai format tanggal
            $formats = ['Y-m-d', 'd-m-Y', 'd/m/Y', 'Y/m/d', 'd-m-y', 'd/m/y'];
            
            foreach ($formats as $format) {
                $parsed = Carbon::createFromFormat($format, $date);
                if ($parsed) {
                    return $parsed->format('Y-m-d');
                }
            }

            // Jika tidak bisa di-parse, coba dengan Carbon::parse
            return Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseGender($gender)
    {
        if (empty($gender)) {
            return null;
        }

        $gender = strtolower(trim($gender));
        
        if (in_array($gender, ['l', 'laki-laki', 'male', 'pria'])) {
            return 'L';
        } elseif (in_array($gender, ['p', 'perempuan', 'female', 'wanita'])) {
            return 'P';
        }

        return null;
    }

    protected function parseIncome($income)
    {
        if (empty($income)) {
            return null;
        }

        // Hapus karakter non-numeric kecuali koma dan titik
        $income = preg_replace('/[^0-9.,]/', '', $income);
        
        // Ganti koma dengan titik untuk decimal
        $income = str_replace(',', '.', $income);
        
        return is_numeric($income) ? (float) $income : null;
    }

    public function rules(): array
    {
        return [
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'nullable|email',
            'nomor_telepon' => 'nullable|string|max:20',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P,Laki-laki,Perempuan,Male,Female',
            'nisn' => 'nullable|string|max:20',
            'nik' => 'nullable|string|max:16',
        ];
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getSuccessCount()
    {
        return $this->successCount;
    }
}
