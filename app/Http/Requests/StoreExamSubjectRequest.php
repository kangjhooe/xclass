<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamSubjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->hasRole('teacher');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'subject_id' => 'required|exists:subjects,id',
            'duration' => 'required|integer|min:15|max:480',
            'settings' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'subject_id.required' => 'Mata pelajaran harus dipilih',
            'subject_id.exists' => 'Mata pelajaran tidak valid',
            'duration.required' => 'Durasi harus diisi',
            'duration.integer' => 'Durasi harus berupa angka',
            'duration.min' => 'Durasi minimal 15 menit',
            'duration.max' => 'Durasi maksimal 480 menit (8 jam)',
            'settings.array' => 'Pengaturan harus berupa array',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate that teacher has access to the subject
            if ($this->subject_id) {
                $teacher = auth()->user()->teacher;
                if ($teacher) {
                    $hasAccess = \App\Models\Tenant\Subject::where('id', $this->subject_id)
                        ->where('teacher_id', $teacher->id)
                        ->where('instansi_id', tenant('id'))
                        ->exists();

                    if (!$hasAccess) {
                        $validator->errors()->add('subject_id', 'Anda tidak memiliki akses ke mata pelajaran ini');
                    }
                }
            }
        });
    }
}
