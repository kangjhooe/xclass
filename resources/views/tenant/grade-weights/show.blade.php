@extends('layouts.tenant')

@section('title', 'Detail Bobot Nilai')
@section('page-title', 'Detail Bobot Nilai')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-eye me-2"></i>
                    Detail Bobot Nilai
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-bordered">
                            <tr>
                                <td width="30%" class="bg-light"><strong>Jenis Penilaian</strong></td>
                                <td>
                                    <span class="badge bg-info">{{ ucfirst($gradeWeight->assignment_type) }}</span>
                                </td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Label</strong></td>
                                <td>{{ $gradeWeight->assignment_label }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Bobot</strong></td>
                                <td>
                                    <strong class="fs-5">{{ number_format($gradeWeight->weight_percentage, 2) }}%</strong>
                                </td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Status</strong></td>
                                <td>
                                    @if($gradeWeight->is_active)
                                        <span class="badge bg-success fs-6">Aktif</span>
                                    @else
                                        <span class="badge bg-secondary fs-6">Tidak Aktif</span>
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <table class="table table-bordered">
                            <tr>
                                <td width="30%" class="bg-light"><strong>Dibuat</strong></td>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($gradeWeight->created_at, true) }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Diperbarui</strong></td>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($gradeWeight->updated_at, true) }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Kontribusi</strong></td>
                                <td>
                                    @if($gradeWeight->is_active)
                                        <span class="text-success">Digunakan dalam perhitungan</span>
                                    @else
                                        <span class="text-muted">Tidak digunakan</span>
                                    @endif
                                </td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>ID</strong></td>
                                <td>{{ $gradeWeight->id }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                    <a href="{{ tenant_route('tenant.grade-weights.index') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>
                        Kembali
                    </a>
                    <div>
                        <a href="{{ tenant_route('tenant.grade-weights.edit', $gradeWeight) }}" class="btn btn-warning">
                            <i class="fas fa-edit me-2"></i>
                            Edit
                        </a>
                        <form action="{{ tenant_route('tenant.grade-weights.toggle-active', $gradeWeight) }}" 
                              method="POST" class="d-inline">
                            @csrf
                            <button type="submit" class="btn {{ $gradeWeight->is_active ? 'btn-outline-secondary' : 'btn-outline-success' }}"
                                    onclick="return confirm('{{ $gradeWeight->is_active ? 'Nonaktifkan' : 'Aktifkan' }} bobot ini?')">
                                <i class="fas fa-{{ $gradeWeight->is_active ? 'pause' : 'play' }} me-2"></i>
                                {{ $gradeWeight->is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-chart-pie me-2"></i>
                    Visualisasi Bobot
                </h6>
            </div>
            <div class="card-body text-center">
                <div class="mb-3">
                    <div class="progress" style="height: 30px;">
                        <div class="progress-bar bg-primary" role="progressbar" 
                             style="width: {{ $gradeWeight->weight_percentage }}%"
                             aria-valuenow="{{ $gradeWeight->weight_percentage }}" 
                             aria-valuemin="0" aria-valuemax="100">
                            {{ number_format($gradeWeight->weight_percentage, 1) }}%
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <h4 class="text-primary">{{ number_format($gradeWeight->weight_percentage, 2) }}%</h4>
                    <p class="mb-0">Bobot Penilaian</p>
                </div>
                
                <div class="mb-3">
                    @if($gradeWeight->is_active)
                        <span class="badge bg-success fs-6">AKTIF</span>
                        <p class="mb-0">Digunakan dalam perhitungan</p>
                    @else
                        <span class="badge bg-secondary fs-6">TIDAK AKTIF</span>
                        <p class="mb-0">Tidak digunakan</p>
                    @endif
                </div>
            </div>
        </div>
        
        <div class="card mt-3">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi
                </h6>
            </div>
            <div class="card-body">
                <p class="mb-3">
                    <strong>Jenis:</strong> {{ $gradeWeight->assignment_type_label }}
                </p>
                <p class="mb-3">
                    <strong>Bobot:</strong> {{ number_format($gradeWeight->weight_percentage, 2) }}% dari total nilai
                </p>
                <p class="mb-3">
                    <strong>Status:</strong> 
                    @if($gradeWeight->is_active)
                        Aktif dan digunakan
                    @else
                        Tidak aktif
                    @endif
                </p>
                <p class="mb-0">
                    <strong>Terakhir Diperbarui:</strong><br>
                    {{ \App\Helpers\DateHelper::formatIndonesian($gradeWeight->updated_at, true) }}
                </p>
            </div>
        </div>
    </div>
</div>
@endsection
