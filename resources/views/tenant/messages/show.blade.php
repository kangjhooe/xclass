@extends('layouts.tenant')

@section('title', 'Detail Pesan')
@section('page-title', 'Detail Pesan')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-envelope-open me-3"></i>
                Detail Pesan
            </h2>
            <p>Detail pesan</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.messages.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
    <div class="card-header d-flex justify-content-between align-items-center">
        <div>
            <h5 class="mb-1">{{ $message->subject ?? '(Tanpa Subjek)' }}</h5>
            <small class="text-muted">
                <i class="fas fa-user me-1"></i>Dari: {{ $message->sender->name ?? '-' }} | 
                <i class="fas fa-user-check me-1"></i>Kepada: {{ $message->receiver->name ?? '-' }} | 
                <i class="fas fa-calendar me-1"></i>{{ $message->created_at->format('d-m-Y H:i') }}
            </small>
        </div>
        <div>
            @if($message->priority == 'urgent')
                <span class="badge-modern bg-danger">Urgent</span>
            @elseif($message->priority == 'high')
                <span class="badge-modern bg-warning">Tinggi</span>
            @elseif($message->priority == 'medium')
                <span class="badge-modern bg-info">Sedang</span>
            @else
                <span class="badge-modern bg-secondary">Rendah</span>
            @endif
        </div>
    </div>
    <div class="card-body">
        <div class="mb-4" style="line-height: 1.8; font-size: 1.05rem;">
            {!! nl2br(e($message->content)) !!}
        </div>

        @if($message->parent)
            <div class="alert alert-info" style="border-radius: 12px; border: none;">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Pesan Balasan untuk:</strong><br>
                <small>{{ $message->parent->subject ?? '(Tanpa Subjek)' }}</small>
            </div>
        @endif

        <div class="d-flex gap-2 flex-wrap">
            @if($message->receiver_id == Auth::id())
                <form action="{{ tenant_route('tenant.messages.reply', ['message' => $message->id]) }}" method="POST" class="d-inline flex-fill">
                    @csrf
                    <div class="input-group">
                        <textarea name="content" class="form-control" rows="3" placeholder="Tulis balasan..." required></textarea>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-reply me-2"></i>Balas
                        </button>
                    </div>
                </form>
            @endif
            
            @if(!$message->is_archived)
                <form action="{{ tenant_route('tenant.messages.archive', ['message' => $message->id]) }}" method="POST" class="d-inline">
                    @csrf
                    <button type="submit" class="btn btn-modern btn-secondary">
                        <i class="fas fa-archive me-2"></i>Arsipkan
                    </button>
                </form>
            @endif
        </div>
    </div>
</div>

@if($message->replies->count() > 0)
    <div class="card-modern fade-in-up fade-in-up-delay-5">
        <div class="card-header">
            <h5 class="mb-0">
                <i class="fas fa-comments me-2 text-primary"></i>
                Balasan ({{ $message->replies->count() }})
            </h5>
        </div>
        <div class="card-body">
            @foreach($message->replies as $reply)
                <div class="border-bottom pb-3 mb-3" style="border-color: #e5e7eb !important;">
                    <div class="d-flex justify-content-between mb-2">
                        <strong>
                            <i class="fas fa-user me-1 text-primary"></i>
                            {{ $reply->sender->name ?? '-' }}
                        </strong>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            {{ $reply->created_at->format('d-m-Y H:i') }}
                        </small>
                    </div>
                    <div style="line-height: 1.8;">{!! nl2br(e($reply->content)) !!}</div>
                </div>
            @endforeach
        </div>
    </div>
@endif
@endsection
