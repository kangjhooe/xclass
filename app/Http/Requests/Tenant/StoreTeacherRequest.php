<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
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
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|unique:teachers,email',
            'gender' => 'required|in:L,P',
            'nik' => [
                'nullable',
                'string',
                'size:16',
                'regex:/^[0-9]{16}$/',
            ],
            'nuptk' => 'nullable|string|size:16|regex:/^[0-9]{16}$/',
            'nip' => 'nullable|string|size:18|regex:/^[0-9]{18}$/',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:50',
            'employee_number' => 'nullable|string|max:20',
            'subject_specialization' => 'nullable|string|max:100',
            'education_level' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah digunakan',
            'gender.required' => 'Jenis kelamin wajib diisi',
            'nik.size' => 'NIK harus terdiri dari 16 digit angka',
            'nik.regex' => 'NIK harus berupa 16 digit angka',
            'nuptk.size' => 'NUPTK harus terdiri dari 16 digit angka',
            'nuptk.regex' => 'NUPTK harus berupa 16 digit angka',
            'nip.size' => 'NIP harus terdiri dari 18 digit angka',
            'nip.regex' => 'NIP harus berupa 18 digit angka',
        ];
    }
}

