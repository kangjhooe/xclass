<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PPDBApplication;
use App\Models\PPDBConfiguration;
use App\Core\Services\PPDB\RegistrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class PPDBRegisterController extends Controller
{
    /**
     * Show the PPDB registration form for prospective students
     */
    public function showRegistrationForm()
    {
        $config = PPDBConfiguration::getActiveConfiguration();
        
        if (!$config) {
            return redirect()->route('home')->with('error', 'Pendaftaran PPDB belum dibuka. Silakan cek kembali nanti.');
        }

        return view('auth.ppdb-register', compact('config'));
    }

    /**
     * Handle PPDB registration request (calon siswa)
     */
    public function register(Request $request)
    {
        $config = PPDBConfiguration::getActiveConfiguration();
        
        if (!$config) {
            return back()->with('error', 'Pendaftaran PPDB belum dibuka.')->withInput();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
            'phone.required' => 'Nomor telepon/WA wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        try {
            DB::beginTransaction();

            // Create user with role calon_siswa
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => 'calon_siswa',
                'is_active' => true,
            ]);

            // Create initial PPDB application with registration number
            $registrationNumber = RegistrationService::generateRegistrationNumber(
                $config->academic_year,
                $config->batch_name
            );

            $application = PPDBApplication::create([
                'user_id' => $user->id,
                'instansi_id' => $config->instansi_id,
                'registration_number' => $registrationNumber,
                'full_name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'academic_year' => $config->academic_year,
                'batch' => $config->batch_name,
                'status' => PPDBApplication::STATUS_PENDING,
            ]);

            DB::commit();

            // Auto login
            Auth::login($user);

            return redirect()->route('ppdb.wizard.index')->with('success', 'Akun berhasil dibuat! Silakan lengkapi data pendaftaran Anda.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withErrors(['general' => 'Terjadi kesalahan saat pendaftaran: ' . $e->getMessage()])
                ->withInput();
        }
    }
}

