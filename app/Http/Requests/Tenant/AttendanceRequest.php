<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
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
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late,excused,sick',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i|after:check_in_time',
            'notes' => 'nullable|string',
            'student_id' => 'required|exists:students,id',
            'schedule_id' => 'nullable|exists:schedules,id',
            'teacher_id' => 'required|exists:teachers,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'date.required' => 'Tanggal wajib diisi',
            'status.required' => 'Status kehadiran wajib dipilih',
            'student_id.required' => 'Siswa wajib dipilih',
            'teacher_id.required' => 'Guru wajib dipilih',
            'check_out_time.after' => 'Waktu keluar harus setelah waktu masuk',
        ];
    }
}
