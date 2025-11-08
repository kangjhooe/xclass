<?php

namespace App\Http\Controllers;

use App\Models\PPDBApplication;
use App\Core\Services\PPDB\RegistrationService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\PPDBConfiguration;
use App\Exports\AcceptedApplicationsExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Core\Services\TenantService;

class PublicPPDBController extends Controller
{
    public function index()
    {
        return view('public.ppdb.index');
    }

    public function store(Request $request)
    {
        $rules = array_merge(
            RegistrationService::baseRules(),
            RegistrationService::fileRules(true)
        );
        Validator::make($request->all(), $rules)->validate();

        // Generate registration number
        $payload = RegistrationService::normalize($request->all());
        $registrationNumber = RegistrationService::generateRegistrationNumber(
            $payload['academic_year'],
            $payload['batch']
        );

        // Handle file uploads
        $photoPath = $request->file('photo')->store('ppdb/photos', 'public');
        $ijazahPath = $request->file('ijazah')->store('ppdb/documents', 'public');
        $kkPath = $request->file('kk')->store('ppdb/documents', 'public');

        $application = PPDBApplication::create([
            'user_id' => auth()->id(),
            'registration_number' => $registrationNumber,
            'full_name' => $payload['full_name'],
            'email' => $payload['email'] ?? null,
            'phone' => $payload['phone'],
            'birth_date' => $payload['birth_date'],
            'birth_place' => $payload['birth_place'],
            'gender' => $payload['gender'],
            'address' => $payload['address'],
            'previous_school' => $payload['previous_school'],
            'previous_school_address' => $payload['previous_school_address'],
            'major_choice' => $payload['major_choice'],
            'parent_name' => $payload['parent_name'],
            'parent_phone' => $payload['parent_phone'],
            'parent_occupation' => $payload['parent_occupation'],
            'photo_path' => $photoPath,
            'ijazah_path' => $ijazahPath,
            'kk_path' => $kkPath,
            'academic_year' => $payload['academic_year'],
            'batch' => $payload['batch']
        ]);

        return redirect()->route('public.ppdb.success', $application->registration_number)
            ->with('success', 'Pendaftaran berhasil! Nomor pendaftaran Anda: ' . $registrationNumber);
    }

    public function success($registrationNumber)
    {
        $application = PPDBApplication::where('registration_number', $registrationNumber)->firstOrFail();
        return view('public.ppdb.success', compact('application'));
    }

    public function announcement(Request $request)
    {
        $config = PPDBConfiguration::getActiveConfiguration();
        $announcementOpen = $config ? now()->greaterThanOrEqualTo($config->announcement_date) : false;
        
        // Only query if announcement is open
        $grouped = collect();
        $accepted = collect();
        
        if ($announcementOpen && $config) {
            $query = PPDBApplication::query()->where('status', PPDBApplication::STATUS_ACCEPTED);
            $query->where('academic_year', $config->academic_year)
                  ->where('batch', $config->batch_name);
            
            // Optional filters
            if ($request->filled('major')) {
                $query->where('major_choice', $request->major);
            }
            if ($request->filled('path')) {
                $query->where('registration_path', $request->path);
            }
            
            // Pagination
            $perPage = 50;
            $accepted = $query->orderBy('major_choice')
                             ->orderBy('registration_path')
                             ->orderByDesc('total_score')
                             ->paginate($perPage)
                             ->appends($request->only(['major', 'path']));
            
            $grouped = $accepted->groupBy(function ($item) {
                return ($item->major_choice ?: 'Tanpa Jurusan') . '||' . ($item->registration_path ?: 'Umum');
            });
        }
        
        return view('public.ppdb.announcement', [
            'config' => $config,
            'grouped' => $grouped,
            'accepted' => $accepted,
            'announcementOpen' => $announcementOpen,
            'selectedMajor' => $request->major,
            'selectedPath' => $request->path,
        ]);
    }

    public function checkResult(Request $request)
    {
        $request->validate([
            'registration_number' => 'required|string'
        ]);

        $application = PPDBApplication::where('registration_number', $request->registration_number)->first();

        if (!$application) {
            return redirect()->back()->with('error', 'Nomor pendaftaran tidak ditemukan.');
        }

        return view('public.ppdb.result', compact('application'));
    }

    public function exportAccepted(Request $request)
    {
        $config = PPDBConfiguration::getActiveConfiguration();
        $fileName = 'PPDB_Diterima_' . ($config?->academic_year ?? date('Y')) . '_' . ($config?->batch_name ?? 'Batch') . '.xlsx';
        return Excel::download(new AcceptedApplicationsExport(
            academicYear: $config?->academic_year,
            batch: $config?->batch_name,
            major: $request->get('major'),
            path: $request->get('path')
        ), $fileName);
    }

    /**
     * Show PPDB application detail by slug (registration_number or ID) in public page
     */
    public function showBySlug($slug)
    {
        $tenantService = app(TenantService::class);
        $tenant = $tenantService->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
        }

        // Find application by registration_number or ID and ensure it belongs to current tenant
        $application = PPDBApplication::where('instansi_id', $tenant->id)
            ->where(function($query) use ($slug) {
                $query->where('registration_number', $slug)
                      ->orWhere('id', $slug);
            })
            ->firstOrFail();

        // Get tenant profile for layout
        $profile = \App\Models\Tenant\TenantProfile::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->first();

        // Get menus for navigation
        $menus = \App\Models\Tenant\Menu::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        return view('public.ppdb.show', compact('application', 'profile', 'menus', 'tenant'));
    }
}
