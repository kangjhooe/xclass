<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'npsn' => 'required|string|size:8|unique:tenants,npsn|regex:/^[0-9]{8}$/',
            'email' => 'required|email|unique:tenants,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'website' => 'nullable|url',
            'custom_domain' => 'nullable|string|max:255|unique:tenants,custom_domain',
            'subscription_plan' => 'required|in:basic,premium,enterprise',
            'subscription_expires_at' => 'nullable|date|after:now',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'npsn.required' => 'NPSN wajib diisi.',
            'npsn.size' => 'NPSN harus terdiri dari 8 digit angka.',
            'npsn.unique' => 'NPSN sudah digunakan oleh tenant lain.',
            'npsn.regex' => 'NPSN hanya boleh berisi angka.',
            'name.required' => 'Nama sekolah wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh tenant lain.',
            'subscription_plan.required' => 'Paket berlangganan wajib dipilih.',
            'subscription_plan.in' => 'Paket berlangganan tidak valid.',
            'subscription_expires_at.date' => 'Format tanggal tidak valid.',
            'subscription_expires_at.after' => 'Tanggal berakhir harus setelah hari ini.',
            'website.url' => 'Format website tidak valid.',
            'custom_domain.unique' => 'Domain kustom sudah digunakan oleh tenant lain.',
        ];
    }
}

