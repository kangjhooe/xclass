<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherSupervisionRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'teacher_id' => 'required|exists:teachers,id',
            'supervisor_id' => 'required|exists:teachers,id',
            'class_room_id' => 'nullable|exists:class_rooms,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'supervision_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'supervision_type' => 'required|in:akademik,administratif,kepribadian,sosial',
            'supervision_method' => 'required|in:observasi_kelas,observasi_non_kelas,wawancara,dokumentasi,kombinasi',
            'preparation_score' => 'nullable|numeric|min:0|max:100',
            'implementation_score' => 'nullable|numeric|min:0|max:100',
            'classroom_management_score' => 'nullable|numeric|min:0|max:100',
            'student_interaction_score' => 'nullable|numeric|min:0|max:100',
            'assessment_score' => 'nullable|numeric|min:0|max:100',
            'academic_year' => 'nullable|string',
            'semester' => 'nullable|integer|min:1|max:2',
        ];
    }
}
