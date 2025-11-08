@extends('layouts.tenant')

@section('title', 'Manajemen Ujian - Admin')
@section('page-title', 'Manajemen Ujian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-clipboard-list me-2"></i>
                        Manajemen Ujian - Admin
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('admin.exam.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Buat Ujian Baru
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="text-end">
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Admin hanya membuat kerangka ujian. Guru yang menambahkan soal dan jadwal.
                                </small>
                            </div>
                        </div>
                    </div>

                    <!-- Statistics Cards -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['total_exams'] }}</h4>
                                            <p class="mb-0">Total Ujian</p>
                                        </div>
                                        <div class="align-self-center">
                                            <i class="fas fa-clipboard-list fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['active_exams'] }}</h4>
                                            <p class="mb-0">Ujian Aktif</p>
                                        </div>
                                        <div class="align-self-center">
                                            <i class="fas fa-play-circle fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['completed_exams'] }}</h4>
                                            <p class="mb-0">Ujian Selesai</p>
                                        </div>
                                        <div class="align-self-center">
                                            <i class="fas fa-check-circle fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['total_exams'] - $statistics['active_exams'] - $statistics['completed_exams'] }}</h4>
                                            <p class="mb-0">Draft</p>
                                        </div>
                                        <div class="align-self-center">
                                            <i class="fas fa-edit fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Exams Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nama Ujian</th>
                                    <th>Jenis</th>
                                    <th>Semester</th>
                                    <th>Tahun Ajaran</th>
                                    <th>Status</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Jadwal</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($exams as $exam)
                                <tr>
                                    <td>
                                        <div>
                                            <strong>{{ $exam->title }}</strong>
                                            @if($exam->description)
                                                <br><small class="text-muted">{{ Str::limit($exam->description, 50) }}</small>
                                            @endif
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-secondary">{{ $exam->type_label }}</span>
                                    </td>
                                    <td>{{ $exam->semester ?? '-' }}</td>
                                    <td>{{ $exam->academic_year ?? '-' }}</td>
                                    <td>
                                        <span class="badge bg-{{ $exam->status_color }}">
                                            {{ $exam->status_label }}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge bg-info">
                                            {{ $exam->examSubjects->count() }} Mapel
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge bg-warning">
                                            {{ $exam->schedules->count() }} Jadwal
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ tenant_route('admin.exam.show', $exam) }}" 
                                               class="btn btn-sm btn-outline-primary" title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('admin.exam.edit', $exam) }}" 
                                               class="btn btn-sm btn-outline-warning" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            @if($exam->status === 'draft')
                                                <form action="{{ tenant_route('admin.exam.start', $exam) }}" 
                                                      method="POST" class="d-inline">
                                                    @csrf
                                                    <button type="submit" class="btn btn-sm btn-outline-success" 
                                                            title="Mulai Ujian" 
                                                            onclick="return confirm('Yakin ingin memulai ujian?')">
                                                        <i class="fas fa-play"></i>
                                                    </button>
                                                </form>
                                            @endif
                                            @if($exam->status === 'ongoing')
                                                <form action="{{ tenant_route('admin.exam.stop', $exam) }}" 
                                                      method="POST" class="d-inline">
                                                    @csrf
                                                    <button type="submit" class="btn btn-sm btn-outline-danger" 
                                                            title="Hentikan Ujian" 
                                                            onclick="return confirm('Yakin ingin menghentikan ujian?')">
                                                        <i class="fas fa-stop"></i>
                                                    </button>
                                                </form>
                                            @endif
                                            <a href="{{ tenant_route('admin.exam.results', $exam) }}" 
                                               class="btn btn-sm btn-outline-info" title="Hasil Ujian">
                                                <i class="fas fa-chart-line"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center py-4">
                                        <div class="text-muted">
                                            <i class="fas fa-clipboard-list fa-3x mb-3"></i>
                                            <p>Belum ada ujian yang dibuat</p>
                                            <a href="{{ tenant_route('admin.exam.create') }}" class="btn btn-primary">
                                                <i class="fas fa-plus me-1"></i>
                                                Buat Ujian Pertama
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="d-flex justify-content-center">
                        {{ $exams->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Auto refresh every 30 seconds for active exams
    setInterval(function() {
        location.reload();
    }, 30000);
</script>
@endpush
