<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\Budget;
use App\Models\Tenant\Expense;
use App\Models\Tenant\BudgetCategory;
use App\Models\Tenant\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get finance statistics
        $stats = [
            'total_budget' => Budget::where('instansi_id', $instansiId)->sum('amount'),
            'total_expenses' => Expense::where('instansi_id', $instansiId)->sum('amount'),
            'this_month_expenses' => Expense::where('instansi_id', $instansiId)
                ->whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->sum('amount'),
            'budget_utilization' => 0
        ];

        // Calculate budget utilization
        if ($stats['total_budget'] > 0) {
            $stats['budget_utilization'] = round(($stats['total_expenses'] / $stats['total_budget']) * 100, 2);
        }

        // Get recent expenses
        $recentExpenses = Expense::where('instansi_id', $instansiId)
            ->with('category')
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get();

        // Get budget categories
        $budgetCategories = BudgetCategory::where('instansi_id', $instansiId)->get();

        return view('tenant.finance.index', [
            'title' => 'Keuangan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => null]
            ],
            'stats' => $stats,
            'recentExpenses' => $recentExpenses,
            'budgetCategories' => $budgetCategories
        ]);
    }

    /**
     * Display budget management
     */
    public function budget(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Budget::where('instansi_id', $instansiId)
            ->with('category');

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by year
        if ($request->filled('year')) {
            $query->whereYear('start_date', $request->year);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $budgets = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get filter options
        $categories = BudgetCategory::where('instansi_id', $instansiId)->get();
        $years = Budget::where('instansi_id', $instansiId)
            ->selectRaw('YEAR(start_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return view('tenant.finance.budget', [
            'title' => 'Anggaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => route('tenant.finance.index')],
                ['name' => 'Anggaran', 'url' => null]
            ],
            'budgets' => $budgets,
            'categories' => $categories,
            'years' => $years
        ]);
    }

    /**
     * Display expenses management
     */
    public function expenses(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Expense::where('instansi_id', $instansiId)
            ->with('category');

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        $expenses = $query->orderBy('date', 'desc')->paginate(20);

        // Get filter options
        $categories = ExpenseCategory::where('instansi_id', $instansiId)->get();

        return view('tenant.finance.expenses', [
            'title' => 'Pengeluaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => route('tenant.finance.index')],
                ['name' => 'Pengeluaran', 'url' => null]
            ],
            'expenses' => $expenses,
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new budget.
     */
    public function createBudget()
    {
        $instansiId = $this->getInstansiId();
        
        $categories = BudgetCategory::where('instansi_id', $instansiId)->get();

        return view('tenant.finance.budget.create', [
            'title' => 'Tambah Anggaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => route('tenant.finance.index')],
                ['name' => 'Anggaran', 'url' => route('tenant.finance.budget')],
                ['name' => 'Tambah Anggaran', 'url' => null]
            ],
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created budget in storage.
     */
    public function storeBudget(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:budget_categories,id',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $budget = Budget::create([
                'instansi_id' => $instansiId,
                'name' => $request->name,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'amount' => $request->amount,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date
            ]);

            DB::commit();

            return redirect()->route('tenant.finance.budget')
                ->with('success', 'Anggaran berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new expense.
     */
    public function createExpense()
    {
        $instansiId = $this->getInstansiId();
        
        $categories = ExpenseCategory::where('instansi_id', $instansiId)->get();

        return view('tenant.finance.expenses.create', [
            'title' => 'Tambah Pengeluaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => route('tenant.finance.index')],
                ['name' => 'Pengeluaran', 'url' => route('tenant.finance.expenses')],
                ['name' => 'Tambah Pengeluaran', 'url' => null]
            ],
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created expense in storage.
     */
    public function storeExpense(Request $request)
    {
        $request->validate([
            'description' => 'required|string|max:500',
            'category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $expense = Expense::create([
                'instansi_id' => $instansiId,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'amount' => $request->amount,
                'date' => $request->date,
                'reference' => $request->reference,
                'notes' => $request->notes
            ]);

            DB::commit();

            return redirect()->route('tenant.finance.expenses')
                ->with('success', 'Pengeluaran berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified budget.
     */
    public function showBudget(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $budget = Budget::where('instansi_id', $instansiId)
            ->with('category')
            ->findOrFail($id);

        // Get expenses for this budget
        $expenses = Expense::where('instansi_id', $instansiId)
            ->where('category_id', $budget->category_id)
            ->whereBetween('date', [$budget->start_date, $budget->end_date])
            ->orderBy('date', 'desc')
            ->get();

        return view('tenant.finance.budget.show', [
            'title' => 'Detail Anggaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => route('tenant.finance.index')],
                ['name' => 'Anggaran', 'url' => route('tenant.finance.budget')],
                ['name' => 'Detail Anggaran', 'url' => null]
            ],
            'budget' => $budget,
            'expenses' => $expenses
        ]);
    }

    /**
     * Show the specified expense.
     */
    public function showExpense(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $expense = Expense::where('instansi_id', $instansiId)
            ->with('category')
            ->findOrFail($id);

        return view('tenant.finance.expenses.show', [
            'title' => 'Detail Pengeluaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => route('tenant.finance.index')],
                ['name' => 'Pengeluaran', 'url' => route('tenant.finance.expenses')],
                ['name' => 'Detail Pengeluaran', 'url' => null]
            ],
            'expense' => $expense
        ]);
    }

    /**
     * Show the form for editing the specified budget.
     */
    public function editBudget(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $budget = Budget::where('instansi_id', $instansiId)->findOrFail($id);
        $categories = BudgetCategory::where('instansi_id', $instansiId)->get();

        return view('tenant.finance.budget.edit', [
            'title' => 'Edit Anggaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => route('tenant.finance.index')],
                ['name' => 'Anggaran', 'url' => route('tenant.finance.budget')],
                ['name' => 'Edit Anggaran', 'url' => null]
            ],
            'budget' => $budget,
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for editing the specified expense.
     */
    public function editExpense(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $expense = Expense::where('instansi_id', $instansiId)->findOrFail($id);
        $categories = ExpenseCategory::where('instansi_id', $instansiId)->get();

        return view('tenant.finance.expenses.edit', [
            'title' => 'Edit Pengeluaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Keuangan', 'url' => route('tenant.finance.index')],
                ['name' => 'Pengeluaran', 'url' => route('tenant.finance.expenses')],
                ['name' => 'Edit Pengeluaran', 'url' => null]
            ],
            'expense' => $expense,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified budget in storage.
     */
    public function updateBudget(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:budget_categories,id',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $budget = Budget::where('instansi_id', $instansiId)->findOrFail($id);
            
            $budget->update([
                'name' => $request->name,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'amount' => $request->amount,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date
            ]);

            DB::commit();

            return redirect()->route('tenant.finance.budget')
                ->with('success', 'Anggaran berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified expense in storage.
     */
    public function updateExpense(Request $request, string $id)
    {
        $request->validate([
            'description' => 'required|string|max:500',
            'category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $expense = Expense::where('instansi_id', $instansiId)->findOrFail($id);
            
            $expense->update([
                'description' => $request->description,
                'category_id' => $request->category_id,
                'amount' => $request->amount,
                'date' => $request->date,
                'reference' => $request->reference,
                'notes' => $request->notes
            ]);

            DB::commit();

            return redirect()->route('tenant.finance.expenses')
                ->with('success', 'Pengeluaran berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified budget from storage.
     */
    public function destroyBudget(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $budget = Budget::where('instansi_id', $instansiId)->findOrFail($id);
            $budget->delete();

            return redirect()->route('tenant.finance.budget')
                ->with('success', 'Anggaran berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroyExpense(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $expense = Expense::where('instansi_id', $instansiId)->findOrFail($id);
            $expense->delete();

            return redirect()->route('tenant.finance.expenses')
                ->with('success', 'Pengeluaran berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Budget planning
     */
    public function budgetPlanning(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $year = $request->get('year', now()->year);
        
        // Get budgets by category for the year
        $budgetsByCategory = Budget::where('instansi_id', $instansiId)
            ->whereYear('start_date', $year)
            ->with('category')
            ->get()
            ->groupBy('category_id');

        // Get expenses by category
        $expensesByCategory = Expense::where('instansi_id', $instansiId)
            ->whereYear('date', $year)
            ->with('category')
            ->get()
            ->groupBy('category_id');

        // Calculate utilization
        $planning = [];
        foreach ($budgetsByCategory as $categoryId => $budgets) {
            $totalBudget = $budgets->sum('amount');
            $totalExpense = isset($expensesByCategory[$categoryId]) 
                ? $expensesByCategory[$categoryId]->sum('amount') 
                : 0;
            $utilization = $totalBudget > 0 ? ($totalExpense / $totalBudget) * 100 : 0;

            $planning[] = [
                'category_id' => $categoryId,
                'category_name' => $budgets->first()->category->name ?? 'Lainnya',
                'budget' => $totalBudget,
                'expense' => $totalExpense,
                'remaining' => $totalBudget - $totalExpense,
                'utilization' => round($utilization, 2)
            ];
        }

        return view('tenant.finance.budget-planning', [
            'title' => 'Perencanaan Anggaran',
            'page-title' => 'Perencanaan Anggaran',
            'planning' => $planning,
            'year' => $year
        ]);
    }

    /**
     * Financial reports
     */
    public function financialReports(Request $request)
    {
        $instansiId = $this->getInstansiId();
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->endOfMonth()->toDateString());

        // Income summary
        $income = DB::table('incomes')
            ->where('instansi_id', $instansiId)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        // Expense summary
        $expenses = Expense::where('instansi_id', $instansiId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $totalExpenses = $expenses->sum('amount');
        $expensesByCategory = $expenses->groupBy('category_id')->map->sum('amount');

        // Budget vs Actual
        $budgets = Budget::where('instansi_id', $instansiId)
            ->whereBetween('start_date', [$startDate, $endDate])
            ->get();

        $totalBudget = $budgets->sum('amount');
        $budgetVariance = $totalBudget - $totalExpenses;

        return view('tenant.finance.financial-reports', [
            'title' => 'Laporan Keuangan',
            'page-title' => 'Laporan Keuangan',
            'income' => $income,
            'totalExpenses' => $totalExpenses,
            'expensesByCategory' => $expensesByCategory,
            'totalBudget' => $totalBudget,
            'budgetVariance' => $budgetVariance,
            'startDate' => $startDate,
            'endDate' => $endDate
        ]);
    }

    /**
     * Payment integration - process payment
     */
    public function processPayment(Request $request)
    {
        $request->validate([
            'payment_type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,bank_transfer,card,digital_wallet',
            'reference_number' => 'nullable|string|max:255',
            'description' => 'required|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            if ($request->payment_type === 'income') {
                DB::table('incomes')->insert([
                    'instansi_id' => $instansiId,
                    'amount' => $request->amount,
                    'payment_method' => $request->payment_method,
                    'reference_number' => $request->reference_number,
                    'description' => $request->description,
                    'date' => now()->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                Expense::create([
                    'instansi_id' => $instansiId,
                    'amount' => $request->amount,
                    'payment_method' => $request->payment_method,
                    'reference_number' => $request->reference_number,
                    'description' => $request->description,
                    'date' => now()->toDateString()
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Pembayaran berhasil diproses');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
