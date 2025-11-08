@extends('layouts.tenant')

@section('title', 'SDM')
@section('page-title', 'SDM')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-users-cog me-2"></i>
                        Manajemen SDM
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('hr.employees') }}" class="btn btn-primary">
                                    <i class="fas fa-users me-1"></i>
                                    Karyawan
                                </a>
                                <a href="{{ tenant_route('hr.payroll') }}" class="btn btn-info">
                                    <i class="fas fa-money-bill me-1"></i>
                                    Penggajian
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari karyawan...">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_employees'] }}</h4>
                                            <small>Total Karyawan</small>
                                        </div>
                                        <i class="fas fa-users fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['active_employees'] }}</h4>
                                            <small>Aktif</small>
                                        </div>
                                        <i class="fas fa-check fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_payrolls'] }}</h4>
                                            <small>Total Penggajian</small>
                                        </div>
                                        <i class="fas fa-money-bill fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['this_month_payrolls'] }}</h4>
                                            <small>Bulan Ini</small>
                                        </div>
                                        <i class="fas fa-calendar fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Karyawan Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentEmployees as $employee)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $employee->name }}</h6>
                                            <small class="text-muted">{{ $employee->position->name ?? 'N/A' }} - {{ $employee->department->name ?? 'N/A' }}</small>
                                        </div>
                                        <div>
                                            @if($employee->status == 'active')
                                                <span class="badge bg-success">Aktif</span>
                                            @elseif($employee->status == 'inactive')
                                                <span class="badge bg-warning">Tidak Aktif</span>
                                            @else
                                                <span class="badge bg-danger">Berhenti</span>
                                            @endif
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada karyawan</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Penggajian Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentPayrolls as $payroll)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $payroll->employee->name ?? 'N/A' }}</h6>
                                            <small class="text-muted">{{ \Carbon\Carbon::parse($payroll->payroll_date)->format('d/m/Y') }}</small>
                                        </div>
                                        <div>
                                            <span class="fw-bold text-primary">Rp {{ number_format($payroll->net_salary, 0, ',', '.') }}</span>
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada penggajian</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
