<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class ClassRoomRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'level' => 'nullable|string|max:50',
            'major' => 'nullable|string|max:50',
            'capacity' => 'required|integer|min:1|max:50',
            'room_number' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'academic_year' => 'nullable|string|max:20',
            'room_id' => 'nullable|exists:rooms,id',
            'homeroom_teacher_id' => 'nullable|exists:teachers,id',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama kelas wajib diisi',
            'capacity.required' => 'Kapasitas kelas wajib diisi',
            'capacity.min' => 'Kapasitas kelas minimal 1 siswa',
            'capacity.max' => 'Kapasitas kelas maksimal 50 siswa',
        ];
    }
}
