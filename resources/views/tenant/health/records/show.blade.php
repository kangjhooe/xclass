@extends('layouts.tenant')

@section('title', 'Detail Rekam Medis')
@section('page-title', 'Detail Rekam Medis')

@push('styles')
<style>
    .modern-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
    }
    
    .modern-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    .info-card {
        background: #fff;
        border-radius: 12px;
        border: 1px solid #e9ecef;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
    }
    
    .info-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .info-card-header {
        background: #f8f9fa;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e9ecef;
        font-weight: 600;
        color: #495057;
    }
    
    .detail-box {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
        border-left: 4px solid #10b981;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-file-medical me-2"></i>
                    Detail Rekam Medis
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="mb-4">
                                <h4 class="text-primary">{{ $record->student->name }}</h4>
                                <p class="text-muted mb-0">{{ $record->student->student_number }} - {{ $record->student->classRoom->name ?? 'N/A' }}</p>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Tanggal Pemeriksaan</label>
                                        <div class="detail-box">
                                            <i class="fas fa-calendar me-1 text-success"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($record->checkup_date) }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Status Kesehatan</label>
                                        <div>
                                            @if($record->health_status == 'healthy')
                                                <span class="badge bg-success">Sehat</span>
                                            @elseif($record->health_status == 'sick')
                                                <span class="badge bg-danger">Sakit</span>
                                            @elseif($record->health_status == 'recovering')
                                                <span class="badge bg-warning">Pulih</span>
                                            @else
                                                <span class="badge bg-secondary">{{ ucfirst($record->health_status) }}</span>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Tinggi Badan</label>
                                        <div>{{ $record->height ? $record->height . ' cm' : '-' }}</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Berat Badan</label>
                                        <div>{{ $record->weight ? $record->weight . ' kg' : '-' }}</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Tekanan Darah</label>
                                        <div>{{ $record->blood_pressure ?? '-' }}</div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Suhu Tubuh</label>
                                        <div>{{ $record->temperature ? $record->temperature . '°C' : '-' }}</div>
                                    </div>
                                </div>
                            </div>

                            @if($record->symptoms)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Gejala</label>
                                <div class="detail-box">
                                    {{ $record->symptoms }}
                                </div>
                            </div>
                            @endif

                            @if($record->diagnosis)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Diagnosis</label>
                                <div class="detail-box">
                                    {{ $record->diagnosis }}
                                </div>
                            </div>
                            @endif

                            @if($record->treatment)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Perawatan</label>
                                <div class="detail-box">
                                    {{ $record->treatment }}
                                </div>
                            </div>
                            @endif

                            @if($record->medication)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Obat-obatan</label>
                                <div class="detail-box">
                                    {{ $record->medication }}
                                </div>
                            </div>
                            @endif

                            @if($record->follow_up_date)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Tanggal Tindak Lanjut</label>
                                <div class="detail-box">
                                    <i class="fas fa-calendar me-1 text-success"></i>
                                    {{ \App\Helpers\DateHelper::formatIndonesian($record->follow_up_date) }}
                                </div>
                            </div>
                            @endif

                            @if($record->notes)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Catatan Tambahan</label>
                                <div class="detail-box">
                                    {{ $record->notes }}
                                </div>
                            </div>
                            @endif
                        </div>

                        <div class="col-md-4">
                            <div class="info-card mb-3">
                                <div class="info-card-header">
                                    <i class="fas fa-cog me-2"></i>
                                    Aksi
                                </div>
                                <div class="card-body">
                                    <div class="d-grid gap-2">
                                        <a href="{{ tenant_route('health.records.edit', $record->id) }}" class="btn btn-warning">
                                            <i class="fas fa-edit me-1"></i>
                                            Edit Rekam Medis
                                        </a>
                                        <a href="{{ tenant_route('health.records') }}" class="btn btn-info">
                                            <i class="fas fa-list me-1"></i>
                                            Kembali ke Daftar
                                        </a>
                                        <form action="{{ tenant_route('health.records.destroy', $record->id) }}" method="POST" 
                                              onsubmit="return confirm('Apakah Anda yakin ingin menghapus rekam medis ini?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger w-100">
                                                <i class="fas fa-trash me-1"></i>
                                                Hapus Rekam Medis
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div class="info-card">
                                <div class="info-card-header">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Informasi Rekam Medis
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <small class="text-muted d-block mb-1">Dibuat:</small>
                                        <div class="detail-box">
                                            <i class="fas fa-calendar-plus me-1 text-success"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($record->created_at, true) }}
                                        </div>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block mb-1">Diperbarui:</small>
                                        <div class="detail-box">
                                            <i class="fas fa-calendar-check me-1 text-success"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($record->updated_at, true) }}
                                        </div>
                                    </div>
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
