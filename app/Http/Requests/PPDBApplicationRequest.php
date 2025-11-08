<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Core\Services\PPDB\RegistrationService;

class PPDBApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = RegistrationService::baseRules();
        // Di sisi tenant, wajibkan tahun ajaran & gelombang
        $rules['academic_year'] = 'required|string';
        $rules['batch'] = 'required|string';

        // File validation rules
        if ($this->isMethod('POST')) {
            $rules = array_merge($rules, RegistrationService::fileRules(true));
        } else {
            $rules = array_merge($rules, RegistrationService::fileRules(false));
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap harus diisi.',
            'full_name.max' => 'Nama lengkap maksimal 255 karakter.',
            'email.required' => 'Email harus diisi.',
            'email.email' => 'Format email tidak valid.',
            'phone.required' => 'Nomor telepon harus diisi.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'birth_date.required' => 'Tanggal lahir harus diisi.',
            'birth_date.date' => 'Format tanggal lahir tidak valid.',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini.',
            'birth_place.required' => 'Tempat lahir harus diisi.',
            'gender.required' => 'Jenis kelamin harus dipilih.',
            'gender.in' => 'Jenis kelamin tidak valid.',
            'address.required' => 'Alamat harus diisi.',
            'previous_school.required' => 'Nama sekolah asal harus diisi.',
            'previous_school_address.required' => 'Alamat sekolah asal harus diisi.',
            'major_choice.required' => 'Pilihan jurusan harus diisi.',
            'parent_name.required' => 'Nama orang tua harus diisi.',
            'parent_phone.required' => 'Nomor telepon orang tua harus diisi.',
            'parent_occupation.required' => 'Pekerjaan orang tua harus diisi.',
            'parent_income.numeric' => 'Penghasilan orang tua harus berupa angka.',
            'parent_income.min' => 'Penghasilan orang tua tidak boleh negatif.',
            'registration_path.required' => 'Jalur pendaftaran harus dipilih.',
            'registration_path.in' => 'Jalur pendaftaran tidak valid.',
            'academic_year.required' => 'Tahun ajaran harus dipilih.',
            'batch.required' => 'Gelombang harus dipilih.',
            'photo_path.image' => 'Foto harus berupa gambar.',
            'photo_path.mimes' => 'Foto harus berformat JPEG, PNG, atau JPG.',
            'photo_path.max' => 'Ukuran foto maksimal 2MB.',
            'ijazah_path.file' => 'Ijazah harus berupa file.',
            'ijazah_path.mimes' => 'Ijazah harus berformat PDF, JPEG, PNG, atau JPG.',
            'ijazah_path.max' => 'Ukuran ijazah maksimal 5MB.',
            'kk_path.file' => 'Kartu keluarga harus berupa file.',
            'kk_path.mimes' => 'Kartu keluarga harus berformat PDF, JPEG, PNG, atau JPG.',
            'kk_path.max' => 'Ukuran kartu keluarga maksimal 5MB.',
            'documents.array' => 'Dokumen pendukung harus berupa array.',
            'documents.*.file' => 'Dokumen pendukung harus berupa file.',
            'documents.*.mimes' => 'Dokumen pendukung harus berformat PDF, JPEG, PNG, atau JPG.',
            'documents.*.max' => 'Ukuran dokumen pendukung maksimal 5MB.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'full_name' => 'nama lengkap',
            'email' => 'email',
            'phone' => 'nomor telepon',
            'birth_date' => 'tanggal lahir',
            'birth_place' => 'tempat lahir',
            'gender' => 'jenis kelamin',
            'address' => 'alamat',
            'previous_school' => 'sekolah asal',
            'previous_school_address' => 'alamat sekolah asal',
            'major_choice' => 'pilihan jurusan',
            'parent_name' => 'nama orang tua',
            'parent_phone' => 'nomor telepon orang tua',
            'parent_occupation' => 'pekerjaan orang tua',
            'parent_income' => 'penghasilan orang tua',
            'registration_path' => 'jalur pendaftaran',
            'academic_year' => 'tahun ajaran',
            'batch' => 'gelombang',
            'photo_path' => 'foto',
            'ijazah_path' => 'ijazah',
            'kk_path' => 'kartu keluarga',
            'documents' => 'dokumen pendukung',
        ];
    }
}
