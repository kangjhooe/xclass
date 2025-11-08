<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\AcademicYear;
use App\Models\Tenant\Schedule;
use App\Models\Tenant\ClassRoom;
use App\Http\Requests\Tenant\AcademicYearRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends BaseTenantController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', AcademicYear::class);

        $tenant = $this->getCurrentTenant();
        $academicYears = AcademicYear::where('instansi_id', $tenant->id)
            ->orderBy('start_date', 'desc')
            ->paginate(10);

        return view('tenant.academic-years.index', compact('academicYears'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', AcademicYear::class);

        return view('tenant.academic-years.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AcademicYearRequest $request)
    {
        $this->authorize('create', AcademicYear::class);

        $validated = $request->validated();

        $tenant = $this->getCurrentTenant();

        try {
            return $this->transaction(function () use ($validated, $request, $tenant) {
                // Jika tahun pelajaran ini diaktifkan, nonaktifkan yang lain dalam transaction
                if ($request->boolean('is_active')) {
                    AcademicYear::where('instansi_id', $tenant->id)
                        ->update(['is_active' => false]);
                }

                $data = $this->prepareTenantData($validated);
                $data['is_active'] = $request->boolean('is_active', false);
                $data['current_semester'] = $request->input('current_semester', 1);

                AcademicYear::create($data);

                return redirect()->route('tenant.academic-years.index', ['tenant' => $tenant->npsn])
                    ->with('success', 'Tahun pelajaran berhasil ditambahkan.');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'menambahkan tahun pelajaran');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AcademicYear $academicYear)
    {
        $this->authorize('view', $academicYear);
        
        return view('tenant.academic-years.show', compact('academicYear'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AcademicYear $academicYear)
    {
        $this->authorize('update', $academicYear);
        
        return view('tenant.academic-years.edit', compact('academicYear'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AcademicYearRequest $request, AcademicYear $academicYear)
    {
        $this->authorize('update', $academicYear);
        $this->ensureTenantAccess($academicYear);

        $validated = $request->validated();

        $tenant = $this->getCurrentTenant();

        try {
            return $this->transaction(function () use ($validated, $request, $academicYear, $tenant) {
                // Jika tahun pelajaran ini diaktifkan, nonaktifkan yang lain dalam transaction yang sama
                if ($request->boolean('is_active')) {
                    AcademicYear::where('instansi_id', $tenant->id)
                        ->where('id', '!=', $academicYear->id)
                        ->update(['is_active' => false]);
                }

                // Only update allowed fields, prevent mass assignment
                $allowedFields = [
                    'year_name',
                    'start_date',
                    'end_date',
                    'is_active',
                ];

                $data = $this->getAllowedFields($request, $allowedFields);
                if ($request->has('is_active')) {
                    $data['is_active'] = $request->boolean('is_active');
                }

                $academicYear->update($data);

                return redirect()->route('tenant.academic-years.index', ['tenant' => $tenant->npsn])
                    ->with('success', 'Tahun pelajaran berhasil diperbarui.');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui tahun pelajaran');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, AcademicYear $academicYear)
    {
        $this->authorize('delete', $academicYear);

        // Cek apakah tahun pelajaran ini sedang aktif
        if ($academicYear->is_active) {
            return redirect()->back()
                ->with('error', 'Tidak dapat menghapus tahun pelajaran yang sedang aktif.');
        }

        // Cek apakah tahun pelajaran memiliki data terkait
        if ($academicYear->hasRelatedData()) {
            $dataCount = $academicYear->getRelatedDataCount();
            $message = 'Tidak dapat menghapus tahun pelajaran karena masih memiliki data terkait. ';
            $message .= sprintf('Data yang ditemukan: %d nilai siswa.', $dataCount['student_grades']);
            
            return redirect()->back()
                ->with('error', $message);
        }

        $tenant = $this->getCurrentTenant();

        try {
            $academicYear->delete();

            return redirect()->route('tenant.academic-years.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Tahun pelajaran berhasil dihapus.');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus tahun pelajaran');
        }
    }

    /**
     * Set academic year as active
     */
    public function setActive(AcademicYear $academicYear)
    {
        $this->authorize('setActive', $academicYear);
        $this->ensureTenantAccess($academicYear);

        $tenant = $this->getCurrentTenant();

        try {
            return $this->transaction(function () use ($academicYear, $tenant) {
                // Dapatkan tahun pelajaran yang sebelumnya aktif
                $previousActive = AcademicYear::where('instansi_id', $tenant->id)
                    ->where('is_active', true)
                    ->where('id', '!=', $academicYear->id)
                    ->first();

                // Nonaktifkan semua tahun pelajaran dan aktifkan yang dipilih dalam transaction yang sama
                AcademicYear::where('instansi_id', $tenant->id)
                    ->update(['is_active' => false]);

                $academicYear->update(['is_active' => true]);

                $message = 'Tahun pelajaran ' . $academicYear->year_name . ' berhasil diaktifkan.';
                
                // Informasikan bahwa data tahun pelajaran sebelumnya tetap aman
                if ($previousActive && method_exists($previousActive, 'getRelatedDataCount')) {
                    $dataCount = $previousActive->getRelatedDataCount();
                    if ($dataCount['student_grades'] > 0) {
                        $message .= ' Data dari tahun pelajaran ' . $previousActive->year_name . ' tetap aman dan dapat diakses.';
                    }
                }

                return redirect()->back()
                    ->with('success', $message);
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'mengaktifkan tahun pelajaran');
        }
    }

    /**
     * Set active semester for current academic year
     */
    public function setActiveSemester(Request $request, AcademicYear $academicYear)
    {
        $this->authorize('update', $academicYear);

        // Hanya bisa set semester untuk tahun pelajaran yang aktif
        if (!$academicYear->is_active) {
            return redirect()->back()
                ->with('error', 'Hanya bisa mengatur semester untuk tahun pelajaran yang sedang aktif.');
        }

        $request->validate([
            'semester' => 'required|integer|in:1,2',
        ]);

        $academicYear->update(['current_semester' => $request->semester]);

        $semesterName = $request->semester == 1 ? 'Ganjil' : 'Genap';
        $message = "Semester {$semesterName} berhasil diaktifkan untuk tahun pelajaran {$academicYear->year_name}.";

        return redirect()->back()
            ->with('success', $message);
    }

    /**
     * Copy schedules from another academic year
     */
    public function copySchedules(Request $request, AcademicYear $academicYear)
    {
        $this->authorize('update', $academicYear);

        $request->validate([
            'from_academic_year_id' => 'required|exists:academic_years,id',
            'class_mapping' => 'nullable|array', // Mapping class_id dari tahun lama ke tahun baru
        ]);

        $fromAcademicYear = AcademicYear::findOrFail($request->from_academic_year_id);
        $instansiId = Auth::user()->instansi_id;

        // Get schedules from source academic year
        $schedules = Schedule::where('instansi_id', $instansiId)
            ->where('academic_year', $fromAcademicYear->year_name)
            ->where('is_active', true)
            ->get();

        if ($schedules->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada jadwal yang bisa di-copy dari tahun pelajaran ' . $fromAcademicYear->year_name);
        }

        $copied = 0;
        $skipped = 0;

        DB::beginTransaction();
        try {
            foreach ($schedules as $schedule) {
                // Check if schedule already exists
                $exists = Schedule::where('instansi_id', $instansiId)
                    ->where('academic_year', $academicYear->year_name)
                    ->where('class_id', $schedule->class_id)
                    ->where('subject_id', $schedule->subject_id)
                    ->where('teacher_id', $schedule->teacher_id)
                    ->where('day', $schedule->day)
                    ->where('start_time', $schedule->start_time)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                // Map class_id if class_mapping provided
                $toClassId = $schedule->class_id;
                if (isset($request->class_mapping[$schedule->class_id])) {
                    $toClassId = $request->class_mapping[$schedule->class_id];
                }

                // Check if target class exists
                $targetClass = ClassRoom::where('id', $toClassId)
                    ->where('instansi_id', $instansiId)
                    ->first();

                if (!$targetClass) {
                    $skipped++;
                    continue;
                }

                Schedule::create([
                    'npsn' => $schedule->npsn,
                    'day' => $schedule->day,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'teacher_id' => $schedule->teacher_id,
                    'subject_id' => $schedule->subject_id,
                    'class_id' => $toClassId,
                    'room' => $schedule->room,
                    'academic_year' => $academicYear->year_name,
                    'semester' => $schedule->semester ?? 1,
                    'is_active' => true,
                    'notes' => $schedule->notes,
                    'instansi_id' => $instansiId,
                ]);

                $copied++;
            }

            DB::commit();

            $message = "Berhasil menyalin {$copied} jadwal dari tahun pelajaran {$fromAcademicYear->year_name}.";
            if ($skipped > 0) {
                $message .= " {$skipped} jadwal dilewati (sudah ada atau kelas tidak ditemukan).";
            }

            return redirect()->back()
                ->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleException($e, 'menyalin jadwal');
        }
    }

    /**
     * Copy classes from another academic year
     */
    public function copyClasses(Request $request, AcademicYear $academicYear)
    {
        $this->authorize('update', $academicYear);

        $request->validate([
            'from_academic_year_id' => 'required|exists:academic_years,id',
        ]);

        $fromAcademicYear = AcademicYear::findOrFail($request->from_academic_year_id);
        $instansiId = Auth::user()->instansi_id;

        // Get classes from source academic year
        $classes = ClassRoom::where('instansi_id', $instansiId)
            ->where('academic_year', $fromAcademicYear->year_name)
            ->where('is_active', true)
            ->get();

        if ($classes->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada kelas yang bisa di-copy dari tahun pelajaran ' . $fromAcademicYear->year_name);
        }

        $copied = 0;
        $skipped = 0;

        DB::beginTransaction();
        try {
            foreach ($classes as $class) {
                // Check if class already exists
                $exists = ClassRoom::where('instansi_id', $instansiId)
                    ->where('academic_year', $academicYear->year_name)
                    ->where('name', $class->name)
                    ->where('level', $class->level)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                ClassRoom::create([
                    'npsn' => $class->npsn,
                    'name' => $class->name,
                    'level' => $class->level,
                    'major' => $class->major,
                    'capacity' => $class->capacity,
                    'room_number' => $class->room_number,
                    'description' => $class->description,
                    'homeroom_teacher_id' => $class->homeroom_teacher_id,
                    'academic_year' => $academicYear->year_name,
                    'is_active' => true,
                    'instansi_id' => $instansiId,
                ]);

                $copied++;
            }

            DB::commit();

            $message = "Berhasil menyalin {$copied} kelas dari tahun pelajaran {$fromAcademicYear->year_name}.";
            if ($skipped > 0) {
                $message .= " {$skipped} kelas dilewati (sudah ada).";
            }

            return redirect()->back()
                ->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleException($e, 'menyalin jadwal');
        }
    }

    /**
     * Show form to copy data from another academic year
     */
    public function showCopyForm(AcademicYear $academicYear)
    {
        $this->authorize('update', $academicYear);

        $instansiId = Auth::user()->instansi_id;
        $academicYears = AcademicYear::where('instansi_id', $instansiId)
            ->where('id', '!=', $academicYear->id)
            ->orderBy('start_date', 'desc')
            ->get();

        // Get classes from target academic year for mapping
        $targetClasses = ClassRoom::where('instansi_id', $instansiId)
            ->where('academic_year', $academicYear->year_name)
            ->get()
            ->groupBy('level');

        return view('tenant.academic-years.copy-data', compact(
            'academicYear',
            'academicYears',
            'targetClasses'
        ));
    }

    /**
     * Get classes from academic year (for AJAX)
     */
    public function getClasses(AcademicYear $academicYear)
    {
        $this->authorize('view', $academicYear);

        $instansiId = Auth::user()->instansi_id;
        $classes = ClassRoom::where('instansi_id', $instansiId)
            ->where('academic_year', $academicYear->year_name)
            ->where('is_active', true)
            ->get(['id', 'name', 'level', 'major']);

        return response()->json([
            'classes' => $classes
        ]);
    }
}
