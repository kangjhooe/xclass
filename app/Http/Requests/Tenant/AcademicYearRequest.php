<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class AcademicYearRequest extends FormRequest
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
            'year_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'nullable|boolean',
            'current_semester' => 'nullable|integer|in:1,2',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'year_name.required' => 'Nama tahun pelajaran wajib diisi',
            'start_date.required' => 'Tanggal mulai wajib diisi',
            'start_date.date' => 'Format tanggal mulai tidak valid',
            'end_date.required' => 'Tanggal selesai wajib diisi',
            'end_date.date' => 'Format tanggal selesai tidak valid',
            'end_date.after' => 'Tanggal selesai harus setelah tanggal mulai',
            'current_semester.in' => 'Semester harus 1 atau 2',
        ];
    }
}

