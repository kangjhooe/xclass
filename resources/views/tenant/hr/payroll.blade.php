@extends('layouts.tenant')

@section('title', 'Penggajian')
@section('page-title', 'Penggajian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-money-bill me-2"></i>
                            Daftar Penggajian
                        </h5>
                        <a href="{{ tenant_route('hr.payroll.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i>
                            Tambah Penggajian
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Filter Form -->
                    <div class="row mb-4">
                        <div class="col-12">
                            <form method="GET" action="{{ tenant_route('hr.payroll') }}" class="row g-3">
                                <div class="col-md-3">
                                    <label for="employee_id" class="form-label">Karyawan</label>
                                    <select class="form-select" name="employee_id" id="employee_id">
                                        <option value="">Semua Karyawan</option>
                                        @foreach($employees as $emp)
                                            <option value="{{ $emp['id'] }}" {{ request('employee_id') == $emp['id'] ? 'selected' : '' }}>
                                                {{ $emp['name'] }} ({{ $emp['number'] }}) - {{ ucfirst($emp['type']) }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <label for="start_date" class="form-label">Tanggal Mulai</label>
                                    <input type="date" class="form-control" name="start_date" id="start_date" value="{{ request('start_date') }}">
                                </div>
                                <div class="col-md-2">
                                    <label for="end_date" class="form-label">Tanggal Akhir</label>
                                    <input type="date" class="form-control" name="end_date" id="end_date" value="{{ request('end_date') }}">
                                </div>
                                <div class="col-md-2">
                                    <label for="status" class="form-label">Status</label>
                                    <select class="form-select" name="status" id="status">
                                        <option value="">Semua Status</option>
                                        <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Menunggu</option>
                                        <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Disetujui</option>
                                        <option value="paid" {{ request('status') == 'paid' ? 'selected' : '' }}>Dibayar</option>
                                        <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <label for="search" class="form-label">Cari</label>
                                    <input type="text" class="form-control" name="search" id="search" placeholder="Nama karyawan..." value="{{ request('search') }}">
                                </div>
                                <div class="col-md-1">
                                    <label class="form-label">&nbsp;</label>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-outline-primary">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Payroll Table -->
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Karyawan</th>
                                    <th>Tanggal</th>
                                    <th>Gaji Pokok</th>
                                    <th>Tunjangan</th>
                                    <th>Potongan</th>
                                    <th>Gaji Bersih</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($payrolls as $payroll)
                                <tr>
                                    <td>{{ $loop->iteration + ($payrolls->currentPage() - 1) * $payrolls->perPage() }}</td>
                                    <td>
                                        <div>
                                            @php
                                                $employeeName = $payroll->employee_name ?? ($payroll->employee->name ?? null);
                                                $employeeNumber = $payroll->employee_number ?? ($payroll->employee->employee_number ?? null);
                                            @endphp
                                            @if($employeeName)
                                                <strong>{{ $employeeName }}</strong>
                                                @if($employeeNumber)
                                                    <br>
                                                    <small class="text-muted">{{ $employeeNumber }}</small>
                                                @endif
                                            @else
                                                <span class="text-danger">
                                                    <i class="fas fa-exclamation-triangle me-1"></i>
                                                    Employee tidak ditemukan (ID: {{ $payroll->employee_id }})
                                                </span>
                                            @endif
                                        </div>
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($payroll->payroll_date) }}</td>
                                    <td>Rp {{ number_format($payroll->basic_salary, 0, ',', '.') }}</td>
                                    <td>Rp {{ number_format($payroll->total_allowances, 0, ',', '.') }}</td>
                                    <td>Rp {{ number_format($payroll->total_deductions, 0, ',', '.') }}</td>
                                    <td>
                                        <strong class="text-primary">Rp {{ number_format($payroll->net_salary, 0, ',', '.') }}</strong>
                                    </td>
                                    <td>
                                        <span class="badge {{ $payroll->status_badge_class }}">
                                            {{ $payroll->status_label }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ tenant_route('hr.payroll.show', $payroll->id) }}" 
                                               class="btn btn-sm btn-outline-info" title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('hr.payroll.edit', $payroll->id) }}" 
                                               class="btn btn-sm btn-outline-warning" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('hr.payroll.destroy', $payroll->id) }}" 
                                                  method="POST" class="d-inline" 
                                                  onsubmit="return confirm('Apakah Anda yakin ingin menghapus penggajian ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="9" class="text-center py-4">
                                        <div class="text-muted">
                                            <i class="fas fa-inbox fa-3x mb-3"></i>
                                            <p>Belum ada data penggajian</p>
                                        </div>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if($payrolls->hasPages())
                    <div class="d-flex justify-content-center mt-4">
                        {{ $payrolls->appends(request()->query())->links() }}
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

