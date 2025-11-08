<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SystemSettingsController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all();
        return view('admin.settings.index', compact('settings'));
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'system_name' => 'required|string|max:255',
            'system_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'system_favicon' => 'nullable|image|mimes:jpeg,png,jpg,gif,ico,svg|max:1024',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            // Update system name
            SystemSetting::setValue('system_name', $request->system_name, 'text', 'Nama sistem');

            // Handle logo upload
            if ($request->hasFile('system_logo')) {
                // Delete old logo if exists
                $oldLogo = SystemSetting::getValue('system_logo');
                if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                    Storage::disk('public')->delete($oldLogo);
                }

                // Store new logo
                $logoPath = $request->file('system_logo')->store('system', 'public');
                SystemSetting::setValue('system_logo', $logoPath, 'image', 'Logo sistem yang ditampilkan di halaman login dan navbar');
            }

            // Handle favicon upload
            if ($request->hasFile('system_favicon')) {
                // Delete old favicon if exists
                $oldFavicon = SystemSetting::getValue('system_favicon');
                if ($oldFavicon && Storage::disk('public')->exists($oldFavicon)) {
                    Storage::disk('public')->delete($oldFavicon);
                }

                // Store new favicon
                $faviconPath = $request->file('system_favicon')->store('system', 'public');
                SystemSetting::setValue('system_favicon', $faviconPath, 'image', 'Favicon sistem yang ditampilkan di browser tab');
            }

            return redirect()->route('admin.settings')
                ->with('success', 'Pengaturan sistem berhasil diperbarui!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function deleteLogo()
    {
        try {
            $logoPath = SystemSetting::getValue('system_logo');
            if ($logoPath && Storage::disk('public')->exists($logoPath)) {
                Storage::disk('public')->delete($logoPath);
            }
            
            SystemSetting::setValue('system_logo', null, 'image', 'Logo sistem yang ditampilkan di halaman login dan navbar');
            
            return redirect()->route('admin.settings')
                ->with('success', 'Logo berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function deleteFavicon()
    {
        try {
            $faviconPath = SystemSetting::getValue('system_favicon');
            if ($faviconPath && Storage::disk('public')->exists($faviconPath)) {
                Storage::disk('public')->delete($faviconPath);
            }
            
            SystemSetting::setValue('system_favicon', null, 'image', 'Favicon sistem yang ditampilkan di browser tab');
            
            return redirect()->route('admin.settings')
                ->with('success', 'Favicon berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
