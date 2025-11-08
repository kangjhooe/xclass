<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LetterTemplateRequest extends FormRequest
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
            'nama_template' => 'required|string|max:255',
            'jenis_surat' => 'required|string|max:100',
            'isi_template' => 'required|string',
            'deskripsi' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nama_template.required' => 'Nama template wajib diisi.',
            'nama_template.max' => 'Nama template maksimal 255 karakter.',
            'jenis_surat.required' => 'Jenis surat wajib diisi.',
            'jenis_surat.max' => 'Jenis surat maksimal 100 karakter.',
            'isi_template.required' => 'Isi template wajib diisi.',
            'deskripsi.max' => 'Deskripsi maksimal 500 karakter.',
            'is_active.boolean' => 'Status aktif harus berupa true atau false.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'nama_template' => 'nama template',
            'jenis_surat' => 'jenis surat',
            'isi_template' => 'isi template',
            'deskripsi' => 'deskripsi',
            'is_active' => 'status aktif',
        ];
    }
}
