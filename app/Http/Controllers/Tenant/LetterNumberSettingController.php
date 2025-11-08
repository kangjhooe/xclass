<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\LetterNumberSetting;
use App\Http\Requests\LetterNumberSettingRequest;
use Illuminate\Http\Request;

class LetterNumberSettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $settings = LetterNumberSetting::where('instansi_id', auth()->user()->instansi_id)
            ->orderBy('jenis_surat')
            ->get();

        return view('tenant.letters.settings.index', compact('settings'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $availablePlaceholders = LetterNumberSetting::getAvailablePlaceholders();
        
        return view('tenant.letters.settings.create', compact('availablePlaceholders'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(LetterNumberSettingRequest $request)
    {
        $data = $request->validated();
        $data['instansi_id'] = auth()->user()->instansi_id;
        $data['created_by'] = auth()->id();

        LetterNumberSetting::create($data);

        return redirect()->route('tenant.letters.settings.index')
            ->with('success', 'Pengaturan nomor surat berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(LetterNumberSetting $pengaturan_nomor_surat)
    {
        $this->authorize('view', $pengaturan_nomor_surat);
        
        return view('tenant.letters.settings.show', compact('pengaturan_nomor_surat'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LetterNumberSetting $pengaturan_nomor_surat)
    {
        $this->authorize('update', $pengaturan_nomor_surat);
        
        $availablePlaceholders = LetterNumberSetting::getAvailablePlaceholders();
        
        return view('tenant.letters.settings.edit', compact('pengaturan_nomor_surat', 'availablePlaceholders'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(LetterNumberSettingRequest $request, LetterNumberSetting $pengaturan_nomor_surat)
    {
        $this->authorize('update', $pengaturan_nomor_surat);

        $pengaturan_nomor_surat->update($request->validated());

        return redirect()->route('tenant.letters.settings.index')
            ->with('success', 'Pengaturan nomor surat berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LetterNumberSetting $pengaturan_nomor_surat)
    {
        $this->authorize('delete', $pengaturan_nomor_surat);

        $pengaturan_nomor_surat->delete();

        return redirect()->route('tenant.letters.settings.index')
            ->with('success', 'Pengaturan nomor surat berhasil dihapus');
    }

    /**
     * Preview format
     */
    public function previewFormat(Request $request)
    {
        $request->validate([
            'format_nomor' => 'required|string',
            'kode_lembaga' => 'nullable|string',
        ]);

        $bulanRomawi = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];

        $replacements = [
            '{counter}' => '001',
            '{bulan_romawi}' => $bulanRomawi[date('n')],
            '{tahun}' => date('Y'),
            '{bulan}' => date('m'),
            '{tanggal}' => date('d'),
            '{kode_lembaga}' => $request->kode_lembaga ?? 'SCH',
        ];

        $preview = str_replace(array_keys($replacements), array_values($replacements), $request->format_nomor);

        return response()->json([
            'preview' => $preview,
            'format' => $request->format_nomor
        ]);
    }

    /**
     * Reset counter
     */
    public function resetCounter(LetterNumberSetting $pengaturan_nomor_surat)
    {
        $this->authorize('update', $pengaturan_nomor_surat);

        $pengaturan_nomor_surat->update(['nomor_terakhir' => 0]);

        return redirect()->back()
            ->with('success', 'Counter nomor surat berhasil direset');
    }

    /**
     * Reset all counters for new year
     */
    public function resetAllCounters()
    {
        $settings = LetterNumberSetting::where('instansi_id', auth()->user()->instansi_id)
            ->where('reset_tahunan', true)
            ->get();

        foreach ($settings as $setting) {
            $setting->resetForNewYear();
        }

        return redirect()->back()
            ->with('success', 'Semua counter nomor surat berhasil direset untuk tahun baru');
    }
}
