<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleRequest extends FormRequest
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
            'day' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:class_rooms,id',
            'academic_year' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'day.required' => 'Hari wajib dipilih',
            'start_time.required' => 'Waktu mulai wajib diisi',
            'end_time.required' => 'Waktu selesai wajib diisi',
            'end_time.after' => 'Waktu selesai harus setelah waktu mulai',
            'teacher_id.required' => 'Guru wajib dipilih',
            'subject_id.required' => 'Mata pelajaran wajib dipilih',
            'class_id.required' => 'Kelas wajib dipilih',
        ];
    }
}
