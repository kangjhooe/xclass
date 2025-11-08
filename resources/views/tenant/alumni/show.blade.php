@extends('layouts.tenant')

@section('title', 'Detail Alumni')
@section('page-title', 'Detail Alumni')

@push('styles')
<style>
    .card {
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        border: none;
    }
    
    .card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        border: none;
        padding: 1.25rem 1.5rem;
    }
    
    .card-header h3 {
        color: white;
        margin: 0;
    }
    
    .avatar-lg {
        width: 100px;
        height: 100px;
        font-size: 40px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .badge-modern {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .info-card {
        border-left: 4px solid #667eea;
        transition: all 0.3s ease;
    }
    
    .info-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-graduation-cap me-2"></i>Detail Alumni
                        </h3>
                        <div class="btn-group">
                            <a href="{{ tenant_route('tenant.alumni.index') }}" class="btn btn-light btn-sm">
                                <i class="fas fa-arrow-left"></i> Kembali
                            </a>
                            <a href="{{ tenant_route('tenant.alumni.edit', $alumni) }}" class="btn btn-light btn-sm">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                        </div>
                    </div>
                </div>

                <div class="card-body p-4">
                    <div class="row">
                        <!-- Profile Information -->
                        <div class="col-md-4 mb-4">
                            <div class="card info-card h-100">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="card-title mb-0">
                                        <i class="fas fa-user me-2"></i>Informasi Profil
                                    </h5>
                                </div>
                                <div class="card-body text-center">
                                    <div class="avatar-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                                        {{ substr($alumni->student->name ?? 'A', 0, 1) }}
                                    </div>
                                    <h4 class="mb-1">{{ $alumni->student->name ?? 'N/A' }}</h4>
                                    <p class="text-muted mb-2">{{ $alumni->student->student_number ?? 'N/A' }}</p>
                                    
                                    <div class="mb-3">
                                        <span class="badge badge-modern bg-{{ $alumni->status_color ?? 'secondary' }}">
                                            {{ $alumni->status_label ?? 'N/A' }}
                                        </span>
                                        @if($alumni->is_active)
                                            <span class="badge bg-success ms-1">Aktif</span>
                                        @else
                                            <span class="badge bg-secondary ms-1">Tidak Aktif</span>
                                        @endif
                                    </div>

                                    <div class="row text-start">
                                        <div class="col-6">
                                            <strong>Tahun Lulus:</strong>
                                        </div>
                                        <div class="col-6">
                                            {{ $alumni->graduation_year }}
                                        </div>
                                        <div class="col-6">
                                            <strong>Tanggal Lulus:</strong>
                                        </div>
                                        <div class="col-6">
                                            {{ \App\Helpers\DateHelper::formatIndonesian($alumni->graduation_date) }}
                                        </div>
                                        <div class="col-6">
                                            <strong>Nilai Akhir:</strong>
                                        </div>
                                        <div class="col-6">
                                            <span class="badge bg-{{ $alumni->grade_color }}">
                                                {{ $alumni->final_grade }} ({{ $alumni->grade_label }})
                                            </span>
                                        </div>
                                        @if($alumni->gpa)
                                            <div class="col-6">
                                                <strong>GPA:</strong>
                                            </div>
                                            <div class="col-6">
                                                {{ $alumni->gpa }}
                                            </div>
                                        @endif
                                        @if($alumni->rank)
                                            <div class="col-6">
                                                <strong>Peringkat:</strong>
                                            </div>
                                            <div class="col-6">
                                                {{ $alumni->formatted_rank }}
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Career Information -->
                        <div class="col-md-8">
                            <div class="row">
                                <!-- Career Details -->
                                <div class="col-md-6 mb-4">
                                    <div class="card info-card h-100">
                                        <div class="card-header bg-success text-white">
                                            <h5 class="card-title mb-0">
                                                <i class="fas fa-briefcase me-2"></i>Informasi Karir
                                            </h5>
                                        </div>
                                        <div class="card-body">
                                            @if($alumni->current_occupation)
                                                <div class="mb-3">
                                                    <strong>Pekerjaan:</strong><br>
                                                    {{ $alumni->current_occupation }}
                                                    @if($alumni->position)
                                                        <br><small class="text-muted">{{ $alumni->position }}</small>
                                                    @endif
                                                </div>
                                            @endif

                                            @if($alumni->company)
                                                <div class="mb-3">
                                                    <strong>Perusahaan:</strong><br>
                                                    {{ $alumni->company }}
                                                    @if($alumni->industry)
                                                        <br><small class="text-muted">{{ $alumni->industry }}</small>
                                                    @endif
                                                </div>
                                            @endif

                                            @if($alumni->salary_range)
                                                <div class="mb-3">
                                                    <strong>Kisaran Gaji:</strong><br>
                                                    {{ $alumni->formatted_salary_range }}
                                                </div>
                                            @endif

                                            @if(!$alumni->current_occupation && !$alumni->company)
                                                <div class="text-muted text-center py-3">
                                                    <i class="fas fa-info-circle me-1"></i>
                                                    Informasi karir belum diisi
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>

                                <!-- Contact Information -->
                                <div class="col-md-6 mb-4">
                                    <div class="card info-card h-100">
                                        <div class="card-header bg-info text-white">
                                            <h5 class="card-title mb-0">
                                                <i class="fas fa-address-book me-2"></i>Informasi Kontak
                                            </h5>
                                        </div>
                                        <div class="card-body">
                                            @if($alumni->address)
                                                <div class="mb-3">
                                                    <strong>Alamat:</strong><br>
                                                    {{ $alumni->address }}
                                                </div>
                                            @endif

                                            @if($alumni->phone)
                                                <div class="mb-3">
                                                    <strong>Telepon:</strong><br>
                                                    <a href="tel:{{ $alumni->phone }}" class="text-decoration-none">
                                                        <i class="fas fa-phone me-1"></i>{{ $alumni->phone }}
                                                    </a>
                                                </div>
                                            @endif

                                            @if($alumni->email)
                                                <div class="mb-3">
                                                    <strong>Email:</strong><br>
                                                    <a href="mailto:{{ $alumni->email }}" class="text-decoration-none">
                                                        <i class="fas fa-envelope me-1"></i>{{ $alumni->email }}
                                                    </a>
                                                </div>
                                            @endif

                                            @if($alumni->last_contact_date)
                                                <div class="mb-3">
                                                    <strong>Kontak Terakhir:</strong><br>
                                                    {{ \App\Helpers\DateHelper::formatIndonesian($alumni->last_contact_date) }}
                                                </div>
                                            @endif

                                            @if(!$alumni->address && !$alumni->phone && !$alumni->email)
                                                <div class="text-muted text-center py-3">
                                                    <i class="fas fa-info-circle me-1"></i>
                                                    Informasi kontak belum diisi
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Achievements -->
                            @if($alumni->achievements && count($alumni->achievements) > 0)
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <div class="card info-card">
                                            <div class="card-header bg-warning text-white">
                                                <h5 class="card-title mb-0">
                                                    <i class="fas fa-trophy me-2"></i>Prestasi ({{ count($alumni->achievements) }})
                                                </h5>
                                            </div>
                                            <div class="card-body">
                                                <div class="row">
                                                    @foreach($alumni->achievements as $index => $achievement)
                                                        <div class="col-md-6 mb-3">
                                                            <div class="border rounded p-3">
                                                                <h6 class="mb-1">{{ $achievement['title'] ?? 'Prestasi' }}</h6>
                                                                @if(isset($achievement['description']))
                                                                    <p class="text-muted mb-1">{{ $achievement['description'] }}</p>
                                                                @endif
                                                                @if(isset($achievement['date']))
                                                                    <small class="text-muted">
                                                                        <i class="fas fa-calendar me-1"></i>
                                                                        {{ \App\Helpers\DateHelper::formatIndonesian($achievement['date']) }}
                                                                    </small>
                                                                @endif
                                                                @if(isset($achievement['level']))
                                                                    <span class="badge bg-info ms-2">{{ ucfirst($achievement['level']) }}</span>
                                                                @endif
                                                            </div>
                                                        </div>
                                                    @endforeach
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endif

                            <!-- Notes -->
                            @if($alumni->notes)
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <div class="card info-card">
                                            <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                                <h5 class="card-title mb-0">
                                                    <i class="fas fa-sticky-note me-2"></i>Catatan
                                                </h5>
                                            </div>
                                            <div class="card-body">
                                                <p class="mb-0">{{ $alumni->notes }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>

                <div class="card-footer bg-light border-top">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>Dibuat: {{ \App\Helpers\DateHelper::formatIndonesian($alumni->created_at, true) }}
                                @if($alumni->updated_at != $alumni->created_at)
                                    <span class="ms-2">
                                        <i class="fas fa-edit me-1"></i>Diperbarui: {{ \App\Helpers\DateHelper::formatIndonesian($alumni->updated_at, true) }}
                                    </span>
                                @endif
                            </small>
                        </div>
                        <div class="btn-group">
                            <form action="{{ tenant_route('tenant.alumni.toggle-active', $alumni) }}" method="POST" class="d-inline">
                                @csrf
                                <button type="submit" class="btn btn-{{ $alumni->is_active ? 'secondary' : 'success' }} btn-sm" 
                                        onclick="return confirm('{{ $alumni->is_active ? 'Nonaktifkan' : 'Aktifkan' }} alumni ini?')">
                                    <i class="fas fa-{{ $alumni->is_active ? 'pause' : 'play' }}"></i>
                                    {{ $alumni->is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                                </button>
                            </form>
                            <form action="{{ tenant_route('tenant.alumni.destroy', $alumni) }}" method="POST" class="d-inline"
                                  onsubmit="return confirm('Hapus alumni ini?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger btn-sm">
                                    <i class="fas fa-trash"></i> Hapus
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

