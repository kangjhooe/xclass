@extends('layouts.tenant')

@section('title', 'Detail Penggajian')
@section('page-title', 'Detail Penggajian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-eye me-2"></i>
                            Detail Penggajian
                        </h5>
                        <div>
                            <a href="{{ tenant_route('hr.payroll.edit', $payroll->id) }}" class="btn btn-warning">
                                <i class="fas fa-edit me-1"></i>
                                Edit
                            </a>
                            <a href="{{ tenant_route('hr.payroll') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>
                                Kembali
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <!-- Employee Information -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Informasi Karyawan</h6>
                                </div>
                                <div class="card-body">
                                    <table class="table table-borderless">
                                        <tr>
                                            <td width="40%"><strong>Nama:</strong></td>
                                            <td>{{ $payroll->employee->name ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>NIP:</strong></td>
                                            <td>{{ $payroll->employee->employee_number ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Email:</strong></td>
                                            <td>{{ $payroll->employee->email ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Posisi:</strong></td>
                                            <td>{{ $payroll->employee->position->name ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Departemen:</strong></td>
                                            <td>{{ $payroll->employee->department->name ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Tanggal Masuk:</strong></td>
                                            <td>{{ $payroll->employee->hire_date ? \App\Helpers\DateHelper::formatIndonesian($payroll->employee->hire_date) : 'N/A' }}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Payroll Information -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Informasi Penggajian</h6>
                                </div>
                                <div class="card-body">
                                    <table class="table table-borderless">
                                        <tr>
                                            <td width="40%"><strong>Tanggal:</strong></td>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($payroll->payroll_date) }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Status:</strong></td>
                                            <td>
                                                <span class="badge {{ $payroll->status_badge_class }}">
                                                    {{ $payroll->status_label }}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Dibuat:</strong></td>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($payroll->created_at, true) }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Diperbarui:</strong></td>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($payroll->updated_at, true) }}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Salary Details -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Rincian Gaji</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <!-- Basic Salary -->
                                        <div class="col-md-6">
                                            <h6 class="text-muted">Gaji Pokok</h6>
                                            <h4 class="text-primary">Rp {{ number_format($payroll->basic_salary, 0, ',', '.') }}</h4>
                                        </div>

                                        <!-- Allowances -->
                                        <div class="col-md-6">
                                            <h6 class="text-muted">Total Tunjangan</h6>
                                            <h4 class="text-success">Rp {{ number_format($payroll->total_allowances, 0, ',', '.') }}</h4>
                                        </div>
                                    </div>

                                    <hr>

                                    <div class="row">
                                        <!-- Deductions -->
                                        <div class="col-md-6">
                                            <h6 class="text-muted">Total Potongan</h6>
                                            <h4 class="text-danger">Rp {{ number_format($payroll->total_deductions, 0, ',', '.') }}</h4>
                                        </div>

                                        <!-- Net Salary -->
                                        <div class="col-md-6">
                                            <h6 class="text-muted">Gaji Bersih</h6>
                                            <h3 class="text-primary fw-bold">Rp {{ number_format($payroll->net_salary, 0, ',', '.') }}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Allowances and Deductions Details -->
                    <div class="row mt-4">
                        <!-- Allowances -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Rincian Tunjangan</h6>
                                </div>
                                <div class="card-body">
                                    @if($payroll->allowances->count() > 0)
                                        <div class="table-responsive">
                                            <table class="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Nama Tunjangan</th>
                                                        <th class="text-end">Jumlah</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach($payroll->allowances as $allowance)
                                                    <tr>
                                                        <td>{{ $allowance->name }}</td>
                                                        <td class="text-end">Rp {{ number_format($allowance->amount, 0, ',', '.') }}</td>
                                                    </tr>
                                                    @endforeach
                                                </tbody>
                                                <tfoot>
                                                    <tr class="fw-bold">
                                                        <td>Total Tunjangan</td>
                                                        <td class="text-end">Rp {{ number_format($payroll->total_allowances, 0, ',', '.') }}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    @else
                                        <p class="text-muted text-center">Tidak ada tunjangan</p>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <!-- Deductions -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Rincian Potongan</h6>
                                </div>
                                <div class="card-body">
                                    @if($payroll->deductions->count() > 0)
                                        <div class="table-responsive">
                                            <table class="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Nama Potongan</th>
                                                        <th class="text-end">Jumlah</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach($payroll->deductions as $deduction)
                                                    <tr>
                                                        <td>{{ $deduction->name }}</td>
                                                        <td class="text-end">Rp {{ number_format($deduction->amount, 0, ',', '.') }}</td>
                                                    </tr>
                                                    @endforeach
                                                </tbody>
                                                <tfoot>
                                                    <tr class="fw-bold">
                                                        <td>Total Potongan</td>
                                                        <td class="text-end">Rp {{ number_format($payroll->total_deductions, 0, ',', '.') }}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    @else
                                        <p class="text-muted text-center">Tidak ada potongan</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    @if($payroll->notes)
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Catatan</h6>
                                </div>
                                <div class="card-body">
                                    <p class="mb-0">{{ $payroll->notes }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
