@extends('layouts.tenant')

@section('title', 'Dashboard Guru')
@section('page-title', 'Dashboard Guru')

@section('content')
<div class="row">
    <!-- Progress Card -->
    <div class="col-md-12 mb-4">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-chart-line me-2"></i>
                    Progress Kelengkapan Data
                </h5>
            </div>
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="progress" style="height: 30px;">
                            <div class="progress-bar 
                                @if($progress['percentage'] < 30) bg-danger
                                @elseif($progress['percentage'] < 60) bg-warning
                                @elseif($progress['percentage'] < 90) bg-info
                                @else bg-success
                                @endif
                            " role="progressbar" style="width: {{ $progress['percentage'] }}%" 
                            aria-valuenow="{{ $progress['percentage'] }}" aria-valuemin="0" aria-valuemax="100">
                                <strong>{{ number_format($progress['percentage'], 1) }}%</strong>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">
                            {{ $progress['filled'] }} dari {{ $progress['total'] }} field telah terisi
                        </small>
                    </div>
                    <div class="col-md-4 text-end">
                        @if($progress['percentage'] < 100)
                            <a href="{{ tenant_route('teachers.edit', $teacher) }}" class="btn btn-primary">
                                <i class="fas fa-edit me-2"></i>
                                Lengkapi Data Saya
                            </a>
                        @else
                            <span class="badge bg-success p-2">
                                <i class="fas fa-check-circle me-2"></i>Data Lengkap!
                            </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Profile Card -->
    <div class="col-md-4 mb-4">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-user me-2"></i>
                    Profil Saya
                </h5>
            </div>
            <div class="card-body text-center">
                <div class="avatar-lg bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 100px; height: 100px; font-size: 40px;">
                    {{ substr($teacher->name, 0, 1) }}
                </div>
                <h4>{{ $teacher->name }}</h4>
                <p class="text-muted">{{ $teacher->subject_specialization ?? 'Guru' }}</p>
                
                <div class="mt-3">
                    <a href="{{ tenant_route('teachers.edit', $teacher) }}" class="btn btn-sm btn-warning w-100 mb-2">
                        <i class="fas fa-edit me-1"></i>
                        Edit Data Saya
                    </a>
                    <a href="{{ tenant_route('teachers.show', $teacher) }}" class="btn btn-sm btn-info w-100">
                        <i class="fas fa-eye me-1"></i>
                        Lihat Detail
                    </a>
                </div>

                <hr class="my-3">

                <div class="text-start">
                    <div class="mb-2">
                        <small class="text-muted">Email:</small><br>
                        <strong>{{ $teacher->email ?? '-' }}</strong>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">NIK:</small><br>
                        <strong>{{ $teacher->nik ?? '-' }}</strong>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">NUPTK:</small><br>
                        <strong>{{ $teacher->nuptk ?? '-' }}</strong>
                    </div>
                    <div>
                        <small class="text-muted">NIP:</small><br>
                        <strong>{{ $teacher->nip ?? '-' }}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Jadwal Hari Ini -->
    <div class="col-md-8 mb-4">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-calendar-day me-2"></i>
                    Jadwal Mengajar Hari Ini
                </h5>
            </div>
            <div class="card-body">
                @if($todaySchedules && count($todaySchedules) > 0)
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Jam</th>
                                    <th>Kelas</th>
                                    <th>Mata Pelajaran</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($todaySchedules as $schedule)
                                <tr>
                                    <td>
                                        <strong>{{ $schedule->start_time ?? '-' }}</strong>
                                        @if($schedule->end_time)
                                            - {{ $schedule->end_time }}
                                        @endif
                                    </td>
                                    <td>{{ $schedule->classRoom->name ?? '-' }}</td>
                                    <td>{{ $schedule->subject->name ?? '-' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Tidak ada jadwal mengajar hari ini</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- History Log -->
@if($activityLogs && count($activityLogs) > 0)
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-history me-2"></i>
                    Riwayat Perubahan Data
                </h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                                <th>Oleh</th>
                                <th>Perubahan</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($activityLogs as $log)
                            <tr>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($log->created_at, true) }}</td>
                                <td>
                                    <span class="badge bg-{{ $log->action == 'create' ? 'success' : ($log->action == 'update' ? 'info' : 'danger') }}">
                                        {{ ucfirst($log->action) }}
                                    </span>
                                </td>
                                <td>{{ $log->user->name ?? '-' }}</td>
                                <td>
                                    @if($log->changes && count($log->changes) > 0)
                                        <small>
                                            @foreach(array_slice($log->changes, 0, 3) as $field => $change)
                                                <strong>{{ $field }}</strong>: 
                                                {{ is_array($change['old']) ? 'Diubah' : ($change['old'] ?? '-') }} 
                                                → 
                                                {{ is_array($change['new']) ? 'Diubah' : ($change['new'] ?? '-') }}<br>
                                            @endforeach
                                            @if(count($log->changes) > 3)
                                                <em>dan {{ count($log->changes) - 3 }} field lainnya...</em>
                                            @endif
                                        </small>
                                    @else
                                        <small class="text-muted">-</small>
                                    @endif
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endif
@endsection

