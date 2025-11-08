<?php

namespace App\Http\Controllers\PublicPage\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\TenantProfile;
use App\Core\Services\TenantService;

class TenantProfileController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Display the tenant profile.
     */
    public function show()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $profile = TenantProfile::firstOrCreate(['instansi_id' => $tenant->id], ['title' => $tenant->name]);
        return view('publicpage::admin.profile.show', compact('profile'));
    }

    /**
     * Show the form for creating the tenant profile.
     */
    public function create()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $profile = TenantProfile::firstOrCreate(['instansi_id' => $tenant->id], ['title' => $tenant->name]);
        return view('publicpage::admin.profile.edit', compact('profile'));
    }

    /**
     * Store the tenant profile.
     */
    public function store(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $profile = TenantProfile::firstOrCreate(['instansi_id' => $tenant->id], ['title' => $tenant->name]);

        $request->validate([
            'institution_name' => 'required|string|max:255',
            'institution_type' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'slogan' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'social_media' => 'nullable|array',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $logoPath = $profile->logo;
        if ($request->hasFile('logo')) {
            if ($profile->logo) {
                \Storage::delete(str_replace('storage/', 'public/', $profile->logo));
            }
            $logoPath = $request->file('logo')->store('public/tenant_logos');
            $logoPath = str_replace('public/', 'storage/', $logoPath);
        }

        $profile->update(array_merge($request->except('logo'), [
            'logo' => $logoPath,
        ]));

        return redirect()->route('tenant.public-page.profile.show', ['tenant' => $tenant->npsn])->with('success', 'Tenant profile updated successfully.');
    }

    /**
     * Show the form for editing the tenant profile.
     */
    public function edit()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $profile = TenantProfile::firstOrCreate(['instansi_id' => $tenant->id], ['title' => $tenant->name]);
        return view('publicpage::admin.profile.edit', compact('profile'));
    }

    /**
     * Update the tenant profile in storage.
     */
    public function update(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $profile = TenantProfile::firstOrCreate(['instansi_id' => $tenant->id], ['title' => $tenant->name]);

        $request->validate([
            'institution_name' => 'required|string|max:255',
            'institution_type' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'slogan' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'social_media' => 'nullable|array',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $logoPath = $profile->logo;
        if ($request->hasFile('logo')) {
            if ($profile->logo) {
                \Storage::delete(str_replace('storage/', 'public/', $profile->logo));
            }
            $logoPath = $request->file('logo')->store('public/tenant_logos');
            $logoPath = str_replace('public/', 'storage/', $logoPath);
        }

        $profile->update(array_merge($request->except('logo'), [
            'logo' => $logoPath,
        ]));

        return redirect()->route('tenant.public-page.profile.show', ['tenant' => $tenant->npsn])->with('success', 'Tenant profile updated successfully.');
    }

    /**
     * Preview the tenant profile.
     */
    public function preview()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $profile = TenantProfile::firstOrCreate(['instansi_id' => $tenant->id], ['title' => $tenant->name]);
        return view('publicpage::admin.profile.preview', compact('profile'));
    }
}
