<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PPDBConfigurationRequest extends FormRequest
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
        return [
            'academic_year' => 'required|string|max:255',
            'batch_name' => 'required|string|max:255',
            'registration_start' => 'required|date',
            'registration_end' => 'required|date|after:registration_start',
            'announcement_date' => 'required|date|after:registration_end',
            're_registration_start' => 'required|date|after:announcement_date',
            're_registration_end' => 'required|date|after:re_registration_start',
            'available_majors' => 'nullable|array',
            'available_majors.*' => 'required|string',
            'available_majors_text' => 'nullable|string',
            'admission_paths' => 'nullable|array',
            'admission_paths.*' => 'required|string',
            'admission_paths_text' => 'nullable|string',
            'quotas_json' => 'nullable|string',
            'max_applications' => 'nullable|integer|min:1',
            'registration_fee' => 'nullable|numeric|min:0',
            'auto_approval' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'academic_year.required' => 'Tahun ajaran harus diisi.',
            'academic_year.max' => 'Tahun ajaran maksimal 255 karakter.',
            'batch_name.required' => 'Nama gelombang harus diisi.',
            'batch_name.max' => 'Nama gelombang maksimal 255 karakter.',
            'registration_start.required' => 'Tanggal mulai pendaftaran harus diisi.',
            'registration_start.date' => 'Format tanggal mulai pendaftaran tidak valid.',
            'registration_end.required' => 'Tanggal selesai pendaftaran harus diisi.',
            'registration_end.date' => 'Format tanggal selesai pendaftaran tidak valid.',
            'registration_end.after' => 'Tanggal selesai pendaftaran harus setelah tanggal mulai.',
            'announcement_date.required' => 'Tanggal pengumuman harus diisi.',
            'announcement_date.date' => 'Format tanggal pengumuman tidak valid.',
            'announcement_date.after' => 'Tanggal pengumuman harus setelah tanggal selesai pendaftaran.',
            're_registration_start.required' => 'Tanggal mulai daftar ulang harus diisi.',
            're_registration_start.date' => 'Format tanggal mulai daftar ulang tidak valid.',
            're_registration_start.after' => 'Tanggal mulai daftar ulang harus setelah tanggal pengumuman.',
            're_registration_end.required' => 'Tanggal selesai daftar ulang harus diisi.',
            're_registration_end.date' => 'Format tanggal selesai daftar ulang tidak valid.',
            're_registration_end.after' => 'Tanggal selesai daftar ulang harus setelah tanggal mulai daftar ulang.',
            'available_majors.array' => 'Jurusan yang tersedia harus berupa array.',
            'available_majors.*.required' => 'Setiap jurusan harus diisi.',
            'available_majors.*.string' => 'Format jurusan tidak valid.',
            'admission_paths.array' => 'Daftar jalur harus berupa array.',
            'admission_paths.*.required' => 'Setiap jalur harus diisi.',
            'admission_paths.*.string' => 'Format jalur tidak valid.',
            'max_applications.integer' => 'Maksimal pendaftar harus berupa angka.',
            'max_applications.min' => 'Maksimal pendaftar minimal 1.',
            'registration_fee.numeric' => 'Biaya pendaftaran harus berupa angka.',
            'registration_fee.min' => 'Biaya pendaftaran tidak boleh negatif.',
            'auto_approval.boolean' => 'Auto approval harus berupa boolean.',
            'is_active.boolean' => 'Status aktif harus berupa boolean.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'academic_year' => 'tahun ajaran',
            'batch_name' => 'nama gelombang',
            'registration_start' => 'tanggal mulai pendaftaran',
            'registration_end' => 'tanggal selesai pendaftaran',
            'announcement_date' => 'tanggal pengumuman',
            're_registration_start' => 'tanggal mulai daftar ulang',
            're_registration_end' => 'tanggal selesai daftar ulang',
            'available_majors' => 'jurusan yang tersedia',
            'max_applications' => 'maksimal pendaftar',
            'registration_fee' => 'biaya pendaftaran',
            'auto_approval' => 'auto approval',
            'is_active' => 'status aktif',
            'description' => 'deskripsi',
        ];
    }
}
