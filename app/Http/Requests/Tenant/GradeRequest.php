<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class GradeRequest extends FormRequest
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
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'assignment_type' => 'required|string|max:50',
            'assignment_name' => 'required|string|max:255',
            'score' => 'required|numeric|min:0|max:100',
            'max_score' => 'required|numeric|min:1|max:100',
            'grade_letter' => 'nullable|string|max:2',
            'notes' => 'nullable|string',
            'academic_year' => 'nullable|string|max:20',
            'semester' => 'nullable|integer|min:1|max:2',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'student_id.required' => 'Siswa wajib dipilih',
            'subject_id.required' => 'Mata pelajaran wajib dipilih',
            'teacher_id.required' => 'Guru wajib dipilih',
            'assignment_type.required' => 'Tipe penilaian wajib diisi',
            'assignment_name.required' => 'Nama penilaian wajib diisi',
            'score.required' => 'Nilai wajib diisi',
            'score.min' => 'Nilai minimal 0',
            'score.max' => 'Nilai maksimal 100',
            'max_score.required' => 'Nilai maksimal wajib diisi',
            'max_score.min' => 'Nilai maksimal minimal 1',
            'max_score.max' => 'Nilai maksimal maksimal 100',
        ];
    }
}
