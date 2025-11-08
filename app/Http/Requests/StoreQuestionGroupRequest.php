<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Tenant\QuestionGroup;

class StoreQuestionGroupRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'stimulus_type' => 'required|in:' . implode(',', [
                QuestionGroup::STIMULUS_TYPE_TEXT,
                QuestionGroup::STIMULUS_TYPE_IMAGE,
                QuestionGroup::STIMULUS_TYPE_TABLE
            ]),
            'stimulus_content' => 'required|string',
            'metadata' => 'nullable|array',
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
            'title.required' => 'Judul stimulus harus diisi',
            'title.max' => 'Judul stimulus maksimal 255 karakter',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
            'stimulus_type.required' => 'Tipe stimulus harus dipilih',
            'stimulus_type.in' => 'Tipe stimulus tidak valid',
            'stimulus_content.required' => 'Konten stimulus harus diisi',
            'metadata.array' => 'Metadata harus berupa array',
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
            // Validate stimulus content based on type
            if ($this->stimulus_type && $this->stimulus_content) {
                switch ($this->stimulus_type) {
                    case QuestionGroup::STIMULUS_TYPE_IMAGE:
                        if (!filter_var($this->stimulus_content, FILTER_VALIDATE_URL) && !file_exists($this->stimulus_content)) {
                            $validator->errors()->add('stimulus_content', 'URL gambar tidak valid');
                        }
                        break;
                    
                    case QuestionGroup::STIMULUS_TYPE_TABLE:
                        $tableData = json_decode($this->stimulus_content, true);
                        if (!$tableData || !isset($tableData['headers']) || !isset($tableData['rows'])) {
                            $validator->errors()->add('stimulus_content', 'Format tabel tidak valid. Pastikan memiliki headers dan rows.');
                        }
                        break;
                }
            }

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
