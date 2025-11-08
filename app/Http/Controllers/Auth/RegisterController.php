<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Database\QueryException;

class RegisterController extends Controller
{
    /**
     * Show the registration form
     */
    public function showRegistrationForm()
    {
        return view('auth.register');
    }

    /**
     * Handle tenant registration request
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'npsn' => 'required|digits:8|unique:tenants,npsn',
            'name' => 'required|string|max:255',
            'type_tenant' => 'required|in:Sekolah Umum,Madrasah',
            'status' => 'required|in:Negeri,Swasta',
            'jenjang' => 'required|in:SD,MI,SMP,MTs,SMA,MA,SMK',
            'email' => 'required|string|email|max:255|unique:tenants,email|unique:users,email',
            'pic_name' => 'required|string|max:255',
            'pic_phone' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'npsn.required' => 'NPSN wajib diisi.',
            'npsn.digits' => 'NPSN harus 8 digit.',
            'npsn.unique' => 'NPSN sudah digunakan instansi lain.',
            'email.required' => 'Email instansi wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah tertaut di instansi lain.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        try {
            DB::beginTransaction();

            // Create tenant using provided information
            $tenant = \App\Models\Core\Tenant::create([
                'npsn' => $validated['npsn'],
                'name' => $validated['name'],
                'type_tenant' => $validated['type_tenant'],
                'jenjang' => $validated['jenjang'],
                'email' => $validated['email'],
                'phone' => $validated['pic_phone'],
                'is_active' => true,
                'settings' => [
                    'status' => $validated['status'],
                    'pic_name' => $validated['pic_name'],
                    'pic_phone' => $validated['pic_phone'],
                ],
            ]);

            // Create default admin user for tenant
            $user = User::create([
                'name' => $validated['pic_name'],
                'email' => $validated['email'],
                'phone' => $validated['pic_phone'],
                'password' => Hash::make($validated['password']),
                'role' => 'school_admin',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ]);

            DB::commit();
        } catch (QueryException $e) {
            DB::rollBack();
            // Tampilkan pesan yang lebih ramah untuk pelanggaran unik
            return back()
                ->withErrors(['general' => 'Data sudah digunakan (NPSN atau Email). Silakan cek kembali.'])
                ->withInput();
        }

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
