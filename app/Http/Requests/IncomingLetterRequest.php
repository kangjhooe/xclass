<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IncomingLetterRequest extends FormRequest
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
            'tanggal_terima' => 'required|date',
            'pengirim' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'lampiran' => 'nullable|array',
            'lampiran.*' => 'string|max:255',
            'file_path' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'status' => 'required|in:baru,diproses,selesai',
            'catatan' => 'nullable|string|max:1000',
            'disposisi' => 'nullable|array',
            'jenis_surat' => 'nullable|string|max:100',
            'prioritas' => 'nullable|in:rendah,sedang,tinggi,sangat_tinggi',
            'sifat_surat' => 'nullable|in:biasa,segera,sangat_segera',
            'isi_ringkas' => 'nullable|string|max:1000',
            'tindak_lanjut' => 'nullable|string|max:1000',
        ];

        // Untuk update, nomor_surat harus unique kecuali untuk record yang sama
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['nomor_surat'] .= '|unique:incoming_letters,nomor_surat,' . $this->route('surat_masuk') . ',id,instansi_id,' . auth()->user()->instansi_id;
        } else {
            $rules['nomor_surat'] .= '|unique:incoming_letters,nomor_surat,NULL,id,instansi_id,' . auth()->user()->instansi_id;
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
            'tanggal_terima.required' => 'Tanggal terima wajib diisi.',
            'tanggal_terima.date' => 'Tanggal terima harus berupa tanggal yang valid.',
            'pengirim.required' => 'Pengirim wajib diisi.',
            'pengirim.max' => 'Nama pengirim maksimal 255 karakter.',
            'perihal.required' => 'Perihal wajib diisi.',
            'perihal.max' => 'Perihal maksimal 255 karakter.',
            'lampiran.array' => 'Lampiran harus berupa array.',
            'lampiran.*.string' => 'Setiap lampiran harus berupa string.',
            'lampiran.*.max' => 'Nama lampiran maksimal 255 karakter.',
            'file_path.file' => 'File harus berupa file yang valid.',
            'file_path.mimes' => 'File harus berupa PDF, DOC, atau DOCX.',
            'file_path.max' => 'Ukuran file maksimal 10MB.',
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Status harus berupa: baru, diproses, atau selesai.',
            'catatan.max' => 'Catatan maksimal 1000 karakter.',
            'disposisi.array' => 'Disposisi harus berupa array.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'nomor_surat' => 'nomor surat',
            'tanggal_terima' => 'tanggal terima',
            'pengirim' => 'pengirim',
            'perihal' => 'perihal',
            'lampiran' => 'lampiran',
            'file_path' => 'file surat',
            'status' => 'status',
            'catatan' => 'catatan',
            'disposisi' => 'disposisi',
        ];
    }
}
