@extends('layouts.tenant')

@section('title', 'Event')
@section('page-title', 'Event')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-calendar me-3"></i>
                Manajemen Event
            </h2>
            <p>Kelola event dan kegiatan sekolah</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons justify-content-md-end">
                <a href="{{ tenant_route('tenant.events.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-plus me-2"></i> Buat Event
                </a>
                <a href="{{ tenant_route('tenant.events.calendar') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-calendar-alt me-2"></i> Kalender
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Statistics Cards -->
<div class="row mb-4">
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card primary fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-calendar"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $stats['total_events'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Event</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card success fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-clock"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $stats['upcoming_events'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Mendatang</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card warning fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #d97706; font-size: 2rem;">{{ $stats['this_month_events'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Bulan Ini</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card info fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-check"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0891b2; font-size: 2rem;">{{ $stats['completed_events'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Selesai</p>
        </div>
    </div>
</div>

<!-- Events Table -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Event
        </h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Nama Event</th>
                                    <th>Jenis</th>
                                    <th>Tanggal</th>
                                    <th>Waktu</th>
                                    <th>Lokasi</th>
                                    <th>Status</th>
                                    <th>Peserta</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($recentEvents as $event)
                                <tr>
                                    <td>
                                        <div>
                                            <strong>{{ $event->title }}</strong>
                                            @if($event->description)
                                                <br><small class="text-muted">{{ Str::limit($event->description, 50) }}</small>
                                            @endif
                                        </div>
                                    </td>
                                    <td>
                                        @if($event->type == 'academic')
                                            <span class="badge bg-primary">Akademik</span>
                                        @elseif($event->type == 'sports')
                                            <span class="badge bg-success">Olahraga</span>
                                        @elseif($event->type == 'cultural')
                                            <span class="badge bg-warning">Budaya</span>
                                        @else
                                            <span class="badge bg-info">Lainnya</span>
                                        @endif
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($event->start_date) }}</td>
                                    <td>
                                        @if($event->is_all_day)
                                            <span class="text-muted">Sepanjang Hari</span>
                                        @else
                                            {{ \Carbon\Carbon::parse($event->start_date)->format('H:i') }} - 
                                            {{ \Carbon\Carbon::parse($event->end_date)->format('H:i') }}
                                        @endif
                                    </td>
                                    <td>{{ $event->location ?? '-' }}</td>
                                    <td>
                                        @if($event->status == 'scheduled')
                                            <span class="badge bg-primary">Terjadwal</span>
                                        @elseif($event->status == 'ongoing')
                                            <span class="badge bg-success">Berlangsung</span>
                                        @elseif($event->status == 'completed')
                                            <span class="badge bg-info">Selesai</span>
                                        @elseif($event->status == 'cancelled')
                                            <span class="badge bg-danger">Dibatalkan</span>
                                        @else
                                            <span class="badge bg-secondary">{{ ucfirst($event->status) }}</span>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge bg-info">{{ $event->students->count() }}</span>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <a href="{{ tenant_route('tenant.events.show', $event->id) }}" class="btn btn-modern btn-primary btn-sm" title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('tenant.events.edit', $event->id) }}" class="btn btn-modern btn-warning btn-sm" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('tenant.events.destroy', $event->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus event ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-modern btn-danger btn-sm" title="Hapus">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center text-muted">
                                        <i class="fas fa-calendar fa-3x mb-3"></i><br>
                                        Belum ada data event
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
