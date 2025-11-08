@extends('layouts.tenant')

@section('title', 'Input Massal Nilai')
@section('page-title', 'Input Massal Nilai')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-plus-circle me-2"></i>
                    Form Input Massal Nilai
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.student-grades.bulk-store') }}" method="POST" id="bulkForm">
                    @csrf
                    
                    <!-- Informasi Umum -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <label for="academic_year_id" class="form-label">Tahun Pelajaran <span class="text-danger">*</span></label>
                            <select name="academic_year_id" id="academic_year_id" class="form-select" required>
                                <option value="">Pilih Tahun Pelajaran</option>
                                @foreach($academicYears as $academicYear)
                                    <option value="{{ $academicYear->id }}" {{ old('academic_year_id') == $academicYear->id ? 'selected' : '' }}>
                                        {{ $academicYear->year_name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('academic_year_id')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-2">
                            <label for="semester" class="form-label">Semester <span class="text-danger">*</span></label>
                            <select name="semester" id="semester" class="form-select" required>
                                <option value="">Pilih</option>
                                <option value="1" {{ old('semester') == '1' ? 'selected' : '' }}>Semester 1</option>
                                <option value="2" {{ old('semester') == '2' ? 'selected' : '' }}>Semester 2</option>
                            </select>
                            @error('semester')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-3">
                            <label for="subject_id" class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                            <select name="subject_id" id="subject_id" class="form-select" required>
                                <option value="">Pilih Mata Pelajaran</option>
                                @foreach($subjects as $subject)
                                    <option value="{{ $subject->id }}" {{ old('subject_id') == $subject->id ? 'selected' : '' }}>
                                        {{ $subject->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('subject_id')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-4">
                            <label for="teacher_id" class="form-label">Guru <span class="text-danger">*</span></label>
                            <select name="teacher_id" id="teacher_id" class="form-select" required>
                                <option value="">Pilih Guru</option>
                                @foreach($teachers as $teacher)
                                    <option value="{{ $teacher->id }}" {{ old('teacher_id') == $teacher->id ? 'selected' : '' }}>
                                        {{ $teacher->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('teacher_id')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <!-- Informasi Penilaian -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <label for="assignment_type" class="form-label">Jenis Penilaian <span class="text-danger">*</span></label>
                            <select name="assignment_type" id="assignment_type" class="form-select" required>
                                <option value="">Pilih Jenis</option>
                                @foreach($assignmentTypes as $key => $label)
                                    <option value="{{ $key }}" {{ old('assignment_type') == $key ? 'selected' : '' }}>
                                        {{ $label }}
                                    </option>
                                @endforeach
                            </select>
                            @error('assignment_type')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-4">
                            <label for="assignment_name" class="form-label">Nama Tugas/Evaluasi <span class="text-danger">*</span></label>
                            <input type="text" name="assignment_name" id="assignment_name" class="form-control" 
                                   value="{{ old('assignment_name') }}" placeholder="Contoh: UTS Matematika" required>
                            @error('assignment_name')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-2">
                            <label for="max_score" class="form-label">Nilai Maksimal <span class="text-danger">*</span></label>
                            <input type="number" name="max_score" id="max_score" class="form-control" 
                                   value="{{ old('max_score', 100) }}" min="1" step="0.01" required>
                            @error('max_score')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-3">
                            <label for="class_id" class="form-label">Kelas</label>
                            <select name="class_id" id="class_id" class="form-select">
                                <option value="">Pilih Kelas</option>
                                <!-- Options akan diisi via AJAX -->
                            </select>
                        </div>
                    </div>
                    
                    <!-- Daftar Siswa -->
                    <div id="studentsSection" style="display: none;">
                        <h6 class="mb-3">
                            <i class="fas fa-users me-2"></i>
                            Daftar Siswa
                        </h6>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th width="5%">No</th>
                                        <th width="30%">Nama Siswa</th>
                                        <th width="20%">Kelas</th>
                                        <th width="20%">Nilai</th>
                                        <th width="25%">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody id="studentsTableBody">
                                    <!-- Data siswa akan diisi via AJAX -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <a href="{{ tenant_route('tenant.student-grades.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                        <button type="submit" class="btn btn-success" id="submitBtn" disabled>
                            <i class="fas fa-save me-2"></i>
                            Simpan Nilai
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const classSelect = document.getElementById('class_id');
    const studentsSection = document.getElementById('studentsSection');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const submitBtn = document.getElementById('submitBtn');
    
    // Load classes when page loads
    loadClasses();
    
    // Load students when class is selected
    classSelect.addEventListener('change', function() {
        if (this.value) {
            loadStudents(this.value);
        } else {
            studentsSection.style.display = 'none';
            submitBtn.disabled = true;
        }
    });
    
    function loadClasses() {
        fetch('{{ tenant_route("tenant.classes.index") }}')
            .then(response => response.json())
            .then(data => {
                classSelect.innerHTML = '<option value="">Pilih Kelas</option>';
                data.forEach(classItem => {
                    const option = document.createElement('option');
                    option.value = classItem.id;
                    option.textContent = classItem.name;
                    classSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading classes:', error));
    }
    
    function loadStudents(classId) {
        fetch(`{{ tenant_route('tenant.student-grades.students-by-class') }}?class_id=${classId}`)
            .then(response => response.json())
            .then(students => {
                studentsTableBody.innerHTML = '';
                students.forEach((student, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${student.name}</td>
                        <td>${student.class_room?.name || '-'}</td>
                        <td>
                            <input type="number" name="grades[${index}][student_id]" value="${student.id}" hidden>
                            <input type="number" name="grades[${index}][score]" class="form-control" 
                                   min="0" step="0.01" placeholder="Masukkan nilai">
                        </td>
                        <td>
                            <input type="text" name="grades[${index}][notes]" class="form-control" 
                                   placeholder="Keterangan (opsional)">
                        </td>
                    `;
                    studentsTableBody.appendChild(row);
                });
                
                studentsSection.style.display = 'block';
                submitBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error loading students:', error);
                studentsSection.style.display = 'none';
                submitBtn.disabled = true;
            });
    }
});
</script>
@endsection
