@extends('layouts.tenant')

@section('title', 'Statistik Staff')
@section('page-title', 'Statistik Staff')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                    <i class="fas fa-chart-bar me-2"></i>
                    Statistik Staff
                </h5>
                <a href="{{ tenant_route('tenant.staff.index') }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-left me-2"></i>
                    Kembali
                </a>
            </div>
            <div class="card-body">
                <!-- Overview Cards -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card border-primary">
                            <div class="card-body text-center">
                                <i class="fas fa-users fa-2x text-primary mb-2"></i>
                                <h4 class="text-primary">{{ $stats['total_staff'] }}</h4>
                                <p class="text-muted mb-0">Total Staff</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card border-success">
                            <div class="card-body text-center">
                                <i class="fas fa-user-check fa-2x text-success mb-2"></i>
                                <h4 class="text-success">{{ $stats['active_staff'] }}</h4>
                                <p class="text-muted mb-0">Staff Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card border-warning">
                            <div class="card-body text-center">
                                <i class="fas fa-user-times fa-2x text-warning mb-2"></i>
                                <h4 class="text-warning">{{ $stats['inactive_staff'] }}</h4>
                                <p class="text-muted mb-0">Staff Tidak Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card border-info">
                            <div class="card-body text-center">
                                <i class="fas fa-percentage fa-2x text-info mb-2"></i>
                                <h4 class="text-info">
                                    {{ $stats['total_staff'] > 0 ? round(($stats['active_staff'] / $stats['total_staff']) * 100, 1) : 0 }}%
                                </h4>
                                <p class="text-muted mb-0">Tingkat Aktivitas</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Role Distribution -->
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-chart-pie me-2"></i>
                                    Distribusi Role
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-6 mb-3">
                                        <div class="d-flex align-items-center">
                                            <div class="bg-danger rounded-circle me-3" style="width: 20px; height: 20px;"></div>
                                            <div>
                                                <h6 class="mb-0">Admin Sekolah</h6>
                                                <small class="text-muted">{{ $stats['school_admins'] }} orang</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6 mb-3">
                                        <div class="d-flex align-items-center">
                                            <div class="bg-success rounded-circle me-3" style="width: 20px; height: 20px;"></div>
                                            <div>
                                                <h6 class="mb-0">Guru</h6>
                                                <small class="text-muted">{{ $stats['teachers'] }} orang</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6 mb-3">
                                        <div class="d-flex align-items-center">
                                            <div class="bg-primary rounded-circle me-3" style="width: 20px; height: 20px;"></div>
                                            <div>
                                                <h6 class="mb-0">Siswa</h6>
                                                <small class="text-muted">{{ $stats['students'] }} orang</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6 mb-3">
                                        <div class="d-flex align-items-center">
                                            <div class="bg-info rounded-circle me-3" style="width: 20px; height: 20px;"></div>
                                            <div>
                                                <h6 class="mb-0">Orang Tua</h6>
                                                <small class="text-muted">{{ $stats['parents'] }} orang</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-chart-bar me-2"></i>
                                    Ringkasan
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-borderless">
                                        <tr>
                                            <td><strong>Total Staff:</strong></td>
                                            <td class="text-end">{{ $stats['total_staff'] }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Staff Aktif:</strong></td>
                                            <td class="text-end text-success">{{ $stats['active_staff'] }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Staff Tidak Aktif:</strong></td>
                                            <td class="text-end text-warning">{{ $stats['inactive_staff'] }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Admin Sekolah:</strong></td>
                                            <td class="text-end text-danger">{{ $stats['school_admins'] }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Guru:</strong></td>
                                            <td class="text-end text-success">{{ $stats['teachers'] }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Siswa:</strong></td>
                                            <td class="text-end text-primary">{{ $stats['students'] }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Orang Tua:</strong></td>
                                            <td class="text-end text-info">{{ $stats['parents'] }}</td>
                                        </tr>
                                    </table>
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
