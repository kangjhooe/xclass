<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PPDBStatusUpdateRequest extends FormRequest
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
            'status' => 'required|in:pending,registered,selection,announced,accepted,rejected,cancelled',
            'notes' => 'nullable|string|max:1000',
            'selection_score' => 'nullable|numeric|min:0|max:100',
            'interview_score' => 'nullable|numeric|min:0|max:100',
            'document_score' => 'nullable|numeric|min:0|max:100',
            'rejected_reason' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status pendaftaran harus dipilih.',
            'status.in' => 'Status pendaftaran tidak valid.',
            'notes.string' => 'Catatan harus berupa teks.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
            'selection_score.numeric' => 'Nilai seleksi harus berupa angka.',
            'selection_score.min' => 'Nilai seleksi minimal 0.',
            'selection_score.max' => 'Nilai seleksi maksimal 100.',
            'interview_score.numeric' => 'Nilai wawancara harus berupa angka.',
            'interview_score.min' => 'Nilai wawancara minimal 0.',
            'interview_score.max' => 'Nilai wawancara maksimal 100.',
            'document_score.numeric' => 'Nilai dokumen harus berupa angka.',
            'document_score.min' => 'Nilai dokumen minimal 0.',
            'document_score.max' => 'Nilai dokumen maksimal 100.',
            'rejected_reason.string' => 'Alasan ditolak harus berupa teks.',
            'rejected_reason.max' => 'Alasan ditolak maksimal 1000 karakter.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'status' => 'status pendaftaran',
            'notes' => 'catatan',
            'selection_score' => 'nilai seleksi',
            'interview_score' => 'nilai wawancara',
            'document_score' => 'nilai dokumen',
            'rejected_reason' => 'alasan ditolak',
        ];
    }
}
