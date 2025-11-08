<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Core\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TenantSettingsController extends BaseTenantController
{
    /**
     * Display tenant settings
     */
    public function index()
    {
        // Only school_admin and super_admin can access settings
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak. Hanya admin yang dapat mengakses pengaturan.');
        }

        $tenant = $this->getCurrentTenant();
        return view('tenant.settings.index', compact('tenant'));
    }

    /**
     * Update tenant settings
     */
    public function update(Request $request)
    {
        // Only school_admin and super_admin can update settings
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak. Hanya admin yang dapat mengubah pengaturan.');
        }

        $tenant = $this->getCurrentTenant();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type_tenant' => 'required|in:Sekolah Umum,Madrasah',
            'jenjang' => 'required|in:SD,MI,SMP,MTs,SMA,MA,SMK,Lainnya',
            'email' => 'required|email|max:255|unique:tenants,email,' . $tenant->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'province_code' => 'nullable|string|max:10',
            'province' => 'nullable|string|max:100',
            'regency_code' => 'nullable|string|max:10',
            'regency' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'district_code' => 'nullable|string|max:10',
            'district' => 'nullable|string|max:100',
            'village_code' => 'nullable|string|max:10',
            'village' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'website' => 'nullable|url|max:255',
            'custom_domain' => 'nullable|string|max:255|unique:tenants,custom_domain,' . $tenant->id,
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|image|mimes:jpeg,png,jpg,gif,ico,svg|max:1024',
        ]);

        try {
            // Only update allowed fields
            $allowedFields = [
                'name',
                'type_tenant',
                'jenjang',
                'email',
                'phone',
                'address',
                'province_code',
                'province',
                'regency_code',
                'regency',
                'city',
                'district_code',
                'district',
                'village_code',
                'village',
                'postal_code',
                'website',
                'custom_domain',
            ];

            $data = $this->getAllowedFields($request, $allowedFields);
            
            // Update basic information
            foreach ($data as $key => $value) {
                $tenant->$key = $value;
            }

            // Handle logo upload
            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if ($tenant->logo && Storage::disk('public')->exists($tenant->logo)) {
                    Storage::disk('public')->delete($tenant->logo);
                }

                // Store new logo
                $logoPath = $request->file('logo')->store('tenants/' . $tenant->npsn, 'public');
                $tenant->logo = $logoPath;
            }

            // Handle favicon upload
            if ($request->hasFile('favicon')) {
                // Delete old favicon if exists
                if ($tenant->favicon && Storage::disk('public')->exists($tenant->favicon)) {
                    Storage::disk('public')->delete($tenant->favicon);
                }

                // Store new favicon
                $faviconPath = $request->file('favicon')->store('tenants/' . $tenant->npsn, 'public');
                $tenant->favicon = $faviconPath;
            }

            $tenant->save();

            return redirect()->route('tenant.settings.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Pengaturan tenant berhasil diperbarui!');

        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui pengaturan tenant');
        }
    }

    /**
     * Delete tenant logo
     */
    public function deleteLogo()
    {
        // Only school_admin and super_admin can delete logo
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        $tenant = $this->getCurrentTenant();

        try {
            if ($tenant->logo && Storage::disk('public')->exists($tenant->logo)) {
                Storage::disk('public')->delete($tenant->logo);
            }
            
            $tenant->logo = null;
            $tenant->save();
            
            return redirect()->route('tenant.settings.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Logo berhasil dihapus!');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus logo');
        }
    }

    /**
     * Delete tenant favicon
     */
    public function deleteFavicon()
    {
        // Only school_admin and super_admin can delete favicon
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        $tenant = $this->getCurrentTenant();

        try {
            if ($tenant->favicon && Storage::disk('public')->exists($tenant->favicon)) {
                Storage::disk('public')->delete($tenant->favicon);
            }
            
            $tenant->favicon = null;
            $tenant->save();
            
            return redirect()->route('tenant.settings.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Favicon berhasil dihapus!');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus favicon');
        }
    }
}
