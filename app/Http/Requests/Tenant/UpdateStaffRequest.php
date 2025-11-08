<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
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
        $staffId = $this->route('nonTeachingStaff') ?? $this->route('staff');
        $staffId = is_object($staffId) ? $staffId->id : $staffId;

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'nullable',
                'email',
                Rule::unique('staff', 'email')->ignore($staffId),
            ],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:100',
            'gender' => 'required|in:L,P',
            'religion' => 'nullable|string|max:50',
            'employee_number' => 'nullable|string|max:20',
            'nip' => 'nullable|string|max:20',
            'position' => 'required|string|max:255',
            'department' => 'nullable|string|max:100',
            'education_level' => 'nullable|string|max:100',
            'employment_status' => 'required|in:permanent,contract,honorary,intern,resigned',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama staf wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah digunakan',
            'gender.required' => 'Jenis kelamin wajib diisi',
            'position.required' => 'Jabatan wajib diisi',
            'employment_status.required' => 'Status kepegawaian wajib diisi',
            'employment_status.in' => 'Status kepegawaian tidak valid',
            'salary.min' => 'Gaji tidak boleh negatif',
        ];
    }
}

