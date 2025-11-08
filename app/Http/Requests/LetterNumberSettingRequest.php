<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LetterNumberSettingRequest extends FormRequest
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
        $rules = [
            'jenis_surat' => 'required|string|max:100',
            'format_nomor' => 'required|string|max:255',
            'nomor_terakhir' => 'required|integer|min:0',
            'reset_tahunan' => 'required|boolean',
            'kode_lembaga' => 'nullable|string|max:10',
            'deskripsi' => 'nullable|string|max:500',
        ];

        // Untuk update, jenis_surat harus unique kecuali untuk record yang sama
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['jenis_surat'] .= '|unique:letter_number_settings,jenis_surat,' . $this->route('pengaturan_nomor_surat') . ',id,instansi_id,' . auth()->user()->instansi_id;
        } else {
            $rules['jenis_surat'] .= '|unique:letter_number_settings,jenis_surat,NULL,id,instansi_id,' . auth()->user()->instansi_id;
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'jenis_surat.required' => 'Jenis surat wajib diisi.',
            'jenis_surat.unique' => 'Jenis surat sudah digunakan.',
            'jenis_surat.max' => 'Jenis surat maksimal 100 karakter.',
            'format_nomor.required' => 'Format nomor wajib diisi.',
            'format_nomor.max' => 'Format nomor maksimal 255 karakter.',
            'nomor_terakhir.required' => 'Nomor terakhir wajib diisi.',
            'nomor_terakhir.integer' => 'Nomor terakhir harus berupa angka.',
            'nomor_terakhir.min' => 'Nomor terakhir minimal 0.',
            'reset_tahunan.required' => 'Reset tahunan wajib dipilih.',
            'reset_tahunan.boolean' => 'Reset tahunan harus berupa true atau false.',
            'kode_lembaga.max' => 'Kode lembaga maksimal 10 karakter.',
            'deskripsi.max' => 'Deskripsi maksimal 500 karakter.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'jenis_surat' => 'jenis surat',
            'format_nomor' => 'format nomor',
            'nomor_terakhir' => 'nomor terakhir',
            'reset_tahunan' => 'reset tahunan',
            'kode_lembaga' => 'kode lembaga',
            'deskripsi' => 'deskripsi',
        ];
    }
}