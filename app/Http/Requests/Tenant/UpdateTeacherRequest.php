<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
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
        $teacherId = $this->route('teacher');
        $teacherId = is_object($teacherId) ? $teacherId->id : $teacherId;

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'nullable',
                'email',
                Rule::unique('teachers', 'email')->ignore($teacherId),
            ],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:100',
            'gender' => 'required|in:L,P',
            'religion' => 'nullable|string|max:50',
            'employee_number' => 'nullable|string|max:20',
            'nip' => [
                'nullable',
                'string',
                'size:18',
                'regex:/^[0-9]{18}$/',
                Rule::unique('teachers', 'nip')->ignore($teacherId),
            ],
            'nuptk' => [
                'nullable',
                'string',
                'size:16',
                'regex:/^[0-9]{16}$/',
                Rule::unique('teachers', 'nuptk')->ignore($teacherId),
            ],
            'nik' => [
                'nullable',
                'string',
                'size:16',
                'regex:/^[0-9]{16}$/',
                Rule::unique('teachers', 'nik')->ignore($teacherId),
            ],
            'npk' => 'nullable|string|max:20',
            'page_id' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'village' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'subject_specialization' => 'nullable|string|max:100',
            'education_level' => 'nullable|string|max:50',
            'jenjang' => 'nullable|string|max:50',
            'study_program_group' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'salary' => 'nullable|numeric|min:0',
            'tpg_amount' => 'nullable|numeric|min:0',
            'tfg_amount' => 'nullable|numeric|min:0',
            'teaching_hours_per_week' => 'nullable|integer|min:0',
            'other_workplace_hours' => 'nullable|integer|min:0',
            'equivalent_teaching_hours' => 'nullable|integer|min:0',
            'additional_duties' => 'nullable|array',
            'additional_duties.*' => 'exists:additional_duties,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah digunakan',
            'gender.required' => 'Jenis kelamin wajib diisi',
            'nik.unique' => 'NIK sudah digunakan oleh guru lain',
            'nik.size' => 'NIK harus terdiri dari 16 digit angka',
            'nik.regex' => 'NIK harus berupa 16 digit angka',
            'nuptk.size' => 'NUPTK harus terdiri dari 16 digit angka',
            'nuptk.regex' => 'NUPTK harus berupa 16 digit angka',
            'nip.size' => 'NIP harus terdiri dari 18 digit angka',
            'nip.regex' => 'NIP harus berupa 18 digit angka',
        ];
    }
}

