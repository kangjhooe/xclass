<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamScheduleRequest extends FormRequest
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
            'class_id' => 'required|exists:class_rooms,id',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'passing_score' => 'required|integer|min:0|max:100',
            'instructions' => 'nullable|string|max:2000',
            'settings' => 'nullable|array',
            'allow_review' => 'boolean',
            'show_correct_answers' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'max_attempts' => 'required|integer|min:1|max:10',
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
            'class_id.required' => 'Kelas harus dipilih',
            'class_id.exists' => 'Kelas tidak valid',
            'start_time.required' => 'Waktu mulai harus diisi',
            'start_time.date' => 'Waktu mulai harus berupa tanggal yang valid',
            'start_time.after' => 'Waktu mulai harus setelah waktu sekarang',
            'end_time.required' => 'Waktu berakhir harus diisi',
            'end_time.date' => 'Waktu berakhir harus berupa tanggal yang valid',
            'end_time.after' => 'Waktu berakhir harus setelah waktu mulai',
            'passing_score.required' => 'Nilai minimal lulus harus diisi',
            'passing_score.integer' => 'Nilai minimal lulus harus berupa angka',
            'passing_score.min' => 'Nilai minimal lulus minimal 0',
            'passing_score.max' => 'Nilai minimal lulus maksimal 100',
            'instructions.max' => 'Instruksi maksimal 2000 karakter',
            'settings.array' => 'Pengaturan harus berupa array',
            'allow_review.boolean' => 'Izinkan review harus berupa true/false',
            'show_correct_answers.boolean' => 'Tampilkan kunci jawaban harus berupa true/false',
            'randomize_questions.boolean' => 'Acak soal harus berupa true/false',
            'randomize_answers.boolean' => 'Acak jawaban harus berupa true/false',
            'max_attempts.required' => 'Maksimal percobaan harus diisi',
            'max_attempts.integer' => 'Maksimal percobaan harus berupa angka',
            'max_attempts.min' => 'Maksimal percobaan minimal 1',
            'max_attempts.max' => 'Maksimal percobaan maksimal 10',
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
            // Validate that class belongs to current tenant
            if ($this->class_id) {
                $hasAccess = \App\Models\Tenant\ClassRoom::where('id', $this->class_id)
                    ->where('instansi_id', tenant('id'))
                    ->exists();

                if (!$hasAccess) {
                    $validator->errors()->add('class_id', 'Kelas tidak valid atau tidak tersedia');
                }
            }

            // Validate time range (max 8 hours)
            if ($this->start_time && $this->end_time) {
                $start = \Carbon\Carbon::parse($this->start_time);
                $end = \Carbon\Carbon::parse($this->end_time);
                $diffInHours = $end->diffInHours($start);

                if ($diffInHours > 8) {
                    $validator->errors()->add('end_time', 'Durasi ujian maksimal 8 jam');
                }
            }
        });
    }
}
