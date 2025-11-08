<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class StoreExamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('exam:create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:class_rooms,id',
            'teacher_id' => 'required|exists:teachers,id',
            'exam_type' => 'required|in:quiz,midterm,final,assignment',
            'duration' => 'required|integer|min:1|max:480',
            'total_score' => 'required|integer|min:1|max:1000',
            'passing_score' => 'required|integer|min:0|max:100',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'instructions' => 'nullable|string|max:2000',
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
            'title.required' => 'Nama ujian harus diisi',
            'title.max' => 'Nama ujian maksimal 255 karakter',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
            'subject_id.required' => 'Mata pelajaran harus dipilih',
            'subject_id.exists' => 'Mata pelajaran tidak valid',
            'class_id.required' => 'Kelas harus dipilih',
            'class_id.exists' => 'Kelas tidak valid',
            'teacher_id.required' => 'Guru harus dipilih',
            'teacher_id.exists' => 'Guru tidak valid',
            'exam_type.required' => 'Jenis ujian harus dipilih',
            'exam_type.in' => 'Jenis ujian tidak valid',
            'duration.required' => 'Durasi harus diisi',
            'duration.min' => 'Durasi minimal 1 menit',
            'duration.max' => 'Durasi maksimal 8 jam (480 menit)',
            'total_score.required' => 'Total nilai harus diisi',
            'total_score.min' => 'Total nilai minimal 1',
            'total_score.max' => 'Total nilai maksimal 1000',
            'passing_score.required' => 'Nilai kelulusan harus diisi',
            'passing_score.min' => 'Nilai kelulusan minimal 0%',
            'passing_score.max' => 'Nilai kelulusan maksimal 100%',
            'start_time.required' => 'Waktu mulai harus diisi',
            'start_time.after' => 'Waktu mulai harus setelah waktu sekarang',
            'end_time.required' => 'Waktu selesai harus diisi',
            'end_time.after' => 'Waktu selesai harus setelah waktu mulai',
            'instructions.max' => 'Instruksi maksimal 2000 karakter',
            'max_attempts.required' => 'Maksimal percobaan harus diisi',
            'max_attempts.min' => 'Maksimal percobaan minimal 1',
            'max_attempts.max' => 'Maksimal percobaan maksimal 10',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes(): array
    {
        return [
            'title' => 'nama ujian',
            'description' => 'deskripsi',
            'subject_id' => 'mata pelajaran',
            'class_id' => 'kelas',
            'teacher_id' => 'guru',
            'exam_type' => 'jenis ujian',
            'duration' => 'durasi',
            'total_score' => 'total nilai',
            'passing_score' => 'nilai kelulusan',
            'start_time' => 'waktu mulai',
            'end_time' => 'waktu selesai',
            'instructions' => 'instruksi',
            'max_attempts' => 'maksimal percobaan',
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
            // Validate that passing score is not greater than total score
            if ($this->total_score && $this->passing_score) {
                $maxPassingScore = ($this->total_score * 100) / 100; // Convert to percentage
                if ($this->passing_score > $maxPassingScore) {
                    $validator->errors()->add('passing_score', 'Nilai kelulusan tidak boleh lebih dari total nilai');
                }
            }
            
            // Validate that exam duration is reasonable
            if ($this->start_time && $this->end_time && $this->duration) {
                $examDuration = Carbon::parse($this->start_time)->diffInMinutes(Carbon::parse($this->end_time));
                if ($examDuration < $this->duration) {
                    $validator->errors()->add('end_time', 'Waktu selesai harus memberikan waktu yang cukup untuk durasi ujian');
                }
            }
        });
    }
}