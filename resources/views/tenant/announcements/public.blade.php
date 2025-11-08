@extends('layouts.tenant')

@section('title', 'Pengumuman Publik')
@section('page-title', 'Pengumuman Publik')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-globe me-3"></i>
                Pengumuman Publik
            </h2>
            <p>Pengumuman yang telah dipublikasikan</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.announcements.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    @forelse($announcements as $announcement)
        <div class="col-md-12 mb-3">
            <div class="card-modern fade-in-up fade-in-up-delay-5">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-bullhorn me-2 text-primary"></i>
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
                    </div>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <small class="text-muted">
                            <i class="fas fa-user me-1"></i>{{ $announcement->author->name ?? '-' }} | 
                            <i class="fas fa-calendar me-1"></i>{{ $announcement->publish_at ? \Carbon\Carbon::parse($announcement->publish_at)->format('d-m-Y H:i') : '-' }}
                        </small>
                    </div>
                    <div style="line-height: 1.8; font-size: 1.05rem;">
                        {!! nl2br(e($announcement->content)) !!}
                    </div>
                    @if($announcement->target_audience && count($announcement->target_audience) > 0)
                    <div class="mt-3 pt-3 border-top">
                        <small>
                            <strong>
                                <i class="fas fa-users me-1"></i>Target:
                            </strong>
                            @foreach($announcement->target_audience as $target)
                                <span class="badge-modern bg-secondary me-1">{{ $target }}</span>
                            @endforeach
                        </small>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    @empty
        <div class="col-md-12">
            <div class="card-modern fade-in-up fade-in-up-delay-5">
                <div class="card-body text-center py-5">
                    <i class="fas fa-bullhorn fa-3x text-muted mb-3" style="opacity: 0.3;"></i>
                    <p class="text-muted">Tidak ada pengumuman yang dipublikasikan</p>
                </div>
            </div>
        </div>
    @endforelse
</div>

<div class="mt-3">
    {{ $announcements->links() }}
</div>
@endsection
