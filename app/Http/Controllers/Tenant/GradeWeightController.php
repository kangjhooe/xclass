<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\GradeWeight;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GradeWeightController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $gradeWeights = GradeWeight::where('instansi_id', Auth::user()->instansi_id)
            ->orderBy('assignment_type')
            ->get();

        return view('tenant.grade-weights.index', compact('gradeWeights'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $assignmentTypes = GradeWeight::getAssignmentTypes();
        return view('tenant.grade-weights.create', compact('assignmentTypes'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'assignment_type' => 'required|string|max:255',
            'assignment_label' => 'required|string|max:255',
            'weight_percentage' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        // Cek apakah total bobot tidak melebihi 100%
        $totalWeight = GradeWeight::where('instansi_id', Auth::user()->instansi_id)
            ->where('is_active', true)
            ->sum('weight_percentage');

        if (($totalWeight + $request->weight_percentage) > 100) {
            return redirect()->back()
                ->with('error', 'Total bobot tidak boleh melebihi 100%. Total bobot saat ini: ' . $totalWeight . '%');
        }

        GradeWeight::create([
            'assignment_type' => $request->assignment_type,
            'assignment_label' => $request->assignment_label,
            'weight_percentage' => $request->weight_percentage,
            'is_active' => $request->is_active ?? true,
            'instansi_id' => Auth::user()->instansi_id,
        ]);

        return redirect()->route('tenant.grade-weights.index')
            ->with('success', 'Bobot nilai berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(GradeWeight $gradeWeight)
    {
        $this->authorize('view', $gradeWeight);
        
        return view('tenant.grade-weights.show', compact('gradeWeight'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GradeWeight $gradeWeight)
    {
        $this->authorize('update', $gradeWeight);
        
        $assignmentTypes = GradeWeight::getAssignmentTypes();
        return view('tenant.grade-weights.edit', compact('gradeWeight', 'assignmentTypes'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GradeWeight $gradeWeight)
    {
        $this->authorize('update', $gradeWeight);

        $request->validate([
            'assignment_type' => 'required|string|max:255',
            'assignment_label' => 'required|string|max:255',
            'weight_percentage' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        // Cek apakah total bobot tidak melebihi 100%
        $totalWeight = GradeWeight::where('instansi_id', Auth::user()->instansi_id)
            ->where('is_active', true)
            ->where('id', '!=', $gradeWeight->id)
            ->sum('weight_percentage');

        if (($totalWeight + $request->weight_percentage) > 100) {
            return redirect()->back()
                ->with('error', 'Total bobot tidak boleh melebihi 100%. Total bobot saat ini: ' . $totalWeight . '%');
        }

        $gradeWeight->update($request->all());

        return redirect()->route('tenant.grade-weights.index')
            ->with('success', 'Bobot nilai berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GradeWeight $gradeWeight)
    {
        $this->authorize('delete', $gradeWeight);

        $gradeWeight->delete();

        return redirect()->route('tenant.grade-weights.index')
            ->with('success', 'Bobot nilai berhasil dihapus.');
    }

    /**
     * Reset to default weights
     */
    public function resetToDefault()
    {
        // Hapus semua bobot yang ada
        GradeWeight::where('instansi_id', Auth::user()->instansi_id)->delete();

        // Buat bobot default
        $defaultWeights = GradeWeight::getDefaultWeights();
        foreach ($defaultWeights as $weight) {
            GradeWeight::create([
                'assignment_type' => $weight['assignment_type'],
                'assignment_label' => $weight['assignment_label'],
                'weight_percentage' => $weight['weight_percentage'],
                'is_active' => true,
                'instansi_id' => Auth::user()->instansi_id,
            ]);
        }

        return redirect()->route('tenant.grade-weights.index')
            ->with('success', 'Bobot nilai berhasil direset ke default.');
    }

    /**
     * Toggle active status
     */
    public function toggleActive(GradeWeight $gradeWeight)
    {
        $this->authorize('update', $gradeWeight);

        $gradeWeight->update(['is_active' => !$gradeWeight->is_active]);

        return redirect()->back()
            ->with('success', 'Status bobot nilai berhasil diperbarui.');
    }
}
