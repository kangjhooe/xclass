@extends('layouts.tenant')

@section('title', 'Detail Siswa')
@section('page-title', 'Detail Siswa')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-graduate me-3"></i>
                Detail Siswa: {{ $student->name }}
            </h2>
            <p>Informasi lengkap tentang siswa</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.students.edit', $student) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.students.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Student Avatar Card -->
    <div class="col-lg-4 mb-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-body text-center p-4">
                <div class="user-avatar mb-3" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    {{ strtoupper(substr($student->name, 0, 1)) }}
                </div>
                <h5 class="mb-1" style="font-weight: 700;">{{ $student->name }}</h5>
                <p class="text-muted mb-2">{{ $student->student_number ?? $student->nisn ?? '-' }}</p>
                <span class="badge-modern {{ $student->is_active ? 'bg-success' : 'bg-danger' }}" style="color: white;">
                    {{ $student->is_active ? 'Aktif' : 'Tidak Aktif' }}
                </span>
            </div>
        </div>
    </div>
    
    <!-- Student Information -->
    <div class="col-lg-8 mb-4">
        <div class="info-card fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0" style="font-weight: 700; color: #495057;">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Siswa
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-id-card"></i>
                        NIS
                    </div>
                    <div class="info-item-value">
                        {{ $student->student_number ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-fingerprint"></i>
                        NISN
                    </div>
                    <div class="info-item-value">
                        {{ $student->nisn ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-user"></i>
                        Nama Lengkap
                    </div>
                    <div class="info-item-value">
                        {{ $student->name }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-envelope"></i>
                        Email
                    </div>
                    <div class="info-item-value">
                        @if($student->email)
                            <a href="mailto:{{ $student->email }}" class="text-decoration-none">{{ $student->email }}</a>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-phone"></i>
                        No. Telepon
                    </div>
                    <div class="info-item-value">
                        @if($student->phone)
                            <a href="tel:{{ $student->phone }}" class="text-decoration-none">{{ $student->phone }}</a>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-venus-mars"></i>
                        Jenis Kelamin
                    </div>
                    <div class="info-item-value">
                        {{ $student->gender == 'male' ? 'Laki-laki' : 'Perempuan' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-birthday-cake"></i>
                        Tanggal Lahir
                    </div>
                    <div class="info-item-value">
                        {{ $student->birth_date ? \App\Helpers\DateHelper::formatIndonesian($student->birth_date) : '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-door-open"></i>
                        Kelas
                    </div>
                    <div class="info-item-value">
                        {{ $student->classRoom->name ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-users"></i>
                        Nama Orang Tua
                    </div>
                    <div class="info-item-value">
                        {{ $student->parent_name ?? '-' }}
                    </div>
                </div>
                @if($student->address)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-map-marker-alt"></i>
                        Alamat
                    </div>
                    <div class="info-item-value">
                        {{ $student->address }}
                    </div>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
