@extends('layouts.tenant')

@section('title', 'Tambah Nilai Siswa')
@section('page-title', 'Tambah Nilai Siswa')

@section('content')
<div id="app">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-plus me-2"></i>
                        Form Tambah Nilai Siswa
                    </h5>
                </div>
                <div class="card-body">
                    <form @submit.prevent="submitForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                    <select v-model="form.student_id" id="student_id" class="form-select" required>
                                        <option value="">Pilih Siswa</option>
                                        <option v-for="student in students" :key="student.id" :value="student.id">
                                            {{ student.name }} - {{ student.class_room?.name || 'Tidak ada kelas' }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="subject_id" class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                                    <select v-model="form.subject_id" id="subject_id" class="form-select" required>
                                        <option value="">Pilih Mata Pelajaran</option>
                                        <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                                            {{ subject.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="teacher_id" class="form-label">Guru <span class="text-danger">*</span></label>
                                    <select v-model="form.teacher_id" id="teacher_id" class="form-select" required>
                                        <option value="">Pilih Guru</option>
                                        <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                                            {{ teacher.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="academic_year_id" class="form-label">Tahun Pelajaran <span class="text-danger">*</span></label>
                                    <select v-model="form.academic_year_id" id="academic_year_id" class="form-select" required>
                                        <option value="">Pilih Tahun Pelajaran</option>
                                        <option v-for="academicYear in academicYears" :key="academicYear.id" :value="academicYear.id">
                                            {{ academicYear.year_name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="semester" class="form-label">Semester <span class="text-danger">*</span></label>
                                    <select v-model="form.semester" id="semester" class="form-select" required>
                                        <option value="">Pilih Semester</option>
                                        <option value="1">Semester 1</option>
                                        <option value="2">Semester 2</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="assignment_type" class="form-label">Jenis Penilaian <span class="text-danger">*</span></label>
                                    <select v-model="form.assignment_type" id="assignment_type" class="form-select" required>
                                        <option value="">Pilih Jenis Penilaian</option>
                                        <option v-for="(label, key) in assignmentTypes" :key="key" :value="key">
                                            {{ label }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="assignment_name" class="form-label">Nama Tugas/Evaluasi <span class="text-danger">*</span></label>
                                    <input type="text" v-model="form.assignment_name" id="assignment_name" class="form-control" 
                                           placeholder="Contoh: UTS Matematika" required>
                                </div>
                            </div>
                            
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="score" class="form-label">Nilai</label>
                                    <input type="number" v-model="form.score" id="score" class="form-control" 
                                           min="0" step="0.01" placeholder="0.00">
                                </div>
                            </div>
                            
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="max_score" class="form-label">Nilai Maksimal <span class="text-danger">*</span></label>
                                    <input type="number" v-model="form.max_score" id="max_score" class="form-control" 
                                           min="1" step="0.01" placeholder="100" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="notes" class="form-label">Keterangan</label>
                            <textarea v-model="form.notes" id="notes" class="form-control" rows="3" 
                                      placeholder="Keterangan tambahan (opsional)"></textarea>
                        </div>
                        
                        <!-- Preview Nilai -->
                        <div v-if="form.score && form.max_score" class="alert alert-info">
                            <h6>Preview Nilai:</h6>
                            <p><strong>Nilai:</strong> {{ form.score }} / {{ form.max_score }}</p>
                            <p><strong>Persentase:</strong> {{ calculatePercentage() }}%</p>
                            <p><strong>Predikat:</strong> 
                                <span class="badge" :class="getGradeClass(calculatePercentage())">
                                    {{ getLetterGrade(calculatePercentage()) }}
                                </span>
                            </p>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <a href="{{ tenant_route('tenant.student-grades.index') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-2"></i>
                                Kembali
                            </a>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <i class="fas fa-save me-2" v-if="!loading"></i>
                                <i class="fas fa-spinner fa-spin me-2" v-if="loading"></i>
                                {{ loading ? 'Menyimpan...' : 'Simpan' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
const { createApp } = Vue;

createApp({
    data() {
        return {
            loading: false,
            form: {
                student_id: '',
                subject_id: '',
                teacher_id: '',
                academic_year_id: '',
                semester: '',
                assignment_type: '',
                assignment_name: '',
                score: '',
                max_score: 100,
                notes: ''
            },
            students: @json($students),
            subjects: @json($subjects),
            teachers: @json($teachers),
            academicYears: @json($academicYears),
            assignmentTypes: @json($assignmentTypes)
        }
    },
    methods: {
        calculatePercentage() {
            if (this.form.score && this.form.max_score) {
                return ((this.form.score / this.form.max_score) * 100).toFixed(1);
            }
            return 0;
        },
        getLetterGrade(percentage) {
            if (percentage >= 90) return 'A';
            if (percentage >= 80) return 'B';
            if (percentage >= 70) return 'C';
            if (percentage >= 60) return 'D';
            return 'E';
        },
        getGradeClass(percentage) {
            if (percentage >= 90) return 'bg-success';
            if (percentage >= 80) return 'bg-info';
            if (percentage >= 70) return 'bg-warning';
            if (percentage >= 60) return 'bg-secondary';
            return 'bg-danger';
        },
        async submitForm() {
            this.loading = true;
            try {
                const response = await fetch('{{ tenant_route("tenant.student-grades.store") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify(this.form)
                });
                
                if (response.ok) {
                    window.location.href = '{{ tenant_route("tenant.student-grades.index") }}';
                } else {
                    const error = await response.json();
                    alert('Error: ' + (error.message || 'Terjadi kesalahan'));
                }
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                this.loading = false;
            }
        }
    }
}).mount('#app');
</script>
@endsection
