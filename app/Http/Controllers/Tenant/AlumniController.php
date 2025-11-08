<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Alumni;
use App\Models\Tenant\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AlumniController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Alumni::with(['student', 'achievements'])
            ->where('instansi_id', current_tenant()->id);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by graduation year
        if ($request->filled('graduation_year')) {
            $query->where('graduation_year', $request->graduation_year);
        }

        // Search by name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $alumni = $query->orderBy('graduation_year', 'desc')
            ->orderBy('final_grade', 'desc')
            ->paginate(15);

        // Get statistics
        $stats = [
            'total' => Alumni::where('instansi_id', current_tenant()->id)->count(),
            'employed' => Alumni::where('instansi_id', current_tenant()->id)
                ->where('status', Alumni::STATUS_EMPLOYED)->count(),
            'studying' => Alumni::where('instansi_id', current_tenant()->id)
                ->where('status', Alumni::STATUS_STUDYING)->count(),
            'self_employed' => Alumni::where('instansi_id', current_tenant()->id)
                ->where('status', Alumni::STATUS_SELF_EMPLOYED)->count(),
        ];

        // Get graduation years for filter
        $graduationYears = Alumni::where('instansi_id', current_tenant()->id)
            ->distinct()
            ->pluck('graduation_year')
            ->sort()
            ->values();

        return view('tenant.alumni.index', compact('alumni', 'stats', 'graduationYears'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $students = Student::where('instansi_id', current_tenant()->id)
            ->whereDoesntHave('alumni')
            ->orderBy('name')
            ->get();

        return view('tenant.alumni.create', compact('students'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'graduation_year' => 'required|integer|min:2000|max:' . date('Y'),
            'graduation_date' => 'required|date',
            'final_grade' => 'required|numeric|min:0|max:100',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'rank' => 'nullable|integer|min:1',
            'current_occupation' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'salary_range' => 'nullable|numeric|min:0',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'status' => 'required|in:' . implode(',', [
                Alumni::STATUS_EMPLOYED,
                Alumni::STATUS_UNEMPLOYED,
                Alumni::STATUS_SELF_EMPLOYED,
                Alumni::STATUS_STUDYING,
                Alumni::STATUS_RETIRED,
                Alumni::STATUS_UNKNOWN
            ]),
            'notes' => 'nullable|string'
        ]);

        $alumni = Alumni::create([
            'instansi_id' => current_tenant()->id,
            'student_id' => $request->student_id,
            'graduation_year' => $request->graduation_year,
            'graduation_date' => $request->graduation_date,
            'final_grade' => $request->final_grade,
            'gpa' => $request->gpa,
            'rank' => $request->rank,
            'current_occupation' => $request->current_occupation,
            'company' => $request->company,
            'position' => $request->position,
            'industry' => $request->industry,
            'salary_range' => $request->salary_range,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'status' => $request->status,
            'notes' => $request->notes,
            'is_active' => true,
            'last_contact_date' => now()
        ]);

        return redirect()->route('tenant.alumni.index')
            ->with('success', 'Data alumni berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Alumni $alumni)
    {
        $this->authorize('view', $alumni);
        
        $alumni->load(['student', 'achievements']);
        
        return view('tenant.alumni.show', compact('alumni'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Alumni $alumni)
    {
        $this->authorize('update', $alumni);
        
        return view('tenant.alumni.edit', compact('alumni'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Alumni $alumni)
    {
        $this->authorize('update', $alumni);

        $request->validate([
            'graduation_year' => 'required|integer|min:2000|max:' . date('Y'),
            'graduation_date' => 'required|date',
            'final_grade' => 'required|numeric|min:0|max:100',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'rank' => 'nullable|integer|min:1',
            'current_occupation' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'salary_range' => 'nullable|numeric|min:0',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'status' => 'required|in:' . implode(',', [
                Alumni::STATUS_EMPLOYED,
                Alumni::STATUS_UNEMPLOYED,
                Alumni::STATUS_SELF_EMPLOYED,
                Alumni::STATUS_STUDYING,
                Alumni::STATUS_RETIRED,
                Alumni::STATUS_UNKNOWN
            ]),
            'notes' => 'nullable|string'
        ]);

        $alumni->update($request->all());

        return redirect()->route('tenant.alumni.index')
            ->with('success', 'Data alumni berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Alumni $alumni)
    {
        $this->authorize('delete', $alumni);
        
        $alumni->delete();

        return redirect()->route('tenant.alumni.index')
            ->with('success', 'Data alumni berhasil dihapus.');
    }

    /**
     * Update alumni status
     */
    public function updateStatus(Request $request, Alumni $alumni)
    {
        $this->authorize('update', $alumni);

        $request->validate([
            'status' => 'required|in:' . implode(',', [
                Alumni::STATUS_EMPLOYED,
                Alumni::STATUS_UNEMPLOYED,
                Alumni::STATUS_SELF_EMPLOYED,
                Alumni::STATUS_STUDYING,
                Alumni::STATUS_RETIRED,
                Alumni::STATUS_UNKNOWN
            ])
        ]);

        $alumni->update([
            'status' => $request->status,
            'last_contact_date' => now()
        ]);

        return redirect()->back()
            ->with('success', 'Status alumni berhasil diperbarui.');
    }

    /**
     * Toggle active status
     */
    public function toggleActive(Alumni $alumni)
    {
        $this->authorize('update', $alumni);

        $alumni->update([
            'is_active' => !$alumni->is_active,
            'last_contact_date' => now()
        ]);

        $status = $alumni->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->back()
            ->with('success', "Alumni berhasil {$status}.");
    }

    /**
     * Get alumni statistics
     */
    /**
     * Alumni network - show connections and networking features
     */
    public function network(Request $request)
    {
        $instansiId = current_tenant()->id;
        
        // Get alumni by graduation year
        $alumniByYear = Alumni::where('instansi_id', $instansiId)
            ->where('is_active', true)
            ->select('graduation_year', DB::raw('count(*) as total'))
            ->groupBy('graduation_year')
            ->orderBy('graduation_year', 'desc')
            ->get();

        // Get alumni by current status
        $alumniByStatus = Alumni::where('instansi_id', $instansiId)
            ->where('is_active', true)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        // Get alumni by location (if available)
        $alumniByLocation = Alumni::where('instansi_id', $instansiId)
            ->where('is_active', true)
            ->whereNotNull('current_location')
            ->select('current_location', DB::raw('count(*) as total'))
            ->groupBy('current_location')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        // Recent alumni updates
        $recentUpdates = Alumni::where('instansi_id', $instansiId)
            ->where('is_active', true)
            ->whereNotNull('last_updated_at')
            ->orderBy('last_updated_at', 'desc')
            ->limit(10)
            ->get();

        return view('tenant.alumni.network', [
            'title' => 'Jaringan Alumni',
            'page-title' => 'Jaringan Alumni',
            'alumniByYear' => $alumniByYear,
            'alumniByStatus' => $alumniByStatus,
            'alumniByLocation' => $alumniByLocation,
            'recentUpdates' => $recentUpdates
        ]);
    }

    /**
     * Career tracking - track alumni careers
     */
    public function careerTracking(Request $request)
    {
        $instansiId = current_tenant()->id;
        
        $query = Alumni::where('instansi_id', $instansiId)
            ->where('is_active', true);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by graduation year
        if ($request->filled('graduation_year')) {
            $query->where('graduation_year', $request->graduation_year);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('current_position', 'like', "%{$search}%")
              ->orWhere('current_company', 'like', "%{$search}%");
        }

        $alumni = $query->with(['student'])->orderBy('graduation_year', 'desc')->paginate(20);

        // Career statistics
        $careerStats = [
            'total_tracked' => Alumni::where('instansi_id', $instansiId)->whereNotNull('current_position')->count(),
            'employed' => Alumni::where('instansi_id', $instansiId)->where('status', Alumni::STATUS_EMPLOYED)->count(),
            'in_education' => Alumni::where('instansi_id', $instansiId)->where('status', Alumni::STATUS_STUDYING)->count(),
            'entrepreneurs' => Alumni::where('instansi_id', $instansiId)->where('status', Alumni::STATUS_SELF_EMPLOYED)->count(),
        ];

        return view('tenant.alumni.career-tracking', [
            'title' => 'Tracking Karir Alumni',
            'page-title' => 'Tracking Karir Alumni',
            'alumni' => $alumni,
            'careerStats' => $careerStats
        ]);
    }

    /**
     * Update career information
     */
    public function updateCareer(Request $request, Alumni $alumni)
    {
        $request->validate([
            'current_position' => 'nullable|string|max:255',
            'current_company' => 'nullable|string|max:255',
            'current_location' => 'nullable|string|max:255',
            'status' => 'required|in:employed,studying,self_employed,not_employed',
            'career_notes' => 'nullable|string|max:1000'
        ]);

        try {
            $alumni->update([
                'current_position' => $request->current_position,
                'current_company' => $request->current_company,
                'current_location' => $request->current_location,
                'status' => $request->status,
                'career_notes' => $request->career_notes,
                'last_updated_at' => now()
            ]);

            return redirect()->back()->with('success', 'Informasi karir berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Reunion management
     */
    public function reunions(Request $request)
    {
        $instansiId = current_tenant()->id;
        
        $query = DB::table('alumni_reunions')
            ->where('instansi_id', $instansiId);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reunions = $query->orderBy('event_date', 'desc')->paginate(20);

        return view('tenant.alumni.reunions', [
            'title' => 'Reuni Alumni',
            'page-title' => 'Manajemen Reuni Alumni',
            'reunions' => $reunions
        ]);
    }

    /**
     * Create reunion
     */
    public function createReunion(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'event_date' => 'required|date',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'target_graduation_years' => 'nullable|array',
            'registration_deadline' => 'nullable|date|before:event_date'
        ]);

        try {
            DB::beginTransaction();

            $reunionId = DB::table('alumni_reunions')->insertGetId([
                'instansi_id' => current_tenant()->id,
                'title' => $request->title,
                'event_date' => $request->event_date,
                'location' => $request->location,
                'description' => $request->description,
                'target_graduation_years' => json_encode($request->target_graduation_years ?? []),
                'registration_deadline' => $request->registration_deadline,
                'status' => 'upcoming',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return redirect()->route('tenant.alumni.reunions')
                ->with('success', 'Reuni berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Register alumni for reunion
     */
    public function registerReunion(Request $request, $reunionId)
    {
        $request->validate([
            'alumni_ids' => 'required|array',
            'alumni_ids.*' => 'exists:alumni,id'
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->alumni_ids as $alumniId) {
                DB::table('alumni_reunion_registrations')->insert([
                    'reunion_id' => $reunionId,
                    'alumni_id' => $alumniId,
                    'status' => 'registered',
                    'registered_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Pendaftaran reuni berhasil');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function statistics()
    {
        $tenantId = current_tenant()->id;
        
        $stats = [
            'total' => Alumni::where('instansi_id', $tenantId)->count(),
            'active' => Alumni::where('instansi_id', $tenantId)->where('is_active', true)->count(),
            'by_status' => Alumni::where('instansi_id', $tenantId)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'by_graduation_year' => Alumni::where('instansi_id', $tenantId)
                ->selectRaw('graduation_year, COUNT(*) as count')
                ->groupBy('graduation_year')
                ->orderBy('graduation_year')
                ->pluck('count', 'graduation_year'),
            'average_gpa' => Alumni::where('instansi_id', $tenantId)
                ->whereNotNull('gpa')
                ->avg('gpa'),
            'average_final_grade' => Alumni::where('instansi_id', $tenantId)
                ->avg('final_grade')
        ];

        return view('tenant.alumni.statistics', compact('stats'));
    }
}
