@extends('layouts.tenant')

@section('title', 'Detail Pengumuman')
@section('page-title', 'Detail Pengumuman')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-bullhorn me-3"></i>
                Detail Pengumuman
            </h2>
            <p>Informasi lengkap tentang pengumuman</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.announcements.edit', ['announcement' => $announcement->id]) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.announcements.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-file-alt me-2 text-primary"></i>
                    {{ $announcement->title }}
                </h5>
                <div>
                    @if($announcement->priority == 'urgent')
                        <span class="badge-modern bg-danger">Urgent</span>
                    @elseif($announcement->priority == 'high')
                        <span class="badge-modern bg-warning">Tinggi</span>
                    @elseif($announcement->priority == 'medium')
                        <span class="badge-modern bg-info">Sedang</span>
                    @else
                        <span class="badge-modern bg-secondary">Rendah</span>
                    @endif
                    
                    @if($announcement->status == 'published')
                        <span class="badge-modern bg-success">Published</span>
                    @elseif($announcement->status == 'draft')
                        <span class="badge-modern bg-warning">Draft</span>
                    @else
                        <span class="badge-modern bg-secondary">Arsip</span>
                    @endif
                </div>
            </div>
            <div class="card-body">
                <div class="info-card mb-4">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-user-circle text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Penulis</small>
                                    <strong>{{ $announcement->author->name ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-alt text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Tanggal Publikasi</small>
                                    <strong>{{ $announcement->publish_at ? \Carbon\Carbon::parse($announcement->publish_at)->format('d-m-Y H:i') : '-' }}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    @if($announcement->target_audience && count($announcement->target_audience) > 0)
                    <div class="mt-3 pt-3 border-top">
                        <small class="text-muted d-block mb-2">Target Audience:</small>
                        <div class="d-flex flex-wrap gap-2">
                            @foreach($announcement->target_audience as $target)
                                <span class="badge-modern bg-secondary">{{ $target }}</span>
                            @endforeach
                        </div>
                    </div>
                    @endif
                </div>
                
                <div class="border-top pt-4">
                    <h5 class="mb-3">
                        <i class="fas fa-align-left me-2 text-primary"></i>
                        Isi Pengumuman
                    </h5>
                    <div class="content-text" style="line-height: 1.8; color: #374151;">
                        {!! nl2br(e($announcement->content)) !!}
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi
                </h5>
            </div>
            <div class="card-body">
                <div class="info-item mb-3">
                    <small class="text-muted d-block">Dibuat</small>
                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($announcement->created_at, true) }}</strong>
                </div>
                <div class="info-item mb-3">
                    <small class="text-muted d-block">Diperbarui</small>
                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($announcement->updated_at, true) }}</strong>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
