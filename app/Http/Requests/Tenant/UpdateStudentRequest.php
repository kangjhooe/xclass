<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by controller
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $studentId = $this->route('student');
        $studentId = is_object($studentId) ? $studentId->id : $studentId;
        
        $tenant = tenant();
        $tenantId = $tenant ? $tenant->id : null;

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'nullable',
                'email',
                Rule::unique('students', 'email')->ignore($studentId),
            ],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:100',
            'gender' => 'required|in:L,P',
            'religion' => 'nullable|string|max:50',
            'class_id' => [
                'nullable',
                Rule::exists('class_rooms', 'id')->where(function ($query) use ($tenantId) {
                    if ($tenantId) {
                        $query->where('instansi_id', $tenantId);
                    }
                }),
            ],
            'student_number' => 'nullable|string|max:20',
            'nisn' => [
                'nullable',
                'string',
                'max:20',
                function ($attribute, $value, $fail) use ($studentId, $tenantId) {
                    if ($value) {
                        // Check if NISN is unique within tenant (excluding current student)
                        $exists = \App\Models\Tenant\Student::where('nisn', $value)
                            ->where('instansi_id', $tenantId)
                            ->where('id', '!=', $studentId)
                            ->exists();
                        
                        if ($exists) {
                            $fail('NISN sudah terdaftar di sekolah ini.');
                        }
                        
                        // Check if NISN is active in another tenant
                        $hasActiveInOtherTenant = \App\Models\Tenant\Student::withoutGlobalScopes()
                            ->where('nisn', $value)
                            ->where('is_active', true)
                            ->where('instansi_id', '!=', $tenantId)
                            ->exists();
                        
                        if ($hasActiveInOtherTenant) {
                            $fail('NISN ini sudah aktif di sekolah lain. Satu NISN hanya bisa aktif di satu sekolah pada waktu yang sama.');
                        }
                    }
                },
            ],
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama siswa wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah digunakan',
            'gender.required' => 'Jenis kelamin wajib diisi',
            'gender.in' => 'Jenis kelamin harus Laki-laki (L) atau Perempuan (P)',
            'class_id.exists' => 'Kelas tidak ditemukan',
            'birth_date.date' => 'Format tanggal lahir tidak valid',
        ];
    }
}

