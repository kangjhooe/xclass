<?php

namespace App\Http\Controllers;

use App\Models\LetterNumberSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LetterNumberSettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = Auth::user()->instansi_id;
        $setting = LetterNumberSetting::where('instansi_id', $instansiId)->first();
        
        return view('tenant.letters.settings.number-settings.index', compact('setting'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('tenant.letters.settings.number-settings.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'format_nomor' => 'required|string|max:255',
            'reset_tahunan' => 'boolean',
            'institusi_code' => 'required|string|max:10',
            'prefix' => 'nullable|string|max:50',
            'suffix' => 'nullable|string|max:50',
        ]);

        $instansiId = Auth::user()->instansi_id;
        
        // Check if setting already exists
        $existingSetting = LetterNumberSetting::where('instansi_id', $instansiId)->first();
        
        if ($existingSetting) {
            return redirect()->back()->with('error', 'Pengaturan nomor surat sudah ada. Silakan edit pengaturan yang sudah ada.');
        }

        LetterNumberSetting::create([
            'instansi_id' => $instansiId,
            'format_nomor' => $request->format_nomor,
            'reset_tahunan' => $request->boolean('reset_tahunan'),
            'institusi_code' => $request->institusi_code,
            'prefix' => $request->prefix,
            'suffix' => $request->suffix,
        ]);

        return redirect()->route('tenant.letters.settings.number-settings.index')
            ->with('success', 'Pengaturan nomor surat berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(LetterNumberSetting $letterNumberSetting)
    {
        return view('tenant.letters.settings.number-settings.show', compact('letterNumberSetting'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LetterNumberSetting $letterNumberSetting)
    {
        return view('tenant.letters.settings.number-settings.edit', compact('letterNumberSetting'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LetterNumberSetting $letterNumberSetting)
    {
        $request->validate([
            'format_nomor' => 'required|string|max:255',
            'reset_tahunan' => 'boolean',
            'institusi_code' => 'required|string|max:10',
            'prefix' => 'nullable|string|max:50',
            'suffix' => 'nullable|string|max:50',
        ]);

        $letterNumberSetting->update([
            'format_nomor' => $request->format_nomor,
            'reset_tahunan' => $request->boolean('reset_tahunan'),
            'institusi_code' => $request->institusi_code,
            'prefix' => $request->prefix,
            'suffix' => $request->suffix,
        ]);

        return redirect()->route('tenant.letters.settings.number-settings.index')
            ->with('success', 'Pengaturan nomor surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LetterNumberSetting $letterNumberSetting)
    {
        $letterNumberSetting->delete();

        return redirect()->route('tenant.letters.settings.number-settings.index')
            ->with('success', 'Pengaturan nomor surat berhasil dihapus.');
    }

    /**
     * Preview nomor surat berdasarkan format
     */
    public function preview(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $setting = LetterNumberSetting::where('instansi_id', $instansiId)->first();
        
        if (!$setting) {
            return response()->json(['error' => 'Pengaturan nomor surat belum dibuat'], 404);
        }

        $preview = $setting->previewNumber();
        
        return response()->json(['preview' => $preview]);
    }

    /**
     * Reset nomor surat
     */
    public function reset(LetterNumberSetting $letterNumberSetting)
    {
        $letterNumberSetting->update(['last_number' => 0]);
        
        return redirect()->back()->with('success', 'Nomor surat berhasil direset.');
    }
}
