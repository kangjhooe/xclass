@extends('layouts.tenant')

@section('title', 'Detail Buku Tamu')
@section('page-title', 'Detail Data Buku Tamu')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user me-3"></i>
                Detail Data Buku Tamu
            </h2>
            <p>Informasi lengkap tentang tamu yang berkunjung</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="d-flex gap-2 justify-content-md-end">
                <a href="{{ tenant_route('tenant.guest-book.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
                <a href="{{ tenant_route('tenant.guest-book.edit', $guestBook) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-6">
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-user-circle me-2 text-primary"></i>
                    Informasi Pribadi
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="info-item">
                        <label>Nama Tamu</label>
                        <p><strong>{{ $guestBook->visitor_name }}</strong></p>
                    </div>
                    <div class="info-item">
                        <label>No. Telepon</label>
                        <p>{{ $guestBook->visitor_phone ?? '-' }}</p>
                    </div>
                    <div class="info-item">
                        <label>Email</label>
                        <p>{{ $guestBook->visitor_email ?? '-' }}</p>
                    </div>
                    <div class="info-item">
                        <label>Organisasi</label>
                        <p>{{ $guestBook->visitor_organization ?? '-' }}</p>
                    </div>
                    <div class="info-item">
                        <label>Alamat</label>
                        <p>{{ $guestBook->visitor_address ?? '-' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-calendar-alt me-2 text-primary"></i>
                    Informasi Kunjungan
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="info-item">
                        <label>Tujuan</label>
                        <p>
                            <span class="badge-modern bg-info">{{ $guestBook->purpose_label }}</span>
                        </p>
                    </div>
                    <div class="info-item">
                        <label>Orang yang Ditemui</label>
                        <p>{{ $guestBook->person_to_meet ?? '-' }}</p>
                    </div>
                    <div class="info-item">
                        <label>Departemen</label>
                        <p>{{ $guestBook->department ?? '-' }}</p>
                    </div>
                    <div class="info-item">
                        <label>Tanggal Kunjungan</label>
                        <p>{{ \App\Helpers\DateHelper::formatIndonesian($guestBook->visit_date) }}</p>
                    </div>
                    <div class="info-item">
                        <label>Waktu Kunjungan</label>
                        <p>{{ $guestBook->visit_time->format('H:i') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@if($guestBook->purpose_description || $guestBook->notes)
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-file-alt me-2 text-primary"></i>
                    Deskripsi & Catatan
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    @if($guestBook->purpose_description)
                    <div class="info-item">
                        <label>Deskripsi Tujuan</label>
                        <p>{{ $guestBook->purpose_description }}</p>
                    </div>
                    @endif
                    @if($guestBook->notes)
                    <div class="info-item">
                        <label>Catatan</label>
                        <p>{{ $guestBook->notes }}</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<div class="row">
    <div class="col-md-6">
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-sign-in-alt me-2 text-primary"></i>
                    Informasi Check In/Out
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="info-item">
                        <label>Status</label>
                        <p>
                            <span class="badge-modern bg-{{ $guestBook->status_color }}">
                                {{ $guestBook->status_label }}
                            </span>
                        </p>
                    </div>
                    @if($guestBook->check_in_time)
                    <div class="info-item">
                        <label>Waktu Check In</label>
                        <p>{{ \App\Helpers\DateHelper::formatIndonesian($guestBook->check_in_time, true) }}</p>
                    </div>
                    @endif
                    @if($guestBook->check_out_time)
                    <div class="info-item">
                        <label>Waktu Check Out</label>
                        <p>{{ \App\Helpers\DateHelper::formatIndonesian($guestBook->check_out_time, true) }}</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Sistem
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="info-item">
                        <label>Dibuat</label>
                        <p>{{ \App\Helpers\DateHelper::formatIndonesian($guestBook->created_at, true) }}</p>
                    </div>
                    <div class="info-item">
                        <label>Diperbarui</label>
                        <p>{{ \App\Helpers\DateHelper::formatIndonesian($guestBook->updated_at, true) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@if($guestBook->status == 'checked_in')
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-body">
                <form action="{{ tenant_route('tenant.guest-book.checkout', $guestBook) }}" 
                      method="POST" 
                      onsubmit="return confirm('Apakah Anda yakin ingin check out tamu ini?')">
                    @csrf
                    <button type="submit" class="btn btn-modern btn-success">
                        <i class="fas fa-sign-out-alt me-2"></i> Check Out Tamu
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endif
@endsection
