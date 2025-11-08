@extends('layouts.tenant')

@section('title', 'Detail Supervisi Guru')
@section('page-title', 'Detail Supervisi Guru')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .info-item {
        padding: 0.75rem 0;
        border-bottom: 1px solid #f0f0f0;
    }
    .info-item:last-child {
        border-bottom: none;
    }
    .info-item label {
        font-weight: 600;
        color: #6c757d;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.25rem;
    }
    .info-item p {
        color: #212529;
        font-size: 1rem;
        margin: 0;
    }
    .score-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1.1rem;
    }
    .score-excellent { background: #10b981; color: white; }
    .score-good { background: #3b82f6; color: white; }
    .score-fair { background: #f59e0b; color: white; }
    .score-poor { background: #ef4444; color: white; }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-clipboard-check me-3"></i>
                Detail Supervisi Guru
            </h2>
            <p>Supervisi tanggal: <strong>{{ \Carbon\Carbon::parse($supervision->supervision_date)->format('d-m-Y') }}</strong></p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="d-flex gap-2 justify-content-md-end">
                <a href="{{ tenant_route('tenant.teacher-supervisions.edit', ['teacher_supervision' => $supervision->id]) }}" 
                   class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i>Edit
                </a>
                <a href="{{ tenant_route('tenant.teacher-supervisions.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i>Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <!-- Data Dasar -->
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5><i class="fas fa-info-circle me-2 text-primary"></i>Data Dasar Supervisi</h5>
            </div>
                <div class="card-body p-4">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>Guru yang Disupervisi</label>
                                <p><strong>{{ $supervision->teacher->name }}</strong><br>
                                <small class="text-muted">{{ $supervision->teacher->employee_number }}</small></p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>Supervisor</label>
                                <p><strong>{{ $supervision->supervisor->name }}</strong></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <div class="info-item">
                                <label>Tanggal Supervisi</label>
                                <p>{{ \Carbon\Carbon::parse($supervision->supervision_date)->format('d-m-Y') }}</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="info-item">
                                <label>Waktu</label>
                                <p>
                                    @if($supervision->start_time)
                                        {{ \Carbon\Carbon::parse($supervision->start_time)->format('H:i') }}
                                        @if($supervision->end_time)
                                            - {{ \Carbon\Carbon::parse($supervision->end_time)->format('H:i') }}
                                        @endif
                                    @else
                                        -
                                    @endif
                                </p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="info-item">
                                <label>Status</label>
                                <p>
                                    @if($supervision->status == 'completed')
                                        <span class="badge bg-success">Selesai</span>
                                    @elseif($supervision->status == 'draft')
                                        <span class="badge bg-secondary">Draft</span>
                                    @else
                                        <span class="badge bg-info">Diarsipkan</span>
                                    @endif
                                    @if($supervision->is_confirmed)
                                        <span class="badge bg-success ms-2">Terkonfirmasi</span>
                                    @endif
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>Jenis Supervisi</label>
                                <p>{{ $supervision->supervision_type_label }}</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>Metode Supervisi</label>
                                <p>{{ $supervision->supervision_method_label }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>Kelas</label>
                                <p>{{ $supervision->classRoom ? $supervision->classRoom->name : '-' }}</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>Mata Pelajaran</label>
                                <p>{{ $supervision->subject ? $supervision->subject->name : '-' }}</p>
                            </div>
                        </div>
                    </div>

                    @if($supervision->academic_year)
                    <div class="row">
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>Tahun Ajaran</label>
                                <p>{{ $supervision->academic_year }}</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-item">
                                <label>Semester</label>
                                <p>{{ $supervision->semester ? 'Semester ' . $supervision->semester : '-' }}</p>
                            </div>
                        </div>
                    </div>
                    @endif
                </div>
            </div>

        <!-- Aspek Penilaian -->
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5><i class="fas fa-chart-line me-2 text-primary"></i>Aspek Penilaian</h5>
            </div>
                <div class="card-body p-4">
                    @if($supervision->preparation_score !== null)
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="form-label mb-0">1. Persiapan</label>
                            <span class="score-badge score-{{ $supervision->preparation_score >= 80 ? 'excellent' : ($supervision->preparation_score >= 70 ? 'good' : ($supervision->preparation_score >= 60 ? 'fair' : 'poor')) }}">
                                {{ number_format($supervision->preparation_score, 2) }}
                            </span>
                        </div>
                        @if($supervision->preparation_notes)
                            <p class="text-muted mb-0">{{ $supervision->preparation_notes }}</p>
                        @endif
                    </div>
                    @endif

                    @if($supervision->implementation_score !== null)
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="form-label mb-0">2. Pelaksanaan</label>
                            <span class="score-badge score-{{ $supervision->implementation_score >= 80 ? 'excellent' : ($supervision->implementation_score >= 70 ? 'good' : ($supervision->implementation_score >= 60 ? 'fair' : 'poor')) }}">
                                {{ number_format($supervision->implementation_score, 2) }}
                            </span>
                        </div>
                        @if($supervision->implementation_notes)
                            <p class="text-muted mb-0">{{ $supervision->implementation_notes }}</p>
                        @endif
                    </div>
                    @endif

                    @if($supervision->classroom_management_score !== null)
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="form-label mb-0">3. Pengelolaan Kelas</label>
                            <span class="score-badge score-{{ $supervision->classroom_management_score >= 80 ? 'excellent' : ($supervision->classroom_management_score >= 70 ? 'good' : ($supervision->classroom_management_score >= 60 ? 'fair' : 'poor')) }}">
                                {{ number_format($supervision->classroom_management_score, 2) }}
                            </span>
                        </div>
                        @if($supervision->classroom_management_notes)
                            <p class="text-muted mb-0">{{ $supervision->classroom_management_notes }}</p>
                        @endif
                    </div>
                    @endif

                    @if($supervision->student_interaction_score !== null)
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="form-label mb-0">4. Interaksi dengan Siswa</label>
                            <span class="score-badge score-{{ $supervision->student_interaction_score >= 80 ? 'excellent' : ($supervision->student_interaction_score >= 70 ? 'good' : ($supervision->student_interaction_score >= 60 ? 'fair' : 'poor')) }}">
                                {{ number_format($supervision->student_interaction_score, 2) }}
                            </span>
                        </div>
                        @if($supervision->student_interaction_notes)
                            <p class="text-muted mb-0">{{ $supervision->student_interaction_notes }}</p>
                        @endif
                    </div>
                    @endif

                    @if($supervision->assessment_score !== null)
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="form-label mb-0">5. Penilaian</label>
                            <span class="score-badge score-{{ $supervision->assessment_score >= 80 ? 'excellent' : ($supervision->assessment_score >= 70 ? 'good' : ($supervision->assessment_score >= 60 ? 'fair' : 'poor')) }}">
                                {{ number_format($supervision->assessment_score, 2) }}
                            </span>
                        </div>
                        @if($supervision->assessment_notes)
                            <p class="text-muted mb-0">{{ $supervision->assessment_notes }}</p>
                        @endif
                    </div>
                    @endif

                    @if($supervision->overall_score)
                    <div class="border-top pt-3 mt-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <label class="form-label mb-0 fw-bold">Nilai Keseluruhan</label>
                            <span class="score-badge score-{{ $supervision->overall_score >= 80 ? 'excellent' : ($supervision->overall_score >= 70 ? 'good' : ($supervision->overall_score >= 60 ? 'fair' : 'poor')) }}" style="font-size: 1.3rem;">
                                {{ number_format($supervision->overall_score, 2) }}
                            </span>
                        </div>
                        <p class="text-muted mb-0 mt-2">
                            <strong>Rating:</strong> {{ $supervision->overall_rating_label }}
                        </p>
                    </div>
                    @endif
                </div>
            </div>

        <!-- Kekuatan dan Kelemahan -->
        @if($supervision->strengths || $supervision->weaknesses)
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5><i class="fas fa-balance-scale me-2 text-primary"></i>Kekuatan dan Kelemahan</h5>
            </div>
                <div class="card-body p-4">
                    @if($supervision->strengths)
                    <div class="mb-3">
                        <label class="form-label text-success"><i class="fas fa-check-circle me-2"></i>Kekuatan</label>
                        <p>{{ $supervision->strengths }}</p>
                    </div>
                    @endif
                    
                    @if($supervision->weaknesses)
                    <div>
                        <label class="form-label text-danger"><i class="fas fa-exclamation-circle me-2"></i>Kelemahan</label>
                        <p>{{ $supervision->weaknesses }}</p>
                    </div>
                    @endif
                </div>
            </div>
            @endif

        <!-- Rencana Tindak Lanjut -->
        @if($supervision->follow_up_plan)
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5><i class="fas fa-tasks me-2 text-primary"></i>Rencana Tindak Lanjut (RTL)</h5>
            </div>
                <div class="card-body p-4">
                    <div class="info-item">
                        <label>Rencana Tindak Lanjut</label>
                        <p>{{ $supervision->follow_up_plan }}</p>
                    </div>
                    @if($supervision->follow_up_date)
                    <div class="info-item">
                        <label>Tanggal Tindak Lanjut</label>
                        <p>{{ \Carbon\Carbon::parse($supervision->follow_up_date)->format('d-m-Y') }}</p>
                    </div>
                    @endif
                    <div class="info-item">
                        <label>Status Tindak Lanjut</label>
                        <p>
                            <span class="badge bg-{{ $supervision->follow_up_status == 'selesai' ? 'success' : ($supervision->follow_up_status == 'sedang' ? 'warning' : 'secondary') }}">
                                {{ $supervision->follow_up_status_label }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            @endif

        <!-- Catatan dan Tanggapan -->
        @if($supervision->notes || $supervision->teacher_response)
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5><i class="fas fa-sticky-note me-2 text-primary"></i>Catatan dan Tanggapan</h5>
            </div>
                <div class="card-body p-4">
                    @if($supervision->notes)
                    <div class="mb-3">
                        <label class="form-label">Catatan Tambahan</label>
                        <p>{{ $supervision->notes }}</p>
                    </div>
                    @endif
                    
                    @if($supervision->teacher_response)
                    <div>
                        <label class="form-label">Tanggapan Guru</label>
                        <div class="alert alert-info">
                            <p class="mb-0">{{ $supervision->teacher_response }}</p>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
            @endif
        </div>

    <div class="col-md-4">
        <!-- Actions -->
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5><i class="fas fa-cog me-2 text-primary"></i>Aksi</h5>
            </div>
            <div class="card-body p-4">
                <div class="d-grid gap-2">
                    <a href="{{ tenant_route('tenant.teacher-supervisions.edit', ['teacher_supervision' => $supervision->id]) }}" 
                       class="btn btn-modern btn-primary">
                        <i class="fas fa-edit me-2"></i>Edit Supervisi
                    </a>
                    
                    @if(!$supervision->is_confirmed)
                    <form action="{{ tenant_route('tenant.teacher-supervisions.confirm', ['teacher_supervision' => $supervision->id]) }}" 
                          method="POST" class="d-grid">
                        @csrf
                        <button type="submit" class="btn btn-modern btn-success">
                            <i class="fas fa-check me-2"></i>Konfirmasi Supervisi
                        </button>
                    </form>
                    @endif

                    @if(!$supervision->teacher_response)
                    <button type="button" class="btn btn-modern btn-info" data-bs-toggle="modal" data-bs-target="#responseModal">
                        <i class="fas fa-comment me-2"></i>Tambah Tanggapan
                    </button>
                    @endif

                    <form action="{{ tenant_route('tenant.teacher-supervisions.destroy', ['teacher_supervision' => $supervision->id]) }}" 
                          method="POST" class="d-grid"
                          onsubmit="return confirm('Apakah Anda yakin ingin menghapus supervisi ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-modern btn-danger">
                            <i class="fas fa-trash me-2"></i>Hapus Supervisi
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Info -->
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5><i class="fas fa-info-circle me-2 text-primary"></i>Informasi</h5>
            </div>
                <div class="card-body p-4">
                    <div class="info-item">
                        <label>Dibuat</label>
                        <p>{{ \Carbon\Carbon::parse($supervision->created_at)->format('d-m-Y H:i') }}</p>
                    </div>
                    <div class="info-item">
                        <label>Diperbarui</label>
                        <p>{{ \Carbon\Carbon::parse($supervision->updated_at)->format('d-m-Y H:i') }}</p>
                    </div>
            </div>
        </div>
    </div>
</div>

<!-- Response Modal -->
<div class="modal fade" id="responseModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ tenant_route('tenant.teacher-supervisions.response', ['teacher_supervision' => $supervision->id]) }}" method="POST">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Tambah Tanggapan Guru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Tanggapan</label>
                        <textarea name="teacher_response" class="form-control" rows="5" required 
                                  placeholder="Tuliskan tanggapan Anda terhadap hasil supervisi"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan Tanggapan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

