<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Tenant\Question;

class StoreQuestionRequest extends FormRequest
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
        $rules = [
            'subject_id' => 'required|exists:subjects,id',
            'question_text' => 'required|string|max:5000',
            'type' => 'required|in:' . implode(',', [
                Question::TYPE_MULTIPLE_CHOICE,
                Question::TYPE_TRUE_FALSE,
                Question::TYPE_ESSAY,
                Question::TYPE_FILL_BLANK,
                Question::TYPE_MATCHING
            ]),
            'points' => 'required|integer|min:1|max:100',
            'difficulty' => 'required|in:' . implode(',', [
                Question::DIFFICULTY_EASY,
                Question::DIFFICULTY_MEDIUM,
                Question::DIFFICULTY_HARD
            ]),
            'explanation' => 'nullable|string|max:2000',
            'metadata' => 'nullable|array',
        ];

        // Add conditional rules based on question type
        if (in_array($this->type, [Question::TYPE_MULTIPLE_CHOICE, Question::TYPE_TRUE_FALSE, Question::TYPE_MATCHING])) {
            $rules['options'] = 'required|array|min:2';
            $rules['options.*'] = 'required|string|max:1000';
            $rules['answer_key'] = 'required|string';
        }

        if ($this->type === Question::TYPE_FILL_BLANK) {
            $rules['answer_key'] = 'required|string|max:500';
        }

        if ($this->type === Question::TYPE_ESSAY) {
            $rules['answer_key'] = 'nullable|string|max:2000';
        }

        return $rules;
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
            'question_text.required' => 'Pertanyaan harus diisi',
            'question_text.max' => 'Pertanyaan maksimal 5000 karakter',
            'type.required' => 'Tipe soal harus dipilih',
            'type.in' => 'Tipe soal tidak valid',
            'points.required' => 'Nilai poin harus diisi',
            'points.integer' => 'Nilai poin harus berupa angka',
            'points.min' => 'Nilai poin minimal 1',
            'points.max' => 'Nilai poin maksimal 100',
            'difficulty.required' => 'Tingkat kesulitan harus dipilih',
            'difficulty.in' => 'Tingkat kesulitan tidak valid',
            'options.required' => 'Opsi jawaban harus diisi untuk tipe soal ini',
            'options.array' => 'Opsi jawaban harus berupa array',
            'options.min' => 'Minimal 2 opsi jawaban',
            'options.*.required' => 'Setiap opsi jawaban harus diisi',
            'options.*.max' => 'Opsi jawaban maksimal 1000 karakter',
            'answer_key.required' => 'Jawaban benar harus diisi',
            'answer_key.max' => 'Jawaban benar maksimal 500 karakter',
            'explanation.max' => 'Penjelasan maksimal 2000 karakter',
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
            // Validate answer key exists in options for multiple choice and true/false
            if (in_array($this->type, [Question::TYPE_MULTIPLE_CHOICE, Question::TYPE_TRUE_FALSE])) {
                if ($this->options && $this->answer_key) {
                    if (!array_key_exists($this->answer_key, $this->options)) {
                        $validator->errors()->add('answer_key', 'Jawaban benar harus ada dalam opsi yang tersedia');
                    }
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