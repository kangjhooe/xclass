@extends('layouts.tenant')

@section('title', 'Detail Event')
@section('page-title', 'Detail Event')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-calendar-alt me-3"></i>
                Detail Event: {{ $event->title }}
            </h2>
            <p>Informasi lengkap tentang event</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.events.edit', $event->id) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.events.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Event
                </h5>
            </div>
            <div class="card-body">
                <div class="mb-4">
                    <h4 class="text-primary mb-2">{{ $event->title }}</h4>
                    @if($event->description)
                        <p class="text-muted mb-0" style="line-height: 1.8;">{{ $event->description }}</p>
                    @endif
                </div>

                <div class="info-card">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-tag text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Jenis Event</small>
                                    @if($event->type == 'academic')
                                        <span class="badge-modern bg-primary">Akademik</span>
                                    @elseif($event->type == 'sports')
                                        <span class="badge-modern bg-success">Olahraga</span>
                                    @elseif($event->type == 'cultural')
                                        <span class="badge-modern bg-warning">Budaya</span>
                                    @else
                                        <span class="badge-modern bg-info">Lainnya</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-map-marker-alt text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Lokasi</small>
                                    <strong>{{ $event->location ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-check text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Tanggal Mulai</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesianWithMonth($event->start_date, !$event->is_all_day) }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-times text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Tanggal Selesai</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesianWithMonth($event->end_date, !$event->is_all_day) }}</strong>
                                </div>
                            </div>
                        </div>
                        @if($event->classRoom)
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-door-open text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Kelas</small>
                                    <strong>{{ $event->classRoom->name }}</strong>
                                </div>
                            </div>
                        </div>
                        @endif
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Status</small>
                                    @if($event->status == 'scheduled')
                                        <span class="badge-modern bg-primary">Terjadwal</span>
                                    @elseif($event->status == 'ongoing')
                                        <span class="badge-modern bg-success">Berlangsung</span>
                                    @elseif($event->status == 'completed')
                                        <span class="badge-modern bg-info">Selesai</span>
                                    @elseif($event->status == 'cancelled')
                                        <span class="badge-modern bg-danger">Dibatalkan</span>
                                    @else
                                        <span class="badge-modern bg-secondary">{{ ucfirst($event->status) }}</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-clock text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Sepanjang Hari</small>
                                    @if($event->is_all_day)
                                        <span class="badge-modern bg-success">Ya</span>
                                    @else
                                        <span class="badge-modern bg-secondary">Tidak</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        @if($event->is_recurring)
                        <div class="col-md-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-redo text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Event Berulang</small>
                                    <span class="badge-modern bg-warning">Ya</span>
                                    @if($event->recurring_type)
                                        - {{ ucfirst($event->recurring_type) }}
                                    @endif
                                    @if($event->recurring_end_date)
                                        <br><small class="text-muted">Berakhir: {{ \Carbon\Carbon::parse($event->recurring_end_date)->format('d F Y') }}</small>
                                    @endif
                                </div>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>

                @if($event->students->count() > 0)
                <div class="mt-4 pt-4 border-top">
                    <h5 class="mb-3">
                        <i class="fas fa-users me-2 text-primary"></i>
                        Peserta Event ({{ $event->students->count() }} siswa)
                    </h5>
                    <div class="row">
                        @foreach($event->students as $student)
                            <div class="col-md-6 mb-2">
                                <div class="d-flex align-items-center p-2" style="background: #f9fafb; border-radius: 8px;">
                                    <i class="fas fa-user me-2 text-primary"></i>
                                    <div>
                                        <div class="fw-bold">{{ $student->name }}</div>
                                        <small class="text-muted">{{ $student->student_number }}</small>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
                @endif
            </div>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-cog me-2 text-primary"></i>
                    Aksi
                </h5>
            </div>
            <div class="card-body">
                <div class="d-grid gap-2">
                    <a href="{{ tenant_route('tenant.events.edit', $event->id) }}" class="btn btn-modern btn-warning">
                        <i class="fas fa-edit me-2"></i>
                        Edit Event
                    </a>
                    <a href="{{ tenant_route('tenant.events.calendar') }}" class="btn btn-modern btn-info">
                        <i class="fas fa-calendar me-2"></i>
                        Lihat Kalender
                    </a>
                    <form action="{{ tenant_route('tenant.events.destroy', $event->id) }}" method="POST" 
                          onsubmit="return confirm('Apakah Anda yakin ingin menghapus event ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-modern btn-danger w-100">
                            <i class="fas fa-trash me-2"></i>
                            Hapus Event
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi
                </h5>
            </div>
            <div class="card-body">
                <div class="info-item mb-3">
                    <small class="text-muted d-block">Dibuat</small>
                    <strong>{{ \Carbon\Carbon::parse($event->created_at)->format('d-m-Y H:i') }}</strong>
                </div>
                <div class="info-item mb-0">
                    <small class="text-muted d-block">Diperbarui</small>
                    <strong>{{ \Carbon\Carbon::parse($event->updated_at)->format('d-m-Y H:i') }}</strong>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
