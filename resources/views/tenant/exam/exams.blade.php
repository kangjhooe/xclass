@extends('layouts.tenant')

@section('title', 'Daftar Ujian')
@section('page-title', 'Daftar Ujian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-list me-2"></i>
                        Daftar Ujian
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Filter Form -->
                    <form method="GET" action="{{ tenant_route('exam.index') }}" class="row mb-4">
                        <div class="col-md-3">
                            <label for="status" class="form-label">Status</label>
                            <select name="status" id="status" class="form-select">
                                <option value="">Semua Status</option>
                                <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                                <option value="scheduled" {{ request('status') == 'scheduled' ? 'selected' : '' }}>Terjadwal</option>
                                <option value="ongoing" {{ request('status') == 'ongoing' ? 'selected' : '' }}>Berlangsung</option>
                                <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Selesai</option>
                                <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="subject_id" class="form-label">Mata Pelajaran</label>
                            <select name="subject_id" id="subject_id" class="form-select">
                                <option value="">Semua Mata Pelajaran</option>
                                @foreach($subjects as $subject)
                                    <option value="{{ $subject->id }}" {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                        {{ $subject->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="class_id" class="form-label">Kelas</label>
                            <select name="class_id" id="class_id" class="form-select">
                                <option value="">Semua Kelas</option>
                                @foreach($classes as $class)
                                    <option value="{{ $class->id }}" {{ request('class_id') == $class->id ? 'selected' : '' }}>
                                        {{ $class->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="search" class="form-label">Pencarian</label>
                            <div class="input-group">
                                <input type="text" name="search" id="search" class="form-control" 
                                       placeholder="Cari ujian..." value="{{ request('search') }}">
                                <button type="submit" class="btn btn-outline-secondary">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </form>

                    <!-- Action Buttons -->
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <a href="{{ tenant_route('exam.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-1"></i>
                                Tambah Ujian
                            </a>
                            <a href="{{ tenant_route('questions.index') }}" class="btn btn-success">
                                <i class="fas fa-question-circle me-1"></i>
                                Bank Soal
                            </a>
                        </div>
                        <div class="col-md-6 text-end">
                            <a href="{{ tenant_route('exam.index') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-arrow-left me-1"></i>
                                Kembali
                            </a>
                        </div>
                    </div>

                    <!-- Exams Table -->
                    @if($exams->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead class="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Ujian</th>
                                        <th>Mata Pelajaran</th>
                                        <th>Kelas</th>
                                        <th>Guru</th>
                                        <th>Tanggal Mulai</th>
                                        <th>Durasi</th>
                                        <th>Status</th>
                                        <th>Peserta</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($exams as $index => $exam)
                                        <tr>
                                            <td>{{ $exams->firstItem() + $index }}</td>
                                            <td>
                                                <strong>{{ $exam->title }}</strong>
                                                @if($exam->description)
                                                    <br><small class="text-muted">{{ Str::limit($exam->description, 50) }}</small>
                                                @endif
                                                <br><small class="text-info">{{ $exam->type_label }}</small>
                                            </td>
                                            <td>{{ $exam->subject->name }}</td>
                                            <td>{{ $exam->classRoom->name }}</td>
                                            <td>{{ $exam->teacher->name }}</td>
                                            <td>
                                                <div>{{ \App\Helpers\DateHelper::formatIndonesian($exam->start_time) }}</div>
                                                <small class="text-muted">{{ $exam->start_time->format('H:i') }}</small>
                                            </td>
                                            <td>{{ $exam->formatted_duration }}</td>
                                            <td>
                                                <span class="badge bg-{{ $exam->status_color }}">
                                                    {{ $exam->status_label }}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <span class="me-2">{{ $exam->getAttemptsCount() }}/{{ $exam->getEligibleStudentsCount() }}</span>
                                                    <div class="progress" style="width: 60px; height: 8px;">
                                                        @php
                                                            $totalStudents = $exam->getEligibleStudentsCount();
                                                            $participants = $exam->getAttemptsCount();
                                                            $percentage = $totalStudents > 0 ? ($participants / $totalStudents) * 100 : 0;
                                                        @endphp
                                                        <div class="progress-bar" role="progressbar" 
                                                             style="width: {{ $percentage }}%"></div>
                                                    </div>
                                                </div>
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
                                                    @if($exam->getAttemptsCount() > 0)
                                                        <a href="{{ tenant_route('exam.exams.show', $exam) }}#statistics" 
                                                           class="btn btn-sm btn-outline-info" 
                                                           title="Statistik">
                                                            <i class="fas fa-chart-bar"></i>
                                                        </a>
                                                    @endif
                                                    <form action="{{ tenant_route('exam.destroy', $exam) }}" 
                                                          method="POST" class="d-inline"
                                                          onsubmit="return confirm('Yakin ingin menghapus ujian?')">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type="submit" 
                                                                class="btn btn-sm btn-outline-danger" 
                                                                title="Hapus">
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
                        
                        <!-- Pagination -->
                        <div class="d-flex justify-content-center mt-3">
                            {{ $exams->appends(request()->query())->links() }}
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-clipboard-list fa-4x text-muted mb-4"></i>
                            <h4 class="text-muted">Tidak ada ujian ditemukan</h4>
                            <p class="text-muted">
                                @if(request()->hasAny(['status', 'subject_id', 'class_id', 'search']))
                                    Coba ubah filter pencarian atau
                                @endif
                                Mulai dengan membuat ujian pertama Anda
                            </p>
                            <a href="{{ tenant_route('exam.create') }}" class="btn btn-primary">
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
@endsection
