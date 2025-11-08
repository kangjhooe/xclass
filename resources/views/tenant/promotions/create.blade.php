@extends('layouts.tenant')

@section('title', 'Buat Data Naik Kelas')
@section('page-title', 'Buat Data Naik Kelas')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-plus me-2"></i>
                    Form Naik Kelas
                </h5>
            </div>
            <div class="card-body">
                @if(!$currentAcademicYear)
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Tidak ada tahun pelajaran yang aktif. Silakan aktifkan tahun pelajaran terlebih dahulu.
                    </div>
                @else
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Tahun Pelajaran Aktif:</strong> {{ $currentAcademicYear->year_name }} 
                        | <strong>Semester:</strong> {{ $currentAcademicYear->getSemesterName() }}
                        @if($currentAcademicYear->current_semester != 2)
                            <br><small class="text-warning">Peringatan: Naik kelas biasanya dilakukan di semester Genap.</small>
                        @endif
                    </div>

                    <form action="{{ tenant_route('tenant.promotions.store') }}" method="POST" id="promotionForm">
                        @csrf
                        
                        <input type="hidden" name="to_academic_year_id" value="{{ $nextAcademicYear->id ?? '' }}" id="toAcademicYearId">

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Dari Tahun Pelajaran <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" value="{{ $currentAcademicYear->year_name }}" readonly>
                                <input type="hidden" name="from_academic_year_id" value="{{ $currentAcademicYear->id }}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Ke Tahun Pelajaran <span class="text-danger">*</span></label>
                                <select name="to_academic_year_id" class="form-select @error('to_academic_year_id') is-invalid @enderror" required id="toAcademicYearSelect">
                                    <option value="">Pilih Tahun Pelajaran</option>
                                    @foreach($academicYears as $ay)
                                        @if($ay->id != $currentAcademicYear->id)
                                            <option value="{{ $ay->id }}" {{ ($nextAcademicYear && $nextAcademicYear->id == $ay->id) ? 'selected' : '' }}>
                                                {{ $ay->year_name }}
                                            </option>
                                        @endif
                                    @endforeach
                                </select>
                                @error('to_academic_year_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <hr>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Pilih Kelas Asal <span class="text-danger">*</span></label>
                                <select class="form-select" id="fromClassSelect" onchange="loadStudents()">
                                    <option value="">Pilih Kelas</option>
                                    @foreach($currentClasses as $level => $classes)
                                        <optgroup label="Kelas {{ $level }}">
                                            @foreach($classes as $class)
                                                <option value="{{ $class->id }}">{{ $class->name }}</option>
                                            @endforeach
                                        </optgroup>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Pilih Kelas Tujuan <span class="text-danger">*</span></label>
                                <select class="form-select" id="toClassSelect">
                                    <option value="">Pilih Kelas</option>
                                    @foreach($nextClasses as $level => $classes)
                                        <optgroup label="Kelas {{ $level }}">
                                            @foreach($classes as $class)
                                                <option value="{{ $class->id }}">{{ $class->name }}</option>
                                            @endforeach
                                        </optgroup>
                                    @endforeach
                                </select>
                            </div>
                        </div>

                        <div id="studentsContainer" class="mt-4" style="display: none;">
                            <h6 class="mb-3">
                                <i class="fas fa-users me-2"></i>
                                Daftar Siswa
                            </h6>
                            <div class="table-responsive">
                                <table class="table table-striped" id="studentsTable">
                                    <thead>
                                        <tr>
                                            <th width="5%">
                                                <input type="checkbox" id="selectAllStudents" onclick="toggleAllStudents()">
                                            </th>
                                            <th>No</th>
                                            <th>Nama</th>
                                            <th>NIS</th>
                                            <th>Kelas</th>
                                            <th>Rata-rata</th>
                                            <th>Tipe</th>
                                            <th>Kelas Tujuan</th>
                                            <th>Alasan</th>
                                        </tr>
                                    </thead>
                                    <tbody id="studentsTableBody">
                                        <!-- Students will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between mt-4">
                            <a href="{{ tenant_route('tenant.promotions.index') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-2"></i>
                                Kembali
                            </a>
                            <button type="submit" class="btn btn-primary" id="submitBtn" disabled>
                                <i class="fas fa-save me-2"></i>
                                Simpan Data Naik Kelas
                            </button>
                        </div>
                    </form>
                @endif
            </div>
        </div>
    </div>
</div>

<script>
let students = [];

function loadStudents() {
    const fromClassId = document.getElementById('fromClassSelect').value;
    const toClassId = document.getElementById('toClassSelect').value;
    const studentsContainer = document.getElementById('studentsContainer');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const submitBtn = document.getElementById('submitBtn');

    if (!fromClassId) {
        studentsContainer.style.display = 'none';
        students = [];
        updateSubmitButton();
        return;
    }

    // Load students via AJAX
    fetch(`{{ tenant_route('tenant.promotions.students-by-class') }}?class_id=${fromClassId}`)
        .then(response => response.json())
        .then(data => {
            students = data;
            renderStudentsTable(toClassId);
            studentsContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Gagal memuat data siswa');
        });
}

document.getElementById('toClassSelect').addEventListener('change', function() {
    if (students.length > 0) {
        renderStudentsTable(this.value);
    }
});

document.getElementById('toAcademicYearSelect').addEventListener('change', function() {
    document.getElementById('toAcademicYearId').value = this.value;
});

function renderStudentsTable(toClassId) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Tidak ada siswa di kelas ini</td></tr>';
        updateSubmitButton();
        return;
    }

    students.forEach((student, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="student-checkbox" 
                       onchange="updateSubmitButton()"
                       data-student-id="${student.id}"
                       data-student-name="${student.name}">
            </td>
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.nis || '-'}</td>
            <td>${student.class_room ? student.class_room.name : '-'}</td>
            <td>
                <strong>${student.final_average ? parseFloat(student.final_average).toFixed(2) : '-'}</strong>
            </td>
            <td>
                <select name="promotions[${index}][type]" class="form-select form-select-sm promotion-type" required>
                    <option value="promotion">Naik Kelas</option>
                    <option value="repeat">Tinggal Kelas</option>
                    <option value="transfer">Pindah Kelas</option>
                </select>
            </td>
            <td>
                <select name="promotions[${index}][to_class_id]" class="form-select form-select-sm" required>
                    <option value="">Pilih Kelas</option>
                    @foreach($nextClasses as $level => $classes)
                        <optgroup label="Kelas {{ $level }}">
                            @foreach($classes as $class)
                                <option value="{{ $class->id }}">{{ $class->name }}</option>
                            @endforeach
                        </optgroup>
                    @endforeach
                </select>
            </td>
            <td>
                <input type="text" name="promotions[${index}][reason]" 
                       class="form-control form-control-sm" 
                       placeholder="Alasan (opsional)">
            </td>
        `;
        
        // Add hidden input for student_id
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = `promotions[${index}][student_id]`;
        hiddenInput.value = student.id;
        tr.appendChild(hiddenInput);

        tbody.appendChild(tr);
    });

    updateSubmitButton();
}

function toggleAllStudents() {
    const selectAll = document.getElementById('selectAllStudents');
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
    });
    updateSubmitButton();
}

function updateSubmitButton() {
    const checkedBoxes = document.querySelectorAll('.student-checkbox:checked');
    const submitBtn = document.getElementById('submitBtn');
    
    // Enable submit button if at least one student is selected and all required fields are filled
    if (checkedBoxes.length > 0) {
        let allFilled = true;
        checkedBoxes.forEach(cb => {
            const row = cb.closest('tr');
            const toClassSelect = row.querySelector('select[name*="[to_class_id]"]');
            if (!toClassSelect || !toClassSelect.value) {
                allFilled = false;
            }
        });
        
        submitBtn.disabled = !allFilled;
    } else {
        submitBtn.disabled = true;
    }
}

// Update submit button when class selection changes
document.addEventListener('change', function(e) {
    if (e.target.matches('.student-checkbox, select[name*="[to_class_id]"]')) {
        updateSubmitButton();
    }
});

// Form validation before submit
document.getElementById('promotionForm').addEventListener('submit', function(e) {
    // Remove unchecked rows from form submission
    const uncheckedRows = document.querySelectorAll('.student-checkbox:not(:checked)');
    uncheckedRows.forEach(cb => {
        const row = cb.closest('tr');
        if (row) {
            row.querySelectorAll('input, select').forEach(input => {
                input.disabled = true;
            });
        }
    });

    const checkedBoxes = document.querySelectorAll('.student-checkbox:checked');
    if (checkedBoxes.length === 0) {
        e.preventDefault();
        alert('Pilih minimal satu siswa untuk naik kelas');
        return false;
    }

    // Validate all required fields
    let isValid = true;
    checkedBoxes.forEach(cb => {
        const row = cb.closest('tr');
        const toClassSelect = row.querySelector('select[name*="[to_class_id]"]');
        if (!toClassSelect || !toClassSelect.value) {
            isValid = false;
        }
    });

    if (!isValid) {
        e.preventDefault();
        alert('Mohon lengkapi kelas tujuan untuk semua siswa yang dipilih');
        return false;
    }

    return true;
});
</script>
@endsection

