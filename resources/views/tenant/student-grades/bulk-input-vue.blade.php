@extends('layouts.tenant')

@section('title', 'Input Massal Nilai')
@section('page-title', 'Input Massal Nilai')

@section('content')
<div id="app">
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
                    <form @submit.prevent="submitForm">
                        <!-- Informasi Umum -->
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <label for="academic_year_id" class="form-label">Tahun Pelajaran <span class="text-danger">*</span></label>
                                <select v-model="form.academic_year_id" id="academic_year_id" class="form-select" required>
                                    <option value="">Pilih Tahun Pelajaran</option>
                                    <option v-for="academicYear in academicYears" :key="academicYear.id" :value="academicYear.id">
                                        {{ academicYear.year_name }}
                                    </option>
                                </select>
                            </div>
                            
                            <div class="col-md-2">
                                <label for="semester" class="form-label">Semester <span class="text-danger">*</span></label>
                                <select v-model="form.semester" id="semester" class="form-select" required>
                                    <option value="">Pilih</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                </select>
                            </div>
                            
                            <div class="col-md-3">
                                <label for="subject_id" class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                                <select v-model="form.subject_id" id="subject_id" class="form-select" required>
                                    <option value="">Pilih Mata Pelajaran</option>
                                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                                        {{ subject.name }}
                                    </option>
                                </select>
                            </div>
                            
                            <div class="col-md-4">
                                <label for="teacher_id" class="form-label">Guru <span class="text-danger">*</span></label>
                                <select v-model="form.teacher_id" id="teacher_id" class="form-select" required>
                                    <option value="">Pilih Guru</option>
                                    <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                                        {{ teacher.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Informasi Penilaian -->
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <label for="assignment_type" class="form-label">Jenis Penilaian <span class="text-danger">*</span></label>
                                <select v-model="form.assignment_type" id="assignment_type" class="form-select" required>
                                    <option value="">Pilih Jenis</option>
                                    <option v-for="(label, key) in assignmentTypes" :key="key" :value="key">
                                        {{ label }}
                                    </option>
                                </select>
                            </div>
                            
                            <div class="col-md-4">
                                <label for="assignment_name" class="form-label">Nama Tugas/Evaluasi <span class="text-danger">*</span></label>
                                <input type="text" v-model="form.assignment_name" id="assignment_name" class="form-control" 
                                       placeholder="Contoh: UTS Matematika" required>
                            </div>
                            
                            <div class="col-md-2">
                                <label for="max_score" class="form-label">Nilai Maksimal <span class="text-danger">*</span></label>
                                <input type="number" v-model="form.max_score" id="max_score" class="form-control" 
                                       min="1" step="0.01" placeholder="100" required>
                            </div>
                            
                            <div class="col-md-3">
                                <label for="class_id" class="form-label">Kelas</label>
                                <select v-model="form.class_id" id="class_id" class="form-select" @change="loadStudents">
                                    <option value="">Pilih Kelas</option>
                                    <option v-for="classRoom in classes" :key="classRoom.id" :value="classRoom.id">
                                        {{ classRoom.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Daftar Siswa -->
                        <div v-if="students.length > 0" class="mb-4">
                            <h6 class="mb-3">
                                <i class="fas fa-users me-2"></i>
                                Daftar Siswa ({{ students.length }} siswa)
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
                                    <tbody>
                                        <tr v-for="(student, index) in students" :key="student.id">
                                            <td>{{ index + 1 }}</td>
                                            <td>{{ student.name }}</td>
                                            <td>{{ student.class_room?.name || '-' }}</td>
                                            <td>
                                                <input type="number" v-model="student.score" class="form-control" 
                                                       min="0" step="0.01" placeholder="Masukkan nilai">
                                            </td>
                                            <td>
                                                <input type="text" v-model="student.notes" class="form-control" 
                                                       placeholder="Keterangan (opsional)">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Statistik Input -->
                            <div class="row mt-3">
                                <div class="col-md-3">
                                    <div class="card bg-light">
                                        <div class="card-body text-center">
                                            <h5 class="text-primary">{{ getFilledCount() }}</h5>
                                            <p class="mb-0">Sudah Diisi</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card bg-light">
                                        <div class="card-body text-center">
                                            <h5 class="text-warning">{{ students.length - getFilledCount() }}</h5>
                                            <p class="mb-0">Belum Diisi</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card bg-light">
                                        <div class="card-body text-center">
                                            <h5 class="text-info">{{ getAverageScore() }}</h5>
                                            <p class="mb-0">Rata-rata</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card bg-light">
                                        <div class="card-body text-center">
                                            <h5 class="text-success">{{ getPassedCount() }}</h5>
                                            <p class="mb-0">Lulus</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <a href="{{ tenant_route('tenant.student-grades.index') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-2"></i>
                                Kembali
                            </a>
                            <button type="submit" class="btn btn-success" :disabled="loading || students.length === 0">
                                <i class="fas fa-save me-2" v-if="!loading"></i>
                                <i class="fas fa-spinner fa-spin me-2" v-if="loading"></i>
                                {{ loading ? 'Menyimpan...' : `Simpan ${getFilledCount()} Nilai` }}
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
                academic_year_id: '',
                semester: '',
                subject_id: '',
                teacher_id: '',
                assignment_type: '',
                assignment_name: '',
                max_score: 100,
                class_id: ''
            },
            students: [],
            classes: [],
            academicYears: @json($academicYears),
            subjects: @json($subjects),
            teachers: @json($teachers),
            assignmentTypes: @json($assignmentTypes)
        }
    },
    mounted() {
        this.loadClasses();
    },
    methods: {
        async loadClasses() {
            try {
                const response = await fetch('{{ tenant_route("tenant.classes.index") }}');
                const data = await response.json();
                this.classes = data;
            } catch (error) {
                console.error('Error loading classes:', error);
            }
        },
        async loadStudents() {
            if (!this.form.class_id) {
                this.students = [];
                return;
            }
            
            try {
                const response = await fetch(`{{ tenant_route('tenant.student-grades.students-by-class') }}?class_id=${this.form.class_id}`);
                const data = await response.json();
                this.students = data.map(student => ({
                    ...student,
                    score: '',
                    notes: ''
                }));
            } catch (error) {
                console.error('Error loading students:', error);
                this.students = [];
            }
        },
        getFilledCount() {
            return this.students.filter(student => student.score && student.score > 0).length;
        },
        getAverageScore() {
            const filledStudents = this.students.filter(student => student.score && student.score > 0);
            if (filledStudents.length === 0) return '0.00';
            const total = filledStudents.reduce((sum, student) => sum + parseFloat(student.score), 0);
            return (total / filledStudents.length).toFixed(2);
        },
        getPassedCount() {
            return this.students.filter(student => student.score && student.score >= 60).length;
        },
        async submitForm() {
            this.loading = true;
            try {
                const grades = this.students
                    .filter(student => student.score && student.score > 0)
                    .map(student => ({
                        student_id: student.id,
                        score: student.score,
                        notes: student.notes
                    }));
                
                const formData = {
                    ...this.form,
                    grades: grades
                };
                
                const response = await fetch('{{ tenant_route("tenant.student-grades.bulk-store") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify(formData)
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
