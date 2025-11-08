<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class SubjectRequest extends FormRequest
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
        $subjectId = $this->route('subject')?->id;
        
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:subjects,code,' . $subjectId,
            'description' => 'nullable|string',
            'credits' => 'required|integer|min:1|max:10',
            'level' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama mata pelajaran wajib diisi',
            'code.required' => 'Kode mata pelajaran wajib diisi',
            'code.unique' => 'Kode mata pelajaran sudah digunakan',
            'credits.required' => 'Jumlah SKS wajib diisi',
            'credits.min' => 'Jumlah SKS minimal 1',
            'credits.max' => 'Jumlah SKS maksimal 10',
        ];
    }
}
