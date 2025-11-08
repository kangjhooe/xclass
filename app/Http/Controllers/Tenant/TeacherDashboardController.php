<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherDashboardController extends Controller
{
    /**
     * Dashboard untuk guru melihat dan melengkapi data sendiri
     */
    public function index()
    {
        $user = Auth::user();
        
        if ($user->role !== 'teacher') {
            return redirect()->route('tenant.dashboard')
                ->with('error', 'Anda tidak memiliki akses ke halaman ini.');
        }

        // Get teacher profile
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('tenant.dashboard')
                ->with('error', 'Data guru tidak ditemukan.');
        }

        // Get progress
        $progress = $this->calculateProgress($teacher);

        // Get recent activity logs
        $activityLogs = [];
        if (method_exists($teacher, 'activityLogs')) {
            $activityLogs = $teacher->activityLogs()
                ->with('user')
                ->latest()
                ->limit(10)
                ->get();
        }

        // Get schedules for today
        $todaySchedules = [];
        if (method_exists($teacher, 'schedules')) {
            $dayNames = ['monday' => 'Senin', 'tuesday' => 'Selasa', 'wednesday' => 'Rabu', 
                        'thursday' => 'Kamis', 'friday' => 'Jumat', 'saturday' => 'Sabtu', 'sunday' => 'Minggu'];
            $today = strtolower(now()->format('l'));
            $todaySchedules = $teacher->schedules()
                ->where('day', $today)
                ->with(['subject', 'classRoom'])
                ->get();
        }

        return view('tenant.teachers.dashboard', compact('teacher', 'progress', 'activityLogs', 'todaySchedules'));
    }

    /**
     * Calculate data completion progress
     */
    private function calculateProgress($teacher)
    {
        $fieldsToCheck = [
            ['name', 2], ['nik', 3], ['nuptk', 2], ['nip', 2], ['page_id', 1], ['npk', 1],
            ['birth_place', 1], ['birth_date', 2], ['gender', 2], ['mother_name', 1],
            ['address', 1], ['province', 1], ['city', 1], ['district', 1], ['village', 1],
            ['postal_code', 1], ['email', 2], ['phone', 1],
            ['jenjang', 2], ['study_program_group', 2], ['education_level', 2],
            ['employment_status', 2], ['employment_status_detail', 1], ['golongan', 1],
            ['tmt_sk_cpns', 1], ['tmt_sk_awal', 1], ['tmt_sk_terakhir', 1],
            ['appointing_institution', 1], ['assignment_status', 1], ['salary', 2],
            ['main_duty', 1], ['main_subject', 2], ['teaching_hours_per_week', 2],
            ['certification_participation_status', 1], ['certification_year', 1], ['nrg', 2],
        ];

        $totalWeight = 0;
        $filledWeight = 0;

        foreach ($fieldsToCheck as $fieldData) {
            $field = $fieldData[0];
            $weight = $fieldData[1];
            $totalWeight += $weight;

            $value = $teacher->$field;
            $isFilled = false;

            if (is_bool($value)) {
                $isFilled = true;
            } elseif ($value !== null && $value !== '') {
                $isFilled = true;
            }

            if ($isFilled) {
                $filledWeight += $weight;
            }
        }

        $percentage = $totalWeight > 0 ? ($filledWeight / $totalWeight) * 100 : 0;

        return [
            'percentage' => round($percentage, 2),
            'filled' => $filledWeight,
            'total' => $totalWeight,
        ];
    }
}
