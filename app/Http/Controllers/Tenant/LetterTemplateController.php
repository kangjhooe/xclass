<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\LetterTemplate;
use App\Http\Requests\LetterTemplateRequest;
use Illuminate\Http\Request;

class LetterTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LetterTemplate::where('instansi_id', auth()->user()->instansi_id);

        // Filter by jenis surat
        if ($request->filled('jenis_surat')) {
            $query->where('jenis_surat', $request->jenis_surat);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_template', 'like', "%{$search}%")
                  ->orWhere('jenis_surat', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        $templates = $query->orderBy('nama_template')->paginate(20);

        return view('tenant.letters.templates.index', compact('templates'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('tenant.letters.templates.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(LetterTemplateRequest $request)
    {
        $data = $request->validated();
        $data['instansi_id'] = auth()->user()->instansi_id;
        $data['created_by'] = auth()->id();

        LetterTemplate::create($data);

        return redirect()->to(tenant_route('tenant.letters.templates.index'))
            ->with('success', 'Template surat berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(LetterTemplate $template_surat)
    {
        $this->authorize('view', $template_surat);
        
        return view('tenant.letters.templates.show', compact('template_surat'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LetterTemplate $template_surat)
    {
        $this->authorize('update', $template_surat);
        
        return view('tenant.letters.templates.edit', compact('template_surat'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(LetterTemplateRequest $request, LetterTemplate $template_surat)
    {
        $this->authorize('update', $template_surat);

        $template_surat->update($request->validated());

        return redirect()->to(tenant_route('tenant.letters.templates.index'))
            ->with('success', 'Template surat berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LetterTemplate $template_surat)
    {
        $this->authorize('delete', $template_surat);

        $template_surat->delete();

        return redirect()->to(tenant_route('tenant.letters.templates.index'))
            ->with('success', 'Template surat berhasil dihapus');
    }

    /**
     * Toggle active status
     */
    public function toggleActive(LetterTemplate $template_surat)
    {
        $this->authorize('update', $template_surat);

        if ($template_surat->is_active) {
            $template_surat->deactivate();
            $message = 'Template berhasil dinonaktifkan';
        } else {
            $template_surat->activate();
            $message = 'Template berhasil diaktifkan';
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Preview template with variables
     */
    public function preview(Request $request, LetterTemplate $template_surat)
    {
        $this->authorize('view', $template_surat);

        $variables = $request->get('variables', []);
        $processedContent = $template_surat->processTemplate($variables);

        return response()->json([
            'success' => true,
            'template_content' => $processedContent,
            'variables' => $template_surat->available_variables
        ]);
    }

    /**
     * Get templates by jenis surat
     */
    public function getByJenisSurat(Request $request)
    {
        $request->validate([
            'jenis_surat' => 'required|string',
        ]);

        $templates = LetterTemplate::where('instansi_id', auth()->user()->instansi_id)
            ->where('jenis_surat', $request->jenis_surat)
            ->where('is_active', true)
            ->select('id', 'nama_template', 'deskripsi')
            ->get();

        return response()->json($templates);
    }
}
