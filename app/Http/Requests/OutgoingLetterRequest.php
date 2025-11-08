<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OutgoingLetterRequest extends FormRequest
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
            'nomor_surat' => 'required|string|max:100',
            'tanggal_surat' => 'required|date',
            'jenis_surat' => 'required|string|max:100',
            'tujuan' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'isi_surat' => 'required|string',
            'file_path' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'status' => 'required|in:draft,menunggu_ttd,terkirim,arsip',
            'prioritas' => 'nullable|in:rendah,sedang,tinggi,sangat_tinggi',
            'sifat_surat' => 'nullable|in:biasa,segera,sangat_segera',
            'isi_ringkas' => 'nullable|string|max:1000',
            'tindak_lanjut' => 'nullable|string|max:1000',
            'pengirim' => 'nullable|string|max:255',
            'tanggal_kirim' => 'nullable|date',
        ];

        // Untuk update, nomor_surat harus unique kecuali untuk record yang sama
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['nomor_surat'] .= '|unique:outgoing_letters,nomor_surat,' . $this->route('surat_keluar') . ',id,instansi_id,' . auth()->user()->instansi_id;
        } else {
            $rules['nomor_surat'] .= '|unique:outgoing_letters,nomor_surat,NULL,id,instansi_id,' . auth()->user()->instansi_id;
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nomor_surat.required' => 'Nomor surat wajib diisi.',
            'nomor_surat.unique' => 'Nomor surat sudah digunakan.',
            'nomor_surat.max' => 'Nomor surat maksimal 100 karakter.',
            'tanggal_surat.required' => 'Tanggal surat wajib diisi.',
            'tanggal_surat.date' => 'Tanggal surat harus berupa tanggal yang valid.',
            'jenis_surat.required' => 'Jenis surat wajib diisi.',
            'jenis_surat.max' => 'Jenis surat maksimal 100 karakter.',
            'tujuan.required' => 'Tujuan wajib diisi.',
            'tujuan.max' => 'Tujuan maksimal 255 karakter.',
            'perihal.required' => 'Perihal wajib diisi.',
            'perihal.max' => 'Perihal maksimal 255 karakter.',
            'isi_surat.required' => 'Isi surat wajib diisi.',
            'file_path.file' => 'File harus berupa file yang valid.',
            'file_path.mimes' => 'File harus berupa PDF, DOC, atau DOCX.',
            'file_path.max' => 'Ukuran file maksimal 10MB.',
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Status harus berupa: draft, menunggu_ttd, terkirim, atau arsip.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'nomor_surat' => 'nomor surat',
            'tanggal_surat' => 'tanggal surat',
            'jenis_surat' => 'jenis surat',
            'tujuan' => 'tujuan',
            'perihal' => 'perihal',
            'isi_surat' => 'isi surat',
            'file_path' => 'file surat',
            'status' => 'status',
        ];
    }
}
