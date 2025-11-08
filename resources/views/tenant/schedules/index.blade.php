@extends('layouts.tenant')

@section('title', 'Jadwal Pelajaran')
@section('page-title', 'Jadwal Pelajaran')

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
                <i class="fas fa-calendar-alt me-3"></i>
                Jadwal Pelajaran
            </h2>
            <p>Kelola jadwal pelajaran sekolah Anda</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons justify-content-md-end">
                <a href="{{ tenant_route('tenant.schedules.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-plus me-2"></i> Tambah Jadwal
                </a>
                <a href="{{ tenant_route('tenant.schedules.weekly') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-calendar-week me-2"></i> Mingguan
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Jadwal Pelajaran
                </h5>
            </div>
            <div class="card-body">
                <!-- Filter Form -->
                <div class="filter-card mb-4">
                    <div class="col-md-12">
                        <form method="GET" class="row g-3">
                            <div class="col-md-3">
                                <select name="class_id" class="form-control">
                                    <option value="">Semua Kelas</option>
                                    @foreach($classes as $class)
                                        <option value="{{ $class->id }}" {{ request('class_id') == $class->id ? 'selected' : '' }}>
                                            {{ $class->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select name="teacher_id" class="form-control">
                                    <option value="">Semua Guru</option>
                                    @foreach($teachers as $teacher)
                                        <option value="{{ $teacher->id }}" {{ request('teacher_id') == $teacher->id ? 'selected' : '' }}>
                                            {{ $teacher->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select name="subject_id" class="form-control">
                                    <option value="">Semua Mata Pelajaran</option>
                                    @foreach($subjects as $subject)
                                        <option value="{{ $subject->id }}" {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                            {{ $subject->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select name="day" class="form-control">
                                    <option value="">Semua Hari</option>
                                    <option value="monday" {{ request('day') == 'monday' ? 'selected' : '' }}>Senin</option>
                                    <option value="tuesday" {{ request('day') == 'tuesday' ? 'selected' : '' }}>Selasa</option>
                                    <option value="wednesday" {{ request('day') == 'wednesday' ? 'selected' : '' }}>Rabu</option>
                                    <option value="thursday" {{ request('day') == 'thursday' ? 'selected' : '' }}>Kamis</option>
                                    <option value="friday" {{ request('day') == 'friday' ? 'selected' : '' }}>Jumat</option>
                                    <option value="saturday" {{ request('day') == 'saturday' ? 'selected' : '' }}>Sabtu</option>
                                    <option value="sunday" {{ request('day') == 'sunday' ? 'selected' : '' }}>Minggu</option>
                                </select>
                            </div>
                            <div class="col-md-12">
                                <button type="submit" class="btn btn-outline-primary">
                                    <i class="fas fa-filter me-2"></i>
                                    Filter
                                </button>
                                <a href="{{ tenant_route('tenant.schedules.index') }}" class="btn btn-outline-secondary">
                                    <i class="fas fa-times me-2"></i>
                                    Reset
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
                
                @if($schedules->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Hari</th>
                                    <th>Waktu</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Guru</th>
                                    <th>Kelas</th>
                                    <th>Ruangan</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($schedules as $schedule)
                                    <tr>
                                        <td>
                                            <span class="badge bg-primary">
                                                {{ ucfirst($schedule->day) }}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{{ \Carbon\Carbon::parse($schedule->start_time)->format('H:i') }}</strong>
                                            <br>
                                            <small class="text-muted">{{ \Carbon\Carbon::parse($schedule->end_time)->format('H:i') }}</small>
                                        </td>
                                        <td>
                                            <strong>{{ $schedule->subject->name }}</strong>
                                            <br>
                                            <small class="text-muted">{{ $schedule->subject->code }}</small>
                                        </td>
                                        <td>{{ $schedule->teacher->name }}</td>
                                        <td>
                                            <span class="badge bg-info">{{ $schedule->classRoom->name }}</span>
                                        </td>
                                        <td>{{ $schedule->room ?? '-' }}</td>
                                        <td>
                                            <span class="badge bg-{{ $schedule->is_active ? 'success' : 'secondary' }}">
                                                {{ $schedule->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="{{ tenant_route('tenant.schedules.show', $schedule) }}" 
                                                   class="btn btn-sm btn-outline-info" title="Lihat">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.schedules.edit', $schedule) }}" 
                                                   class="btn btn-sm btn-outline-warning" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('tenant.schedules.destroy', $schedule) }}" 
                                                      method="POST" class="d-inline"
                                                      onsubmit="return confirm('Apakah Anda yakin ingin menghapus jadwal ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="d-flex justify-content-center">
                        {{ $schedules->links() }}
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada jadwal pelajaran</h5>
                        <p class="text-muted">Mulai dengan menambahkan jadwal pelajaran pertama</p>
                        <a href="{{ tenant_route('tenant.schedules.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>
                            Tambah Jadwal
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

