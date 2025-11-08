@extends('layouts.tenant')

@section('title', 'Detail Kelas')
@section('page-title', 'Detail Kelas')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-door-open me-3"></i>
                Detail Kelas: {{ $class->name }}
            </h2>
            <p>Informasi lengkap tentang kelas</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.classes.edit', $class) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.classes.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
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
                <i class="fas fa-users"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $class->students->count() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Siswa</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card success fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $class->teachers->count() ?? 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Guru</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card info fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0891b2; font-size: 2rem;">{{ $class->schedules->count() ?? 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Jadwal</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card warning fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-door-open"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #d97706; font-size: 2rem;">{{ $class->capacity ?? '-' }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Kapasitas</p>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <!-- Informasi Kelas -->
        <div class="info-card fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0" style="font-weight: 700; color: #495057;">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Kelas
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-door-open"></i>
                        Nama Kelas
                    </div>
                    <div class="info-item-value">
                        {{ $class->name }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-layer-group"></i>
                        Level
                    </div>
                    <div class="info-item-value">
                        <span class="badge-modern bg-secondary" style="color: white;">{{ $class->level ?? '-' }}</span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar"></i>
                        Tahun Ajaran
                    </div>
                    <div class="info-item-value">
                        {{ $class->academic_year ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-building"></i>
                        No. Ruangan
                    </div>
                    <div class="info-item-value">
                        {{ $class->room_number ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-user-tie"></i>
                        Wali Kelas
                    </div>
                    <div class="info-item-value">
                        @if($class->homeroomTeacher)
                            {{ $class->homeroomTeacher->name }}
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-check-circle"></i>
                        Status
                    </div>
                    <div class="info-item-value">
                        <span class="badge-modern {{ $class->is_active ? 'bg-success' : 'bg-danger' }}" style="color: white;">
                            {{ $class->is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </span>
                    </div>
                </div>
                @if($class->description)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-align-left"></i>
                        Deskripsi
                    </div>
                    <div class="info-item-value">
                        {{ $class->description }}
                    </div>
                </div>
                @endif
            </div>
        </div>

        <!-- Daftar Siswa -->
        @if($class->students && $class->students->count() > 0)
        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-4">
            <div class="card-header">
                <h5>
                    <i class="fas fa-users me-2 text-primary"></i>
                    Daftar Siswa ({{ $class->students->count() }})
                </h5>
            </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-modern mb-0">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>NIS</th>
                                    <th>Nama Lengkap</th>
                                    <th>Jenis Kelamin</th>
                                    <th class="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($class->students->take(10) as $student)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $student->nis ?? '-' }}</td>
                                    <td>{{ $student->name }}</td>
                                    <td>{{ $student->gender == 'male' ? 'Laki-laki' : 'Perempuan' }}</td>
                                    <td class="text-center">
                                        <a href="{{ tenant_route('tenant.students.show', $student) }}" class="btn btn-sm btn-info">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @if($class->students->count() > 10)
                    <div class="card-footer text-center">
                        <a href="{{ tenant_route('tenant.classes.students', $class) }}" class="btn btn-primary btn-sm">
                            Lihat Semua Siswa ({{ $class->students->count() }})
                        </a>
                    </div>
                    @endif
                </div>
            </div>
            @endif

        <!-- Jadwal Kelas -->
        @if($class->schedules && $class->schedules->count() > 0)
        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-4">
            <div class="card-header">
                <h5>
                    <i class="fas fa-calendar-alt me-2 text-primary"></i>
                    Jadwal Kelas
                </h5>
            </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-modern mb-0">
                            <thead>
                                <tr>
                                    <th>Hari</th>
                                    <th>Jam</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Guru</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($class->schedules->take(10) as $schedule)
                                <tr>
                                    <td>{{ $schedule->day ?? '-' }}</td>
                                    <td>{{ $schedule->start_time ?? '-' }} - {{ $schedule->end_time ?? '-' }}</td>
                                    <td>{{ $schedule->subject->name ?? '-' }}</td>
                                    <td>{{ $schedule->teacher->name ?? '-' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @if($class->schedules->count() > 10)
                    <div class="card-footer text-center">
                        <a href="{{ tenant_route('tenant.classes.schedules', $class) }}" class="btn btn-primary btn-sm">
                            Lihat Semua Jadwal ({{ $class->schedules->count() }})
                        </a>
                    </div>
                    @endif
                </div>
            </div>
            @endif
        </div>

    <!-- Sidebar -->
    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-bolt me-2 text-primary"></i>
                    Aksi
                </h5>
            </div>
            <div class="card-body">
                <div class="d-grid gap-2">
                    <a href="{{ tenant_route('tenant.classes.edit', $class) }}" class="btn btn-modern btn-warning">
                        <i class="fas fa-edit me-2"></i> Edit Kelas
                    </a>
                    <button type="button" 
                            class="btn btn-modern btn-info" 
                            data-bs-toggle="modal" 
                            data-bs-target="#addStudentsModal">
                        <i class="fas fa-user-plus me-2"></i> Tambah Siswa
                    </button>
                    <button type="button" 
                            class="btn btn-modern btn-success" 
                            data-bs-toggle="modal" 
                            data-bs-target="#setHomeroomTeacherModal">
                        <i class="fas fa-user-tie me-2"></i> Pilih Wali Kelas
                    </button>
                    <a href="{{ tenant_route('tenant.classes.students', $class) }}" class="btn btn-modern btn-info">
                        <i class="fas fa-users me-2"></i> Lihat Siswa
                    </a>
                    <a href="{{ tenant_route('tenant.classes.schedules', $class) }}" class="btn btn-modern btn-success">
                        <i class="fas fa-calendar-alt me-2"></i> Lihat Jadwal
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Tambah Siswa -->
<div class="modal fade" id="addStudentsModal" tabindex="-1" aria-labelledby="addStudentsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addStudentsModalLabel">
                    <i class="fas fa-user-plus me-2"></i>Tambah Siswa ke Kelas: {{ $class->name }}
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="{{ tenant_route('tenant.classes.add-students', ['class' => $class->id]) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="searchStudent" class="form-label">Cari Siswa</label>
                        <input type="text" 
                               class="form-control" 
                               id="searchStudent" 
                               placeholder="Cari berdasarkan nama, NIS, atau NISN..."
                               autocomplete="off">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Pilih Siswa</label>
                        <div id="studentsList" style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 0.375rem; padding: 0.5rem;">
                            <div class="text-center text-muted py-3">
                                <i class="fas fa-spinner fa-spin"></i> Memuat data siswa...
                            </div>
                        </div>
                        <small class="text-muted">Pilih satu atau lebih siswa untuk ditambahkan ke kelas ini</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal: Pilih Wali Kelas -->
<div class="modal fade" id="setHomeroomTeacherModal" tabindex="-1" aria-labelledby="setHomeroomTeacherModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="setHomeroomTeacherModalLabel">
                    <i class="fas fa-user-tie me-2"></i>Pilih Wali Kelas: {{ $class->name }}
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="{{ tenant_route('tenant.classes.set-homeroom-teacher', ['class' => $class->id]) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="homeroomTeacher" class="form-label">Wali Kelas</label>
                        <select class="form-select" id="homeroomTeacher" name="homeroom_teacher_id">
                            <option value="">-- Pilih Wali Kelas --</option>
                            @foreach($teachers as $teacher)
                                <option value="{{ $teacher->id }}" {{ $class->homeroom_teacher_id == $teacher->id ? 'selected' : '' }}>
                                    {{ $teacher->name }}
                                    @if($teacher->employee_number)
                                        ({{ $teacher->employee_number }})
                                    @endif
                                </option>
                            @endforeach
                        </select>
                        <small class="text-muted">Pilih guru yang akan menjadi wali kelas, atau kosongkan untuk menghapus wali kelas</small>
                    </div>
                    @if($class->homeroomTeacher)
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Wali kelas saat ini: <strong>{{ $class->homeroomTeacher->name }}</strong>
                    </div>
                    @endif
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
// Load students when modal opens
document.getElementById('addStudentsModal').addEventListener('show.bs.modal', function() {
    loadStudents();
});

// Search functionality
let searchTimeout;
document.getElementById('searchStudent').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
        loadStudents();
    }, 500);
});

function loadStudents() {
    const search = document.getElementById('searchStudent').value;
    const studentsList = document.getElementById('studentsList');
    
    studentsList.innerHTML = '<div class="text-center text-muted py-3"><i class="fas fa-spinner fa-spin"></i> Memuat data siswa...</div>';
    
    @php
        $currentTenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        $tenantNpsn = $currentTenant ? $currentTenant->npsn : request()->route('tenant');
    @endphp
    const url = '{{ route("tenant.classes.available-students", ["tenant" => $tenantNpsn, "class" => $class->id]) }}?search=' + encodeURIComponent(search);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            // Handle error response
            if (data.error) {
                studentsList.innerHTML = '<div class="text-center text-danger py-3"><i class="fas fa-exclamation-triangle me-2"></i>' + (data.message || data.error) + '</div>';
                return;
            }
            
            // Handle empty array
            if (!Array.isArray(data) || data.length === 0) {
                studentsList.innerHTML = '<div class="text-center text-muted py-3">Tidak ada siswa yang tersedia</div>';
                return;
            }
            
            let html = '';
            data.forEach(function(student) {
                const currentClass = student.class_name ? ' (Kelas: ' + student.class_name + ')' : ' (Belum ada kelas)';
                html += `
                    <div class="form-check mb-2 p-2" style="border-bottom: 1px solid #f0f0f0;">
                        <input class="form-check-input" type="checkbox" name="student_ids[]" value="${student.id}" id="student${student.id}">
                        <label class="form-check-label" for="student${student.id}">
                            <strong>${student.name || 'Nama tidak tersedia'}</strong>
                            ${student.nis ? '<br><small class="text-muted">NIS: ' + student.nis + '</small>' : ''}
                            ${student.nisn ? '<br><small class="text-muted">NISN: ' + student.nisn + '</small>' : ''}
                            <br><small class="text-muted">${currentClass}</small>
                        </label>
                    </div>
                `;
            });
            studentsList.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading students:', error);
            const errorMessage = error.message || error.error || 'Gagal memuat data siswa. Silakan coba lagi.';
            studentsList.innerHTML = '<div class="text-center text-danger py-3"><i class="fas fa-exclamation-triangle me-2"></i>' + errorMessage + '</div>';
        });
}
</script>
@endpush
@endsection

