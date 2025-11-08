<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Employee;
use App\Models\Tenant\Payroll;
use App\Models\Tenant\PayrollItem;
use App\Models\Tenant\Position;
use App\Models\Tenant\Department;
use App\Models\Tenant\Staff;
use App\Models\Tenant\Teacher;
use App\Core\Services\TenantService;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HrController extends Controller
{
    use HasInstansiId;

    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get HR statistics
        $stats = [
            'total_employees' => Employee::where('instansi_id', $instansiId)->count(),
            'active_employees' => Employee::where('instansi_id', $instansiId)->where('status', 'active')->count(),
            'total_payrolls' => Payroll::where('instansi_id', $instansiId)->count(),
            'this_month_payrolls' => Payroll::where('instansi_id', $instansiId)
                ->whereMonth('payroll_date', now()->month)
                ->whereYear('payroll_date', now()->year)
                ->count()
        ];

        // Get recent employees
        $recentEmployees = Employee::where('instansi_id', $instansiId)
            ->with(['position', 'department'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent payrolls
        $recentPayrolls = Payroll::where('instansi_id', $instansiId)
            ->with('employee')
            ->orderBy('payroll_date', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.hr.index', [
            'title' => 'SDM',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => null]
            ],
            'stats' => $stats,
            'recentEmployees' => $recentEmployees,
            'recentPayrolls' => $recentPayrolls
        ]);
    }

    /**
     * Display employees management
     */
    public function employees(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Employee::where('instansi_id', $instansiId)
            ->with(['position', 'department']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by department
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Filter by position
        if ($request->filled('position_id')) {
            $query->where('position_id', $request->position_id);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get filter options
        $departments = Department::where('instansi_id', $instansiId)->get();
        $positions = Position::where('instansi_id', $instansiId)->get();

        return view('tenant.hr.employees', [
            'title' => 'Karyawan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => tenant_route('tenant.hr.index')],
                ['name' => 'Karyawan', 'url' => null]
            ],
            'employees' => $employees,
            'departments' => $departments,
            'positions' => $positions
        ]);
    }

    /**
     * Display payroll management
     */
    public function payroll(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Payroll::where('instansi_id', $instansiId)
            ->with(['employee' => function($q) {
                $q->withTrashed(); // Include soft deleted employees
            }, 'teacher', 'staff']);

        // Filter by employee
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('payroll_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('payroll_date', '<=', $request->end_date);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search, $instansiId) {
                // Search in employees
                $q->whereHas('employee', function($empQ) use ($search) {
                    $empQ->where('name', 'like', "%{$search}%")
                         ->orWhere('employee_number', 'like', "%{$search}%");
                })
                // Search in teachers
                ->orWhereHas('teacher', function($teacherQ) use ($search, $instansiId) {
                    $teacherQ->where('instansi_id', $instansiId)
                             ->where(function($tq) use ($search) {
                                 $tq->where('name', 'like', "%{$search}%")
                                    ->orWhere('nip', 'like', "%{$search}%")
                                    ->orWhere('nuptk', 'like', "%{$search}%")
                                    ->orWhere('nik', 'like', "%{$search}%");
                             });
                })
                // Search in staff
                ->orWhereHas('staff', function($staffQ) use ($search, $instansiId) {
                    $staffQ->where('instansi_id', $instansiId)
                           ->where(function($sq) use ($search) {
                               $sq->where('name', 'like', "%{$search}%")
                                  ->orWhere('employee_number', 'like', "%{$search}%")
                                  ->orWhere('nip', 'like', "%{$search}%")
                                  ->orWhere('nik', 'like', "%{$search}%");
                           });
                });
            });
        }

        $payrolls = $query->orderBy('payroll_date', 'desc')->paginate(20);

        // Get filter options - include employees, teachers, and staff
        $employees = Employee::where('instansi_id', $instansiId)->get();
        $teachers = Teacher::where('instansi_id', $instansiId)->where('is_active', true)->get();
        $staff = Staff::where('instansi_id', $instansiId)->where('is_active', true)->get();
        
        // Combine all for dropdown (employees, teachers, staff are all considered employees)
        $allEmployees = collect()
            ->merge($employees->map(function($emp) {
                return ['id' => $emp->id, 'name' => $emp->name, 'number' => $emp->employee_number, 'type' => 'employee'];
            }))
            ->merge($teachers->map(function($teacher) {
                return ['id' => $teacher->id, 'name' => $teacher->name, 'number' => $teacher->nik ?? $teacher->nip ?? $teacher->nuptk ?? 'N/A', 'type' => 'teacher'];
            }))
            ->merge($staff->map(function($s) {
                return ['id' => $s->id, 'name' => $s->name, 'number' => $s->nik ?? $s->nip ?? $s->employee_number ?? 'N/A', 'type' => 'staff'];
            }));

        return view('tenant.hr.payroll', [
            'title' => 'Penggajian',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => tenant_route('tenant.hr.index')],
                ['name' => 'Penggajian', 'url' => null]
            ],
            'payrolls' => $payrolls,
            'employees' => $allEmployees
        ]);
    }

    /**
     * Show the form for creating a new employee.
     */
    public function createEmployee()
    {
        $instansiId = $this->getInstansiId();
        
        $departments = Department::where('instansi_id', $instansiId)->get();
        $positions = Position::where('instansi_id', $instansiId)->get();

        return view('tenant.hr.employees.create', [
            'title' => 'Tambah Karyawan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => tenant_route('tenant.hr.index')],
                ['name' => 'Karyawan', 'url' => tenant_route('tenant.hr.employees')],
                ['name' => 'Tambah Karyawan', 'url' => null]
            ],
            'departments' => $departments,
            'positions' => $positions
        ]);
    }

    /**
     * Store a newly created employee in storage.
     */
    public function storeEmployee(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'employee_number' => 'required|string|max:50|unique:employees,employee_number',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'position_id' => 'required|exists:positions,id',
            'department_id' => 'required|exists:departments,id',
            'hire_date' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,terminated'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $employee = Employee::create([
                'instansi_id' => $instansiId,
                'name' => $request->name,
                'employee_number' => $request->employee_number,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'position_id' => $request->position_id,
                'department_id' => $request->department_id,
                'hire_date' => $request->hire_date,
                'salary' => $request->salary,
                'status' => $request->status
            ]);

            DB::commit();

            return redirect()->to(tenant_route('tenant.hr.employees'))
                ->with('success', 'Karyawan berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new payroll.
     */
    public function createPayroll()
    {
        $instansiId = $this->getInstansiId();
        
        if (!$instansiId) {
            return redirect()->back()->with('error', 'Instansi tidak ditemukan. Silakan login ulang.');
        }
        
        // Get employees, teachers, and staff - remove strict filters to show all
        $employees = Employee::where('instansi_id', $instansiId)->get();
        $teachers = Teacher::where('instansi_id', $instansiId)->get();
        $staff = Staff::where('instansi_id', $instansiId)->get();
        
        // Combine all for dropdown
        $allEmployees = collect()
            ->merge($employees->map(function($emp) {
                return ['id' => $emp->id, 'name' => $emp->name, 'number' => $emp->employee_number ?? 'N/A', 'type' => 'employee'];
            }))
            ->merge($teachers->map(function($teacher) {
                return ['id' => $teacher->id, 'name' => $teacher->name, 'number' => $teacher->nik ?? $teacher->nip ?? $teacher->nuptk ?? $teacher->employee_number ?? 'N/A', 'type' => 'teacher'];
            }))
            ->merge($staff->map(function($s) {
                return ['id' => $s->id, 'name' => $s->name, 'number' => $s->nik ?? $s->nip ?? $s->employee_number ?? 'N/A', 'type' => 'staff'];
            }));

        return view('tenant.hr.payroll.create', [
            'title' => 'Tambah Penggajian',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => tenant_route('tenant.hr.index')],
                ['name' => 'Penggajian', 'url' => tenant_route('tenant.hr.payroll')],
                ['name' => 'Tambah Penggajian', 'url' => null]
            ],
            'employees' => $allEmployees
        ]);
    }

    /**
     * Store a newly created payroll in storage.
     */
    public function storePayroll(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        // Validate employee_id based on employee_type
        $employeeType = $request->employee_type ?? 'employee';
        $validationRules = [
            'employee_id' => 'required',
            'employee_type' => 'required|in:employee,teacher,staff',
            'payroll_date' => 'required|date',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|array',
            'allowances.*.name' => 'required|string|max:255',
            'allowances.*.amount' => 'required|numeric|min:0',
            'deductions' => 'nullable|array',
            'deductions.*.name' => 'required|string|max:255',
            'deductions.*.amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ];

        // Add specific validation for employee_id based on type
        switch ($employeeType) {
            case 'teacher':
                $validationRules['employee_id'] = 'required|exists:teachers,id';
                break;
            case 'staff':
                $validationRules['employee_id'] = 'required|exists:staff,id';
                break;
            default:
                $validationRules['employee_id'] = 'required|exists:employees,id';
        }

        $request->validate($validationRules);

        try {
            DB::beginTransaction();

            // Calculate total allowances
            $totalAllowances = 0;
            if ($request->has('allowances')) {
                foreach ($request->allowances as $allowance) {
                    $totalAllowances += $allowance['amount'];
                }
            }

            // Calculate total deductions
            $totalDeductions = 0;
            if ($request->has('deductions')) {
                foreach ($request->deductions as $deduction) {
                    $totalDeductions += $deduction['amount'];
                }
            }

            // Calculate net salary
            $netSalary = $request->basic_salary + $totalAllowances - $totalDeductions;
            
            $payroll = Payroll::create([
                'instansi_id' => $instansiId,
                'employee_id' => $request->employee_id,
                'employee_type' => $employeeType,
                'payroll_date' => $request->payroll_date,
                'basic_salary' => $request->basic_salary,
                'total_allowances' => $totalAllowances,
                'total_deductions' => $totalDeductions,
                'net_salary' => $netSalary,
                'status' => 'pending',
                'notes' => $request->notes,
                'created_by' => auth()->id()
            ]);

            // Create allowance items
            if ($request->has('allowances')) {
                foreach ($request->allowances as $allowance) {
                    PayrollItem::create([
                        'payroll_id' => $payroll->id,
                        'name' => $allowance['name'],
                        'amount' => $allowance['amount'],
                        'type' => 'allowance'
                    ]);
                }
            }

            // Create deduction items
            if ($request->has('deductions')) {
                foreach ($request->deductions as $deduction) {
                    PayrollItem::create([
                        'payroll_id' => $payroll->id,
                        'name' => $deduction['name'],
                        'amount' => $deduction['amount'],
                        'type' => 'deduction'
                    ]);
                }
            }

            DB::commit();

            return redirect()->to(tenant_route('tenant.hr.payroll'))
                ->with('success', 'Penggajian berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified employee.
     */
    public function showEmployee(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $employee = Employee::where('instansi_id', $instansiId)
            ->with(['position', 'department'])
            ->findOrFail($id);

        return view('tenant.hr.employees.show', [
            'title' => 'Detail Karyawan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => tenant_route('tenant.hr.index')],
                ['name' => 'Karyawan', 'url' => tenant_route('tenant.hr.employees')],
                ['name' => 'Detail Karyawan', 'url' => null]
            ],
            'employee' => $employee
        ]);
    }

    /**
     * Show the specified payroll.
     */
    public function showPayroll(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $payroll = Payroll::where('instansi_id', $instansiId)
            ->with(['employee', 'teacher', 'staff', 'items'])
            ->findOrFail($id);

        return view('tenant.hr.payroll.show', [
            'title' => 'Detail Penggajian',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => tenant_route('tenant.hr.index')],
                ['name' => 'Penggajian', 'url' => tenant_route('tenant.hr.payroll')],
                ['name' => 'Detail Penggajian', 'url' => null]
            ],
            'payroll' => $payroll
        ]);
    }

    /**
     * Show the form for editing the specified employee.
     */
    public function editEmployee(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $employee = Employee::where('instansi_id', $instansiId)->findOrFail($id);
        $departments = Department::where('instansi_id', $instansiId)->get();
        $positions = Position::where('instansi_id', $instansiId)->get();

        return view('tenant.hr.employees.edit', [
            'title' => 'Edit Karyawan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => tenant_route('tenant.hr.index')],
                ['name' => 'Karyawan', 'url' => tenant_route('tenant.hr.employees')],
                ['name' => 'Edit Karyawan', 'url' => null]
            ],
            'employee' => $employee,
            'departments' => $departments,
            'positions' => $positions
        ]);
    }

    /**
     * Show the form for editing the specified payroll.
     */
    public function editPayroll(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $payroll = Payroll::where('instansi_id', $instansiId)
            ->with(['employee', 'teacher', 'staff', 'items'])
            ->findOrFail($id);
        
        // Get all employees, teachers, and staff for dropdown - remove strict filters
        $employees = Employee::where('instansi_id', $instansiId)->get();
        $teachers = Teacher::where('instansi_id', $instansiId)->get();
        $staff = Staff::where('instansi_id', $instansiId)->get();
        
        // Combine all for dropdown
        $allEmployees = collect()
            ->merge($employees->map(function($emp) {
                return ['id' => $emp->id, 'name' => $emp->name, 'number' => $emp->employee_number ?? 'N/A', 'type' => 'employee'];
            }))
            ->merge($teachers->map(function($teacher) {
                return ['id' => $teacher->id, 'name' => $teacher->name, 'number' => $teacher->nik ?? $teacher->nip ?? $teacher->nuptk ?? $teacher->employee_number ?? 'N/A', 'type' => 'teacher'];
            }))
            ->merge($staff->map(function($s) {
                return ['id' => $s->id, 'name' => $s->name, 'number' => $s->nik ?? $s->nip ?? $s->employee_number ?? 'N/A', 'type' => 'staff'];
            }));

        return view('tenant.hr.payroll.edit', [
            'title' => 'Edit Penggajian',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'SDM', 'url' => tenant_route('tenant.hr.index')],
                ['name' => 'Penggajian', 'url' => tenant_route('tenant.hr.payroll')],
                ['name' => 'Edit Penggajian', 'url' => null]
            ],
            'payroll' => $payroll,
            'employees' => $allEmployees
        ]);
    }

    /**
     * Update the specified employee in storage.
     */
    public function updateEmployee(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'employee_number' => 'required|string|max:50|unique:employees,employee_number,' . $id,
            'email' => 'required|email|unique:employees,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'position_id' => 'required|exists:positions,id',
            'department_id' => 'required|exists:departments,id',
            'hire_date' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,terminated'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $employee = Employee::where('instansi_id', $instansiId)->findOrFail($id);
            
            $employee->update([
                'name' => $request->name,
                'employee_number' => $request->employee_number,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'position_id' => $request->position_id,
                'department_id' => $request->department_id,
                'hire_date' => $request->hire_date,
                'salary' => $request->salary,
                'status' => $request->status
            ]);

            DB::commit();

            return redirect()->to(tenant_route('tenant.hr.employees'))
                ->with('success', 'Karyawan berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified payroll in storage.
     */
    public function updatePayroll(Request $request, string $id)
    {
        $instansiId = $this->getInstansiId();
        
        // Validate employee_id based on employee_type
        $employeeType = $request->employee_type ?? 'employee';
        $validationRules = [
            'employee_id' => 'required',
            'employee_type' => 'required|in:employee,teacher,staff',
            'payroll_date' => 'required|date',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|array',
            'allowances.*.name' => 'required|string|max:255',
            'allowances.*.amount' => 'required|numeric|min:0',
            'deductions' => 'nullable|array',
            'deductions.*.name' => 'required|string|max:255',
            'deductions.*.amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ];

        // Add specific validation for employee_id based on type
        switch ($employeeType) {
            case 'teacher':
                $validationRules['employee_id'] = 'required|exists:teachers,id';
                break;
            case 'staff':
                $validationRules['employee_id'] = 'required|exists:staff,id';
                break;
            default:
                $validationRules['employee_id'] = 'required|exists:employees,id';
        }

        $request->validate($validationRules);

        try {
            DB::beginTransaction();
            
            $payroll = Payroll::where('instansi_id', $instansiId)->findOrFail($id);
            
            // Calculate total allowances
            $totalAllowances = 0;
            if ($request->has('allowances')) {
                foreach ($request->allowances as $allowance) {
                    $totalAllowances += $allowance['amount'];
                }
            }

            // Calculate total deductions
            $totalDeductions = 0;
            if ($request->has('deductions')) {
                foreach ($request->deductions as $deduction) {
                    $totalDeductions += $deduction['amount'];
                }
            }

            // Calculate net salary
            $netSalary = $request->basic_salary + $totalAllowances - $totalDeductions;
            
            $payroll->update([
                'employee_id' => $request->employee_id,
                'employee_type' => $employeeType,
                'payroll_date' => $request->payroll_date,
                'basic_salary' => $request->basic_salary,
                'total_allowances' => $totalAllowances,
                'total_deductions' => $totalDeductions,
                'net_salary' => $netSalary,
                'notes' => $request->notes,
                'updated_by' => auth()->id()
            ]);

            // Delete existing items
            $payroll->items()->delete();

            // Create allowance items
            if ($request->has('allowances')) {
                foreach ($request->allowances as $allowance) {
                    PayrollItem::create([
                        'payroll_id' => $payroll->id,
                        'name' => $allowance['name'],
                        'amount' => $allowance['amount'],
                        'type' => 'allowance'
                    ]);
                }
            }

            // Create deduction items
            if ($request->has('deductions')) {
                foreach ($request->deductions as $deduction) {
                    PayrollItem::create([
                        'payroll_id' => $payroll->id,
                        'name' => $deduction['name'],
                        'amount' => $deduction['amount'],
                        'type' => 'deduction'
                    ]);
                }
            }

            DB::commit();

            return redirect()->to(tenant_route('tenant.hr.payroll'))
                ->with('success', 'Penggajian berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroyEmployee(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $employee = Employee::where('instansi_id', $instansiId)->findOrFail($id);
            $employee->delete();

            return redirect()->to(tenant_route('tenant.hr.employees'))
                ->with('success', 'Karyawan berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified payroll from storage.
     */
    public function destroyPayroll(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $payroll = Payroll::where('instansi_id', $instansiId)->findOrFail($id);
            $payroll->delete();

            return redirect()->to(tenant_route('tenant.hr.payroll'))
                ->with('success', 'Penggajian berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Attendance tracking
     */
    public function attendanceTracking(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('employee_attendances')
            ->join('employees', 'employee_attendances.employee_id', '=', 'employees.id')
            ->where('employees.instansi_id', $instansiId)
            ->select('employee_attendances.*', 'employees.name as employee_name', 'employees.employee_number');

        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('attendance_date', $request->date);
        } else {
            $query->whereDate('attendance_date', today());
        }

        // Filter by employee
        if ($request->filled('employee_id')) {
            $query->where('employee_attendances.employee_id', $request->employee_id);
        }

        $attendances = $query->orderBy('attendance_date', 'desc')->paginate(20);

        // Get statistics
        $stats = [
            'present_today' => DB::table('employee_attendances')
                ->join('employees', 'employee_attendances.employee_id', '=', 'employees.id')
                ->where('employees.instansi_id', $instansiId)
                ->whereDate('attendance_date', today())
                ->where('status', 'present')
                ->count(),
            'absent_today' => DB::table('employee_attendances')
                ->join('employees', 'employee_attendances.employee_id', '=', 'employees.id')
                ->where('employees.instansi_id', $instansiId)
                ->whereDate('attendance_date', today())
                ->where('status', 'absent')
                ->count(),
            'late_today' => DB::table('employee_attendances')
                ->join('employees', 'employee_attendances.employee_id', '=', 'employees.id')
                ->where('employees.instansi_id', $instansiId)
                ->whereDate('attendance_date', today())
                ->where('status', 'late')
                ->count(),
        ];

        $employees = Employee::where('instansi_id', $instansiId)->get();

        return view('tenant.hr.attendance-tracking', [
            'title' => 'Tracking Absensi',
            'page-title' => 'Tracking Absensi Karyawan',
            'attendances' => $attendances,
            'stats' => $stats,
            'employees' => $employees
        ]);
    }

    /**
     * Record attendance
     */
    public function recordAttendance(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'attendance_date' => 'required|date',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i|after:check_in_time',
            'status' => 'required|in:present,absent,late,excused',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            // Check if attendance already exists
            $exists = DB::table('employee_attendances')
                ->where('employee_id', $request->employee_id)
                ->whereDate('attendance_date', $request->attendance_date)
                ->exists();

            if ($exists) {
                DB::table('employee_attendances')
                    ->where('employee_id', $request->employee_id)
                    ->whereDate('attendance_date', $request->attendance_date)
                    ->update([
                        'check_in_time' => $request->check_in_time,
                        'check_out_time' => $request->check_out_time,
                        'status' => $request->status,
                        'notes' => $request->notes,
                        'updated_at' => now()
                    ]);
            } else {
                DB::table('employee_attendances')->insert([
                    'employee_id' => $request->employee_id,
                    'attendance_date' => $request->attendance_date,
                    'check_in_time' => $request->check_in_time,
                    'check_out_time' => $request->check_out_time,
                    'status' => $request->status,
                    'notes' => $request->notes,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Absensi berhasil direkam');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Performance review
     */
    public function performanceReview(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('performance_reviews')
            ->join('employees', 'performance_reviews.employee_id', '=', 'employees.id')
            ->where('employees.instansi_id', $instansiId)
            ->select('performance_reviews.*', 'employees.name as employee_name', 'employees.employee_number');

        // Filter by employee
        if ($request->filled('employee_id')) {
            $query->where('performance_reviews.employee_id', $request->employee_id);
        }

        // Filter by review period
        if ($request->filled('review_period')) {
            $query->where('performance_reviews.review_period', $request->review_period);
        }

        $reviews = $query->orderBy('review_date', 'desc')->paginate(20);

        $employees = Employee::where('instansi_id', $instansiId)->get();

        return view('tenant.hr.performance-review', [
            'title' => 'Performance Review',
            'page-title' => 'Penilaian Kinerja Karyawan',
            'reviews' => $reviews,
            'employees' => $employees
        ]);
    }

    /**
     * Create performance review
     */
    public function createPerformanceReview(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'review_date' => 'required|date',
            'review_period' => 'required|string|max:50',
            'rating' => 'required|numeric|min:1|max:5',
            'strengths' => 'required|string|max:1000',
            'weaknesses' => 'nullable|string|max:1000',
            'goals' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:2000'
        ]);

        try {
            DB::beginTransaction();

            DB::table('performance_reviews')->insert([
                'employee_id' => $request->employee_id,
                'review_date' => $request->review_date,
                'review_period' => $request->review_period,
                'rating' => $request->rating,
                'strengths' => $request->strengths,
                'weaknesses' => $request->weaknesses,
                'goals' => $request->goals,
                'notes' => $request->notes,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return redirect()->route('tenant.hr.performance-review')
                ->with('success', 'Performance review berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }
}
