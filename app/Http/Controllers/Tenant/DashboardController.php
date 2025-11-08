<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Subject;
use App\Models\Tenant\Schedule;
use App\Models\Tenant\Attendance;
use App\Models\Tenant\Grade;
use App\Models\Tenant\AcademicYear;
use App\Models\Core\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends BaseTenantController
{
    /**
     * Show tenant dashboard
     */
    public function index()
    {
        // Redirect teacher ke dashboard mereka sendiri
        $user = Auth::user();
        if ($user->role === 'teacher') {
            $tenant = $this->getCurrentTenant();
            if ($tenant) {
                return redirect()->route('tenant.teacher.dashboard', ['tenant' => $tenant->npsn]);
            }
        }
        
        $tenant = $this->getCurrentTenant();
        $instansiId = $user->instansi_id;
        
        // Get current active academic year
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        $stats = [
            'total_students' => Student::where('instansi_id', $tenant->id)->count(),
            'total_teachers' => Teacher::where('instansi_id', $tenant->id)->count(),
            'total_classes' => ClassRoom::where('instansi_id', $tenant->id)->count(),
            'total_subjects' => Subject::where('instansi_id', $tenant->id)->count(),
        ];

        $recent_students = Student::where('instansi_id', $tenant->id)
            ->latest()
            ->take(5)
            ->get();

        $recent_teachers = Teacher::where('instansi_id', $tenant->id)
            ->latest()
            ->take(5)
            ->get();

        // Get today schedules for active academic year
        $todaySchedulesQuery = Schedule::where('instansi_id', $tenant->id)
            ->where('day', strtolower(now()->format('l')))
            ->active()
            ->with(['teacher', 'subject', 'classRoom']);
            
        if ($currentAcademicYear) {
            $todaySchedulesQuery->where('academic_year', $currentAcademicYear->year_name);
        }
        
        $today_schedules = $todaySchedulesQuery->get();

        return view('tenant.dashboard', compact('stats', 'recent_students', 'recent_teachers', 'today_schedules', 'currentAcademicYear'));
    }

    /**
     * Show reports page
     */
    public function reports()
    {
        return view('tenant.reports');
    }

    /**
     * Show student reports
     */
    public function studentReports()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $students = Student::where('instansi_id', $tenant->id)
            ->with(['classRoom', 'attendances', 'grades'])
            ->orderBy('name')
            ->get();

        return view('tenant.reports.students', compact('students'));
    }

    /**
     * Show teacher reports
     */
    public function teacherReports()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $teachers = Teacher::where('instansi_id', $tenant->id)
            ->with(['classes', 'subjects', 'schedules'])
            ->orderBy('name')
            ->get();

        return view('tenant.reports.teachers', compact('teachers'));
    }

    /**
     * Show attendance reports
     */
    public function attendanceReports()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $attendances = Attendance::where('instansi_id', $tenant->id)
            ->with(['student', 'schedule', 'teacher'])
            ->orderBy('date', 'desc')
            ->paginate(20);

        return view('tenant.reports.attendance', compact('attendances'));
    }

    /**
     * Show grade reports
     */
    public function gradeReports()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $grades = Grade::where('instansi_id', $tenant->id)
            ->with(['student', 'subject', 'teacher'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.reports.grades', compact('grades'));
    }

    /**
     * Show the form for editing tenant profile
     */
    public function editProfile()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
        }
        
        return view('tenant.profile.edit', compact('tenant'));
    }

    /**
     * Update tenant profile
     */
    public function updateProfile(Request $request)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'type_tenant' => 'required|in:Sekolah Umum,Madrasah',
            'jenjang' => 'required|in:SD,MI,SMP,MTs,SMA,MA,SMK,Lainnya',
            'email' => 'required|email|unique:tenants,email,' . $tenant->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'website' => 'nullable|url',
        ]);

        $tenant->update($request->all());

        return redirect()->route('tenant.profile.edit')
            ->with('success', 'Profil tenant berhasil diperbarui');
    }
}
