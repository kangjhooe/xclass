@extends('layouts.tenant')

@section('title', 'Ujian Online')
@section('page-title', 'Ujian Online')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-clipboard-list me-2"></i>
                        Manajemen Ujian Online
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('exam.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Buat Ujian
                                </a>
                                <a href="{{ tenant_route('exam.index') }}" class="btn btn-info">
                                    <i class="fas fa-list me-1"></i>
                                    Daftar Ujian
                                </a>
                                <a href="{{ tenant_route('questions.index') }}" class="btn btn-success">
                                    <i class="fas fa-question-circle me-1"></i>
                                    Bank Soal
                                </a>
                                <a href="{{ tenant_route('student.exam.index') }}" class="btn btn-warning">
                                    <i class="fas fa-chart-line me-1"></i>
                                    Hasil Ujian
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari ujian..." id="searchInput">
                                <button class="btn btn-outline-secondary" type="button" id="searchBtn">
                                    <i class="fas fa-search"></i>
                                </button>
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
                                            <h4 class="mb-0">{{ $statistics['active_exams'] }}</h4>
                                            <small>Ujian Aktif</small>
                                        </div>
                                        <i class="fas fa-play fa-2x opacity-75"></i>
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
                                            <small>Selesai</small>
                                        </div>
                                        <i class="fas fa-check fa-2x opacity-75"></i>
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
                                            <small>Draft</small>
                                        </div>
                                        <i class="fas fa-clock fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['total_questions'] }}</h4>
                                            <small>Total Soal</small>
                                        </div>
                                        <i class="fas fa-question fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Exams Table -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-history me-2"></i>
                                Ujian Terbaru
                            </h6>
                        </div>
                        <div class="card-body">
                            @if($exams->count() > 0)
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Nama Ujian</th>
                                                <th>Mata Pelajaran</th>
                                                <th>Kelas</th>
                                                <th>Tanggal Mulai</th>
                                                <th>Durasi</th>
                                                <th>Status</th>
                                                <th>Peserta</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($exams as $exam)
                                                <tr>
                                                    <td>
                                                        <strong>{{ $exam->title }}</strong>
                                                        @if($exam->description)
                                                            <br><small class="text-muted">{{ Str::limit($exam->description, 50) }}</small>
                                                        @endif
                                                    </td>
                                                    <td>{{ $exam->subject->name }}</td>
                                                    <td>{{ $exam->classRoom->name }}</td>
                                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($exam->start_time, true) }}</td>
                                                    <td>{{ $exam->formatted_duration }}</td>
                                                    <td>
                                                        <span class="badge bg-{{ $exam->status_color }}">
                                                            {{ $exam->status_label }}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {{ $exam->getAttemptsCount() }}/{{ $exam->getEligibleStudentsCount() }}
                                                    </td>
                                                    <td>
                                                        <div class="btn-group" role="group">
                                                            <a href="{{ tenant_route('exam.show', $exam) }}" 
                                                               class="btn btn-sm btn-outline-primary" 
                                                               title="Lihat Detail">
                                                                <i class="fas fa-eye"></i>
                                                            </a>
                                                            <a href="{{ tenant_route('exam.edit', $exam) }}" 
                                                               class="btn btn-sm btn-outline-warning" 
                                                               title="Edit">
                                                                <i class="fas fa-edit"></i>
                                                            </a>
                                                            @if($exam->status === 'draft')
                                                                <form action="{{ tenant_route('exam.start', $exam) }}" 
                                                                      method="POST" class="d-inline">
                                                                    @csrf
                                                                    <button type="submit" 
                                                                            class="btn btn-sm btn-outline-success" 
                                                                            title="Mulai Ujian"
                                                                            onclick="return confirm('Yakin ingin memulai ujian?')">
                                                                        <i class="fas fa-play"></i>
                                                                    </button>
                                                                </form>
                                                            @endif
                                                            @if($exam->status === 'ongoing')
                                                                <form action="{{ tenant_route('exam.stop', $exam) }}" 
                                                                      method="POST" class="d-inline">
                                                                    @csrf
                                                                    <button type="submit" 
                                                                            class="btn btn-sm btn-outline-danger" 
                                                                            title="Hentikan Ujian"
                                                                            onclick="return confirm('Yakin ingin menghentikan ujian?')">
                                                                        <i class="fas fa-stop"></i>
                                                                    </button>
                                                                </form>
                                                            @endif
                                                        </div>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                                
                                <!-- Pagination -->
                                <div class="d-flex justify-content-center mt-3">
                                    {{ $exams->links() }}
                                </div>
                            @else
                                <div class="text-center py-4">
                                    <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                                    <h5 class="text-muted">Belum ada ujian</h5>
                                    <p class="text-muted">Mulai dengan membuat ujian pertama Anda</p>
                                    <a href="{{ tenant_route('exam.exams.create') }}" class="btn btn-primary">
                                        <i class="fas fa-plus me-1"></i>
                                        Buat Ujian
                                    </a>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchBtn.addEventListener('click', function() {
        const searchTerm = searchInput.value;
        if (searchTerm.trim()) {
            window.location.href = '{{ tenant_route("tenant.exam.exams.index") }}?search=' + encodeURIComponent(searchTerm);
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
});
</script>
@endpush
@endsection
