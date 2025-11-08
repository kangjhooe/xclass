<?php

namespace App\Http\Controllers;

use App\Models\LetterTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LetterTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        
        $query = LetterTemplate::where('instansi_id', $instansiId);
        
        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        
        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        
        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        $templates = $query->orderBy('created_at', 'desc')->paginate(20);
        $categories = LetterTemplate::getCategories();
        
        return view('tenant.letters.templates.index', compact('templates', 'categories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = LetterTemplate::getCategories();
        $defaultVariables = LetterTemplate::getDefaultVariables();
        
        return view('tenant.letters.templates.create', compact('categories', 'defaultVariables'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'content' => 'required|string',
            'variables_json' => 'nullable|array',
            'description' => 'nullable|string|max:500',
        ]);

        $instansiId = Auth::user()->instansi_id;
        
        LetterTemplate::create([
            'instansi_id' => $instansiId,
            'title' => $request->title,
            'category' => $request->category,
            'content' => $request->content,
            'variables_json' => $request->variables_json ?? [],
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('tenant.letters.templates.index')
            ->with('success', 'Template surat berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(LetterTemplate $letterTemplate)
    {
        $defaultVariables = LetterTemplate::getDefaultVariables();
        
        return view('tenant.letters.templates.show', compact('letterTemplate', 'defaultVariables'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LetterTemplate $letterTemplate)
    {
        $categories = LetterTemplate::getCategories();
        $defaultVariables = LetterTemplate::getDefaultVariables();
        
        return view('tenant.letters.templates.edit', compact('letterTemplate', 'categories', 'defaultVariables'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LetterTemplate $letterTemplate)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'content' => 'required|string',
            'variables_json' => 'nullable|array',
            'description' => 'nullable|string|max:500',
        ]);

        $letterTemplate->update([
            'title' => $request->title,
            'category' => $request->category,
            'content' => $request->content,
            'variables_json' => $request->variables_json ?? [],
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('tenant.letters.templates.index')
            ->with('success', 'Template surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LetterTemplate $letterTemplate)
    {
        $letterTemplate->delete();

        return redirect()->route('tenant.letters.templates.index')
            ->with('success', 'Template surat berhasil dihapus.');
    }

    /**
     * Toggle active status
     */
    public function toggleActive(LetterTemplate $letterTemplate)
    {
        $letterTemplate->update(['is_active' => !$letterTemplate->is_active]);
        
        $status = $letterTemplate->is_active ? 'diaktifkan' : 'dinonaktifkan';
        
        return redirect()->back()->with('success', "Template surat berhasil {$status}.");
    }

    /**
     * Preview template with variables
     */
    public function preview(LetterTemplate $letterTemplate, Request $request)
    {
        $variables = $request->input('variables', []);
        $processedContent = $letterTemplate->processTemplate($variables);
        
        return response()->json(['content' => $processedContent]);
    }

    /**
     * Get templates by category for AJAX
     */
    public function getByCategory(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $category = $request->input('category');
        
        $templates = LetterTemplate::where('instansi_id', $instansiId)
            ->where('is_active', true)
            ->when($category, function($query) use ($category) {
                return $query->where('category', $category);
            })
            ->get(['id', 'title', 'category']);
        
        return response()->json($templates);
    }

    /**
     * Get template variables for AJAX
     */
    public function getVariables(LetterTemplate $letterTemplate)
    {
        return response()->json([
            'variables' => $letterTemplate->getAvailableVariables(),
            'default_variables' => LetterTemplate::getDefaultVariables()
        ]);
    }
}
