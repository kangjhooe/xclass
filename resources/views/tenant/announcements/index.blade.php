@extends('layouts.tenant')

@section('title', 'Pengumuman')
@section('page-title', 'Pengumuman')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .filter-card {
        background: #f8f9fa;
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-bullhorn me-3"></i>
                Pengumuman
            </h2>
            <p>Kelola pengumuman sekolah</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons justify-content-md-end">
                <a href="{{ tenant_route('tenant.announcements.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-plus me-2"></i> Tambah
                </a>
                <a href="{{ tenant_route('tenant.announcements.public') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-globe me-2"></i> Publik
                </a>
            </div>
        </div>
    </div>
</div>

<div class="filter-card mb-4 fade-in-up fade-in-up-delay-5">
        <form method="GET" action="{{ tenant_route('tenant.announcements.index') }}" class="row g-3">
            <div class="col-md-3">
                <select name="status" class="form-select">
                    <option value="">Semua Status</option>
                    <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="published" {{ request('status') == 'published' ? 'selected' : '' }}>Published</option>
                    <option value="archived" {{ request('status') == 'archived' ? 'selected' : '' }}>Arsip</option>
                </select>
            </div>
            <div class="col-md-3">
                <select name="priority" class="form-select">
                    <option value="">Semua Prioritas</option>
                    <option value="low" {{ request('priority') == 'low' ? 'selected' : '' }}>Rendah</option>
                    <option value="medium" {{ request('priority') == 'medium' ? 'selected' : '' }}>Sedang</option>
                    <option value="high" {{ request('priority') == 'high' ? 'selected' : '' }}>Tinggi</option>
                    <option value="urgent" {{ request('priority') == 'urgent' ? 'selected' : '' }}>Urgent</option>
                </select>
            </div>
            <div class="col-md-4">
                <input type="text" name="search" class="form-control" placeholder="Cari pengumuman..." value="{{ request('search') }}">
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100"><i class="fas fa-search me-1"></i>Cari</button>
            </div>
        </form>
    </div>

    <div class="card-modern fade-in-up fade-in-up-delay-5">
        <div class="card-header">
            <h5>
                <i class="fas fa-list me-2 text-primary"></i>
                Daftar Pengumuman
            </h5>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-modern">
                    <thead>
                        <tr>
                            <th>Judul</th>
                            <th>Penulis</th>
                            <th>Prioritas</th>
                            <th>Status</th>
                            <th>Target</th>
                            <th>Tanggal Publikasi</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($announcements as $announcement)
                        <tr>
                            <td>{{ $announcement->title }}</td>
                            <td>{{ $announcement->author->name ?? '-' }}</td>
                            <td>
                                @if($announcement->priority == 'urgent')
                                    <span class="badge bg-danger">Urgent</span>
                                @elseif($announcement->priority == 'high')
                                    <span class="badge bg-warning">Tinggi</span>
                                @elseif($announcement->priority == 'medium')
                                    <span class="badge bg-info">Sedang</span>
                                @else
                                    <span class="badge bg-secondary">Rendah</span>
                                @endif
                            </td>
                            <td>
                                @if($announcement->status == 'published')
                                    <span class="badge bg-success">Published</span>
                                @elseif($announcement->status == 'draft')
                                    <span class="badge bg-warning">Draft</span>
                                @else
                                    <span class="badge bg-secondary">Arsip</span>
                                @endif
                            </td>
                            <td>
                                @foreach($announcement->target_audience ?? [] as $target)
                                    <span class="badge bg-secondary">{{ $target }}</span>
                                @endforeach
                            </td>
                            <td>{{ $announcement->publish_at ? \Carbon\Carbon::parse($announcement->publish_at)->format('d-m-Y H:i') : '-' }}</td>
                            <td>
                                <a href="{{ tenant_route('tenant.announcements.show', ['announcement' => $announcement->id]) }}" class="btn btn-sm btn-info">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ tenant_route('tenant.announcements.edit', ['announcement' => $announcement->id]) }}" class="btn btn-sm btn-warning">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form action="{{ tenant_route('tenant.announcements.destroy', ['announcement' => $announcement->id]) }}" method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-danger">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="text-center py-4">Tidak ada pengumuman</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3">
                {{ $announcements->links() }}
            </div>
        </div>
    </div>
</div>
@endsection

