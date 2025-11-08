@extends('layouts.tenant')

@section('title', 'Buat Ujian Baru')
@section('page-title', 'Buat Ujian Baru')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus me-2"></i>
                        Form Buat Ujian Baru
                    </h5>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('admin.exam.store') }}" method="POST">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Nama Ujian <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('title') is-invalid @enderror" 
                                           id="title" name="title" value="{{ old('title') }}" 
                                           placeholder="Contoh: Ujian Akhir Semester Ganjil 2024" required>
                                    @error('title')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="description" class="form-label">Deskripsi</label>
                                    <textarea class="form-control @error('description') is-invalid @enderror" 
                                              id="description" name="description" rows="3" 
                                              placeholder="Deskripsi singkat tentang ujian">{{ old('description') }}</textarea>
                                    @error('description')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="exam_type" class="form-label">Jenis Ujian <span class="text-danger">*</span></label>
                                            <select class="form-select @error('exam_type') is-invalid @enderror" 
                                                    id="exam_type" name="exam_type" required>
                                                <option value="">Pilih Jenis Ujian</option>
                                                <option value="quiz" {{ old('exam_type') == 'quiz' ? 'selected' : '' }}>Kuis</option>
                                                <option value="midterm" {{ old('exam_type') == 'midterm' ? 'selected' : '' }}>UTS</option>
                                                <option value="final" {{ old('exam_type') == 'final' ? 'selected' : '' }}>UAS</option>
                                                <option value="assignment" {{ old('exam_type') == 'assignment' ? 'selected' : '' }}>Tugas</option>
                                            </select>
                                            @error('exam_type')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="semester" class="form-label">Semester</label>
                                            <select class="form-select @error('semester') is-invalid @enderror" 
                                                    id="semester" name="semester">
                                                <option value="">Pilih Semester</option>
                                                <option value="Ganjil" {{ old('semester') == 'Ganjil' ? 'selected' : '' }}>Ganjil</option>
                                                <option value="Genap" {{ old('semester') == 'Genap' ? 'selected' : '' }}>Genap</option>
                                            </select>
                                            @error('semester')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="academic_year" class="form-label">Tahun Ajaran</label>
                                            <input type="text" class="form-control @error('academic_year') is-invalid @enderror" 
                                                   id="academic_year" name="academic_year" value="{{ old('academic_year') }}" 
                                                   placeholder="Contoh: 2024/2025">
                                            @error('academic_year')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="status" class="form-label">Status</label>
                                            <select class="form-select @error('status') is-invalid @enderror" 
                                                    id="status" name="status">
                                                <option value="draft" {{ old('status', 'draft') == 'draft' ? 'selected' : '' }}>Draft</option>
                                                <option value="scheduled" {{ old('status') == 'scheduled' ? 'selected' : '' }}>Terjadwal</option>
                                            </select>
                                            @error('status')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="start_time" class="form-label">Waktu Mulai <span class="text-danger">*</span></label>
                                            <input type="datetime-local" class="form-control @error('start_time') is-invalid @enderror" 
                                                   id="start_time" name="start_time" value="{{ old('start_time') }}" required>
                                            @error('start_time')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="end_time" class="form-label">Waktu Berakhir <span class="text-danger">*</span></label>
                                            <input type="datetime-local" class="form-control @error('end_time') is-invalid @enderror" 
                                                   id="end_time" name="end_time" value="{{ old('end_time') }}" required>
                                            @error('end_time')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="instructions" class="form-label">Instruksi Umum</label>
                                    <textarea class="form-control @error('instructions') is-invalid @enderror" 
                                              id="instructions" name="instructions" rows="4" 
                                              placeholder="Instruksi yang akan diberikan kepada siswa">{{ old('instructions') }}</textarea>
                                    @error('instructions')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="card bg-light">
                                    <div class="card-header">
                                        <h6 class="mb-0">
                                            <i class="fas fa-info-circle me-1"></i>
                                            Informasi Penting
                                        </h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="alert alert-info">
                                            <h6 class="alert-heading">Peran Admin</h6>
                                            <p class="mb-0">Sebagai admin, Anda hanya membuat kerangka ujian. Guru yang akan:</p>
                                            <ul class="mb-0 mt-2">
                                                <li>Menambahkan mata pelajaran</li>
                                                <li>Memilih soal dari bank soal</li>
                                                <li>Membuat jadwal ujian per kelas</li>
                                                <li>Mengatur pengaturan ujian</li>
                                            </ul>
                                        </div>

                                        <div class="alert alert-warning">
                                            <h6 class="alert-heading">Langkah Selanjutnya</h6>
                                            <p class="mb-0">Setelah ujian dibuat, guru dapat:</p>
                                            <ul class="mb-0 mt-2">
                                                <li>Mengakses ujian dari menu "Ujian Saya"</li>
                                                <li>Menambahkan mata pelajaran yang diampu</li>
                                                <li>Memilih soal dari bank soal</li>
                                                <li>Membuat jadwal untuk kelas masing-masing</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('admin.exam.index') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Batal
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>
                                Buat Ujian
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Set default start time to current time + 1 hour
    document.addEventListener('DOMContentLoaded', function() {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const startTime = now.toISOString().slice(0, 16);
        
        if (!document.getElementById('start_time').value) {
            document.getElementById('start_time').value = startTime;
        }
        
        // Set end time to start time + 2 hours
        const endTime = new Date(now);
        endTime.setHours(endTime.getHours() + 2);
        const endTimeString = endTime.toISOString().slice(0, 16);
        
        if (!document.getElementById('end_time').value) {
            document.getElementById('end_time').value = endTimeString;
        }
    });

    // Update end time when start time changes
    document.getElementById('start_time').addEventListener('change', function() {
        const startTime = new Date(this.value);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);
        document.getElementById('end_time').value = endTime.toISOString().slice(0, 16);
    });
</script>
@endpush
