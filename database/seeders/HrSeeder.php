<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Core\Tenant;
use App\Models\Tenant\Department;
use App\Models\Tenant\Position;
use App\Models\Tenant\Employee;
use App\Models\Tenant\Payroll;
use App\Models\Tenant\PayrollItem;
use App\Models\User;

class HrSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first tenant
        $tenant = Tenant::first();
        if (!$tenant) {
            $this->command->error('No tenant found. Please run TenantSeeder first.');
            return;
        }

        // Get first user for created_by
        $user = User::first();
        if (!$user) {
            $this->command->error('No user found. Please run UserSeeder first.');
            return;
        }

        // Create departments
        $departments = [
            ['name' => 'Administrasi', 'description' => 'Departemen Administrasi'],
            ['name' => 'Akademik', 'description' => 'Departemen Akademik'],
            ['name' => 'Keuangan', 'description' => 'Departemen Keuangan'],
            ['name' => 'Sumber Daya Manusia', 'description' => 'Departemen SDM'],
            ['name' => 'Teknologi Informasi', 'description' => 'Departemen IT'],
        ];

        $createdDepartments = [];
        foreach ($departments as $dept) {
            $department = Department::create([
                'instansi_id' => $tenant->id,
                'name' => $dept['name'],
                'description' => $dept['description'],
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);
            $createdDepartments[] = $department;
        }

        // Create positions
        $positions = [
            ['name' => 'Kepala Sekolah', 'description' => 'Kepala Sekolah', 'level' => '1'],
            ['name' => 'Wakil Kepala Sekolah', 'description' => 'Wakil Kepala Sekolah', 'level' => '2'],
            ['name' => 'Guru', 'description' => 'Guru Mata Pelajaran', 'level' => '3'],
            ['name' => 'Staff Administrasi', 'description' => 'Staff Administrasi', 'level' => '4'],
            ['name' => 'Staff Keuangan', 'description' => 'Staff Keuangan', 'level' => '4'],
            ['name' => 'Staff IT', 'description' => 'Staff Teknologi Informasi', 'level' => '4'],
            ['name' => 'Satpam', 'description' => 'Satuan Pengamanan', 'level' => '5'],
            ['name' => 'Cleaning Service', 'description' => 'Petugas Kebersihan', 'level' => '5'],
        ];

        $createdPositions = [];
        foreach ($positions as $pos) {
            $position = Position::create([
                'instansi_id' => $tenant->id,
                'name' => $pos['name'],
                'description' => $pos['description'],
                'level' => $pos['level'],
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);
            $createdPositions[] = $position;
        }

        // Create employees
        $employees = [
            [
                'name' => 'Dr. Ahmad Suryadi, M.Pd',
                'employee_number' => 'EMP001',
                'email' => 'ahmad.suryadi@school.com',
                'phone' => '081234567890',
                'address' => 'Jl. Pendidikan No. 123, Jakarta',
                'position_id' => $createdPositions[0]->id, // Kepala Sekolah
                'department_id' => $createdDepartments[0]->id, // Administrasi
                'hire_date' => '2020-01-01',
                'salary' => 15000000,
                'status' => 'active',
            ],
            [
                'name' => 'Siti Nurhaliza, S.Pd',
                'employee_number' => 'EMP002',
                'email' => 'siti.nurhaliza@school.com',
                'phone' => '081234567891',
                'address' => 'Jl. Merdeka No. 456, Jakarta',
                'position_id' => $createdPositions[1]->id, // Wakil Kepala Sekolah
                'department_id' => $createdDepartments[1]->id, // Akademik
                'hire_date' => '2020-02-01',
                'salary' => 12000000,
                'status' => 'active',
            ],
            [
                'name' => 'Budi Santoso, S.Pd',
                'employee_number' => 'EMP003',
                'email' => 'budi.santoso@school.com',
                'phone' => '081234567892',
                'address' => 'Jl. Sudirman No. 789, Jakarta',
                'position_id' => $createdPositions[2]->id, // Guru
                'department_id' => $createdDepartments[1]->id, // Akademik
                'hire_date' => '2020-03-01',
                'salary' => 8000000,
                'status' => 'active',
            ],
            [
                'name' => 'Rina Wulandari, S.E',
                'employee_number' => 'EMP004',
                'email' => 'rina.wulandari@school.com',
                'phone' => '081234567893',
                'address' => 'Jl. Gatot Subroto No. 321, Jakarta',
                'position_id' => $createdPositions[4]->id, // Staff Keuangan
                'department_id' => $createdDepartments[2]->id, // Keuangan
                'hire_date' => '2020-04-01',
                'salary' => 6000000,
                'status' => 'active',
            ],
            [
                'name' => 'Andi Prasetyo, S.Kom',
                'employee_number' => 'EMP005',
                'email' => 'andi.prasetyo@school.com',
                'phone' => '081234567894',
                'address' => 'Jl. Thamrin No. 654, Jakarta',
                'position_id' => $createdPositions[5]->id, // Staff IT
                'department_id' => $createdDepartments[4]->id, // IT
                'hire_date' => '2020-05-01',
                'salary' => 7000000,
                'status' => 'active',
            ],
        ];

        $createdEmployees = [];
        foreach ($employees as $emp) {
            $employee = Employee::create([
                'instansi_id' => $tenant->id,
                'name' => $emp['name'],
                'employee_number' => $emp['employee_number'],
                'email' => $emp['email'],
                'phone' => $emp['phone'],
                'address' => $emp['address'],
                'position_id' => $emp['position_id'],
                'department_id' => $emp['department_id'],
                'hire_date' => $emp['hire_date'],
                'salary' => $emp['salary'],
                'status' => $emp['status'],
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);
            $createdEmployees[] = $employee;
        }

        // Create sample payrolls
        foreach ($createdEmployees as $employee) {
            // Create payroll for current month
            $payroll = Payroll::create([
                'instansi_id' => $tenant->id,
                'employee_id' => $employee->id,
                'payroll_date' => now()->format('Y-m-d'),
                'basic_salary' => $employee->salary,
                'total_allowances' => 0,
                'total_deductions' => 0,
                'net_salary' => $employee->salary,
                'status' => 'pending',
                'notes' => 'Penggajian bulan ' . now()->format('F Y'),
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            // Add allowances based on position level
            $allowances = [];
            if ($employee->position->level <= 2) {
                $allowances[] = ['name' => 'Tunjangan Jabatan', 'amount' => 2000000];
                $allowances[] = ['name' => 'Tunjangan Transport', 'amount' => 1000000];
            } elseif ($employee->position->level == 3) {
                $allowances[] = ['name' => 'Tunjangan Transport', 'amount' => 500000];
                $allowances[] = ['name' => 'Tunjangan Kinerja', 'amount' => 1000000];
            } else {
                $allowances[] = ['name' => 'Tunjangan Transport', 'amount' => 300000];
            }

            $totalAllowances = 0;
            foreach ($allowances as $allowance) {
                PayrollItem::create([
                    'payroll_id' => $payroll->id,
                    'name' => $allowance['name'],
                    'amount' => $allowance['amount'],
                    'type' => 'allowance',
                ]);
                $totalAllowances += $allowance['amount'];
            }

            // Add deductions
            $deductions = [
                ['name' => 'BPJS Kesehatan', 'amount' => $employee->salary * 0.01],
                ['name' => 'BPJS Ketenagakerjaan', 'amount' => $employee->salary * 0.02],
            ];

            $totalDeductions = 0;
            foreach ($deductions as $deduction) {
                PayrollItem::create([
                    'payroll_id' => $payroll->id,
                    'name' => $deduction['name'],
                    'amount' => $deduction['amount'],
                    'type' => 'deduction',
                ]);
                $totalDeductions += $deduction['amount'];
            }

            // Update payroll totals
            $payroll->update([
                'total_allowances' => $totalAllowances,
                'total_deductions' => $totalDeductions,
                'net_salary' => $employee->salary + $totalAllowances - $totalDeductions,
            ]);
        }

        $this->command->info('HR data seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . count($createdDepartments) . ' departments');
        $this->command->info('- ' . count($createdPositions) . ' positions');
        $this->command->info('- ' . count($createdEmployees) . ' employees');
        $this->command->info('- ' . count($createdEmployees) . ' payrolls');
    }
}