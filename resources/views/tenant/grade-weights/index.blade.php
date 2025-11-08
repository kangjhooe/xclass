@extends('layouts.tenant')

@section('title', 'Bobot Nilai')
@section('page-title', 'Bobot Nilai')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-balance-scale me-2"></i>
                    Pengaturan Bobot Nilai
                </h5>
                <div>
                    <form action="{{ tenant_route('tenant.grade-weights.reset-default') }}" method="POST" class="d-inline me-2">
                        @csrf
                        <button type="submit" class="btn btn-warning btn-sm" 
                                onclick="return confirm('Reset ke bobot default? Ini akan menghapus semua pengaturan yang ada.')">
                            <i class="fas fa-undo me-2"></i>
                            Reset Default
                        </button>
                    </form>
                    <a href="{{ tenant_route('tenant.grade-weights.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>
                        Tambah Bobot
                    </a>
                </div>
            </div>
            <div class="card-body">
                @if($gradeWeights->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Jenis Penilaian</th>
                                    <th>Label</th>
                                    <th>Bobot (%)</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($gradeWeights as $index => $gradeWeight)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td>
                                            <span class="badge bg-info">{{ ucfirst($gradeWeight->assignment_type) }}</span>
                                        </td>
                                        <td>{{ $gradeWeight->assignment_label }}</td>
                                        <td>
                                            <strong>{{ number_format($gradeWeight->weight_percentage, 2) }}%</strong>
                                        </td>
                                        <td>
                                            @if($gradeWeight->is_active)
                                                <span class="badge bg-success">Aktif</span>
                                            @else
                                                <span class="badge bg-secondary">Tidak Aktif</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="{{ tenant_route('tenant.grade-weights.show', $gradeWeight) }}" 
                                                   class="btn btn-sm btn-outline-info">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.grade-weights.edit', $gradeWeight) }}" 
                                                   class="btn btn-sm btn-outline-warning">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('tenant.grade-weights.toggle-active', $gradeWeight) }}" 
                                                      method="POST" class="d-inline">
                                                    @csrf
                                                    <button type="submit" class="btn btn-sm {{ $gradeWeight->is_active ? 'btn-outline-secondary' : 'btn-outline-success' }}">
                                                        <i class="fas fa-{{ $gradeWeight->is_active ? 'pause' : 'play' }}"></i>
                                                    </button>
                                                </form>
                                                <form action="{{ tenant_route('tenant.grade-weights.destroy', $gradeWeight) }}" 
                                                      method="POST" class="d-inline"
                                                      onsubmit="return confirm('Hapus bobot nilai ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Total Bobot -->
                    <div class="alert alert-info mt-3">
                        <strong>Total Bobot Aktif:</strong> 
                        {{ number_format($gradeWeights->where('is_active', true)->sum('weight_percentage'), 2) }}%
                        @if($gradeWeights->where('is_active', true)->sum('weight_percentage') != 100)
                            <span class="text-warning">
                                <i class="fas fa-exclamation-triangle me-1"></i>
                                Total bobot harus 100%
                            </span>
                        @else
                            <span class="text-success">
                                <i class="fas fa-check me-1"></i>
                                Total bobot sudah sesuai
                            </span>
                        @endif
                    </div>
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-balance-scale fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada pengaturan bobot nilai</h5>
                        <p class="text-muted">Klik tombol "Reset Default" untuk menggunakan bobot standar atau "Tambah Bobot" untuk membuat pengaturan custom.</p>
                        <div>
                            <form action="{{ tenant_route('tenant.grade-weights.reset-default') }}" method="POST" class="d-inline me-2">
                                @csrf
                                <button type="submit" class="btn btn-warning" 
                                        onclick="return confirm('Reset ke bobot default?')">
                                    <i class="fas fa-undo me-2"></i>
                                    Reset Default
                                </button>
                            </form>
                            <a href="{{ tenant_route('tenant.grade-weights.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-2"></i>
                                Tambah Bobot
                            </a>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
