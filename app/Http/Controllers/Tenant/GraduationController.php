<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\Graduation as Graduate;
use App\Models\Tenant\Student;
use App\Models\Tenant\AcademicYear;
use App\Models\Tenant\Institution;
use App\Exports\GraduationExport;
use App\Core\Services\TenantService;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class GraduationController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        $stats = [
            'total_graduates' => Graduate::where('instansi_id', $instansiId)->count(),
            'this_year_graduates' => Graduate::where('instansi_id', $instansiId)
                ->whereYear('graduation_date', now()->year)
                ->count(),
            'cum_laude_graduates' => Graduate::where('instansi_id', $instansiId)
                ->whereRaw("JSON_CONTAINS(achievements, ?)", [json_encode('cum_laude')])
                ->count(),
            'magna_laude_graduates' => Graduate::where('instansi_id', $instansiId)
                ->whereRaw("JSON_CONTAINS(achievements, ?)", [json_encode('magna_laude')])
                ->count(),
        ];

        $recentGraduates = Graduate::with(['student', 'creator'])
            ->where('instansi_id', $instansiId)
            ->orderBy('graduation_date', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.graduation.index', [
            'title' => 'Kelulusan',
            'page-title' => 'Sistem Kelulusan',
            'stats' => $stats,
            'recentGraduates' => $recentGraduates
        ]);
    }

    /**
     * Display graduates management
     */
    public function graduates()
    {
        $graduates = Graduate::with(['student', 'creator'])
            ->where('instansi_id', $instansiId)
            ->orderBy('graduation_date', 'desc')
            ->paginate(20);

        return view('tenant.graduation.graduates', [
            'title' => 'Lulusan',
            'page-title' => 'Manajemen Lulusan',
            'graduates' => $graduates
        ]);
    }

    /**
     * Show the form for creating a new graduate.
     */
    public function createGraduate()
    {
        $students = Student::where('instansi_id', $instansiId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        $academicYears = AcademicYear::where('instansi_id', $instansiId)
            ->orderBy('year', 'desc')
            ->get();

        return view('tenant.graduation.create-graduate', [
            'title' => 'Tambah Lulusan',
            'page-title' => 'Tambah Data Lulusan',
            'students' => $students,
            'academicYears' => $academicYears
        ]);
    }

    /**
     * Store a newly created graduate in storage.
     */
    public function storeGraduate(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'graduation_date' => 'required|date',
            'final_grade' => 'required|numeric|min:0|max:100',
            'achievement' => 'required|in:none,cum_laude,magna_laude,summa_laude',
            'certificate_number' => 'required|string|max:50|unique:graduates,certificate_number',
            'rank' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            // Get academic year to extract year
            $academicYear = AcademicYear::findOrFail($request->academic_year_id);
            
            // Convert achievement to array format
            $achievements = [];
            if ($request->achievement !== 'none') {
                $achievements[] = $request->achievement;
            }

            Graduate::create([
                'student_id' => $request->student_id,
                'graduation_year' => $academicYear->year,
                'graduation_date' => $request->graduation_date,
                'final_grade' => $request->final_grade,
                'achievements' => $achievements,
                'certificate_number' => $request->certificate_number,
                'rank' => $request->rank,
                'notes' => $request->notes,
                'instansi_id' => $instansiId,
                'created_by' => auth()->id(),
            ]);

            // Update student status to graduated
            $student = Student::find($request->student_id);
            $student->update(['status' => 'graduated']);

            DB::commit();
            return redirect()->route('tenant.graduation.graduates')->with('success', 'Lulusan berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show the form for editing the specified graduate.
     */
    public function editGraduate(string $id)
    {
        $graduate = Graduate::where('instansi_id', $instansiId)
            ->findOrFail($id);

        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        $academicYears = AcademicYear::where('instansi_id', $instansiId)
            ->orderBy('year', 'desc')
            ->get();

        return view('tenant.graduation.edit-graduate', [
            'title' => 'Edit Lulusan',
            'page-title' => 'Edit Data Lulusan',
            'graduate' => $graduate,
            'students' => $students,
            'academicYears' => $academicYears
        ]);
    }

    /**
     * Update the specified graduate in storage.
     */
    public function updateGraduate(Request $request, string $id)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'graduation_date' => 'required|date',
            'final_grade' => 'required|numeric|min:0|max:100',
            'achievement' => 'required|in:none,cum_laude,magna_laude,summa_laude',
            'certificate_number' => 'required|string|max:50|unique:graduates,certificate_number,' . $id,
            'rank' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            $graduate = Graduate::where('instansi_id', $instansiId)
                ->findOrFail($id);

            // Get academic year to extract year
            $academicYear = AcademicYear::findOrFail($request->academic_year_id);
            
            // Convert achievement to array format
            $achievements = [];
            if ($request->achievement !== 'none') {
                $achievements[] = $request->achievement;
            }

            $graduate->update([
                'student_id' => $request->student_id,
                'graduation_year' => $academicYear->year,
                'graduation_date' => $request->graduation_date,
                'final_grade' => $request->final_grade,
                'achievements' => $achievements,
                'certificate_number' => $request->certificate_number,
                'rank' => $request->rank,
                'notes' => $request->notes
            ]);

            DB::commit();
            return redirect()->route('tenant.graduation.graduates')->with('success', 'Lulusan berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified graduate from storage.
     */
    public function destroyGraduate(string $id)
    {
        try {
            DB::beginTransaction();

            $graduate = Graduate::where('instansi_id', $instansiId)
                ->findOrFail($id);

            // Update student status back to active
            $student = Student::find($graduate->student_id);
            $student->update(['status' => 'active']);

            $graduate->delete();

            DB::commit();
            return redirect()->route('tenant.graduation.graduates')->with('success', 'Lulusan berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Generate graduation certificate
     */
    public function generateCertificate(string $id)
    {
        try {
            $graduate = Graduate::with(['student', 'creator'])
                ->where('instansi_id', $instansiId)
                ->findOrFail($id);

            // Get tenant data
            $tenantService = app(TenantService::class);
            $tenant = $tenantService->getCurrentTenant();
            
            // Get institution data
            $institution = Institution::where('instansi_id', $instansiId)->first();
            
            $pdf = Pdf::loadView('tenant.graduation.certificate', [
                'graduate' => $graduate,
                'tenant' => $tenant,
                'institution' => $institution,
            ]);

            $pdf->setPaper('A4', 'landscape');
            $pdf->setOption('enable-local-file-access', true);
            
            $filename = "sertifikat-kelulusan-{$graduate->student->name}-{$graduate->certificate_number}.pdf";
            $filename = preg_replace('/[^A-Za-z0-9\-]/', '-', $filename); // Sanitize filename
            
            return $pdf->download($filename);
        } catch (\Exception $e) {
            \Log::error('Generate Certificate Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Export graduates data
     */
    public function exportGraduates(Request $request): BinaryFileResponse
    {
        try {
            $academicYearId = $request->get('academic_year_id');
            $achievement = $request->get('achievement');

            $query = Graduate::with(['student', 'creator'])
                ->where('instansi_id', $instansiId);

            if ($academicYearId) {
                $query->where('graduation_year', $academicYearId);
            }

            if ($achievement) {
                $query->whereRaw("JSON_CONTAINS(achievements, ?)", [json_encode($achievement)]);
            }

            $graduations = $query->orderBy('graduation_date', 'desc')->get();

            $filename = "data-lulusan-" . now()->format('Y-m-d_H-i-s') . ".xlsx";
            
            return Excel::download(new GraduationExport($graduations), $filename);
        } catch (\Exception $e) {
            \Log::error('Export Graduation Error: ' . $e->getMessage());
            abort(500, 'Terjadi kesalahan saat mengekspor data: ' . $e->getMessage());
        }
    }
}
