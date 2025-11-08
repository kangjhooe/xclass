@extends('layouts.tenant')

@section('title', 'Pesan Terkirim')
@section('page-title', 'Pesan Terkirim')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-paper-plane me-3"></i>
                Pesan Terkirim
            </h2>
            <p>Pesan yang telah dikirim</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.messages.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Pesan Baru
            </a>
        </div>
    </div>
</div>

<div class="d-flex gap-2 mb-3 flex-wrap">
    <a href="{{ tenant_route('tenant.messages.inbox') }}" class="btn btn-modern btn-primary">
        <i class="fas fa-inbox me-2"></i>Kotak Masuk
    </a>
    <a href="{{ tenant_route('tenant.messages.index') }}" class="btn btn-modern btn-secondary">
        <i class="fas fa-list me-2"></i>Semua Pesan
    </a>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Pesan Terkirim
        </h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-modern">
                <thead>
                    <tr>
                        <th>Kepada</th>
                        <th>Subjek</th>
                        <th>Prioritas</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($messages as $message)
                    <tr>
                        <td>{{ $message->receiver->name ?? '-' }}</td>
                        <td>{{ $message->subject ?? '(Tanpa Subjek)' }}</td>
                        <td>
                            @if($message->priority == 'urgent')
                                <span class="badge-modern bg-danger">Urgent</span>
                            @elseif($message->priority == 'high')
                                <span class="badge-modern bg-warning">Tinggi</span>
                            @elseif($message->priority == 'medium')
                                <span class="badge-modern bg-info">Sedang</span>
                            @else
                                <span class="badge-modern bg-secondary">Rendah</span>
                            @endif
                        </td>
                        <td>
                            @if($message->is_read)
                                <span class="badge-modern bg-success">Dibaca</span>
                            @else
                                <span class="badge-modern bg-secondary">Belum Dibaca</span>
                            @endif
                        </td>
                        <td>{{ $message->created_at->format('d-m-Y H:i') }}</td>
                        <td>
                            <a href="{{ tenant_route('tenant.messages.show', ['message' => $message->id]) }}" class="btn btn-modern btn-primary btn-sm" title="Lihat Detail">
                                <i class="fas fa-eye"></i>
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="text-center py-4">
                            <div class="text-muted">
                                <i class="fas fa-paper-plane fa-3x mb-3" style="opacity: 0.3;"></i>
                                <p>Tidak ada pesan terkirim</p>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <div class="mt-3">
            {{ $messages->links() }}
        </div>
    </div>
</div>
@endsection
